import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exec, query } from "@/lib/mysql";

export async function POST(request) {
  const cookieStore = await cookies();
  const driverIdStr = cookieStore.get("driver_id")?.value;
  if (!driverIdStr) {
    return NextResponse.redirect(new URL("/driver/login?error=auth", request.url));
  }
  const driverId = Number(driverIdStr);

  const formData = await request.formData();
  const name = (formData.get("name") || "").toString().trim();
  const email = (formData.get("email") || "").toString().trim().toLowerCase();
  const phone = (formData.get("phone") || "").toString().trim();
  const cabNumber = (formData.get("cab_number") || "").toString().trim();
  const cabType = (formData.get("cab_type") || "").toString().trim();
  const acType = (formData.get("ac_type") || "AC").toString();

  if (!name || !email || !phone || !cabNumber || !cabType) {
    return NextResponse.redirect(new URL("/driver/profile?error=missing", request.url));
  }

  // Enforce table creation safely
  await exec(`
    CREATE TABLE IF NOT EXISTS driver_edit_requests (
      edit_id INT PRIMARY KEY AUTO_INCREMENT,
      driver_id INT NOT NULL,
      name VARCHAR(100),
      email VARCHAR(100),
      phone VARCHAR(20),
      cab_number VARCHAR(50),
      cab_type VARCHAR(50),
      ac_type VARCHAR(10),
      status VARCHAR(50) DEFAULT 'Pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (driver_id) REFERENCES drivers(driver_id) ON DELETE CASCADE
    )
  `);

  // Auto-reject any old pending requests
  await exec("UPDATE driver_edit_requests SET status = 'Rejected' WHERE driver_id = ? AND status = 'Pending'", [driverId]);

  // Insert the new shadow edit
  await exec(
    "INSERT INTO driver_edit_requests (driver_id, name, email, phone, cab_number, cab_type, ac_type, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')",
    [driverId, name, email, phone, cabNumber, cabType, acType]
  );

  return NextResponse.redirect(new URL("/driver/profile?success=1", request.url));
}
