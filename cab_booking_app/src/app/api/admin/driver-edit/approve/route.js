import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exec, query } from "@/lib/mysql";

export async function POST(request) {
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;
  if (role !== "admin") {
    return NextResponse.redirect(new URL("/admin/login?error=auth", request.url));
  }

  const formData = await request.formData();
  const editId = Number(formData.get("edit_id") || 0);

  if (!editId) {
    return NextResponse.redirect(new URL("/admin/drivers?error=missing", request.url));
  }

  // 1. Fetch the requested edit data
  const editDataRows = await query("SELECT * FROM driver_edit_requests WHERE edit_id = ? AND status = 'Pending'", [editId]);
  if (editDataRows.length === 0) {
    return NextResponse.redirect(new URL("/admin/drivers?error=notfound", request.url));
  }
  const editData = editDataRows[0];

  // 2. Overwrite the drivers table explicitly
  await exec(
    "UPDATE drivers SET name = ?, email = ?, phone = ? WHERE driver_id = ?",
    [editData.name, editData.email, editData.phone, editData.driver_id]
  );

  // 3. Overwrite the cabs table explicitly
  await exec(
    "UPDATE cabs SET cab_number = ?, cab_type = ?, ac_type = ? WHERE driver_id = ?",
    [editData.cab_number, editData.cab_type, editData.ac_type, editData.driver_id]
  );

  // 4. Update the edit request to Approved
  await exec("UPDATE driver_edit_requests SET status = 'Approved' WHERE edit_id = ?", [editId]);

  return NextResponse.redirect(new URL("/admin/drivers?edit_approved=1", request.url));
}
