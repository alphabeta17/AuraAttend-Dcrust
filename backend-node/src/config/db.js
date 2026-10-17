import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    ssl: { rejectUnauthorized: false }
});

// Table creation query with profile_pic column added
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255),
    roll_no VARCHAR(50) UNIQUE,
    university_portal_password INT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    course VARCHAR(100),
    start_year INT,
    section VARCHAR(100),
    phone_no VARCHAR(15),
    gender VARCHAR(20),
    linkedin_url VARCHAR(255),
    profile_pic TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

const dbPool = pool.promise();

// Server start hote hi table initialize karne ke liye
async function initializeDatabase() {
    try {
        await dbPool.query(createTableQuery);
        console.log('✨ Fresh users table created successfully!');
    } catch (err) {
        console.error('Database initialization error:', err.message);
    }
}

initializeDatabase();

pool.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed: ', err.message);
    } else {
        console.log('Connected to Aiven MySQL Cloud Database successfully!');
        connection.release();
    }
});

export default dbPool;
