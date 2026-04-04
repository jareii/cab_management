-- PostgreSQL DBMS Requirement Script
-- Use with database: neondb (or your Neon database)

-- 0) TABLES (if not already created)
CREATE TABLE IF NOT EXISTS admin (
  admin_id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  email VARCHAR(120) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS drivers (
  driver_id SERIAL PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  email VARCHAR(120),
  phone VARCHAR(20),
  password VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'Approved',
  driver_status VARCHAR(20) DEFAULT 'Off Duty',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cabs (
  cab_id SERIAL PRIMARY KEY,
  cab_number VARCHAR(30) UNIQUE NOT NULL,
  cab_type VARCHAR(30) NOT NULL,
  ac_type VARCHAR(10),
  driver_id INT REFERENCES drivers(driver_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS booking (
  booking_id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(user_id) ON DELETE SET NULL,
  cab_id INT REFERENCES cabs(cab_id) ON DELETE SET NULL,
  driver_id INT REFERENCES drivers(driver_id) ON DELETE SET NULL,
  pickup_location TEXT NOT NULL,
  drop_location TEXT NOT NULL,
  booking_date DATE NOT NULL,
  booking_time TIME,
  status VARCHAR(20) NOT NULL,
  distance_km NUMERIC(8,2),
  fare_amount NUMERIC(10,2),
  payment_status VARCHAR(20) DEFAULT 'Not Paid',
  user_phone VARCHAR(20),
  accepted_at TIMESTAMP,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);

-- 1) VIEW: Driver earnings summary
CREATE OR REPLACE VIEW view_driver_earnings AS
SELECT
  d.driver_id,
  d.name AS driver_name,
  COUNT(b.booking_id) AS total_trips,
  SUM(CASE WHEN b.payment_status = 'Paid' THEN COALESCE(b.fare_amount, 0) ELSE 0 END) AS total_earned
FROM drivers d
LEFT JOIN cabs c ON d.driver_id = c.driver_id
LEFT JOIN booking b ON c.cab_id = b.cab_id
GROUP BY d.driver_id, d.name;

-- 2) VIEW: Recent bookings (includes user details)
CREATE OR REPLACE VIEW view_recent_bookings AS
SELECT
  b.booking_id,
  b.booking_date,
  b.booking_time,
  b.pickup_location,
  b.drop_location,
  b.status,
  b.payment_status,
  b.fare_amount,
  b.user_id,
  c.cab_number,
  d.name AS driver_name,
  u.name AS user_name,
  u.phone AS user_phone
FROM booking b
LEFT JOIN cabs c ON b.cab_id = c.cab_id
LEFT JOIN drivers d ON c.driver_id = d.driver_id
LEFT JOIN users u ON b.user_id = u.user_id
ORDER BY b.booking_date DESC, b.booking_time DESC;

-- 3) FUNCTION (Procedure-like): Get driver earnings by driver_id
CREATE OR REPLACE FUNCTION sp_driver_earnings(p_driver_id INT)
RETURNS TABLE(driver_id INT, driver_name TEXT, total_trips BIGINT, total_earned NUMERIC)
LANGUAGE SQL
AS $$
  SELECT
    d.driver_id,
    d.name AS driver_name,
    COUNT(b.booking_id) AS total_trips,
    SUM(CASE WHEN b.payment_status = 'Paid' THEN COALESCE(b.fare_amount, 0) ELSE 0 END) AS total_earned
  FROM drivers d
  LEFT JOIN cabs c ON d.driver_id = c.driver_id
  LEFT JOIN booking b ON c.cab_id = b.cab_id
  WHERE d.driver_id = p_driver_id
  GROUP BY d.driver_id, d.name;
$$;

-- 4) TRIGGER: Auto-update updated_at on booking updates
CREATE OR REPLACE FUNCTION set_booking_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_booking_updated_at ON booking;
CREATE TRIGGER trg_booking_updated_at
BEFORE UPDATE ON booking
FOR EACH ROW
EXECUTE FUNCTION set_booking_updated_at();

-- 5) TRIGGER: Set default payment_status on booking insert
CREATE OR REPLACE FUNCTION set_booking_payment_default()
RETURNS trigger AS $$
BEGIN
  IF NEW.payment_status IS NULL OR NEW.payment_status = '' THEN
    NEW.payment_status = 'Not Paid';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_booking_payment_default ON booking;
CREATE TRIGGER trg_booking_payment_default
BEFORE INSERT ON booking
FOR EACH ROW
EXECUTE FUNCTION set_booking_payment_default();

-- 6) AGGREGATE QUERY: Total earnings (all drivers)
SELECT SUM(CASE WHEN payment_status = 'Paid' THEN COALESCE(fare_amount, 0) ELSE 0 END) AS total_earned
FROM booking;

-- 7) AGGREGATE QUERY: Earnings per driver
SELECT d.driver_id, d.name, SUM(CASE WHEN b.payment_status = 'Paid' THEN COALESCE(b.fare_amount, 0) ELSE 0 END) AS earned
FROM drivers d
LEFT JOIN cabs c ON d.driver_id = c.driver_id
LEFT JOIN booking b ON c.cab_id = b.cab_id
GROUP BY d.driver_id, d.name;

-- 8) AGGREGATE QUERY: Active trips
SELECT COUNT(*) AS active_trips
FROM booking
WHERE status IN ('Confirmed', 'Picked');
