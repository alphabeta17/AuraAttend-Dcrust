import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const sendOtpEmail = async (toEmail, otpCode) => {
    const mailOptions = {
        from: '"AuraAttend Security" <no-reply@auraattend.com>',
        to: toEmail,
        subject: 'Your AuraAttend Verification Code',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; background: #f4f5f8; border-radius: 10px;">
                <h2 style="color: #6d28d9;">AuraAttend Verification</h2>
                <p>Hello,</p>
                <p>Your one-time password (OTP) for account verification is:</p>
                <div style="font-size: 24px; font-weight: bold; color: #7c3aed; background: #fff; padding: 10px 20px; display: inline-block; border-radius: 6px; letter-spacing: 4px;">
                    ${otpCode}
                </div>
                <p style="margin-top: 20px; font-size: 12px; color: #6b7280;">This code will expire in 5 minutes. If you didn't request this, please ignore this email.</p>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
};