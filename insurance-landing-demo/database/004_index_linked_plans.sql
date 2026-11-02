-- ======================================================================
-- Index Linked Savings Plans (25/7 and 25/15) — OrangeCare Insurance Demo
-- MySQL / MariaDB (XAMPP Compatible)
-- Safe to re-import: every row is upserted by its primary key.
-- This script does not modify demo_plans, leads or the existing rate tables.
-- Creates the demo database when it does not exist yet.
--
-- DEMO DATA NOTICE
--   • Structure follows a real Thai index-linked savings quotation
--     ("ตารางแสดงผลประโยชน์") but every value here is treated as DEMO DATA.
--   • Premium rate = 1,000 THB per 1,000 THB sum assured per year
--     (flat for every age and gender).
--   • Cash value of SS25_7 is taken 1:1 from the source quotation
--     (sum assured 100,000 / premium 100,000 x 7 years) and scales linearly
--     with the sum assured. SS25_15 has no published cash value table in the
--     source document, so its curve applies the same "cash value ÷ maturity
--     benefit" ratio of SS25_7 to its 1,480% maturity benefit. Both are
--     illustrative only and must be replaced by the real "ตารางมูลค่ากรมธรรม์"
--     before any production use.
-- ======================================================================

CREATE DATABASE IF NOT EXISTS `insurance_landing_demo`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `insurance_landing_demo`;

