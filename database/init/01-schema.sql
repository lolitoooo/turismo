-- Création des tables pour DriveturismoCopy

-- Table des rôles utilisateurs
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des abonnements
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

-- Table des utilisateurs
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    driver_license_number VARCHAR(50),
    driver_license_verified BOOLEAN DEFAULT FALSE,
    role_id INTEGER REFERENCES roles(id),
    subscription_type_id INTEGER REFERENCES subscription_types(id),
    subscription_start_date TIMESTAMP WITH TIME ZONE,
    subscription_end_date TIMESTAMP WITH TIME ZONE,
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des catégories de voitures
CREATE TABLE car_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des voitures
CREATE TABLE cars (
    id SERIAL PRIMARY KEY,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    color VARCHAR(50) NOT NULL,
    license_plate VARCHAR(20) NOT NULL UNIQUE,
    mileage INTEGER NOT NULL,
    category_id INTEGER REFERENCES car_categories(id),
    daily_price DECIMAL(10, 2) NOT NULL,
    deposit_amount DECIMAL(10, 2) NOT NULL,
    included_km INTEGER NOT NULL,
    extra_km_price DECIMAL(6, 2) NOT NULL,
    seats INTEGER NOT NULL,
    transmission VARCHAR(20) NOT NULL,
    fuel_type VARCHAR(50) NOT NULL,
    features JSONB,
    images JSONB,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des disponibilités des voitures
CREATE TABLE car_availabilities (
    id SERIAL PRIMARY KEY,
    car_id INTEGER REFERENCES cars(id) ON DELETE CASCADE,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    reason VARCHAR(100), -- 'maintenance', 'reservation', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT no_overlap CHECK (
        NOT EXISTS (
            SELECT 1 FROM car_availabilities ca
            WHERE ca.car_id = car_availabilities.car_id
            AND ca.id != car_availabilities.id
            AND (
                (ca.start_date <= car_availabilities.start_date AND ca.end_date > car_availabilities.start_date)
                OR (ca.start_date < car_availabilities.end_date AND ca.end_date >= car_availabilities.end_date)
                OR (ca.start_date >= car_availabilities.start_date AND ca.end_date <= car_availabilities.end_date)
            )
        )
    )
);

-- Table des statuts de réservation
CREATE TABLE reservation_statuses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des réservations
CREATE TABLE reservations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    car_id INTEGER REFERENCES cars(id) ON DELETE SET NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    pickup_location TEXT,
    return_location TEXT,
    total_price DECIMAL(10, 2) NOT NULL,
    deposit_paid BOOLEAN DEFAULT FALSE,
    deposit_amount DECIMAL(10, 2) NOT NULL,
    deposit_payment_id VARCHAR(255),
    status_id INTEGER REFERENCES reservation_statuses(id),
    initial_mileage INTEGER,
    final_mileage INTEGER,
    extra_km INTEGER,
    extra_charges DECIMAL(10, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT no_car_double_booking CHECK (
        NOT EXISTS (
            SELECT 1 FROM reservations r
            WHERE r.car_id = reservations.car_id
            AND r.id != reservations.id
            AND r.status_id IN (SELECT id FROM reservation_statuses WHERE name IN ('confirmed', 'in_progress'))
            AND (
                (r.start_date <= reservations.start_date AND r.end_date > reservations.start_date)
                OR (r.start_date < reservations.end_date AND r.end_date >= reservations.end_date)
                OR (r.start_date >= reservations.start_date AND r.end_date <= reservations.end_date)
            )
        )
    )
);

-- Table des paiements
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    reservation_id INTEGER REFERENCES reservations(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_type VARCHAR(50) NOT NULL, -- 'deposit', 'rental', 'extra_charges'
    payment_method VARCHAR(50) NOT NULL, -- 'credit_card', 'bank_transfer', etc.
    transaction_id VARCHAR(255),
    status VARCHAR(50) NOT NULL, -- 'pending', 'completed', 'failed', 'refunded'
    payment_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des avis
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    reservation_id INTEGER REFERENCES reservations(id) ON DELETE SET NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    car_id INTEGER REFERENCES cars(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Création des index pour optimiser les performances
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_cars_brand_model ON cars(brand, model);
CREATE INDEX idx_cars_category ON cars(category_id);
CREATE INDEX idx_cars_price ON cars(daily_price);
CREATE INDEX idx_reservations_user ON reservations(user_id);
CREATE INDEX idx_reservations_car ON reservations(car_id);
CREATE INDEX idx_reservations_dates ON reservations(start_date, end_date);
CREATE INDEX idx_reservations_status ON reservations(status_id);
CREATE INDEX idx_car_availabilities_car ON car_availabilities(car_id);
CREATE INDEX idx_car_availabilities_dates ON car_availabilities(start_date, end_date);
