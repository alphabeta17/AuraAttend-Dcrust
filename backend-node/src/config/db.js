import mysql from 'mysql2'; // MySQL package ko import kiya

// Database connection pool create kar rahe hain
const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: '1010',
  database: 'AuraAttend'
});

// Connection check karne ke liye
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection failed: ', err.message);
  } else {
    console.log('Connected to MySQL Database successfully!');
    connection.release();
  }
});

export default pool.promise(); // Default export taaki 'import db' sahi se kaam kare