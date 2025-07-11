-- Création des tables pour l'authentification

-- Table des rôles
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    latitude FLOAT,
    longitude FLOAT,
    profile_image VARCHAR(255),
    driver_license_number VARCHAR(50),
    driver_license_verified BOOLEAN DEFAULT FALSE,
    role_id INTEGER REFERENCES roles(id),
    subscription_type_id INTEGER,
    subscription_start_date TIMESTAMP WITH TIME ZONE,
    subscription_end_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- La table user_profiles a été fusionnée avec la table users

-- Table des types d'abonnements
CREATE TABLE subscription_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    duration_days INTEGER NOT NULL,
    features JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des statuts de réservation
CREATE TABLE IF NOT EXISTS reservation_statuses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insertion des données initiales

-- Rôles par défaut
INSERT INTO roles (name, description) VALUES
    ('admin', 'Administrateur avec tous les privilèges'),
    ('customer', 'Client standard')
ON CONFLICT (name) DO NOTHING;

-- Statuts de réservation
INSERT INTO reservation_statuses (name, description) VALUES
    ('pending', 'Réservation en attente de confirmation'),
    ('confirmed', 'Réservation confirmée'),
    ('cancelled', 'Réservation annulée'),
    ('completed', 'Location terminée'),
    ('in_progress', 'Location en cours')
ON CONFLICT (name) DO NOTHING;

-- Utilisateur admin par défaut (mot de passe: admin123)
INSERT INTO users (first_name, last_name, email, password, role_id, is_active, email_verified)
VALUES (
    'Admin', 
    'Système', 
    'admin@driveturismo.com', 
    '$2a$10$3.cGoUF1lkEfQ9EzbjFYSObNg/dQdDm/5C.lxvTsSLPYJNNcG7lQ.', 
    (SELECT id FROM roles WHERE name = 'admin'), 
    TRUE, 
    TRUE
)
ON CONFLICT (email) DO NOTHING;

-- Insertion des types d'abonnements
INSERT INTO subscription_types (name, description, price, duration_days, features) VALUES
('Starter', 'Abonnement de base pour les déplacements occasionnels', 499, 150, '{"level": 1, "days_per_month": 5, "vehicle_access": "Accès aux véhicules de catégorie 1", "delivery_included": false, "concierge_included": false, "hotline_included": true, "cleaning_included": false, "featured": false}'),
('Urban', 'Abonnement urbain pour une mobilité régulière', 899, 210, '{"level": 2, "days_per_month": 7, "vehicle_access": "Accès aux véhicules de catégories 1 et 2", "delivery_included": false, "concierge_included": false, "hotline_included": true, "cleaning_included": false, "featured": false}'),
('Executive', 'Abonnement business pour les professionnels exigeants', 1499, 300, '{"level": 3, "days_per_month": 10, "vehicle_access": "Accès aux véhicules de catégories 1 à 3", "delivery_included": true, "concierge_included": false, "hotline_included": true, "cleaning_included": false, "featured": true}'),
('Prestige', 'Abonnement premium pour une expérience de luxe', 2499, 360, '{"level": 4, "days_per_month": 12, "vehicle_access": "Accès aux véhicules de catégories 1 à 4", "delivery_included": true, "concierge_included": true, "hotline_included": true, "cleaning_included": false, "featured": false}'),
('Elite', 'Abonnement élite pour les passionnés d automobile', 3999, 450, '{"level": 5, "days_per_month": 15, "vehicle_access": "Accès aux véhicules de catégories 1 à 5", "delivery_included": true, "concierge_included": true, "hotline_included": true, "cleaning_included": true, "featured": false}'),
('Signature', 'Abonnement signature pour une expérience ultime', 6999, 600, '{"level": 6, "days_per_month": 20, "vehicle_access": "Accès à tous les véhicules de notre flotte", "delivery_included": true, "concierge_included": true, "hotline_included": true, "cleaning_included": true, "featured": false}')
ON CONFLICT (name) DO NOTHING;

