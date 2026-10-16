import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  ssl: {
    rejectUnauthorized: false
  }
});

// Table creation query jisme naya INT column (university_id) bhi shamil hai
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      roll_no VARCHAR(50) UNIQUE,
      university_portal_password INT,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      course VARCHAR(100),
      start_year INT,
      section VARCHAR(20),
      phone_no VARCHAR(15),
      gender VARCHAR(20),
      linkedin_url VARCHAR(255),
      
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

// Server start hote hi table verify/create karein
pool.query(createTableQuery, (err, results) => {
  if (err) {
    console.error('Error creating users table:', err.message);
  } else {
    console.log('Users table verified/created successfully with university_id column!');
  }
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection failed: ', err.message);
  } else {
    console.log('Connected to Aiven MySQL Cloud Database successfully!');
    connection.release();
  }
});

export default pool.promise();