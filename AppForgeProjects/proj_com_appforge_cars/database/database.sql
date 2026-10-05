-- ========================================================
-- AppForge AI Database Schema
-- App: AutoForge Market (com.appforge.cars)
-- Generated: 2026-10-05T09:33:39.410Z
-- Engine: MySQL 8.0+ / MariaDB 10.5+
-- Target: cPanel, VPS, DirectAdmin, or Local MySQL
-- ========================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- Table structure for table `roles`
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `display_name` VARCHAR(100) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `users`
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `role_id` INT NOT NULL DEFAULT '3',
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) NULL,
  `avatar` VARCHAR(255) NULL,
  `status` ENUM('active','pending','banned') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_users_email` (`email`),
  KEY `idx_users_role_id` (`role_id`),
  CONSTRAINT `fk_users_role_id` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `categories`
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(120) NOT NULL,
  `icon` VARCHAR(50) NULL,
  `image` VARCHAR(255) NULL,
  `sort_order` INT NOT NULL DEFAULT '0',
  `is_active` BOOLEAN NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `cars`
DROP TABLE IF EXISTS `cars`;
CREATE TABLE `cars` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `category_id` INT NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT NULL,
  `price` DECIMAL(12,2) NOT NULL DEFAULT '0.00',
  `currency` VARCHAR(10) NOT NULL DEFAULT 'USD',
  `status` ENUM('pending','approved','active','sold','inactive') NOT NULL DEFAULT 'pending',
  `views_count` INT NOT NULL DEFAULT '0',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `brand` VARCHAR(80) NOT NULL DEFAULT 'General',
  `model` VARCHAR(80) NOT NULL DEFAULT 'Standard',
  `year` INT NOT NULL DEFAULT '2023',
  `mileage` INT NOT NULL DEFAULT '0',
  `transmission` VARCHAR(30) NULL DEFAULT 'Automatic',
  `fuel_type` VARCHAR(30) NULL DEFAULT 'Petrol',
  `location` VARCHAR(150) NULL DEFAULT 'Downtown',
  PRIMARY KEY (`id`),
  KEY `idx_cars_user_id` (`user_id`),
  KEY `idx_cars_category_id` (`category_id`),
  KEY `idx_cars_status` (`status`),
  CONSTRAINT `fk_cars_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cars_category_id` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `car_images`
DROP TABLE IF EXISTS `car_images`;
CREATE TABLE `car_images` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `car_id` INT NOT NULL,
  `image_url` VARCHAR(255) NOT NULL,
  `is_featured` BOOLEAN NOT NULL DEFAULT '0',
  `sort_order` INT NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_car_images_car_id` FOREIGN KEY (`car_id`) REFERENCES `cars` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `favorites`
DROP TABLE IF EXISTS `favorites`;
CREATE TABLE `favorites` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `car_id` INT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_favorites_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_favorites_car_id` FOREIGN KEY (`car_id`) REFERENCES `cars` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `messages`
DROP TABLE IF EXISTS `messages`;
CREATE TABLE `messages` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `sender_id` INT NOT NULL,
  `receiver_id` INT NOT NULL,
  `car_id` INT NULL,
  `message_text` TEXT NOT NULL,
  `is_read` BOOLEAN NOT NULL DEFAULT '0',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_messages_sender_id` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_messages_receiver_id` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_messages_car_id` FOREIGN KEY (`car_id`) REFERENCES `cars` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `payments`
DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `transaction_id` VARCHAR(100) NOT NULL,
  `gateway` VARCHAR(50) NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `currency` VARCHAR(10) NOT NULL DEFAULT 'USD',
  `status` ENUM('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_payments_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `reviews`
DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `car_id` INT NOT NULL,
  `rating` INT NOT NULL DEFAULT '5',
  `comment` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_reviews_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reviews_car_id` FOREIGN KEY (`car_id`) REFERENCES `cars` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `notifications`
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `body` TEXT NOT NULL,
  `is_read` BOOLEAN NOT NULL DEFAULT '0',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_notifications_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `settings`
DROP TABLE IF EXISTS `settings`;
CREATE TABLE `settings` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `setting_key` VARCHAR(80) NOT NULL,
  `setting_value` TEXT NULL,
  `group_name` VARCHAR(50) NOT NULL DEFAULT 'general',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `pages`
DROP TABLE IF EXISTS `pages`;
CREATE TABLE `pages` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `slug` VARCHAR(100) NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `content` LONGTEXT NULL,
  `is_published` BOOLEAN NOT NULL DEFAULT '1',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ========================================================
-- Default Seed Data & Initial Admin Account
-- ========================================================

-- Default User Roles
INSERT INTO `roles` (`id`, `name`, `display_name`, `created_at`) VALUES
(1, 'admin', 'Super Administrator', NOW()),
(2, 'moderator', 'Moderator', NOW()),
(3, 'user', 'Regular Customer / User', NOW());

-- Default Super Admin User (Password: Admin@123456)
INSERT INTO `users` (`id`, `role_id`, `name`, `email`, `password`, `status`, `created_at`) VALUES
(1, 1, 'System Admin', 'admin@appforge.local', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'active', NOW());

-- Default App Settings
INSERT INTO `settings` (`setting_key`, `setting_value`, `group_name`) VALUES
('app_name', 'AutoForge Market', 'general'),
('app_package', 'com.appforge.cars', 'general'),
('primary_color', '#2563EB', 'theme'),
('secondary_color', '#1D4ED8', 'theme'),
('currency', 'USD', 'finance'),
('contact_email', 'support@appforge.com', 'contact'),
('stripe_mode', 'sandbox', 'payments'),
('paypal_mode', 'sandbox', 'payments'),
('maintenance_mode', '0', 'general');

-- Default Legal & Content Pages
INSERT INTO `pages` (`slug`, `title`, `content`, `is_published`, `created_at`) VALUES
('privacy-policy', 'Privacy Policy', '<h2>Privacy Policy</h2><p>Your privacy is strictly guarded. We collect minimal information required to deliver services.</p>', 1, NOW()),
('terms-of-service', 'Terms & Conditions', '<h2>Terms & Conditions</h2><p>By using AutoForge Market, you agree to abide by community standards and applicable laws.</p>', 1, NOW()),
('about-us', 'About Us', '<h2>About Us</h2><p>Welcome to AutoForge Market. Engineered with passion for unmatched user convenience.</p>', 1, NOW());
