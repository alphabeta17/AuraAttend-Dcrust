import express from 'express'; // Express router create karne ke liye import
import bcrypt from 'bcryptjs'; // Password ko secure hash mein convert aur compare karne ke liye
import { sendOtpEmail } from '../services/email.service.js'; // Nodemailer service email bhejne ke liye
import { OAuth2Client } from 'google-auth-library'; // Google token verify karne ke liye
import db from '../config/db.js'; // MySQL database connection pool import kiya
import * as cheerio from 'cheerio';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';


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
    const { email, otp, password, roll_no, university_id, university_portal_password, fullName, gender, phone_no, course, branch } = req.body;
    
    // Frontend se university_id aa rahi hai, use table ke university_portal_password column ke sath map karein
    const portalPassword = university_portal_password || university_id;

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

        // Database (`users` table) mein sahi fields insert kar rahe hain
        const [result] = await db.query(
            'INSERT INTO users (email, password, roll_no, university_portal_password,full_name, gender, phone_no, course, section) VALUES (?, ?, ?, ?, ?, ?,?, ?, ?)',
            [email,
              hashedPassword, 
              roll_no || null,
              portalPassword ? parseInt(portalPassword) : null, 
              fullName || null, 
              gender || null, 
              phone_no || null, 
              course || null, 
              branch || null]
        );

        console.log(`[User Registered] Email: ${email}, Roll No: ${roll_no}`);
        otpStorage.delete(email);
        res.status(200).json({ success: true, message: "Account registered successfully!", userId: result.insertId });
    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({ success: false, message: "Internal server error during registration." });
    }
});


// 4. Database Login Route (User verify karne ke liye)
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    try {
        // Database se user nikalna
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        
        // Agar email exist nahi karti
        if (users.length === 0) {
            return res.status(400).json({ success: false, message: "Account not found. Please sign up." });
        }

        const user = users[0];

        // Agar user Google se aaya tha aur uska password set nahi hai
        if (!user.password) {
            return res.status(400).json({ success: false, message: "Please use Google Sign-In for this account." });
        }

        // Database ke hashed password ko match karna
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Incorrect password." });
        }

        // Login successful hone par
        res.status(200).json({ success: true, email: user.email, name: user.full_name });

    } catch (error) {
        console.error("Error during manual login:", error);
        res.status(500).json({ success: false, message: "Server error during login." });
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
        const email = payload.email;
        const name = payload.name;

        // Check karein ki user database mein hai ya nahi
        const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (existingUsers.length === 0) {
            // Agar naya user hai toh database mein insert kar dein
            await db.query(
                'INSERT INTO users (email, full_name) VALUES (?, ?)',
                [email, name]
            );
        }

        res.status(200).json({ success: true, email: email, name: name });
    } catch (error) {
        res.status(400).json({ success: false, message: "Invalid Google token", error: error.message });
    }
});


// get profile details
router.get('/get-profile',async (req,res)=>{
  const{email}=req.query;
  if(!email){
    return res.status(400).json({success: false, message:"Email query parameter is required."});
  }
  try {
    const[users]=await db.query('Select email, roll_no,full_name, gender, phone_no, course, section, profile_pic FROM users where email=?', [email]);
    if (users.length===0){
      return res.status(404).json({success:false, message:"User not found!" });
    }
    const user = users[0];
    res.status(200).json({
      success:true,
      data:{
        email: user.email,
        roll: user.roll_no || '',
        fullName: user.full_name || 'Student Name',
        gender: user.gender || 'Male',
        phone: user.phone_no || '',
        course: user.course || 'B.Tech',
        branch: user.section || '',
        photo:user.profile_pic||''
      }
    });
  }
  catch(error){
    console.error("Error fetching Profile:",error);
    res.status(500).json({success: false, message:"Server error while fetching profile!"})
  }
});


