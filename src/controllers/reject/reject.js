const { client_update } = require('../../configuration/database/databaseUpdate.js');

exports.reject = async (req, res) => {
    const { row_id, comment, checker } = req.body;

    if (!row_id || !checker) {
        return res.status(400).json({
            success: false,
            message: 'row_id and checker are required fields',
        });
    }

    try {
        if (!client_update || client_update.ended) {
            throw new Error('Database client is not connected');
        }

        const updateQuery = `
            UPDATE app.change_tracker
            SET 
                status = 'rejected',
                comments = COALESCE($1, comments),
                checker_id = $2,
                updated_at = NOW()
            WHERE id = $3
            RETURNING *;
        `;

        const values = [
            comment,
            checker,
            row_id
        ];

        const result = await client_update.query(updateQuery, values);

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'No row found with the provided row_id',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Change request rejected successfully',
            data: result.rows[0],
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