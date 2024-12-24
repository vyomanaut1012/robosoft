const { client_update } = require('../../configuration/database/databaseUpdate.js');
const nodemailer = require('nodemailer');

// Create email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'monkey.d.luffy.20.oct.1999@gmail.com', // Replace with your email
        pass: 'dkyb souo pjuj risd' // Replace with your app password
    }
});

// Function to send OTP email
async function sendOTPEmail(recipientEmail, otp) {
    const mailOptions = {
        from: 'monkey.d.luffy.20.oct.1999@gmail.com', // Replace with your email
        to: recipientEmail,
        subject: 'Your OTP Code',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>OTP Verification</h2>
                <p>Your OTP code is: <strong>${otp}</strong></p>
                <p>This code will expire soon. Please do not share this code with anyone.</p>
                <p>If you didn't request this code, please ignore this email.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Email sending error:', error);
        throw new Error('Failed to send OTP email');
    }
}

exports.sendOTP = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            success: false,
            message: 'Email is required',
        });
    }

    try {
        const checkUserQuery = `
            SELECT email 
            FROM app."users" 
            WHERE email = $1
        `;
        
        const userExists = await client_update.query(checkUserQuery, [email]);
        
        if (userExists.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'This email is not registered',
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000);

        const upsertOtpQuery = `
            INSERT INTO app."OTP_tracker" (email, "OTP")
            VALUES ($1, $2)
            ON CONFLICT (email)
            DO UPDATE SET "OTP" = EXCLUDED."OTP";
        `;

        await client_update.query(upsertOtpQuery, [email, otp]);

        // Send OTP via email
        try {
            await sendOTPEmail(email, otp);
        } catch (emailError) {
            // If email fails, still return OTP but with a warning
            console.error('Email sending failed:', emailError);
            return res.status(200).json({
                success: true,
                message: 'OTP generated successfully but email delivery failed',
                otp: otp,
                emailStatus: 'failed'
            });
        }

        res.status(200).json({
            success: true,
            message: 'OTP generated and sent successfully',
            otp: otp,
            emailStatus: 'sent'
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while processing the request',
            error: error.message,
        });
    }
};