"use server";

import pool from "@/lib/db";
import { redirect } from "next/navigation";
import { RowDataPacket } from "mysql2";

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !phone || !email || !password) {
    redirect("/register?error=MissingFields");
  }

  try {
    const [existing] = await pool.execute<RowDataPacket[]>(
      "SELECT user_id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      redirect("/register?error=EmailExists");
    }

    await pool.execute(
      "INSERT INTO users (name, phone, email, password) VALUES (?, ?, ?, ?)",
      [name, phone, email, password]
    );
    
  } catch (error) {
    console.error("Registration failed", error);
    // Cannot redirect from inside catch if redirect itself throws, wait redirect essentially throws an error to abort
    // We should safely redirect outside or rethrow if it's the redirect error.
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    
    redirect("/register?error=Error");
  }

  redirect("/login?success=1");
}
