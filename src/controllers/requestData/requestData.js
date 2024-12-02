const { client_update } = require('../../configuration/database/databaseUpdate.js');

exports.requestData = async (req, res) => {
    const {
        table_name,
        old_values,
        new_values,
        maker_id,
        comments,
    } = req.body;

    if (!table_name || !maker_id) {
        return res.status(400).json({
            success: false,
            message: 'table_name and maker_id are required fields',
        });
    }

    try {
        if (!client_update || client_update.ended) {
            throw new Error('Database client is not connected');
        }

        const insertQuery = `
            INSERT INTO app.change_tracker (
                table_name,
                maker_id,
                old_values,
                new_values,
                status,
                comments,
                created_at,
                updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
            RETURNING *;
        `;

        const values = [
            table_name,
            maker_id,
            old_values ? JSON.stringify(old_values) : null,
            new_values ? JSON.stringify(new_values) : null,
            'pending',
            comments || null
        ];

        const result = await client_update.query(insertQuery, values);

        res.status(201).json({
            success: true,
            message: 'Data inserted successfully',
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