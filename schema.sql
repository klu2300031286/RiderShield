-- GigShield: AI-Powered Parametric Insurance Platform
-- MySQL Schema & Seed Data

CREATE DATABASE IF NOT EXISTS gigshield;
USE gigshield;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('worker', 'admin') DEFAULT 'worker',
    location VARCHAR(100) DEFAULT 'Mumbai',
    phone VARCHAR(15),
    platform VARCHAR(50) DEFAULT 'Zomato',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Policies Table
CREATE TABLE IF NOT EXISTS policies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    premium_weekly DECIMAL(10,2) NOT NULL,
    coverage_amount DECIMAL(10,2) NOT NULL,
    risk_score DECIMAL(5,2) DEFAULT 0.0,
    status ENUM('active', 'expired', 'cancelled') DEFAULT 'active',
    start_date DATE NOT NULL,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Claims Table
CREATE TABLE IF NOT EXISTS claims (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    policy_id INT NOT NULL,
    trigger_type ENUM('heavy_rain', 'extreme_heat', 'pollution', 'curfew', 'flood', 'storm') NOT NULL,
    claim_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'fraud_detected') DEFAULT 'pending',
    fraud_flag BOOLEAN DEFAULT FALSE,
    fraud_reason VARCHAR(255),
    location VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (policy_id) REFERENCES policies(id) ON DELETE CASCADE
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    claim_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'processed', 'failed') DEFAULT 'pending',
    method ENUM('upi', 'bank_transfer', 'wallet') DEFAULT 'upi',
    transaction_id VARCHAR(100),
    processed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (claim_id) REFERENCES claims(id) ON DELETE CASCADE
);

-- Risk Data Table
CREATE TABLE IF NOT EXISTS risk_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    location VARCHAR(100) NOT NULL,
    weather_condition VARCHAR(50),
    temperature DECIMAL(5,2),
    humidity DECIMAL(5,2),
    aqi INT,
    risk_level ENUM('low', 'medium', 'high', 'critical') DEFAULT 'low',
    is_disruption BOOLEAN DEFAULT FALSE,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- SEED DATA
-- ============================================

-- Admin user (password: admin123)
INSERT INTO users (name, email, password, role, location, phone, platform) VALUES
('Admin User', 'admin@gigshield.in', '$2b$12$LJ3m4ys3Lk0TSwHvfHnJaOyLEFg2I0GBDq6NzRfAEuX8AOVXVKW6S', 'admin', 'Mumbai', '9999900000', 'Admin');

-- Worker users (password: worker123)
INSERT INTO users (name, email, password, role, location, phone, platform) VALUES
('Raj Kumar', 'raj@example.com', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'worker', 'Mumbai', '9876543210', 'Zomato'),
('Priya Sharma', 'priya@example.com', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'worker', 'Delhi', '9876543211', 'Swiggy'),
('Amit Patel', 'amit@example.com', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'worker', 'Bangalore', '9876543212', 'Amazon'),
('Sunita Devi', 'sunita@example.com', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'worker', 'Chennai', '9876543213', 'Zomato'),
('Vikram Singh', 'vikram@example.com', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'worker', 'Hyderabad', '9876543214', 'Swiggy');

-- Policies
INSERT INTO policies (user_id, premium_weekly, coverage_amount, risk_score, status, start_date, end_date) VALUES
(2, 49.00, 2000.00, 35.5, 'active', '2026-04-01', '2026-06-30'),
(3, 65.00, 3000.00, 55.0, 'active', '2026-04-01', '2026-06-30'),
(4, 42.00, 1800.00, 28.0, 'active', '2026-03-15', '2026-06-15'),
(5, 58.00, 2500.00, 45.0, 'active', '2026-04-01', '2026-06-30'),
(6, 72.00, 3500.00, 62.0, 'active', '2026-03-20', '2026-06-20');

-- Claims
INSERT INTO claims (user_id, policy_id, trigger_type, claim_amount, status, fraud_flag, location, created_at) VALUES
(2, 1, 'heavy_rain', 500.00, 'approved', FALSE, 'Mumbai', '2026-04-02 10:30:00'),
(3, 2, 'pollution', 750.00, 'approved', FALSE, 'Delhi', '2026-04-02 14:00:00'),
(4, 3, 'extreme_heat', 400.00, 'pending', FALSE, 'Bangalore', '2026-04-03 09:15:00'),
(2, 1, 'heavy_rain', 500.00, 'fraud_detected', TRUE, 'Pune', '2026-04-03 10:30:00'),
(5, 4, 'curfew', 600.00, 'approved', FALSE, 'Chennai', '2026-04-03 16:00:00');

-- Payments
INSERT INTO payments (claim_id, amount, status, method, transaction_id, processed_at) VALUES
(1, 500.00, 'processed', 'upi', 'TXN_GS_20260402_001', '2026-04-02 11:00:00'),
(2, 750.00, 'processed', 'bank_transfer', 'TXN_GS_20260402_002', '2026-04-02 15:00:00'),
(5, 600.00, 'processed', 'upi', 'TXN_GS_20260403_003', '2026-04-03 17:00:00');

-- Risk Data
INSERT INTO risk_data (location, weather_condition, temperature, humidity, aqi, risk_level, is_disruption) VALUES
('Mumbai', 'Heavy Rain', 28.5, 92.0, 120, 'high', TRUE),
('Delhi', 'Haze', 35.0, 45.0, 380, 'critical', TRUE),
('Bangalore', 'Extreme Heat', 42.0, 30.0, 85, 'medium', TRUE),
('Chennai', 'Thunderstorm', 30.0, 88.0, 95, 'high', TRUE),
('Hyderabad', 'Clear', 33.0, 55.0, 70, 'low', FALSE),
('Pune', 'Partly Cloudy', 31.0, 60.0, 90, 'low', FALSE),
('Kolkata', 'Heavy Rain', 29.0, 95.0, 110, 'high', TRUE),
('Jaipur', 'Dust Storm', 40.0, 20.0, 350, 'critical', TRUE);
