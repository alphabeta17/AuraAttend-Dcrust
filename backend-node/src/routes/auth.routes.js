import express from 'express'; // Express router create karne ke liye import
import bcrypt from 'bcryptjs'; // Password ko secure hash mein convert aur compare karne ke liye
import { sendOtpEmail } from '../services/email.service.js'; // Nodemailer service email bhejne ke liye
import { OAuth2Client } from 'google-auth-library'; // Google token verify karne ke liye
import db from '../config/db.js'; // MySQL database connection pool import kiya

const router = express.Router(); // Router instance banaya
const client = new OAuth2Client("166248464188-kh51ko7innf6jk9ojgalgtk61352uqcb.apps.googleusercontent.com");

// In-memory store OTPs ke liye { email: { otp, expiresAt } }
const otpStorage = new Map();

// Check Email Existence Route
router.post('/check-email', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }
  try {
    const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(200).json({ exists: true, message: "Email is already registered" });
    }
    return res.status(200).json({ exists: false, message: "" });
  } catch (error) {
    console.error("Error checking email:", error);
    res.status(500).json({ success: false, message: "Server error while checking email" });
  }
});

// 1. Send OTP Route (Email par OTP dispatch karne ke liye)
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit random OTP
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes expiry
    otpStorage.set(email, { otp, expiresAt });
    await sendOtpEmail(email, otp);
    console.log(`[OTP Sent] Code ${otp} dispatched to ${email}`);
    res.status(200).json({ success: true, message: "OTP sent successfully to your email." });
  } catch (error) {
    console.error("Error sending OTP email:", error);
    res.status(500).json({ success: false, message: "Failed to send OTP email.", error: error.message });
  }
});

// 2. Verify OTP & Register User Route (OTP match hone par MySQL mein save karna)
router.post('/verify-otp', async (req, res) => {
  const { email, otp, password, roll_no, university_id } = req.body;
  if (!otpStorage.has(email)) {
    return res.status(400).json({ success: false, message: "No OTP requested for this email." });
  }
  const record = otpStorage.get(email);
  if (Date.now() > record.expiresAt) {
    otpStorage.delete(email);
    return res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
  }
  if (record.otp !== otp) {
    return res.status(400).json({ success: false, message: "Invalid OTP code." });
  }
  try {
    // Check karein ki user pehle se database mein exist karta hai ya nahi
    const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: "Email is already registered" });
    }

    // Password ko secure hash mein convert kar rahe hain (bcryptjs use karke)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Database (`users` table) mein email, password, roll_no aur university_id insert kar rahe hain
    const [result] = await db.query(
      'INSERT INTO users (email, password, roll_no, university_id) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, roll_no || null, university_id || null]
    );
    console.log(`[User Registered] Email: ${email}, Roll No: ${roll_no}, University ID: ${university_id}`);
    otpStorage.delete(email);
    res.status(200).json({ success: true, message: "Account registered successfully!", userId: result.insertId });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ success: false, message: "Internal server error during registration." });
  }
});

// 3. Google Login Route
router.post('/google', async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: "166248464188-kh51ko7innf6jk9ojgalgtk61352uqcb.apps.googleusercontent.com",
    });
    const payload = ticket.getPayload();
    res.status(200).json({ success: true, email: payload.email, name: payload.name });
  } catch (error) {
    res.status(400).json({ success: false, message: "Invalid Google token", error: error.message });
  }
});

// 4. Database Login Route (User verify karne ke liye)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }
  try {
    // Database se email ke basis par user ko find karein
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }
    const user = users[0];

    // Database ke hashed password ke sath entered password ko compare karein
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    // Login successful hone par response bhejein
    res.status(200).json({ success: true, message: "Login successful!", email: user.email });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error during login" });
  }
});

// Profile Details Update Route
router.post('/update-profile', async (req, res) => {
  const { email, fullName, gender, phone1, phone2, course, branch, roll_no, university_id } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required for updating profile." });
  }
  try {
    const query = `
      UPDATE users 
      SET fullName = ?, gender = ?, phone_no = ?, course = ?, section = ?, roll_no = ?, university_id = ?
      WHERE email = ?
    `;
    await db.query(query, [fullName, gender, phone1, course, branch, roll_no, email]);
    res.status(200).json({ success: true, message: "Profile updated successfully in database!" });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ success: false, message: "Server error while updating profile." });
  }
});
// Temporary storage delete OTPs ke liye
const deleteOtpStorage = new Map();

// 1. Request Delete Account OTP
router.post('/request-delete-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  try {
    // Check karein ki user exist karta hai ya nahi
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(400).json({ success: false, message: "User not found with this email." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes expiry
    deleteOtpStorage.set(email, { otp, expiresAt });

    await sendOtpEmail(email, otp);
    console.log(`[Delete OTP Sent] Code ${otp} dispatched to ${email}`);
    res.status(200).json({ success: true, message: "Deletion OTP sent to your email." });
  } catch (error) {
    console.error("Error sending delete OTP:", error);
    res.status(500).json({ success: false, message: "Failed to send OTP for account deletion." });
  }
});

// 2. Verify OTP & Delete User from Database
router.post('/verify-and-delete', async (req, res) => {
  const { email, otp } = req.body;
  if (!deleteOtpStorage.has(email)) {
    return res.status(400).json({ success: false, message: "No deletion request found for this email." });
  }

  const record = deleteOtpStorage.get(email);
  if (Date.now() > record.expiresAt) {
    deleteOtpStorage.delete(email);
    return res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
  }

  if (record.otp !== otp) {
    return res.status(400).json({ success: false, message: "Invalid OTP code." });
  }

  try {
    // Database se user record delete karna
    await db.query('DELETE FROM users WHERE email = ?', [email]);
    console.log(`[User Deleted] Account with email ${email} has been permanently deleted from database.`);
    
    deleteOtpStorage.delete(email);
    res.status(200).json({ success: true, message: "Account deleted successfully." });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ success: false, message: "Server error during account deletion." });
  }
});
export default router;