-- DBMS Requirement Script (MySQL)
-- Use with database: cab_management

-- 1) VIEW: Driver earnings summary
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

-- 3) PROCEDURE: Get driver earnings by driver_id
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

-- 4) TRIGGER: Auto-update updated_at on booking updates
DROP TRIGGER IF EXISTS trg_booking_updated_at;
DELIMITER $$
CREATE TRIGGER trg_booking_updated_at
BEFORE UPDATE ON booking
FOR EACH ROW
BEGIN
  SET NEW.updated_at = NOW();
END $$
DELIMITER ;

-- 5) TRIGGER: Set default payment_status on booking insert
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

-- 6) AGGREGATE QUERY: Total earnings (all drivers)
SELECT SUM(CASE WHEN payment_status = 'Paid' THEN IFNULL(fare_amount, 0) ELSE 0 END) AS total_earned
FROM booking;

-- 7) AGGREGATE QUERY: Earnings per driver
SELECT d.driver_id, d.name, SUM(CASE WHEN b.payment_status = 'Paid' THEN IFNULL(b.fare_amount, 0) ELSE 0 END) AS earned
FROM drivers d
LEFT JOIN cabs c ON d.driver_id = c.driver_id
LEFT JOIN booking b ON c.cab_id = b.cab_id
GROUP BY d.driver_id, d.name;

-- 8) AGGREGATE QUERY: Active trips
SELECT COUNT(*) AS active_trips
FROM booking
WHERE status IN ('Confirmed', 'Picked');
