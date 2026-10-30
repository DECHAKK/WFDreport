-- ======================================================================
-- Database Schema: OrangeCare Insurance Demo
-- Target Engine: MySQL / MariaDB (XAMPP Compatible)
-- Character Set: utf8mb4 / utf8mb4_unicode_ci
-- Engine: InnoDB
-- Notice: This schema is strictly for demonstration and testing purposes.
-- ======================================================================

CREATE DATABASE IF NOT EXISTS `insurance_landing_demo`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `insurance_landing_demo`;

-- ----------------------------------------------------------------------
-- Table: demo_plans
-- Contains hypothetical insurance plan options for demonstration.
-- ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `demo_plans` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `plan_name` VARCHAR(150) NOT NULL COMMENT 'Demo plan display name',
  `description` TEXT NOT NULL COMMENT 'Short marketing description of the demo plan',
  `demo_premium` VARCHAR(100) NOT NULL COMMENT 'Sample hypothetical premium display string',
  `coverage_summary` TEXT NOT NULL COMMENT 'JSON-formatted array or summary of key demo coverage points',
  `is_demo` BOOLEAN NOT NULL DEFAULT 1 COMMENT 'Flag to ensure demo classification',
  `is_active` BOOLEAN NOT NULL DEFAULT 1 COMMENT 'Toggle to show or hide plan',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_plans_active` (`is_active`),
  INDEX `idx_plans_demo` (`is_demo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------
-- Table: leads
-- Contains customer consultation requests submitted via the demo landing page.
-- ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `leads` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `full_name` VARCHAR(150) NOT NULL COMMENT 'Customer full name',
  `phone` VARCHAR(20) NOT NULL COMMENT 'Validated phone number (e.g., Thai mobile 08x, 09x, 06x)',
  `email` VARCHAR(150) DEFAULT NULL COMMENT 'Optional email address',
  `insurance_interest` VARCHAR(50) NOT NULL COMMENT 'Category of interest: life, health, car, savings, etc.',
  `preferred_contact_method` VARCHAR(20) NOT NULL DEFAULT 'phone' COMMENT 'phone, email, or line',
  `consent_given` BOOLEAN NOT NULL DEFAULT 1 COMMENT 'Explicit user consent for demo processing',
  `status` ENUM('pending', 'contacted', 'closed', 'cancelled') NOT NULL DEFAULT 'pending' COMMENT 'Lead lifecycle status',
  `is_demo` BOOLEAN NOT NULL DEFAULT 1 COMMENT 'Flag indicating demo lead',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_leads_status` (`status`),
  INDEX `idx_leads_phone` (`phone`),
  INDEX `idx_leads_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
