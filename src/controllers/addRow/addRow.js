const { client_update } = require('../../configuration/database/databaseUpdate.js');
const { v4: uuidv4 } = require('uuid');

exports.addRow = async (req, res) => {
    const { table_name, row_data, maker } = req.body; // Extracting the required fields from the request body

    if (!table_name || !row_data || !maker) {
        return res.status(400).json({
            success: false,
            message: 'Required fields: table_name, row_data, and maker are missing.',
        });
    }

    const request_id = uuidv4(); // Generate a UUID for request_id
    const row_is = uuidv4(); // Generate a UUID for row_is

    try {
        // Start a transaction
        await client_update.query('BEGIN');

        // Insert into the table
        const query = `
            INSERT INTO app.add_row_table (request_id, table_name, row_data, status, maker, row_is, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW());
        `;
        const values = [request_id, table_name, row_data, 'pending', maker, row_is];

        await client_update.query(query, values);

        // Commit the transaction
        await client_update.query('COMMIT');

        return res.status(201).json({
            success: true,
            message: 'Row added successfully.',
            data: { request_id, row_is },
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
