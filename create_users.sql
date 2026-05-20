-- SQL script to create admin and user accounts
-- Run this after creating the tables with database_setup.sql

-- Insert admin accounts
INSERT INTO `users` (`name`, `email`, `password`, `role`, `status`, `email_verified`, `created_at`, `updated_at`) VALUES
('Super Admin', 'admin@siteparfum.fr', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'active', 1, NOW(), NOW()),
('Moderateur Demo', 'moderateur@siteparfum.fr', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'active', 1, NOW(), NOW()),
('Client Demo', 'user@siteparfum.fr', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'customer', 'active', 1, NOW(), NOW()),
('Marc Gestion', 'gestion@siteparfum.fr', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'manager', 'active', 1, NOW(), NOW()),
('Alice Staff', 'staff@siteparfum.fr', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'manager', 'active', 1, NOW(), NOW()),
('Jean Client', 'client@siteparfum.fr', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'customer', 'active', 1, NOW(), NOW());

-- Note: The password hash above corresponds to "password"
-- For the demo accounts, you can use:
-- Email: admin@siteparfum.fr | Password: password (Super Admin)
-- Email: moderateur@siteparfum.fr | Password: password (Admin)
-- Email: user@siteparfum.fr | Password: password (Customer)
-- Email: gestion@siteparfum.fr | Password: password (Manager)
-- Email: staff@siteparfum.fr | Password: password (Manager)
-- Email: client@siteparfum.fr | Password: password (Customer)

-- Create some sample addresses for users
INSERT INTO `addresses` (`user_id`, `type`, `address_line_1`, `city`, `postal_code`, `country`, `is_default`, `created_at`, `updated_at`) VALUES
(3, 'shipping', '123 Rue des Parfums', 'Paris', '75001', 'France', 1, NOW(), NOW()),
(3, 'billing', '123 Rue des Parfums', 'Paris', '75001', 'France', 1, NOW(), NOW()),
(6, 'shipping', '456 Avenue Champs-Élysées', 'Paris', '75008', 'France', 1, NOW(), NOW()),
(6, 'billing', '456 Avenue Champs-Élysées', 'Paris', '75008', 'France', 1, NOW(), NOW());

-- Create sample categories if not exists
INSERT IGNORE INTO `categories` (`name`, `slug`, `description`, `is_active`, `sort_order`, `created_at`, `updated_at`) VALUES
('Féminin', 'feminin', 'Parfums pour femmes', 1, 1, NOW(), NOW()),
('Masculin', 'masculin', 'Parfums pour hommes', 1, 2, NOW(), NOW()),
('Unisex', 'unisex', 'Parfums unisex', 1, 3, NOW(), NOW()),
('Floral', 'floral', 'Notes florales dominantes', 1, 4, NOW(), NOW()),
('Boisé', 'boise', 'Notes boisées dominantes', 1, 5, NOW(), NOW()),
('Oriental', 'oriental', 'Notes orientales épicées', 1, 6, NOW(), NOW()),
('Frais', 'frais', 'Notes fraîches et citronnées', 1, 7, NOW(), NOW());

-- Create sample perfumes
INSERT INTO `perfumes` (`name`, `description`, `notes`, `price`, `category_id`, `brand`, `concentration`, `size_ml`, `gender_target`, `is_active`, `stock_quantity`, `rating_avg`, `rating_count`, `created_at`, `updated_at`) VALUES
('Chanel N°5', 'Un classique intemporel, le parfum féminin par excellence', 'Rose, Jasmin, Vanille', 125.00, 1, 'Chanel', 'eau_de_parfum', 100, 'women', 1, 50, 4.5, 128, NOW(), NOW()),
('Dior Sauvage', 'Parfum masculin frais et boisé', 'Bergamote, Poivre, Ambroxan', 95.00, 2, 'Dior', 'eau_de_toilette', 100, 'men', 1, 75, 4.3, 89, NOW(), NOW()),
('Creed Aventus', 'Parfum luxueux pour homme', 'Ananas, Bergamote, Bouleau, Musc', 320.00, 2, 'Creed', 'eau_de_parfum', 100, 'men', 1, 25, 4.8, 156, NOW(), NOW()),
('Tom Ford Black Orchid', 'Parfum mystérieux et sensuel', 'Truffe, Orchidée Noire, Vanille', 180.00, 3, 'Tom Ford', 'eau_de_parfum', 100, 'unisex', 1, 40, 4.6, 94, NOW(), NOW()),
('Jo Malone London Peony & Blush Suede', 'Frais et floral', 'Pivoine, Fraise, Suede', 135.00, 1, 'Jo Malone', 'eau_de_cologne', 100, 'women', 1, 60, 4.4, 67, NOW(), NOW()),
('Le Labo Santal 33', 'Parfum boisé iconique', 'Santal Australien, Cèdre, Cardamome', 195.00, 5, 'Le Labo', 'eau_de_parfum', 100, 'unisex', 1, 35, 4.7, 112, NOW(), NOW());

-- Create some sample reviews
INSERT INTO `reviews` (`user_id`, `perfume_id`, `rating`, `title`, `comment`, `is_verified_purchase`, `is_approved`, `created_at`, `updated_at`) VALUES
(3, 1, 5, 'Parfait !', 'Un parfum magnifique, très élégant et durable.', 1, 1, NOW(), NOW()),
(6, 2, 4, 'Très bon', 'Frais et moderne, parfait pour tous les jours.', 1, 1, NOW(), NOW()),
(3, 3, 5, 'Incroyable !', 'Vaut chaque centime, luxe absolu.', 1, 1, NOW(), NOW()),
(6, 4, 4, 'Original', 'Très différent et sensuel, j\'adore.', 1, 1, NOW(), NOW());

-- Create sample settings
INSERT IGNORE INTO `settings` (`key`, `value`, `type`, `group`, `description`, `is_public`) VALUES
('site_name', 'Maison de Parfum', 'text', 'general', 'Nom du site', 1),
('site_description', 'Boutique en ligne de parfums de luxe', 'text', 'general', 'Description du site', 1),
('contact_email', 'contact@maisondeparfum.fr', 'email', 'contact', 'Email de contact', 1),
('phone_number', '+33 1 23 45 67 89', 'text', 'contact', 'Numéro de téléphone', 1),
('address', '123 Avenue des Champs-Élysées, 75008 Paris, France', 'text', 'contact', 'Adresse physique', 1),
('currency', 'EUR', 'text', 'shop', 'Devise par défaut', 1),
('tax_rate', '20.00', 'decimal', 'shop', 'Taux de TVA (%)', 0),
('free_shipping_threshold', '50.00', 'decimal', 'shop', 'Seuil de livraison gratuite', 0),
('default_shipping_cost', '5.00', 'decimal', 'shop', 'Coût de livraison par défaut', 0);