-- Insertion des catégories de voitures
INSERT INTO car_categories (name, description) VALUES
('Catégorie 1', 'SUV et véhicules polyvalents'),
('Catégorie 2', 'Véhicules sportifs et berlines de luxe'),
('Catégorie 3', 'Véhicules tout-terrain de luxe'),
('Catégorie 4', 'Véhicules de prestige'),
('Catégorie 5', 'Supercars et véhicules de haute performance'),
('Catégorie 6', 'Hypercars exclusives')
ON CONFLICT DO NOTHING;

-- Insertion des voitures par catégorie
INSERT INTO cars (brand, model, year, color, license_plate, mileage, category_id, daily_price, deposit_amount, included_km, extra_km_price, seats, transmission, fuel_type, features, images, is_available) VALUES
-- Catégorie 1: SUV et véhicules polyvalents
('Porsche', 'Macan 4S', 2023, 'Blanc', 'C1-PM4S-01', 3500, (SELECT id FROM car_categories WHERE name = 'Catégorie 1'), 299.99, 5000.00, 200, 0.50, 5, 'Automatique', 'Hybride', '{"bluetooth": true, "air_conditioning": true, "gps": true, "leather_seats": true, "sport_mode": true, "parking_assist": true}', '["porsche_macan_4S_home.webp"]', true),
('Porsche', 'Macan 4', 2023, 'Gris', 'C1-PM4-02', 2800, (SELECT id FROM car_categories WHERE name = 'Catégorie 1'), 279.99, 4800.00, 200, 0.45, 5, 'Automatique', 'Hybride', '{"bluetooth": true, "air_conditioning": true, "gps": true, "leather_seats": true, "sport_mode": true, "parking_assist": true}', '["porsche_macan_4_home.webp"]', true),
('Mercedes-Benz', 'GLE 400e', 2023, 'Noir', 'C1-MGLE-03', 4200, (SELECT id FROM car_categories WHERE name = 'Catégorie 1'), 319.99, 5200.00, 200, 0.55, 5, 'Automatique', 'Hybride', '{"bluetooth": true, "air_conditioning": true, "gps": true, "leather_seats": true, "massage_seats": true, "ambient_lighting": true}', '["mb_gle_400e_home.webp"]', true),
('Mercedes-Benz', 'GLC 300e SUV', 2023, 'Bleu', 'C1-MGLCS-04', 3800, (SELECT id FROM car_categories WHERE name = 'Catégorie 1'), 289.99, 4800.00, 200, 0.50, 5, 'Automatique', 'Hybride', '{"bluetooth": true, "air_conditioning": true, "gps": true, "leather_seats": true, "ambient_lighting": true, "driver_assistance": true}', '["mb_glc_300e_home.webp"]', true),
('Mercedes-Benz', 'GLC 300e Coupé', 2023, 'Gris', 'C1-MGLCC-05', 3200, (SELECT id FROM car_categories WHERE name = 'Catégorie 1'), 299.99, 5000.00, 200, 0.50, 5, 'Automatique', 'Hybride', '{"bluetooth": true, "air_conditioning": true, "gps": true, "leather_seats": true, "ambient_lighting": true, "panoramic_roof": true}', '["mb_glc_300e_coupe_home.webp"]', true),
('Audi', 'RSQ3', 2023, 'Rouge', 'C1-ARSQ3-06', 4500, (SELECT id FROM car_categories WHERE name = 'Catégorie 1'), 309.99, 5100.00, 200, 0.55, 5, 'Automatique', 'Essence', '{"bluetooth": true, "air_conditioning": true, "gps": true, "leather_seats": true, "sport_mode": true, "virtual_cockpit": true}', '["audi_rsq3_home.webp"]', true),
('Mercedes-Benz', 'GLC 200D 4MATIC', 2022, 'Blanc', 'C1-MGLCD-07', 5000, (SELECT id FROM car_categories WHERE name = 'Catégorie 1'), 269.99, 4500.00, 200, 0.45, 5, 'Automatique', 'Diesel', '{"bluetooth": true, "air_conditioning": true, "gps": true, "leather_seats": true, "driver_assistance": true}', '["mb_glc_200d_4matic_home.jpg"]', true),
('Range Rover', 'Velar P400E', 2023, 'Gris', 'C1-RRVEL-08', 3800, (SELECT id FROM car_categories WHERE name = 'Catégorie 1'), 329.99, 5500.00, 200, 0.60, 5, 'Automatique', 'Hybride', '{"bluetooth": true, "air_conditioning": true, "gps": true, "leather_seats": true, "terrain_response": true, "meridian_sound": true}', '["range_rover_velar_p400e_home.webp"]', true),
('Porsche', 'Macan S', 2023, 'Noir', 'C1-PMS-09', 3200, (SELECT id FROM car_categories WHERE name = 'Catégorie 1'), 309.99, 5200.00, 200, 0.55, 5, 'Automatique', 'Essence', '{"bluetooth": true, "air_conditioning": true, "gps": true, "leather_seats": true, "sport_mode": true, "bose_sound": true}', '["porsche_macan_s_home.webp"]', true),
('Porsche', '718 Boxster', 2022, 'Rouge', 'C1-P718B-10', 4000, (SELECT id FROM car_categories WHERE name = 'Catégorie 1'), 339.99, 5800.00, 150, 0.65, 2, 'Automatique', 'Essence', '{"bluetooth": true, "air_conditioning": true, "gps": true, "leather_seats": true, "sport_mode": true, "convertible_roof": true}', '["porsche_718_boxter_home.webp"]', true),

