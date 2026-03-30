"use server";

import pool from "@/lib/db";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { RowDataPacket } from "mysql2";

export async function loginDriver(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    redirect("/driver-login?error=InvalidCredentials");
  }

  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT driver_id, name, password FROM drivers WHERE email = ?",
      [email]
    );

    if (rows.length >= 1) {
      const driver = rows[0];
      if (driver.password === password) {
        const session = await getSession();
        session.driverId = driver.driver_id;
        session.userName = driver.name;
        session.role = "driver";
        await session.save();
      } else {
        throw new Error("Incorrect password."); 
      }
    } else {
      throw new Error("No account found with that email.");
    }
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    redirect("/driver-login?error=InvalidCredentials");
  }

  redirect("/driver-dashboard");
}
