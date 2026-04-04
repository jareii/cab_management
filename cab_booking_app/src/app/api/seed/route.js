import { NextResponse } from "next/server";
import { exec, query } from "@/lib/mysql";
import { toMySqlDateTime } from "@/lib/time";

export async function GET(request) {
  const adminCountRows = await query("SELECT COUNT(*) as count FROM admin");
  if ((adminCountRows[0]?.count || 0) === 0) {
    await exec("INSERT INTO admin (username, password) VALUES (?, ?)", ["admin", "admin123"]);
  }

  const driverCountRows = await query("SELECT COUNT(*) as count FROM drivers");
  if ((driverCountRows[0]?.count || 0) === 0) {
    await exec(
      "INSERT INTO drivers (name, email, phone, password, status, driver_status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      ["Ramesh", "driver@cab.com", "9990001111", "driver123", "Approved", "On Duty", toMySqlDateTime()]
    );
  }

  const cabCountRows = await query("SELECT COUNT(*) as count FROM cabs");
  if ((cabCountRows[0]?.count || 0) === 0) {
    const drivers = await query("SELECT driver_id FROM drivers LIMIT 1");
    const driverId = drivers[0]?.driver_id || 1;
    await exec(
      "INSERT INTO cabs (cab_number, cab_type, ac_type, driver_id) VALUES (?, ?, ?, ?), (?, ?, ?, ?)",
      ["KL11AB1234", "Mini", "AC", driverId, "KL11CD5678", "Sedan", "Non-AC", driverId]
    );
  }

  const url = new URL("/", request.url);
  url.searchParams.set("seeded", "1");
  return NextResponse.redirect(url);
}