-- Catégorie 2: Véhicules sportifs et berlines de luxe
('Mercedes-Benz', 'GLE 53 AMG', 2023, 'Noir', 'C2-MGLE53-01', 3200, (SELECT id FROM car_categories WHERE name = 'Catégorie 2'), 399.99, 6000.00, 200, 0.70, 5, 'Automatique', 'Essence', '{"bluetooth": true, "air_conditioning": true, "gps": true, "leather_seats": true, "sport_mode": true, "amg_ride_control": true}', '["mb_gle_53_amg_home.webp"]', true),
('BMW', 'M3 Compétition', 2023, 'Bleu', 'C2-BM3C-02', 2800, (SELECT id FROM car_categories WHERE name = 'Catégorie 2'), 429.99, 6500.00, 200, 0.75, 5, 'Automatique', 'Essence', '{"bluetooth": true, "air_conditioning": true, "gps": true, "leather_seats": true, "sport_mode": true, "m_drive_professional": true}', '["bmw_m3_comp_home.webp"]', true),
('Porsche', '992 Carrera Cabriolet', 2023, 'Blanc', 'C2-P992CC-03', 2500, (SELECT id FROM car_categories WHERE name = 'Catégorie 2'), 499.99, 7000.00, 150, 0.85, 2, 'Automatique', 'Essence', '{"bluetooth": true, "air_conditioning": true, "gps": true, "leather_seats": true, "sport_mode": true, "convertible_roof": true}', '["porsche_992_carrera_cab_home.webp"]', true),
('Mercedes-Benz', 'GT 43 AMG', 2023, 'Gris', 'C2-MGT43-04', 3000, (SELECT id FROM car_categories WHERE name = 'Catégorie 2'), 459.99, 6800.00, 200, 0.80, 4, 'Automatique', 'Essence', '{"bluetooth": true, "air_conditioning": true, "gps": true, "leather_seats": true, "sport_mode": true, "burmester_sound": true}', '["mb_gt_43_amg_home.jpg"]', true),
('Porsche', '992 Carrera', 2023, 'Rouge', 'C2-P992C-05', 2200, (SELECT id FROM car_categories WHERE name = 'Catégorie 2'), 479.99, 6900.00, 150, 0.85, 2, 'Automatique', 'Essence', '{"bluetooth": true, "air_conditioning": true, "gps": true, "leather_seats": true, "sport_mode": true, "sport_chrono": true}', '["porsche_992_carrera_home.webp"]', true),
('Mercedes-Benz', 'SL 43 AMG', 2023, 'Noir', 'C2-MSL43-06', 2800, (SELECT id FROM car_categories WHERE name = 'Catégorie 2'), 489.99, 7000.00, 150, 0.85, 2, 'Automatique', 'Essence', '{"bluetooth": true, "air_conditioning": true, "gps": true, "leather_seats": true, "sport_mode": true, "convertible_roof": true}', '["mb_sl_43_amg_home.webp"]', true),
('Porsche', 'Cayenne E-Hybrid Coupé', 2023, 'Vert', 'C2-PCEHC-07', 3500, (SELECT id FROM car_categories WHERE name = 'Catégorie 2'), 449.99, 6500.00, 200, 0.75, 5, 'Automatique', 'Hybride', '{"bluetooth": true, "air_conditioning": true, "gps": true, "leather_seats": true, "sport_mode": true, "panoramic_roof": true}', '["porsche_cayenne_e-hybrid_home.webp"]', true),
('Range Rover', 'Sport P460e', 2023, 'Gris', 'C2-RRS460-08', 3200, (SELECT id FROM car_categories WHERE name = 'Catégorie 2'), 469.99, 6800.00, 200, 0.80, 5, 'Automatique', 'Hybride', '{"bluetooth": true, "air_conditioning": true, "gps": true, "leather_seats": true, "terrain_response": true, "meridian_sound": true}', '["range_rover_sport_p460e_home.webp"]', true),
('Range Rover', 'Sport P440e', 2023, 'Noir', 'C2-RRS440-09', 3000, (SELECT id FROM car_categories WHERE name = 'Catégorie 2'), 459.99, 6700.00, 200, 0.80, 5, 'Automatique', 'Hybride', '{"bluetooth": true, "air_conditioning": true, "gps": true, "leather_seats": true, "terrain_response": true, "meridian_sound": true}', '["range_rover_sport_p440e_home.webp"]', true),

