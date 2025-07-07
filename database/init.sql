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
