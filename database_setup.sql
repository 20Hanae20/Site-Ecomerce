-- SQL script to create all tables for the Maison de Parfum e-commerce site
-- Run this script in phpMyAdmin or MySQL client to create the database structure

-- Create users table
CREATE TABLE `users` (
    `id` bigint unsigned NOT NULL AUTO_INCREMENT,
    `name` varchar(255) NOT NULL,
    `email` varchar(255) NOT NULL,
    `email_verified_at` timestamp NULL DEFAULT NULL,
    `password` varchar(255) NOT NULL,
    `remember_token` varchar(100) DEFAULT NULL,
    `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create password_reset_tokens table
CREATE TABLE `password_reset_tokens` (
    `email` varchar(255) NOT NULL,
    `token` varchar(255) NOT NULL,
    `created_at` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create sessions table
CREATE TABLE `sessions` (
    `id` varchar(255) NOT NULL,
    `user_id` bigint unsigned DEFAULT NULL,
    `ip_address` varchar(45) DEFAULT NULL,
    `user_agent` text,
    `payload` longtext NOT NULL,
    `last_activity` int NOT NULL,
    PRIMARY KEY (`id`),
    KEY `sessions_user_id_index` (`user_id`),
    KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create cache table
CREATE TABLE `cache` (
    `key` varchar(255) NOT NULL,
    `value` longtext NOT NULL,
    `expiration` int NOT NULL,
    PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create cache_locks table
CREATE TABLE `cache_locks` (
    `key` varchar(255) NOT NULL,
    `owner` varchar(255) NOT NULL,
    `expiration` int NOT NULL,
    PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create jobs table
CREATE TABLE `jobs` (
    `id` bigint unsigned NOT NULL AUTO_INCREMENT,
    `queue` varchar(255) NOT NULL,
    `payload` longtext NOT NULL,
    `attempts` tinyint unsigned NOT NULL,
    `reserved_at` int unsigned DEFAULT NULL,
    `available_at` int NOT NULL,
    `created_at` int NOT NULL,
    PRIMARY KEY (`id`),
    KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create job_batches table
CREATE TABLE `job_batches` (
    `id` varchar(255) NOT NULL,
    `name` varchar(255) NOT NULL,
    `total_jobs` int NOT NULL,
    `pending_jobs` int NOT NULL,
    `failed_jobs` int NOT NULL,
    `failed_job_ids` longtext NOT NULL,
    `options` mediumtext,
    `created_at` int NOT NULL,
    `cancelled_at` int DEFAULT NULL,
    `finished_at` int DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create failed_jobs table
CREATE TABLE `failed_jobs` (
    `id` bigint unsigned NOT NULL AUTO_INCREMENT,
    `uuid` varchar(255) NOT NULL,
    `connection` text NOT NULL,
    `queue` text NOT NULL,
    `payload` longtext NOT NULL,
    `exception` longtext NOT NULL,
    `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create personal_access_tokens table
CREATE TABLE `personal_access_tokens` (
    `id` bigint unsigned NOT NULL AUTO_INCREMENT,
    `tokenable_type` varchar(255) NOT NULL,
    `tokenable_id` bigint unsigned NOT NULL,
    `name` varchar(255) NOT NULL,
    `token` varchar(64) NOT NULL,
    `abilities` text DEFAULT NULL,
    `last_used_at` timestamp NULL DEFAULT NULL,
    `expires_at` timestamp NULL DEFAULT NULL,
    `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
    KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create perfumes table
CREATE TABLE `perfumes` (
    `id` bigint unsigned NOT NULL AUTO_INCREMENT,
    `name` varchar(255) NOT NULL,
    `description` text NOT NULL,
    `notes` varchar(255) NOT NULL,
    `price` decimal(8,2) NOT NULL,
    `image_url` varchar(255) DEFAULT NULL,
    `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add profile fields to users table
ALTER TABLE `users` 
ADD COLUMN `first_name` varchar(255) DEFAULT NULL AFTER `password`,
ADD COLUMN `last_name` varchar(255) DEFAULT NULL AFTER `first_name`,
ADD COLUMN `phone` varchar(20) DEFAULT NULL AFTER `last_name`,
ADD COLUMN `date_of_birth` date DEFAULT NULL AFTER `phone`,
ADD COLUMN `gender` enum('male','female','other') DEFAULT NULL AFTER `date_of_birth`;

-- Create addresses table
CREATE TABLE `addresses` (
    `id` bigint unsigned NOT NULL AUTO_INCREMENT,
    `user_id` bigint unsigned NOT NULL,
    `type` enum('billing','shipping') NOT NULL DEFAULT 'shipping',
    `address_line_1` varchar(255) NOT NULL,
    `address_line_2` varchar(255) DEFAULT NULL,
    `city` varchar(100) NOT NULL,
    `state` varchar(100) DEFAULT NULL,
    `postal_code` varchar(20) NOT NULL,
    `country` varchar(100) NOT NULL DEFAULT 'France',
    `is_default` tinyint(1) NOT NULL DEFAULT '0',
    `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `addresses_user_id_foreign` (`user_id`),
    CONSTRAINT `addresses_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create categories table
CREATE TABLE `categories` (
    `id` bigint unsigned NOT NULL AUTO_INCREMENT,
    `name` varchar(255) NOT NULL,
    `slug` varchar(255) NOT NULL,
    `description` text DEFAULT NULL,
    `image_url` varchar(255) DEFAULT NULL,
    `parent_id` bigint unsigned DEFAULT NULL,
    `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `categories_slug_unique` (`slug`),
    KEY `categories_parent_id_foreign` (`parent_id`),
    CONSTRAINT `categories_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add advanced fields to perfumes table
ALTER TABLE `perfumes` 
ADD COLUMN `category_id` bigint unsigned DEFAULT NULL AFTER `image_url`,
ADD COLUMN `brand` varchar(255) DEFAULT NULL AFTER `category_id`,
ADD COLUMN `concentration` enum('eau_de_parfum','eau_de_toilette','eau_de_cologne','parfum','eau_fraiche') DEFAULT NULL AFTER `brand`,
ADD COLUMN `size_ml` int DEFAULT NULL AFTER `concentration`,
ADD COLUMN `gender_target` enum('men','women','unisex') DEFAULT NULL AFTER `size_ml`,
ADD COLUMN `launch_year` int DEFAULT NULL AFTER `gender_target`,
ADD COLUMN `ingredients` text DEFAULT NULL AFTER `launch_year`,
ADD COLUMN `is_featured` tinyint(1) NOT NULL DEFAULT '0' AFTER `ingredients`,
ADD COLUMN `is_active` tinyint(1) NOT NULL DEFAULT '1' AFTER `is_featured`,
ADD COLUMN `stock_quantity` int NOT NULL DEFAULT '0' AFTER `is_active`,
ADD INDEX `perfumes_category_id_foreign` (`category_id`),
ADD CONSTRAINT `perfumes_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

-- Create carts table
CREATE TABLE `carts` (
    `id` bigint unsigned NOT NULL AUTO_INCREMENT,
    `user_id` bigint unsigned DEFAULT NULL,
    `session_id` varchar(255) DEFAULT NULL,
    `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `carts_user_id_foreign` (`user_id`),
    KEY `carts_session_id_index` (`session_id`),
    CONSTRAINT `carts_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create cart_items table
CREATE TABLE `cart_items` (
    `id` bigint unsigned NOT NULL AUTO_INCREMENT,
    `cart_id` bigint unsigned NOT NULL,
    `perfume_id` bigint unsigned NOT NULL,
    `quantity` int NOT NULL DEFAULT '1',
    `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `cart_items_cart_id_foreign` (`cart_id`),
    KEY `cart_items_perfume_id_foreign` (`perfume_id`),
    CONSTRAINT `cart_items_cart_id_foreign` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`) ON DELETE CASCADE,
    CONSTRAINT `cart_items_perfume_id_foreign` FOREIGN KEY (`perfume_id`) REFERENCES `perfumes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create orders table
CREATE TABLE `orders` (
    `id` bigint unsigned NOT NULL AUTO_INCREMENT,
    `user_id` bigint unsigned NOT NULL,
    `order_number` varchar(255) NOT NULL,
    `status` enum('pending','processing','shipped','delivered','cancelled','refunded') NOT NULL DEFAULT 'pending',
    `subtotal` decimal(10,2) NOT NULL,
    `tax_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
    `shipping_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
    `total_amount` decimal(10,2) NOT NULL,
    `currency` varchar(3) NOT NULL DEFAULT 'EUR',
    `shipping_address` text NOT NULL,
    `billing_address` text NOT NULL,
    `notes` text DEFAULT NULL,
    `shipped_at` timestamp NULL DEFAULT NULL,
    `delivered_at` timestamp NULL DEFAULT NULL,
    `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `orders_order_number_unique` (`order_number`),
    KEY `orders_user_id_foreign` (`user_id`),
    CONSTRAINT `orders_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create order_items table
CREATE TABLE `order_items` (
    `id` bigint unsigned NOT NULL AUTO_INCREMENT,
    `order_id` bigint unsigned NOT NULL,
    `perfume_id` bigint unsigned NOT NULL,
    `quantity` int NOT NULL,
    `price` decimal(8,2) NOT NULL,
    `total` decimal(10,2) NOT NULL,
    `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `order_items_order_id_foreign` (`order_id`),
    KEY `order_items_perfume_id_foreign` (`perfume_id`),
    CONSTRAINT `order_items_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
    CONSTRAINT `order_items_perfume_id_foreign` FOREIGN KEY (`perfume_id`) REFERENCES `perfumes` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create payments table
CREATE TABLE `payments` (
    `id` bigint unsigned NOT NULL AUTO_INCREMENT,
    `order_id` bigint unsigned NOT NULL,
    `payment_method` enum('card','paypal','cash','bank_transfer','cod','stripe') NOT NULL DEFAULT 'card',
    `amount` decimal(10,2) NOT NULL,
    `currency` varchar(3) NOT NULL DEFAULT 'EUR',
    `status` enum('pending','processing','completed','failed','refunded') NOT NULL DEFAULT 'pending',
    `transaction_id` varchar(255) DEFAULT NULL,
    `gateway_response` json DEFAULT NULL,
    `paid_at` timestamp NULL DEFAULT NULL,
    `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `payments_order_id_foreign` (`order_id`),
    CONSTRAINT `payments_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create reviews table
CREATE TABLE `reviews` (
    `id` bigint unsigned NOT NULL AUTO_INCREMENT,
    `user_id` bigint unsigned NOT NULL,
    `perfume_id` bigint unsigned NOT NULL,
    `rating` tinyint unsigned NOT NULL,
    `title` varchar(255) DEFAULT NULL,
    `comment` text DEFAULT NULL,
    `is_verified_purchase` tinyint(1) NOT NULL DEFAULT '0',
    `is_approved` tinyint(1) NOT NULL DEFAULT '1',
    `helpful_count` int NOT NULL DEFAULT '0',
    `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `reviews_user_id_foreign` (`user_id`),
    KEY `reviews_perfume_id_foreign` (`perfume_id`),
    CONSTRAINT `reviews_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `reviews_perfume_id_foreign` FOREIGN KEY (`perfume_id`) REFERENCES `perfumes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add rating to perfumes table
ALTER TABLE `perfumes` 
ADD COLUMN `rating_avg` decimal(3,2) DEFAULT NULL AFTER `stock_quantity`,
ADD COLUMN `rating_count` int NOT NULL DEFAULT '0' AFTER `rating_avg`;

-- Create stock_movements table
CREATE TABLE `stock_movements` (
    `id` bigint unsigned NOT NULL AUTO_INCREMENT,
    `perfume_id` bigint unsigned NOT NULL,
    `type` enum('in','out','adjustment') NOT NULL,
    `quantity` int NOT NULL,
    `reason` varchar(255) DEFAULT NULL,
    `reference_id` bigint unsigned DEFAULT NULL,
    `reference_type` varchar(255) DEFAULT NULL,
    `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `stock_movements_perfume_id_foreign` (`perfume_id`),
    CONSTRAINT `stock_movements_perfume_id_foreign` FOREIGN KEY (`perfume_id`) REFERENCES `perfumes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add gallery to perfumes table
ALTER TABLE `perfumes` 
ADD COLUMN `gallery` json DEFAULT NULL AFTER `rating_count`;

-- Add role and status to users table
ALTER TABLE `users` 
ADD COLUMN `role` enum('customer','admin','manager') NOT NULL DEFAULT 'customer' AFTER `gender`,
ADD COLUMN `status` enum('active','inactive','banned') NOT NULL DEFAULT 'active' AFTER `role`,
ADD COLUMN `email_verified` tinyint(1) NOT NULL DEFAULT '0' AFTER `status`;

-- Create admin_login_logs table
CREATE TABLE `admin_login_logs` (
    `id` bigint unsigned NOT NULL AUTO_INCREMENT,
    `user_id` bigint unsigned NOT NULL,
    `ip_address` varchar(45) NOT NULL,
    `user_agent` text,
    `login_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    `logout_at` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `admin_login_logs_user_id_foreign` (`user_id`),
    CONSTRAINT `admin_login_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add is_active to categories table
ALTER TABLE `categories` 
ADD COLUMN `is_active` tinyint(1) NOT NULL DEFAULT '1' AFTER `parent_id`,
ADD COLUMN `sort_order` int NOT NULL DEFAULT '0' AFTER `is_active`;

-- Create promotions table
CREATE TABLE `promotions` (
    `id` bigint unsigned NOT NULL AUTO_INCREMENT,
    `name` varchar(255) NOT NULL,
    `code` varchar(50) DEFAULT NULL,
    `description` text DEFAULT NULL,
    `type` enum('percentage','fixed_amount') NOT NULL,
    `value` decimal(8,2) NOT NULL,
    `minimum_amount` decimal(8,2) DEFAULT NULL,
    `usage_limit` int DEFAULT NULL,
    `used_count` int NOT NULL DEFAULT '0',
    `starts_at` timestamp NULL DEFAULT NULL,
    `expires_at` timestamp NULL DEFAULT NULL,
    `is_active` tinyint(1) NOT NULL DEFAULT '1',
    `applicable_to` enum('all','categories','products','users') NOT NULL DEFAULT 'all',
    `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `promotions_code_unique` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create settings table
CREATE TABLE `settings` (
    `id` bigint unsigned NOT NULL AUTO_INCREMENT,
    `key` varchar(255) NOT NULL,
    `value` text DEFAULT NULL,
    `type` varchar(50) NOT NULL DEFAULT 'text',
    `group` varchar(100) NOT NULL DEFAULT 'general',
    `description` text DEFAULT NULL,
    `is_public` tinyint(1) NOT NULL DEFAULT '0',
    `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `settings_key_unique` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create action_logs table
CREATE TABLE `action_logs` (
    `id` bigint unsigned NOT NULL AUTO_INCREMENT,
    `user_id` bigint unsigned DEFAULT NULL,
    `action` varchar(255) NOT NULL,
    `model_type` varchar(255) DEFAULT NULL,
    `model_id` bigint unsigned DEFAULT NULL,
    `old_values` json DEFAULT NULL,
    `new_values` json DEFAULT NULL,
    `ip_address` varchar(45) DEFAULT NULL,
    `user_agent` text,
    `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `action_logs_user_id_foreign` (`user_id`),
    CONSTRAINT `action_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add olfactory attributes to perfumes table
ALTER TABLE `perfumes` 
ADD COLUMN `olfactory_family` varchar(100) DEFAULT NULL AFTER `gallery`,
ADD COLUMN `olfactory_notes` json DEFAULT NULL AFTER `olfactory_family`,
ADD COLUMN `intensity` enum('light','medium','strong') DEFAULT NULL AFTER `olfactory_notes`,
ADD COLUMN `longevity` enum('short','medium','long') DEFAULT NULL AFTER `intensity`,
ADD COLUMN `sillage` enum('close','moderate','heavy') DEFAULT NULL AFTER `longevity`;

-- Create perfume_views table
CREATE TABLE `perfume_views` (
    `id` bigint unsigned NOT NULL AUTO_INCREMENT,
    `perfume_id` bigint unsigned NOT NULL,
    `user_id` bigint unsigned DEFAULT NULL,
    `session_id` varchar(255) DEFAULT NULL,
    `ip_address` varchar(45) DEFAULT NULL,
    `viewed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `perfume_views_perfume_id_foreign` (`perfume_id`),
    KEY `perfume_views_user_id_foreign` (`user_id`),
    KEY `perfume_views_session_id_index` (`session_id`),
    CONSTRAINT `perfume_views_perfume_id_foreign` FOREIGN KEY (`perfume_id`) REFERENCES `perfumes` (`id`) ON DELETE CASCADE,
    CONSTRAINT `perfume_views_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert some basic data
INSERT INTO `categories` (`name`, `slug`, `description`, `is_active`, `sort_order`) VALUES
('Feminin', 'feminin', 'Parfums pour femmes', 1, 1),
('Masculin', 'masculin', 'Parfums pour hommes', 1, 2),
('Unisex', 'unisex', 'Parfums unisex', 1, 3),
('Floral', 'floral', 'Notes florales dominantes', 1, 4),
('Boisé', 'boise', 'Notes boisées dominantes', 1, 5),
('Oriental', 'oriental', 'Notes orientales épicées', 1, 6),
('Frais', 'frais', 'Notes fraîches et citronnées', 1, 7);

INSERT INTO `settings` (`key`, `value`, `type`, `group`, `description`, `is_public`) VALUES
('site_name', 'Maison de Parfum', 'text', 'general', 'Nom du site', 1),
('site_description', 'Boutique en ligne de parfums de luxe', 'text', 'general', 'Description du site', 1),
('contact_email', 'contact@maisondeparfum.fr', 'email', 'contact', 'Email de contact', 1),
('phone_number', '+33 1 23 45 67 89', 'text', 'contact', 'Numéro de téléphone', 1),
('address', '123 Avenue des Champs-Élysées, 75008 Paris, France', 'text', 'contact', 'Adresse physique', 1),
('currency', 'EUR', 'text', 'shop', 'Devise par défaut', 1),
('tax_rate', '20.00', 'decimal', 'shop', 'Taux de TVA (%)', 0),
('free_shipping_threshold', '50.00', 'decimal', 'shop', 'Seuil de livraison gratuite', 0),
('default_shipping_cost', '5.00', 'decimal', 'shop', 'Coût de livraison par défaut', 0);

-- Create indexes for better performance
CREATE INDEX `perfumes_name_index` ON `perfumes` (`name`);
CREATE INDEX `perfumes_price_index` ON `perfumes` (`price`);
CREATE INDEX `perfumes_rating_avg_index` ON `perfumes` (`rating_avg`);
CREATE INDEX `perfumes_is_active_index` ON `perfumes` (`is_active`);
CREATE INDEX `perfumes_is_featured_index` ON `perfumes` (`is_featured`);
CREATE INDEX `orders_status_index` ON `orders` (`status`);
CREATE INDEX `orders_created_at_index` ON `orders` (`created_at`);
CREATE INDEX `reviews_rating_index` ON `reviews` (`rating`);
CREATE INDEX `reviews_created_at_index` ON `reviews` (`created_at`);
CREATE INDEX `perfume_views_viewed_at_index` ON `perfume_views` (`viewed_at`);