-- Catégorie 3: Véhicules tout-terrain de luxe
('Mercedes-Benz', 'Classe G63 AMG', 2023, 'Noir', 'C3-MG63-01', 2500, (SELECT id FROM car_categories WHERE name = 'Catégorie 3'), 649.99, 8500.00, 200, 1.00, 5, 'Automatique', 'Essence', '{"bluetooth": true, "air_conditioning": true, "gps": true, "leather_seats": true, "off_road_mode": true, "burmester_sound": true}', '["mb_g63_amg_home.webp"]', true),
('Range Rover', 'P560e SWB', 2023, 'Gris', 'C3-RRP560-02', 2800, (SELECT id FROM car_categories WHERE name = 'Catégorie 3'), 599.99, 8000.00, 200, 0.95, 5, 'Automatique', 'Hybride', '{"bluetooth": true, "air_conditioning": true, "gps": true, "leather_seats": true, "terrain_response": true, "meridian_sound": true}', '["range_rover_p560e_swb_home.webp"]', true),

-- Catégorie 4: Véhicules de prestige
('Bentley', 'Continental GT', 2023, 'Noir', 'C4-BCGT-01', 2000, (SELECT id FROM car_categories WHERE name = 'Catégorie 4'), 799.99, 10000.00, 150, 1.20, 4, 'Automatique', 'Essence', '{"bluetooth": true, "air_conditioning": true, "gps": true, "leather_seats": true, "massage_seats": true, "premium_sound": true}', '["bentley_continental_gt_home.webp"]', true),
('Porsche', '718 GT4 RS', 2023, 'Bleu', 'C4-P718GT4-02', 1800, (SELECT id FROM car_categories WHERE name = 'Catégorie 4'), 849.99, 10500.00, 150, 1.30, 2, 'Automatique', 'Essence', '{"bluetooth": true, "air_conditioning": true, "gps": true, "leather_seats": true, "sport_mode": true, "track_telemetry": true}', '["porsche_718_gt4_rs_home.webp"]', true),
('Range Rover', 'P635 SV', 2023, 'Blanc', 'C4-RRP635-03', 1500, (SELECT id FROM car_categories WHERE name = 'Catégorie 4'), 899.99, 11000.00, 150, 1.40, 5, 'Automatique', 'Hybride', '{"bluetooth": true, "air_conditioning": true, "gps": true, "leather_seats": true, "terrain_response": true, "massage_seats": true}', '["range_rover_p635_sv_home.webp"]', true),
('Lamborghini', 'Urus', 2023, 'Jaune', 'C4-LU-04', 2000, (SELECT id FROM car_categories WHERE name = 'Catégorie 4'), 929.99, 12000.00, 150, 1.50, 5, 'Automatique', 'Essence', '{"bluetooth": true, "air_conditioning": true, "gps": true, "leather_seats": true, "sport_mode": true, "off_road_mode": true}', '["lamborghini_urus_home.webp"]', true),
('Bentley', 'Bentayga S', 2023, 'Vert', 'C4-BBS-05', 1800, (SELECT id FROM car_categories WHERE name = 'Catégorie 4'), 879.99, 11000.00, 150, 1.40, 5, 'Automatique', 'Essence', '{"bluetooth": true, "air_conditioning": true, "gps": true, "leather_seats": true, "massage_seats": true, "premium_sound": true}', '["bentley_bentayga_s_home.webp"]', true),

