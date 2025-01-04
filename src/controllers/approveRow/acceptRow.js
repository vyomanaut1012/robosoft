const { client_update } = require('../../configuration/database/databaseUpdate.js');

exports.acceptRow = async (req, res) => {
    try {
        const { request_id, admin, comments } = req.body;

        // Validate input
        if (!request_id || !admin) {
            return res.status(400).json({
                success: false,
                message: 'Required fields: request_id and admin are missing.',
            });
        }

        // Start a transaction
        await client_update.query('BEGIN');

        // Fetch the row with the given request_id
        const fetchQuery = `
            SELECT table_name, row_data
            FROM app.add_row_table
            WHERE request_id = $1;
        `;
        const fetchResult = await client_update.query(fetchQuery, [request_id]);

        if (fetchResult.rowCount === 0) {
            await client_update.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'No row found with the given request_id.',
            });
        }

        const { table_name, row_data } = fetchResult.rows[0];

        if (!table_name || !row_data) {
            await client_update.query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: 'Invalid data: table_name or row_data is missing.',
            });
        }

        // Insert the row_data into the target table
        const columns = Object.keys(row_data).join(', ');
        const values = Object.values(row_data);
        const valuePlaceholders = values.map((_, index) => `$${index + 1}`).join(', ');

        const insertQuery = `
            INSERT INTO app.${table_name} (${columns})
            VALUES (${valuePlaceholders});
        `;
        await client_update.query(insertQuery, values);

        // Update the status, admin, and comments in the original row
        const updateQuery = `
            UPDATE app.add_row_table
            SET status = $1, admin = $2, comments = $3, updated_at = NOW()
            WHERE request_id = $4
            RETURNING *;
        `;
        const updateValues = ['approve', admin, comments || null, request_id];

        const updateResult = await client_update.query(updateQuery, updateValues);

        // Commit the transaction
        await client_update.query('COMMIT');

        return res.status(200).json({
            success: true,
            message: 'Row approved and added to the target table successfully.',
            data: updateResult.rows[0], // Return the updated row
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
