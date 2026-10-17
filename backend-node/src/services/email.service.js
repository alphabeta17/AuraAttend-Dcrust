// src/services/email.service.js
export async function sendOtpEmail(toEmail, otp) {
    const BREVO_API_KEY = process.env.BREVO_API_KEY;

    if (!BREVO_API_KEY) {
        throw new Error("BREVO_API_KEY is missing in environment variables.");
    }

    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'api-key': BREVO_API_KEY
            },
            body: JSON.stringify({
                sender: { 
                    email: process.env.EMAIL_USER, // Aapki verified email jo Brevo par hai
                    name: "AuraAttend" 
                },
                to: [{ email: toEmail }],
                subject: "Your Verification OTP Code - AuraAttend",
                textContent: `Hello,\n\nYour 6-digit OTP code for AuraAttend is: ${otp}\n\nThis code is valid for 5 minutes. Do not share it with anyone.`
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to send email via Brevo API");
        }

        console.log(`[Brevo API] OTP email successfully sent to ${toEmail}`);
        return true;
    } catch (error) {
        console.error("Brevo API Error:", error);
        throw error;
    }
}