-- Catégorie 5: Supercars et véhicules de haute performance
('Porsche', '992 GT3 RS', 2023, 'Rouge', 'C5-P992GT3-01', 1000, (SELECT id FROM car_categories WHERE name = 'Catégorie 5'), 1399.99, 16000.00, 100, 2.10, 2, 'Automatique', 'Essence', '{"bluetooth": true, "air_conditioning": true, "gps": true, "leather_seats": true, "sport_mode": true, "track_telemetry": true}', '["porsche_992_gt3_rs_home.webp"]', true),
('Lamborghini', 'Huracan Technica', 2023, 'Jaune', 'C5-LHT-02', 800, (SELECT id FROM car_categories WHERE name = 'Catégorie 5'), 1299.99, 15000.00, 100, 2.00, 2, 'Automatique', 'Essence', '{"bluetooth": true, "air_conditioning": true, "gps": true, "leather_seats": true, "sport_mode": true, "carbon_fiber": true}', '["lamborghini_huracan_technica_home.webp"]', true),
('Lamborghini', 'Urus S', 2023, 'Bleu', 'C5-LUS-03', 1200, (SELECT id FROM car_categories WHERE name = 'Catégorie 5'), 1199.99, 14000.00, 100, 1.90, 5, 'Automatique', 'Essence', '{"bluetooth": true, "air_conditioning": true, "gps": true, "leather_seats": true, "sport_mode": true, "off_road_mode": true}', '["lamborghini_urus_s_home.webp"]', true),
('Lamborghini', 'Urus Performante', 2023, 'Noir', 'C5-LUP-04', 1000, (SELECT id FROM car_categories WHERE name = 'Catégorie 5'), 1299.99, 15000.00, 100, 2.00, 5, 'Automatique', 'Essence', '{"bluetooth": true, "air_conditioning": true, "gps": true, "leather_seats": true, "sport_mode": true, "track_mode": true}', '["lamborghini_urus_performante_home.webp"]', true),
('Ferrari', '488 Pista', 2022, 'Rouge', 'C5-F488P-05', 1500, (SELECT id FROM car_categories WHERE name = 'Catégorie 5'), 1399.99, 16000.00, 100, 2.10, 2, 'Automatique', 'Essence', '{"bluetooth": true, "air_conditioning": true, "gps": true, "leather_seats": true, "sport_mode": true, "carbon_chassis": true}', '["ferrari_488_pista_home.webp"]', true),

-- Catégorie 6: Hypercars exclusives
('Lamborghini', 'Aventador SVJ', 2022, 'Vert', 'C6-LASVJ-01', 500, (SELECT id FROM car_categories WHERE name = 'Catégorie 6'), 2499.99, 50000.00, 50, 5.00, 2, 'Automatique', 'Essence', '{"bluetooth": true, "air_conditioning": true, "gps": true, "leather_seats": true, "carbon_fiber": true, "track_mode": true}', '["lamborghini_aventador_svj_home.webp"]', true)
ON CONFLICT DO NOTHING;
