-- Create Database 
CREATE DATABASE IF NOT EXISTS yatrasathi; 
USE yatrasathi; 

-- ============================== 
--  USERS, ROLES & PERMISSIONS 
-- ============================== 

CREATE TABLE roles ( 
    role_id BIGINT AUTO_INCREMENT PRIMARY KEY, 
    role_name VARCHAR(50) UNIQUE NOT NULL, 
    description TEXT 
); 

CREATE TABLE permissions ( 
    permission_id BIGINT AUTO_INCREMENT PRIMARY KEY, 
    permission_name VARCHAR(100) UNIQUE NOT NULL 
); 

CREATE TABLE role_permissions ( 
    role_id BIGINT, 
    permission_id BIGINT, 
    PRIMARY KEY (role_id, permission_id), 
    FOREIGN KEY (role_id) REFERENCES roles(role_id), 
    FOREIGN KEY (permission_id) REFERENCES permissions(permission_id) 
); 

CREATE TABLE users ( 
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY, 
    name VARCHAR(100) NOT NULL, 
    email VARCHAR(100) UNIQUE NOT NULL, 
    phone VARCHAR(20) UNIQUE NOT NULL, 
    aadhaar VARCHAR(20) UNIQUE, 
    password_hash TEXT NOT NULL, 
    user_type ENUM('CUSTOMER','EMPLOYEE','ADMIN') DEFAULT 'CUSTOMER', 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP 
); 

CREATE TABLE user_roles ( 
    id BIGINT AUTO_INCREMENT PRIMARY KEY, 
    user_id BIGINT, 
    role_id BIGINT, 
    FOREIGN KEY (user_id) REFERENCES users(user_id), 
    FOREIGN KEY (role_id) REFERENCES roles(role_id) 
); 

-- ============================== 
--  EMPLOYEE DETAILS 
-- ============================== 

CREATE TABLE employee_details ( 
    employee_id BIGINT PRIMARY KEY, 
    designation VARCHAR(100), 
    salary DECIMAL(12,2), 
    joined_on DATE, 
    status ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE', 
    FOREIGN KEY (employee_id) REFERENCES users(user_id) 
); 

-- ============================== 
--  STATIONS & TRAINS 
-- ============================== 

CREATE TABLE stations ( 
    station_id BIGINT AUTO_INCREMENT PRIMARY KEY, 
    station_name VARCHAR(100) UNIQUE NOT NULL, 
    station_code VARCHAR(10) UNIQUE NOT NULL, 
    city VARCHAR(100), 
    state VARCHAR(100), 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
); 

CREATE TABLE trains ( 
    train_id BIGINT AUTO_INCREMENT PRIMARY KEY, 
    train_number VARCHAR(20) UNIQUE NOT NULL, 
    train_name VARCHAR(100), 
    departure_station_id BIGINT, 
    arrival_station_id BIGINT, 
    departure_time TIMESTAMP, 
    arrival_time TIMESTAMP, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    FOREIGN KEY (departure_station_id) REFERENCES stations(station_id), 
    FOREIGN KEY (arrival_station_id) REFERENCES stations(station_id) 
); 

-- ============================== 
--  BOOKINGS & PASSENGERS 
-- ============================== 

CREATE TABLE bookings ( 
    booking_id BIGINT AUTO_INCREMENT PRIMARY KEY, 
    customer_id BIGINT NOT NULL, 
    employee_id BIGINT, 
    train_id BIGINT NOT NULL, 
    pnr VARCHAR(20) UNIQUE NOT NULL, 
    travel_date DATE NOT NULL, 
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    class VARCHAR(50), 
    status ENUM('PENDING','CONFIRMED','CANCELLED','WAITLIST') DEFAULT 'PENDING', 
    total_tickets INT DEFAULT 1, 
    cancelled_on TIMESTAMP NULL, 
    cancellation_reason TEXT, 
    FOREIGN KEY (customer_id) REFERENCES users(user_id), 
    FOREIGN KEY (employee_id) REFERENCES users(user_id), 
    FOREIGN KEY (train_id) REFERENCES trains(train_id) 
); 

