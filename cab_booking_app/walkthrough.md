# 🎓 DBMS Project Requirements Report

This document explains exactly where the required database components (MySQL Triggers, Views, Procedures, and MongoDB integration) are used in your `cab_booking_app` codebase. You can use this to easily demonstrate your work to your teacher.

## 1. MongoDB Integration (The "One Portion")
As requested, the project is strictly built on MySQL EXCEPT for one specific portion: **The Payment Gateway.**
* **What it does:** When a user pays for a cab ride, their transaction receipt (containing `booking_id`, `amount`, `status`, and timestamps) is stored directly inside a MongoDB collection named `payments`. 
* **Where to find it in the code:** 
  - The connection is established in `src/lib/mongo.js` and `src/lib/db.js`.
  - The actual MongoDB insert code runs inside `src/app/api/payment/save/route.js`.
  - We fetch records from MongoDB to show on dashboards (e.g., `src/app/admin/dashboard/page.js` and `src/app/driver/dashboard/page.js`).

---

## 2. MySQL Views
Views are entirely virtual tables created from complex JOIN queries to make reading data easier. We have two main views:
* **`view_recent_bookings`:** Used in the Admin Dashboard to easily see comprehensive booking details (joining the `booking`, `cabs`, `drivers`, and `users` tables).
* **`view_driver_earnings`:** Also used by Admins to easily see how much total money each driver has earned, aggregating data efficiently.
* **Where to find it:** These views are defined inside your `mysql_dbms_requirements.sql` file.

---

## 3. MySQL Triggers
Triggers are automated database actions. We created two exact triggers to handle background automation:
* **`trg_booking_payment_default` [BEFORE INSERT]:** When a new booking is inserted into the `booking` table, this trigger ensures the `payment_status` is strictly assigned a default of `"Not Paid"`. 
* **`trg_booking_updated_at` [BEFORE UPDATE]:** Automatically sets the `updated_at` timestamp on a booking record every time the driver changes the route status (e.g., from "Requested" to "Picked").
* **Where to find it:** These triggers are defined inside your `mysql_dbms_requirements.sql` file.

---

## 4. MySQL Stored Procedures
A stored procedure is used for logic that runs directly on the database engine.
* **`sp_driver_earnings(IN p_driver_id INT)`:** This procedure calculates total trips and earnings perfectly for *one specific driver*. When a driver logs into the Next.js Driver Portal, we use standard syntax (`CALL sp_driver_earnings(?)`) to query their money. 
* **Where to find it:** 
   - Defined in the SQL file: `mysql_dbms_requirements.sql`
   - Executed in your Next.js app: `src/app/driver/dashboard/page.js` (line 27).

---
> [!TIP]
> **For the Teacher:** Hand them the `mysql_dbms_requirements.sql` file to prove that you wrote all standard schema commands to fulfill the assignment rules, and show them how the UI strictly connects to MySQL using `mysql2` underneath for everything except Payments!
