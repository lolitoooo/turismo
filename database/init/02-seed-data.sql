-- Données initiales pour DriveturismoCopy

-- Insertion des rôles
INSERT INTO roles (name, description) VALUES
('admin', 'Administrateur avec tous les droits'),
('manager', 'Gestionnaire avec droits limités'),
('customer', 'Client standard'),
('premium_customer', 'Client premium avec avantages'),
('vip_customer', 'Client VIP avec services exclusifs'),
('guest', 'Utilisateur non enregistré');

-- Insertion des types d'abonnements
INSERT INTO subscription_types (name, description, price, duration_days, features) VALUES
('Basic', 'Abonnement de base avec fonctionnalités limitées', 0.00, 365, '{"reservations": true, "support": "email"}'),
('Premium', 'Abonnement premium avec réductions', 99.99, 365, '{"reservations": true, "support": "email,phone", "discount": 5}'),
('Business', 'Abonnement pour professionnels', 199.99, 365, '{"reservations": true, "support": "email,phone,priority", "discount": 10, "priority_booking": true}'),
('VIP', 'Abonnement VIP avec services exclusifs', 499.99, 365, '{"reservations": true, "support": "dedicated", "discount": 15, "priority_booking": true, "free_upgrades": true}'),
('Family', 'Abonnement familial avec avantages pour plusieurs conducteurs', 149.99, 365, '{"reservations": true, "support": "email,phone", "discount": 8, "additional_drivers": 3}'),
('Corporate', 'Abonnement pour entreprises', 999.99, 365, '{"reservations": true, "support": "dedicated", "discount": 20, "priority_booking": true, "free_upgrades": true, "additional_drivers": 10}');

-- Insertion d'un utilisateur admin (mot de passe: admin123)
INSERT INTO users (email, password, first_name, last_name, phone, role_id) VALUES
('admin@driveturismo.com', '$2b$10$X7EBGITGHmJzRgIbrYgVDOcSU9QAiIyLXNf1IA1Tn2XQDGcCJL9Ky', 'Admin', 'User', '+33123456789', 1);

-- Insertion des catégories de voitures
INSERT INTO car_categories (name, description) VALUES
('Économique', 'Voitures compactes et économiques'),
('Berline', 'Berlines confortables pour voyages d''affaires'),
('SUV', 'Véhicules spacieux pour familles et aventures'),
('Premium', 'Voitures haut de gamme pour une expérience luxueuse'),
('Sport', 'Voitures sportives pour sensations fortes'),
('Utilitaire', 'Véhicules utilitaires pour déménagements');

-- Insertion des statuts de réservation
INSERT INTO reservation_statuses (name, description) VALUES
('pending', 'Réservation en attente de confirmation'),
('confirmed', 'Réservation confirmée'),
('in_progress', 'Location en cours'),
('completed', 'Location terminée'),
('cancelled', 'Réservation annulée'),
('no_show', 'Client ne s''est pas présenté');

-- Insertion de quelques voitures d'exemple
INSERT INTO cars (brand, model, year, color, license_plate, mileage, category_id, daily_price, deposit_amount, included_km, extra_km_price, seats, transmission, fuel_type, features, images, is_available) VALUES
('Renault', 'Clio', 2022, 'Blanc', 'AA-123-BB', 15000, 1, 39.99, 500.00, 200, 0.15, 5, 'Manuel', 'Essence', '{"bluetooth": true, "air_conditioning": true, "gps": false}', '["clio_1.jpg", "clio_2.jpg"]', true),
('Peugeot', '308', 2021, 'Gris', 'BB-456-CC', 25000, 2, 49.99, 600.00, 200, 0.18, 5, 'Automatique', 'Diesel', '{"bluetooth": true, "air_conditioning": true, "gps": true, "parking_sensors": true}', '["308_1.jpg", "308_2.jpg"]', true),
('BMW', 'X3', 2022, 'Noir', 'CC-789-DD', 18000, 3, 89.99, 1000.00, 250, 0.25, 5, 'Automatique', 'Diesel', '{"bluetooth": true, "air_conditioning": true, "gps": true, "leather_seats": true, "parking_camera": true}', '["x3_1.jpg", "x3_2.jpg"]', true),
('Mercedes', 'Classe C', 2023, 'Bleu', 'DD-012-EE', 10000, 4, 99.99, 1200.00, 300, 0.30, 5, 'Automatique', 'Hybride', '{"bluetooth": true, "air_conditioning": true, "gps": true, "leather_seats": true, "parking_camera": true, "heated_seats": true}', '["classe_c_1.jpg", "classe_c_2.jpg"]', true),
('Porsche', '911', 2022, 'Rouge', 'EE-345-FF', 8000, 5, 199.99, 2500.00, 150, 0.50, 2, 'Automatique', 'Essence', '{"bluetooth": true, "air_conditioning": true, "gps": true, "leather_seats": true, "sport_mode": true}', '["911_1.jpg", "911_2.jpg"]', true),
('Renault', 'Kangoo', 2021, 'Blanc', 'FF-678-GG', 30000, 6, 59.99, 700.00, 300, 0.20, 2, 'Manuel', 'Diesel', '{"bluetooth": true, "air_conditioning": true, "cargo_capacity": "4m³"}', '["kangoo_1.jpg", "kangoo_2.jpg"]', true);
