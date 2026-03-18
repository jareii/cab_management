DROP TABLE IF EXISTS users;
CREATE TABLE users (
  user_id int NOT NULL AUTO_INCREMENT,
  name varchar(50) DEFAULT NULL,
  phone varchar(15) DEFAULT NULL,
  email varchar(50) DEFAULT NULL,
  password varchar(50) DEFAULT NULL,
  PRIMARY KEY (user_id)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS drivers;
CREATE TABLE drivers (
  driver_id int NOT NULL,
  name varchar(50) DEFAULT NULL,
  phone varchar(15) DEFAULT NULL,
  license_no varchar(50) DEFAULT NULL,
  email varchar(50) DEFAULT NULL,
  password varchar(50) DEFAULT NULL,
  PRIMARY KEY (driver_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS admin;
CREATE TABLE admin (
  admin_id int NOT NULL AUTO_INCREMENT,
  username varchar(50) NOT NULL,
  password varchar(50) NOT NULL,
  PRIMARY KEY (admin_id)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS cabs;
CREATE TABLE cabs (
  cab_id int NOT NULL AUTO_INCREMENT,
  cab_number varchar(20) DEFAULT NULL,
  cab_type varchar(20) DEFAULT NULL,
  driver_id int DEFAULT NULL,
  ac_type varchar(10) DEFAULT 'AC',
  PRIMARY KEY (cab_id),
  KEY driver_id (driver_id),
  CONSTRAINT cabs_ibfk_1 FOREIGN KEY (driver_id) REFERENCES drivers (driver_id)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS booking;
CREATE TABLE booking (
  booking_id int NOT NULL AUTO_INCREMENT,
  user_id int DEFAULT NULL,
  cab_id int DEFAULT NULL,
  pickup_location varchar(100) DEFAULT NULL,
  drop_location varchar(100) DEFAULT NULL,
  booking_date date DEFAULT NULL,
  booking_time time DEFAULT NULL,
  status varchar(20) DEFAULT 'Confirmed',
  PRIMARY KEY (booking_id),
  KEY booking_ibfk_1 (user_id),
  KEY booking_ibfk_2 (cab_id),
  CONSTRAINT booking_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (user_id),
  CONSTRAINT booking_ibfk_2 FOREIGN KEY (cab_id) REFERENCES cabs (cab_id)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