-- ----------------------------------------------------------------------
-- Table: index_linked_plans
-- One row per plan variant (premium payment term 7 or 15 years).
-- ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `index_linked_plans` (
  `plan_code` VARCHAR(20) NOT NULL PRIMARY KEY COMMENT 'e.g. SS25_7',
  `plan_name` VARCHAR(150) NOT NULL COMMENT 'Display name of the demo plan',
  `short_label` VARCHAR(50) NOT NULL COMMENT 'Compact label used in tables',
  `payment_years` SMALLINT UNSIGNED NOT NULL COMMENT 'Premium payment term (7 or 15)',
  `coverage_years` SMALLINT UNSIGNED NOT NULL COMMENT 'Coverage term in years (25)',
  `min_age` TINYINT UNSIGNED NOT NULL COMMENT 'Minimum issue age in years',
  `max_age` TINYINT UNSIGNED NOT NULL COMMENT 'Maximum issue age in years',
  `min_sum_assured` INT UNSIGNED NOT NULL COMMENT 'Minimum sum assured (THB)',
  `senior_age_threshold` TINYINT UNSIGNED DEFAULT NULL COMMENT 'Age from which the senior minimum applies',
  `senior_min_sum_assured` INT UNSIGNED DEFAULT NULL COMMENT 'Minimum sum assured for senior ages (THB)',
  `premium_per_thousand` DECIMAL(10,2) NOT NULL COMMENT 'Annual premium per 1,000 THB sum assured',
  `annual_cashback_percent` DECIMAL(6,2) NOT NULL COMMENT 'Guaranteed cashback, % of sum assured per year',
  `cashback_years` SMALLINT UNSIGNED NOT NULL COMMENT 'Number of policy years that pay the cashback',
  `maturity_percent` DECIMAL(8,2) NOT NULL COMMENT 'Maturity benefit, % of sum assured',
  `death_benefit_premium_percent` DECIMAL(6,2) NOT NULL COMMENT 'Death benefit, % of total premiums paid',
  `participation_rate` DECIMAL(6,2) NOT NULL COMMENT 'Participation rate (PR) for non-guaranteed benefits',
  `ng_split_year` SMALLINT UNSIGNED NOT NULL COMMENT 'Policy year of the first non-guaranteed payout',
  `expense_ratio_percent` DECIMAL(6,2) DEFAULT NULL COMMENT 'Disclosed expense ratio of the demo product',
  `is_demo` BOOLEAN NOT NULL DEFAULT 1,
  `is_active` BOOLEAN NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_index_linked_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ----------------------------------------------------------------------
-- Table: index_linked_plan_schedule
-- One row per policy year: premium rate, cashback rate and cash value,
-- all expressed per 1,000 THB of sum assured so any sum assured can be used.
-- ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `index_linked_plan_schedule` (
  `plan_code` VARCHAR(20) NOT NULL,
  `policy_year` TINYINT UNSIGNED NOT NULL,
  `premium_per_thousand` DECIMAL(10,2) NOT NULL COMMENT 'Annual premium per 1,000 THB sum assured',
  `cashback_percent` DECIMAL(6,2) NOT NULL COMMENT 'Guaranteed cashback of this year, % of sum assured',
  `cash_value_per_thousand` DECIMAL(12,2) NOT NULL COMMENT 'Cash (surrender) value per 1,000 THB sum assured',
  PRIMARY KEY (`plan_code`, `policy_year`),
  CONSTRAINT `fk_index_linked_schedule_plan`
    FOREIGN KEY (`plan_code`) REFERENCES `index_linked_plans` (`plan_code`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------
-- Table: index_linked_scenarios
-- Index growth assumptions rendered as columns of the projection table
-- (2%, 4%, 6% from the source quotation plus 8% added for this demo).
-- ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `index_linked_scenarios` (
  `scenario_code` VARCHAR(10) NOT NULL PRIMARY KEY COMMENT 'e.g. IDX2',
  `annual_index_change_percent` DECIMAL(6,2) NOT NULL COMMENT 'Assumed average index growth per year',
  `display_order` TINYINT UNSIGNED NOT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT 1,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

START TRANSACTION;

-- ----------------------------------------------------------------------
-- Seed: index_linked_plans
-- ----------------------------------------------------------------------
INSERT INTO `index_linked_plans`
  (`plan_code`, `plan_name`, `short_label`, `payment_years`, `coverage_years`,
   `min_age`, `max_age`, `min_sum_assured`, `senior_age_threshold`, `senior_min_sum_assured`,
   `premium_per_thousand`, `annual_cashback_percent`, `cashback_years`, `maturity_percent`,
   `death_benefit_premium_percent`, `participation_rate`, `ng_split_year`, `expense_ratio_percent`,
   `is_demo`, `is_active`)
VALUES
  ('SS25_7', 'ประกันสะสมทรัพย์ อินเด็กซ์ลิงก์ 25/7 (แผนตัวอย่าง)', '25/7', 7, 25,
   1, 75, 20000, 71, 150000,
   1000.00, 1.00, 24, 700.00, 101.00, 100.00, 7, 54.82, 1, 1),
  ('SS25_15', 'ประกันสะสมทรัพย์ อินเด็กซ์ลิงก์ 25/15 (แผนตัวอย่าง)', '25/15', 15, 25,
   1, 70, 20000, NULL, NULL,
   1000.00, 1.00, 24, 1480.00, 101.00, 100.00, 15, 54.82, 1, 1)
ON DUPLICATE KEY UPDATE
  `plan_name` = VALUES(`plan_name`),
  `short_label` = VALUES(`short_label`),
  `payment_years` = VALUES(`payment_years`),
  `coverage_years` = VALUES(`coverage_years`),
  `min_age` = VALUES(`min_age`),
  `max_age` = VALUES(`max_age`),
  `min_sum_assured` = VALUES(`min_sum_assured`),
  `senior_age_threshold` = VALUES(`senior_age_threshold`),
  `senior_min_sum_assured` = VALUES(`senior_min_sum_assured`),
  `premium_per_thousand` = VALUES(`premium_per_thousand`),
  `annual_cashback_percent` = VALUES(`annual_cashback_percent`),
  `cashback_years` = VALUES(`cashback_years`),
  `maturity_percent` = VALUES(`maturity_percent`),
  `death_benefit_premium_percent` = VALUES(`death_benefit_premium_percent`),
  `participation_rate` = VALUES(`participation_rate`),
  `ng_split_year` = VALUES(`ng_split_year`),
  `expense_ratio_percent` = VALUES(`expense_ratio_percent`),
  `is_demo` = VALUES(`is_demo`),
  `is_active` = VALUES(`is_active`);

-- ----------------------------------------------------------------------
-- Seed: index_linked_scenarios (2%, 4%, 6% + 8% added for this demo)
-- ----------------------------------------------------------------------
INSERT INTO `index_linked_scenarios`
  (`scenario_code`, `annual_index_change_percent`, `display_order`, `is_active`)
VALUES
  ('IDX2', 2.00, 1, 1),
  ('IDX4', 4.00, 2, 1),
  ('IDX6', 6.00, 3, 1),
  ('IDX8', 8.00, 4, 1)
ON DUPLICATE KEY UPDATE
  `annual_index_change_percent` = VALUES(`annual_index_change_percent`),
  `display_order` = VALUES(`display_order`),
  `is_active` = VALUES(`is_active`);


-- ----------------------------------------------------------------------
-- Seed: index_linked_plan_schedule (25 policy years x 2 plans)
-- ----------------------------------------------------------------------
INSERT INTO `index_linked_plan_schedule`
  (`plan_code`, `policy_year`, `premium_per_thousand`, `cashback_percent`, `cash_value_per_thousand`)
VALUES
  ('SS25_7', 1, 1000.00, 1.00, 33.00),
  ('SS25_7', 2, 1000.00, 1.00, 316.00),
  ('SS25_7', 3, 1000.00, 1.00, 957.00),
  ('SS25_7', 4, 1000.00, 1.00, 1633.00),
  ('SS25_7', 5, 1000.00, 1.00, 2455.00),
  ('SS25_7', 6, 1000.00, 1.00, 3119.00),
  ('SS25_7', 7, 1000.00, 1.00, 3808.00),
  ('SS25_7', 8, 0.00, 1.00, 3935.00),
  ('SS25_7', 9, 0.00, 1.00, 4067.00),
  ('SS25_7', 10, 0.00, 1.00, 4205.00),
  ('SS25_7', 11, 0.00, 1.00, 4347.00),
  ('SS25_7', 12, 0.00, 1.00, 4494.00),
  ('SS25_7', 13, 0.00, 1.00, 4647.00),
  ('SS25_7', 14, 0.00, 1.00, 4805.00),
  ('SS25_7', 15, 0.00, 1.00, 4970.00),
  ('SS25_7', 16, 0.00, 1.00, 5140.00),
  ('SS25_7', 17, 0.00, 1.00, 5317.00),
  ('SS25_7', 18, 0.00, 1.00, 5500.00),
  ('SS25_7', 19, 0.00, 1.00, 5690.00),
  ('SS25_7', 20, 0.00, 1.00, 5887.00),
  ('SS25_7', 21, 0.00, 1.00, 6092.00),
  ('SS25_7', 22, 0.00, 1.00, 6304.00),
  ('SS25_7', 23, 0.00, 1.00, 6524.00),
  ('SS25_7', 24, 0.00, 1.00, 6753.00),
  ('SS25_7', 25, 0.00, 0.00, 7000.00),
  ('SS25_15', 1, 1000.00, 1.00, 69.77),
  ('SS25_15', 2, 1000.00, 1.00, 668.11),
  ('SS25_15', 3, 1000.00, 1.00, 2023.37),
  ('SS25_15', 4, 1000.00, 1.00, 3452.63),
  ('SS25_15', 5, 1000.00, 1.00, 5190.57),
  ('SS25_15', 6, 1000.00, 1.00, 6594.46),
  ('SS25_15', 7, 1000.00, 1.00, 8051.20),
  ('SS25_15', 8, 1000.00, 1.00, 8319.71),
  ('SS25_15', 9, 1000.00, 1.00, 8598.80),
  ('SS25_15', 10, 1000.00, 1.00, 8890.57),
  ('SS25_15', 11, 1000.00, 1.00, 9190.80),
  ('SS25_15', 12, 1000.00, 1.00, 9501.60),
  ('SS25_15', 13, 1000.00, 1.00, 9825.09),
  ('SS25_15', 14, 1000.00, 1.00, 10159.14),
  ('SS25_15', 15, 1000.00, 1.00, 10508.00),
  ('SS25_15', 16, 0.00, 1.00, 10867.43),
  ('SS25_15', 17, 0.00, 1.00, 11241.66),
  ('SS25_15', 18, 0.00, 1.00, 11628.57),
  ('SS25_15', 19, 0.00, 1.00, 12030.29),
  ('SS25_15', 20, 0.00, 1.00, 12446.80),
  ('SS25_15', 21, 0.00, 1.00, 12880.23),
  ('SS25_15', 22, 0.00, 1.00, 13328.46),
  ('SS25_15', 23, 0.00, 1.00, 13793.60),
  ('SS25_15', 24, 0.00, 1.00, 14277.77),
  ('SS25_15', 25, 0.00, 0.00, 14800.00)
ON DUPLICATE KEY UPDATE
  `premium_per_thousand` = VALUES(`premium_per_thousand`),
  `cashback_percent` = VALUES(`cashback_percent`),
  `cash_value_per_thousand` = VALUES(`cash_value_per_thousand`);

COMMIT;
