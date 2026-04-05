-- ==========================================
-- CAB MANAGEMENT FULL DATABASE SETUP SCRIPT
-- ==========================================

-- 1) Create the Database and Use It
CREATE DATABASE IF NOT EXISTS cab_management;
USE cab_management;

-- ==========================================
-- BASE TABLES
-- ==========================================

-- 2) Create Admin Table
CREATE TABLE IF NOT EXISTS admin (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- 3) Create Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- 4) Create Drivers Table
CREATE TABLE IF NOT EXISTS drivers (
    driver_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    driver_status VARCHAR(50) DEFAULT 'Offline',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5) Create Cabs Table
CREATE TABLE IF NOT EXISTS cabs (
    cab_id INT AUTO_INCREMENT PRIMARY KEY,
    cab_number VARCHAR(50) NOT NULL UNIQUE,
    cab_type VARCHAR(50) NOT NULL,
    ac_type VARCHAR(20) NOT NULL,
    driver_id INT NOT NULL,
    FOREIGN KEY (driver_id) REFERENCES drivers(driver_id) ON DELETE CASCADE
);

-- 6) Create Booking Table
CREATE TABLE IF NOT EXISTS booking (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    cab_id INT NOT NULL,
    pickup_location VARCHAR(255) NOT NULL,
    drop_location VARCHAR(255) NOT NULL,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    status VARCHAR(50) DEFAULT 'Requested',
    distance_km DECIMAL(10,2) NULL,
    fare_amount DECIMAL(10,2) NULL,
    payment_status VARCHAR(50) DEFAULT 'Not Paid',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    user_phone VARCHAR(20),
    driver_id INT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (cab_id) REFERENCES cabs(cab_id) ON DELETE CASCADE,
    FOREIGN KEY (driver_id) REFERENCES drivers(driver_id) ON DELETE SET NULL
);

-- ==========================================
-- DBMS REQUIREMENTS (VIEWS, PROCEDURES, TRIGGERS)
-- ==========================================

-- 7) VIEW: Driver earnings summary
CREATE OR REPLACE VIEW view_driver_earnings AS
SELECT
  d.driver_id,
  d.name AS driver_name,
  COUNT(b.booking_id) AS total_trips,
  SUM(CASE WHEN b.payment_status = 'Paid' THEN IFNULL(b.fare_amount, 0) ELSE 0 END) AS total_earned
FROM drivers d
LEFT JOIN cabs c ON d.driver_id = c.driver_id
LEFT JOIN booking b ON c.cab_id = b.cab_id
GROUP BY d.driver_id, d.name;

-- 8) VIEW: Recent bookings (includes user details)
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

-- 9) PROCEDURE: Get driver earnings by driver_id
DROP PROCEDURE IF EXISTS sp_driver_earnings;
DELIMITER $$
CREATE PROCEDURE sp_driver_earnings(IN p_driver_id INT)
BEGIN
  SELECT
    d.driver_id,
    d.name AS driver_name,
    COUNT(b.booking_id) AS total_trips,
    SUM(CASE WHEN b.payment_status = 'Paid' THEN IFNULL(b.fare_amount, 0) ELSE 0 END) AS total_earned
  FROM drivers d
  LEFT JOIN cabs c ON d.driver_id = c.driver_id
  LEFT JOIN booking b ON c.cab_id = b.cab_id
  WHERE d.driver_id = p_driver_id
  GROUP BY d.driver_id, d.name;
END $$
DELIMITER ;

-- 10) TRIGGER: Auto-update updated_at on booking updates
DROP TRIGGER IF EXISTS trg_booking_updated_at;
DELIMITER $$
CREATE TRIGGER trg_booking_updated_at
BEFORE UPDATE ON booking
FOR EACH ROW
BEGIN
  SET NEW.updated_at = NOW();
END $$
DELIMITER ;

-- 11) TRIGGER: Set default payment_status on booking insert
DROP TRIGGER IF EXISTS trg_booking_payment_default;
DELIMITER $$
CREATE TRIGGER trg_booking_payment_default
BEFORE INSERT ON booking
FOR EACH ROW
BEGIN
  IF NEW.payment_status IS NULL OR NEW.payment_status = '' THEN
    SET NEW.payment_status = 'Not Paid';
  END IF;
END $$
DELIMITER ;
