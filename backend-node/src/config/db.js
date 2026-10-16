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

// Table creation query with fresh drop
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

const dbPool = pool.promise();

// Server start hote hi purani table drop karke fresh table banayein aur live table view print karein
async function initializeDatabase() {
    try {
        
        await dbPool.query(`ALTER TABLE users ADD COLUMN profile_pic LONGTEXT;`);

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