-- Naya database banate hain jiska naam 'aura_attend_db' hoga
CREATE DATABASE IF NOT EXISTS aura_attend_db;

-- Is database ko active/select karte hain
USE aura_attend_db;

-- Users table banate hain jo email aur hashed password store karegi
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);