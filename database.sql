CREATE DATABASE IF NOT EXISTS ticketsystem;
USE ticketsystem;
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100),
    password VARCHAR(255) NOT NULL,
    role ENUM('admin','support','user') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    priority ENUM('urgente','haute','moyenne','ok') DEFAULT 'moyenne',
    status ENUM('en-attente','en-cours','resolu') DEFAULT 'en-attente',
    created_by INT,
    assigned_to INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id)
);
INSERT INTO users (username, email, password, role) VALUES 
('admin', 'admin@system.com', 'admin123', 'admin'),
('ahmed', 'ahmed@system.com', 'support123', 'support'),
('foued', 'foued@system.com', 'support123', 'support'),
('maram', 'maram@system.com', 'support123', 'support'),
('sami', 'sami@system.com', 'support123', 'support'),
('user1', 'user1@mail.com', 'user123', 'user'),
('user2', 'user2@mail.com', 'user123', 'user'),
('user3', 'user3@mail.com', 'user123', 'user'),
('user4', 'user4@mail.com', 'user123', 'user');
INSERT INTO tickets (title, description, category, priority, status, created_by, assigned_to) VALUES 
('Problème réseau étage 2', 'Connexion instable', 'reseaux', 'haute', 'en-cours', 6, 1),
('Imprimante ne répond pas', 'Cartouche vide', 'authentification', 'moyenne', 'en-attente', 6, NULL),
('Erreur base de données', 'Timeout fréquent', 'base-donnees', 'urgente', 'en-cours', 7, 2),
('Installation logiciel', 'Demande licence', 'upload-download', 'ok', 'resolu', 8, 3),
('Problème Wi-Fi', 'Accès impossible', 'reseaux', 'haute', 'en-attente', 9, NULL),
('Serveur lent', 'Performance dégradée', 'serveur', 'haute', 'en-cours', 6, 4),
('Reset mot de passe', 'Demande CEO', 'authentification', 'urgente', 'en-attente', 7, NULL);