"use server";

import pool from "@/lib/db";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { RowDataPacket } from "mysql2";

export async function loginUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    redirect("/login?error=InvalidCredentials");
  }

  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT user_id, name, password FROM users WHERE email = ?",
      [email]
    );

    if (rows.length >= 1) {
      const user = rows[0];
      if (user.password === password) {
        // Success
        const session = await getSession();
        session.userId = user.user_id;
        session.userName = user.name;
        session.role = "user";
        await session.save();
      } else {
        throw new Error("Incorrect password."); 
      }
    } else {
      throw new Error("No account found with that email.");
    }
  } catch (error) {
    console.error("Login failed", error);
    // Ideally we'd return a state to useActionState, but for simplicity let's rely on standard throw for now, 
    // or just let the Next.js boundary catch it. Proper way: redirect to /login?error=true
    redirect("/login?error=InvalidCredentials");
  }

  // Redirect on success
  redirect("/dashboard");
}