// Profile Details Update Route
router.post('/update-profile', async (req, res) => {
    const { email, fullName, gender, phone, phone2, course, branch, roll_no, university_portal_password, photo } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: "Email is required." });
    }

    try {
        // Pehle check karein user exist karta hai ya nahi
        const [users] = await db.query('SELECT * FROM users WHERE email=?', [email]);
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        const currentUser = users.only ? users[0] : users[0];

        // Agar koi field empty aayi hai toh purani value retain karein
        const updatedFullName = fullName !== undefined ? fullName : currentUser.full_name;
        const updatedRoll = roll_no !== undefined ? roll_no : currentUser.roll_no;
        const updatedGender = gender !== undefined ? gender : currentUser.gender;
        const updatedPhone = phone !== undefined ? phone : currentUser.phone_no;
        const updatedCourse = course !== undefined ? course : currentUser.course;
        const updatedBranch = branch !== undefined ? branch : currentUser.section;
        const updatedPhoto = photo !== undefined ? photo : currentUser.profile_pic;

        const query = `UPDATE users SET full_name=?, roll_no=?, gender=?, phone_no=?, course=?, section=?, profile_pic=? WHERE email=?`;
        await db.query(query, [
            updatedFullName, 
            updatedRoll, 
            updatedGender, 
            updatedPhone, 
            updatedCourse, 
            updatedBranch, 
            updatedPhoto, 
            email
        ]);

        res.status(200).json({ success: true, message: "Profile updated successfully!" });
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
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(400).json({ success: false, message: "User not found with this email." });
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 5 * 60 * 1000;
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
        await db.query('DELETE FROM users WHERE email = ?', [email]);
        console.log(`[User Deleted] Account with email ${email} has been permanently deleted from database.`);
        deleteOtpStorage.delete(email);
        res.status(200).json({ success: true, message: "Account deleted successfully." });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ success: false, message: "Server error during account deletion." });
    }
});

// ==========================================
// 5. FETCH UNIVERSITY ATTENDANCE ROUTE
// ==========================================
router.post('/fetch-university-attendance', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email is required" });

    try {
        const [users] = await db.query('SELECT roll_no, university_portal_password FROM users WHERE email = ?', [email]);
        
        if (users.length === 0 || !users[0].university_portal_password) {
            return res.status(400).json({ success: false, message: "University credentials not found in your profile." });
        }
        
        const rollNo = users[0].roll_no;
        const portalPassword = users[0].university_portal_password;

        // STEP 1: Initial page fetch
        const initialRes = await fetch('https://dcrustm.samarth.edu.in/index.php/site/login');
        const initialHtml = await initialRes.text(); 
        
        // NAYA TAREEQA (Node 18+): getSetCookie() use karke cookies nikalna
        const rawCookies = initialRes.headers.getSetCookie();
        const initialCookie = rawCookies.length > 0 ? rawCookies.map(c => c.split(';')[0]).join('; ') : '';
        
        const $init = cheerio.load(initialHtml);
        const csrfToken = $init('meta[name="csrf-token"]').attr('content');

        // STEP 2: Login form submit
        const params = new URLSearchParams();
        params.append('_csrf', csrfToken); 
        params.append('LoginForm[username]', rollNo); 
        params.append('LoginForm[password]', portalPassword); 

        const loginRes = await fetch('https://dcrustm.samarth.edu.in/index.php/site/login', {
            method: 'POST',
            body: params,
            redirect: 'manual', 
            headers: { 
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cookie': initialCookie
            }
        });

        // NAYA TAREEQA: VIP session cookie nikalna
        const loginRawCookies = loginRes.headers.getSetCookie();
        const sessionCookie = loginRawCookies.length > 0 
            ? loginRawCookies.map(c => c.split(';')[0]).join('; ') 
            : initialCookie;

        // STEP 3: Main dashboard fetch
        const mainPageRes = await fetch('https://dcrustm.samarth.edu.in/index.php/student-attendance/attendance/index', {
            headers: { 'Cookie': sessionCookie }
        });
        const mainHtml = await mainPageRes.text();
        const $main = cheerio.load(mainHtml);
        
        const classLinks = [];
        $main('table.table-bordered tbody tr').each((i, el) => {
            const subject = $main(el).find('td:nth-child(2)').text().trim();
            const viewLink = $main(el).find('td:nth-child(6) a').attr('href');
            if (subject && viewLink) {
                classLinks.push({ subject, url: `https://dcrustm.samarth.edu.in${viewLink}` });
            }
        });

        // STEP 4: Subjects percentage fetch
        const attendanceData = await Promise.all(classLinks.map(async (cls) => {
            const detailRes = await fetch(cls.url, { headers: { 'Cookie': sessionCookie } });
            const detailHtml = await detailRes.text();
            const $detail = cheerio.load(detailHtml);
            
            let percentage = '0';
            let summary = 'Classes Data Unavailable';
            const records = [];
            
            $detail('table#w0 tr').each((i, el) => {
                const header = $detail(el).find('th').text().trim();
                const value = $detail(el).find('td').text().trim();
                if (header === 'Present Percentage') {
                    percentage = value.replace('%', '').trim();
                } else if (header === 'Attendance Summary') {
                    summary = value;
                }
            });
            // 2. NAYA AUR SAFE TAREEQA: Day-wise history nikalna
            $detail('.grid-view table tr').each((i, el) => {
                // Table header (th) wali row skip karein
                if ($detail(el).find('th').length > 0) return;
                
                // "No results found" wali row skip karein
                if ($detail(el).find('.empty').length > 0) return;

                // eq(index) use kiya hai jo 0 se shuru hota hai (1=Date, 2=Time, 3=Status)
                const date = $detail(el).find('td').eq(1).text().trim();
                const time = $detail(el).find('td').eq(2).text().trim();
                const status = $detail(el).find('td').eq(3).text().trim();

                if (date) {
                    records.push({ date, time, status });
                }
            });
            return { subject: cls.subject, percentage, summary, records };
        }));

        res.status(200).json({ success: true, data: attendanceData });

    } catch (error) {
        console.error("Scraping Error:", error);
        res.status(500).json({ success: false, message: "Failed to sync with university servers." });
    }
});


