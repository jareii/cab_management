"use server";

import pool from "@/lib/db";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { RowDataPacket } from "mysql2";

export async function loginAdmin(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    redirect("/admin-login?error=InvalidCredentials");
  }

  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT admin_id, username, password FROM admin WHERE username = ?",
      [username]
    );

    if (rows.length >= 1) {
      const admin = rows[0];
      if (admin.password === password) {
        const session = await getSession();
        session.adminId = admin.admin_id;
        session.userName = admin.username;
        session.role = "admin";
        await session.save();
      } else {
        throw new Error("Incorrect password."); 
      }
    } else {
      throw new Error("No account found with that username.");
    }
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    redirect("/admin-login?error=InvalidCredentials");
  }

  redirect("/admin-dashboard");
}
