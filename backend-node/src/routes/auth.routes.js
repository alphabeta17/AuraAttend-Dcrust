import express from 'express';
import { sendOtpEmail } from '../services/email.service.js';
import { OAuth2Client } from 'google-auth-library';

const router = express.Router();

const client = new OAuth2Client("166248464188-kh51ko7innf6jk9ojgalgtk61352uqcb.apps.googleusercontent.com");

// In-memory store for OTPs { email: { otp, expiresAt } }
const otpStorage = new Map();

// 1. Send OTP Route
router.post('/send-otp', async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ success: false, message: "Email is required" });
    }

    try {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 5 * 60 * 1000; // 5 mins expiration

        otpStorage.set(email, { otp, expiresAt });
        await sendOtpEmail(email, otp);

        console.log(`[OTP Sent] Code ${otp} dispatched to ${email}`);
        res.status(200).json({ success: true, message: "OTP sent successfully to your email." });
    } catch (error) {
        console.error("Error sending OTP email:", error);
        res.status(500).json({ success: false, message: "Failed to send OTP email.", error: error.message });
    }
});

// 2. Verify OTP Route
router.post('/verify-otp', (req, res) => {
    const { email, otp } = req.body;

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

    otpStorage.delete(email);
    res.status(200).json({ success: true, message: "OTP verified successfully!" });
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

export default router;