// Multer configuration for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// ==========================================
// UPLOAD PROFILE PICTURE ROUTE (Cloudinary)
// ==========================================
router.post('/upload-photo', upload.single('photo'), async (req, res) => {
    const { email } = req.body;
    
    if (!email || !req.file) {
        return res.status(400).json({ success: false, message: "Email and image file are required." });
    }

    try {
        // Buffer ko Cloudinary par upload karne ka tareeqa
        const uploadStream = () => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: "aura_attend_profiles" }, // Cloudinary folder name
                    (error, result) => {
                        if (result) resolve(result);
                        else reject(error);
                    }
                );
                stream.end(req.file.buffer);
            });
        };

        const uploadResult = await uploadStream();
        const imageUrl = uploadResult.secure_url; // Cloudinary secure URL

        // Database mein sirf image ka URL save kar rahe hain
        await db.query('UPDATE users SET profile_pic = ? WHERE email = ?', [imageUrl, email]);

        res.status(200).json({ success: true, message: "Photo uploaded successfully!", photoUrl: imageUrl });

    } catch (error) {
        console.error("Cloudinary Upload Error:", error);
        res.status(500).json({ success: false, message: "Failed to upload image to cloud." });
    }
});
// ==========================================
// REMOVE PHOTO ROUTE
// ==========================================
router.post('/remove-photo', async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ success: false, message: "Email is required." });
    }
    try {
        // profile_pic column ko khali (empty string ya null) kar diya
        await db.query('UPDATE users SET profile_pic = ? WHERE email = ?', ['', email]);
        res.status(200).json({ success: true, message: "Profile photo removed successfully." });
    } catch (error) {
        console.error("Error removing photo:", error);
        res.status(500).json({ success: false, message: "Server error while removing photo." });
    }
});
export default router;
