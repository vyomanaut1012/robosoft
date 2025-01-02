const { client_update } = require('../../configuration/database/databaseUpdate.js');

exports.rejectRow = async (req, res) => {
    const { request_id, comments, admin } = req.body;

    // Validate input
    if (!request_id || !comments || !admin) {
        return res.status(400).json({
            success: false,
            message: 'Required fields: request_id, comments, and admin are missing.',
        });
    }

    try {
        // Start a transaction
        await client_update.query('BEGIN');

        // Update the row with the given request_id
        const query = `
            UPDATE app.add_row_table
            SET status = $1, comments = $2, admin = $3, updated_at = NOW()
            WHERE request_id = $4
            RETURNING *;
        `;
        const values = ['rejected', comments, admin, request_id];

        const result = await client_update.query(query, values);

        // Check if the row was updated
        if (result.rowCount === 0) {
            await client_update.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'No row found with the given request_id.',
            });
        }

        // Commit the transaction
        await client_update.query('COMMIT');

        return res.status(200).json({
            success: true,
            message: 'Row rejected successfully.',
            data: result.rows[0], // Return the updated row
        });
    } catch (error) {
        // Rollback in case of error
        await client_update.query('ROLLBACK');
        console.error('Error:', error);

        return res.status(500).json({
            success: false,
            message: 'An error occurred while processing the request.',
            error: error.message,
        });
    }
};
