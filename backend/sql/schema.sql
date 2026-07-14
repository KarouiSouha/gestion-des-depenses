-- ===================================================
-- Base de données : gestion_depenses
-- Import : ouvrir phpMyAdmin > SQL > coller ce fichier
-- (ou : mysql -u root -p < schema.sql)
-- ===================================================

CREATE DATABASE IF NOT EXISTS gestion_depenses
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE gestion_depenses;

-- ── Utilisateurs ─────────────────────────────────────
CREATE TABLE users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100)  NOT NULL,
  email      VARCHAR(150)  NOT NULL UNIQUE,
  password   VARCHAR(255)  NOT NULL,       -- hash (jamais en clair)
  created_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- ── Catégories (propres à chaque utilisateur) ────────
CREATE TABLE categories (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT           NOT NULL,
  name        VARCHAR(100)  NOT NULL,
  description VARCHAR(255),
  color       VARCHAR(20),
  icon        VARCHAR(10),
  is_default  TINYINT(1)    DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── Dépenses ──────────────────────────────────────────
CREATE TABLE expenses (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT            NOT NULL,
  category    VARCHAR(100)   NOT NULL,
  amount      DECIMAL(10,3)  NOT NULL,
  date        DATE           NOT NULL,
  description VARCHAR(255),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
