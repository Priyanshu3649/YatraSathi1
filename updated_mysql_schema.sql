-- ========================================== 
-- YatraSathi - MySQL Schema and Demo Data 
-- ========================================== 

-- 1) Database 
CREATE DATABASE IF NOT EXISTS `yatrasathi` 
  CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci; 
USE `yatrasathi`; 

-- 2) Tables 

-- users: stores all accounts (admin, employee, customer) 
CREATE TABLE IF NOT EXISTS `users` ( 
  `id` BIGINT NOT NULL AUTO_INCREMENT, 
  `email` VARCHAR(255) NOT NULL, 
  `phone` VARCHAR(15) NOT NULL, 
  `aadhaar` CHAR(12) NOT NULL, 
  `password_hash` VARCHAR(100) NOT NULL, 
  `role` VARCHAR(20) NOT NULL,           -- ADMIN | EMPLOYEE | CUSTOMER 
  `active` TINYINT(1) NOT NULL DEFAULT 1, 
  PRIMARY KEY (`id`), 
  UNIQUE KEY `uk_users_email` (`email`), 
  UNIQUE KEY `uk_users_phone` (`phone`), 
  UNIQUE KEY `uk_users_aadhaar` (`aadhaar`) 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4; 

-- employees: one-to-one link to users for employee profile 
CREATE TABLE IF NOT EXISTS `employees` ( 
  `id` BIGINT NOT NULL AUTO_INCREMENT, 
  `account_id` BIGINT NOT NULL,          -- FK to users.id 
  `name` VARCHAR(255), 
  `department` VARCHAR(255), 
  `active` TINYINT(1) NOT NULL DEFAULT 1, 
  PRIMARY KEY (`id`), 
  UNIQUE KEY `uk_employees_account` (`account_id`), 
  CONSTRAINT `fk_employees_user` FOREIGN KEY (`account_id`) 
    REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4; 

-- ticket_requests: requests raised by customers 
CREATE TABLE IF NOT EXISTS `ticket_requests` ( 
  `id` BIGINT NOT NULL AUTO_INCREMENT, 
  `customer_id` BIGINT NOT NULL,         -- FK to users.id 
  `origin` VARCHAR(255) NOT NULL, 
  `destination` VARCHAR(255) NOT NULL, 
  `travel_date` DATE NOT NULL, 
  `travel_class` VARCHAR(32),            -- SLEEPER | THREE_A | TWO_A | ONE_A | CHAIR_CAR | SECOND_SITTING 
  `berth_preference` VARCHAR(32),        -- UPPER | MIDDLE | LOWER | SIDE_UPPER | SIDE_LOWER | NONE 
  `special_requirements` VARCHAR(1000), 
  `status` VARCHAR(32) NOT NULL,         -- PENDING | APPROVED | CONFIRMED 
  `approved_ticket_count` INT NULL, 
  `assigned_pnr` VARCHAR(32), 
  `assigned_employee_id` BIGINT NULL,    -- FK to employees.id 
  `passenger_count` INT NOT NULL DEFAULT 1, -- Added passenger_count field
  PRIMARY KEY (`id`), 
  KEY `idx_tr_status` (`status`), 
  KEY `idx_tr_date` (`travel_date`), 
  KEY `idx_tr_customer` (`customer_id`), 
  KEY `idx_tr_assigned_emp` (`assigned_employee_id`), 
  CONSTRAINT `fk_tr_customer` FOREIGN KEY (`customer_id`) 
    REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT, 
  CONSTRAINT `fk_tr_employee` FOREIGN KEY (`assigned_employee_id`) 
    REFERENCES `employees` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4; 

-- passengers: stores passenger details for ticket requests
CREATE TABLE IF NOT EXISTS `passengers` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `ticket_request_id` BIGINT NOT NULL,   -- FK to ticket_requests.id
  `name` VARCHAR(255) NOT NULL,
  `age` INT NOT NULL,
  `gender` VARCHAR(20) NOT NULL,
  `id_proof_type` VARCHAR(50),
  `id_proof_number` VARCHAR(50),
  PRIMARY KEY (`id`),
  KEY `idx_passenger_ticket` (`ticket_request_id`),
  CONSTRAINT `fk_passenger_ticket` FOREIGN KEY (`ticket_request_id`)
    REFERENCES `ticket_requests` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- payments: payments attached to ticket requests 
CREATE TABLE IF NOT EXISTS `payments` ( 
  `id` BIGINT NOT NULL AUTO_INCREMENT, 
  `ticket_request_id` BIGINT NOT NULL,   -- FK to ticket_requests.id 
  `amount` DECIMAL(12,2) NOT NULL, 
  `mode` VARCHAR(32) NOT NULL,           -- UPI | CASH | CHEQUE | NET_BANKING 
  `status` VARCHAR(32) NOT NULL,         -- PENDING | COMPLETED | FAILED | PARTIAL 
  `reference` VARCHAR(128), 
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, 
  PRIMARY KEY (`id`), 
  KEY `idx_payment_status` (`status`), 
  KEY `idx_payment_ticket` (`ticket_request_id`), 
  CONSTRAINT `fk_payment_ticket` FOREIGN KEY (`ticket_request_id`) 
    REFERENCES `ticket_requests` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4; 

-- audit_logs: record of actions 
CREATE TABLE IF NOT EXISTS `audit_logs` ( 
  `id` BIGINT NOT NULL AUTO_INCREMENT, 
  `actor` VARCHAR(255) NOT NULL,         -- email or 'system' 
  `action` VARCHAR(100) NOT NULL, 
  `details` VARCHAR(1000), 
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, 
  PRIMARY KEY (`id`) 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4; 


-- 3) Demo data 
-- IMPORTANT: 
-- The backend seeds default accounts on first run: 
--   Admin:    admin@yatrasathi.com / phone 9999999999 
--   Employee: employee1@yatrasathi.com / phone 8888888888 
--   Customer: customer1@yatrasathi.com / phone 7777777777 
-- After you run the backend once (so those users and an employee row exist), 
-- run the inserts below. 

-- Create a couple of additional customers for variety (optional). 
-- NOTE: Replace password_hash with a BCrypt hash if you want these to be usable for login. 
-- Otherwise, keep them inactive or use them only for data relations.