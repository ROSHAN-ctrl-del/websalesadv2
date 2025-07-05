-- Sales Management System Database Schema

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS sales_management;
USE sales_management;

-- Sales Admins Table
CREATE TABLE IF NOT EXISTS sales_admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL,
  region VARCHAR(50) NOT NULL,
  password VARCHAR(255) NOT NULL,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  last_login DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_status (status),
  INDEX idx_region (region)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sales Persons Table
CREATE TABLE IF NOT EXISTS sales_persons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL,
  region VARCHAR(50) NOT NULL,
  sales_admin_id INT NOT NULL,
  password VARCHAR(255) NOT NULL,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  current_location VARCHAR(255),
  total_sales DECIMAL(15,2) DEFAULT 0.00,
  deals_count INT DEFAULT 0,
  last_activity DATETIME,
  api_key VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (sales_admin_id) REFERENCES sales_admins(id) ON DELETE CASCADE,
  INDEX idx_email (email),
  INDEX idx_sales_admin (sales_admin_id),
  INDEX idx_status (status),
  INDEX idx_api_key (api_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Customers Table
CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  company VARCHAR(100),
  email VARCHAR(100),
  phone VARCHAR(20),
  address TEXT,
  assigned_to INT,
  total_orders INT DEFAULT 0,
  total_spent DECIMAL(15,2) DEFAULT 0.00,
  last_order DATETIME,
  status ENUM('active', 'inactive', 'potential') DEFAULT 'potential',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_to) REFERENCES sales_persons(id) ON DELETE SET NULL,
  INDEX idx_email (email),
  INDEX idx_assigned_to (assigned_to),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  unit_price DECIMAL(10,2) NOT NULL,
  current_stock INT DEFAULT 0,
  min_stock INT DEFAULT 0,
  max_stock INT DEFAULT 0,
  status ENUM('in_stock', 'low_stock', 'out_of_stock') DEFAULT 'in_stock',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_status (status),
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sales Orders Table
CREATE TABLE IF NOT EXISTS sales_orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id INT NOT NULL,
  sales_person_id INT NOT NULL,
  total_amount DECIMAL(15,2) NOT NULL,
  status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  delivery_date DATETIME,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (sales_person_id) REFERENCES sales_persons(id) ON DELETE CASCADE,
  INDEX idx_order_number (order_number),
  INDEX idx_customer (customer_id),
  INDEX idx_sales_person (sales_person_id),
  INDEX idx_status (status),
  INDEX idx_order_date (order_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_order (order_id),
  INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  user_type ENUM('sales_admin', 'sales_person') NOT NULL,
  action VARCHAR(100) NOT NULL,
  description TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (user_id, user_type),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- API Keys Table
CREATE TABLE IF NOT EXISTS api_keys (
  id INT AUTO_INCREMENT PRIMARY KEY,
  key_name VARCHAR(100) NOT NULL,
  api_key VARCHAR(255) UNIQUE NOT NULL,
  api_secret VARCHAR(255) NOT NULL,
  user_id INT,
  user_type ENUM('sales_admin', 'sales_person') NOT NULL,
  permissions JSON,
  status ENUM('active', 'inactive', 'revoked') DEFAULT 'active',
  last_used DATETIME,
  expires_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_api_key (api_key),
  INDEX idx_user (user_id, user_type),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data
INSERT INTO sales_admins (name, email, phone, region, password) VALUES
('John Smith', 'john.smith@company.com', '+1-555-0123', 'North Region', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
('Sarah Johnson', 'sarah.johnson@company.com', '+1-555-0124', 'South Region', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

INSERT INTO sales_persons (name, email, phone, region, sales_admin_id, password, api_key) VALUES
('Alice Johnson', 'alice.johnson@company.com', '+1-555-0201', 'Downtown', 1, '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'sp_live_alice_123456789'),
('Bob Smith', 'bob.smith@company.com', '+1-555-0202', 'Suburbs', 1, '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'sp_live_bob_987654321'),
('Charlie Brown', 'charlie.brown@company.com', '+1-555-0203', 'Industrial', 2, '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'sp_live_charlie_456789123');

INSERT INTO products (name, category, description, unit_price, current_stock, min_stock, max_stock) VALUES
('Chilli Powder', 'spices', 'Premium quality red chilli powder', 99.99, 150, 20, 500),
('Ginger Powder', 'spices', 'Fresh ground ginger powder', 49.99, 51, 50, 200),
('Turmeric Powder', 'spices', 'Pure turmeric powder', 89.99, 12, 10, 100);

INSERT INTO customers (name, company, email, phone, address, assigned_to) VALUES
('John Doe', 'TechCorp Solutions', 'john.doe@techcorp.com', '+1-555-0301', '123 Tech Street, San Francisco, CA', 1),
('Sarah Wilson', 'RetailMax Inc', 'sarah.wilson@retailmax.com', '+1-555-0302', '456 Commerce Ave, New York, NY', 2),
('Mike Chen', 'StartupXYZ', 'mike.chen@startupxyz.com', '+1-555-0303', '789 Innovation Blvd, Austin, TX', 3);