CREATE TABLE passengers ( 
    passenger_id BIGINT AUTO_INCREMENT PRIMARY KEY, 
    booking_id BIGINT NOT NULL, 
    name VARCHAR(100) NOT NULL, 
    age INT NOT NULL, 
    gender ENUM('MALE','FEMALE','OTHER'), 
    relation_to_primary VARCHAR(50), 
    aadhaar VARCHAR(20), 
    passport_number VARCHAR(20), 
    berth_allotted VARCHAR(20), 
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) 
); 

-- ============================== 
--  PAYMENTS & ACCOUNTS 
-- ============================== 

CREATE TABLE accounts ( 
    account_id BIGINT AUTO_INCREMENT PRIMARY KEY, 
    booking_id BIGINT NOT NULL, 
    total_amount DECIMAL(12,2) NOT NULL, 
    received_amount DECIMAL(12,2) DEFAULT 0, 
    pending_amount DECIMAL(12,2) AS (total_amount - received_amount) STORED, 
    last_payment_date TIMESTAMP NULL, 
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) 
); 

CREATE TABLE payments ( 
    payment_id BIGINT AUTO_INCREMENT PRIMARY KEY, 
    booking_id BIGINT NOT NULL, 
    amount DECIMAL(12,2) NOT NULL, 
    mode ENUM('UPI','CARD','NETBANKING','CASH') DEFAULT 'UPI', 
    transaction_reference VARCHAR(100), 
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    financial_year VARCHAR(10), 
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) 
); 

-- ============================== 
--  AUDIT, NOTIFICATIONS & FEEDBACK 
-- ============================== 

CREATE TABLE login_audit ( 
    id BIGINT AUTO_INCREMENT PRIMARY KEY, 
    user_id BIGINT, 
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    ip_address VARCHAR(50), 
    status ENUM('SUCCESS','FAILED'), 
    FOREIGN KEY (user_id) REFERENCES users(user_id) 
); 

CREATE TABLE notifications ( 
    notification_id BIGINT AUTO_INCREMENT PRIMARY KEY, 
    user_id BIGINT, 
    message TEXT, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    is_read BOOLEAN DEFAULT FALSE, 
    FOREIGN KEY (user_id) REFERENCES users(user_id) 
); 

CREATE TABLE feedback ( 
    feedback_id BIGINT AUTO_INCREMENT PRIMARY KEY, 
    booking_id BIGINT, 
    user_id BIGINT, 
    rating INT CHECK (rating BETWEEN 1 AND 5), 
    comments TEXT, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id), 
    FOREIGN KEY (user_id) REFERENCES users(user_id) 
); 

-- Insert demo data
INSERT INTO roles (role_name, description) VALUES
('ADMIN', 'Administrator with full access'),
('EMPLOYEE', 'Railway employee with ticket management access'),
('CUSTOMER', 'Regular customer with booking privileges');

-- Insert demo stations
INSERT INTO stations (station_name, station_code, city, state) VALUES
('New Delhi Railway Station', 'NDLS', 'New Delhi', 'Delhi'),
('Mumbai Central', 'MMCT', 'Mumbai', 'Maharashtra'),
('Chennai Central', 'MAS', 'Chennai', 'Tamil Nadu'),
('Howrah Junction', 'HWH', 'Kolkata', 'West Bengal'),
('Bengaluru City Junction', 'SBC', 'Bengaluru', 'Karnataka');

-- Insert demo trains
INSERT INTO trains (train_number, train_name, departure_station_id, arrival_station_id, departure_time, arrival_time) VALUES
('12301', 'Rajdhani Express', 1, 2, '2023-06-01 16:55:00', '2023-06-02 08:15:00'),
('12302', 'Shatabdi Express', 2, 3, '2023-06-01 06:00:00', '2023-06-01 14:00:00'),
('12303', 'Duronto Express', 3, 4, '2023-06-01 23:00:00', '2023-06-02 15:30:00'),
('12304', 'Garib Rath', 4, 5, '2023-06-01 22:15:00', '2023-06-02 12:45:00'),
('12305', 'Jan Shatabdi', 5, 1, '2023-06-01 05:30:00', '2023-06-01 22:00:00');