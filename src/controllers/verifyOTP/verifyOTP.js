const { client_update } = require('../../configuration/database/databaseUpdate.js');

exports.verifyOTP = async (req, res) => {
    const { email, OTP } = req.body;

    if (!email || !OTP) {
        return res.status(400).json({
            success: false,
            message: 'Email and OTP are required.',
        });
    }

    try {
        // Begin a transaction
        await client_update.query('BEGIN');

        // Query to check email and OTP in the database
        const verifyQuery = `
            SELECT * FROM app."OTP_tracker"
            WHERE email = $1 AND "OTP" = $2
            AND "OTP_disable" = false
            LIMIT 1;
        `;
        const verifyValues = [email, OTP];

        const result = await client_update.query(verifyQuery, verifyValues);

        if (result.rows.length > 0) {
            // Update OTP_disable to true
            const updateQuery = `
                UPDATE app."OTP_tracker"
                SET "OTP_disable" = true
                WHERE email = $1 AND "OTP" = $2;
            `;
            await client_update.query(updateQuery, [email, OTP]);

            // Commit the transaction
            await client_update.query('COMMIT');

            return res.status(200).json({
                success: true,
                message: 'OTP verified successfully.',
            });
        } else {
            // Rollback the transaction
            await client_update.query('ROLLBACK');

            return res.status(200).json({
                success: false,
                message: 'Incorrect OTP or OTP has already been used.',
            });
        }
    } catch (error) {
        // Rollback the transaction in case of error
        await client_update.query('ROLLBACK');

        console.error('Error during OTP verification:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while verifying OTP.',
            error: error.message,
        });
    }
};