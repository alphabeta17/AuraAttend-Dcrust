// src/services/email.service.js
import nodemailer from 'nodemailer';

export async function sendOtpEmail(toEmail, otp) {
    // Brevo SMTP credentials jo aapke dashboard mein hain
    const transporter = nodemailer.createTransport({
        host: 'smtp-relay.brevo.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER, // Brevo login email (jaise be96d7001@smtp-brevo.com) ya aapki account email
            pass: process.env.BREVO_API_KEY // Yahan apni SMTP key daalein jo aapne generate ki hai
        }
    });

    try {
        await transporter.sendMail({
            from: '"AuraAttend" <' + process.env.EMAIL_USER + '>',
            to: toEmail,
            subject: "Your Verification OTP Code - AuraAttend",
            text: `Your 6-digit OTP code for AuraAttend is: ${otp}. Valid for 5 minutes.`
        });

        console.log(`[Brevo SMTP] OTP email successfully sent to ${toEmail}`);
        return true;
    } catch (error) {
        console.error("Brevo SMTP Error:", error);
        throw error;
    }
}