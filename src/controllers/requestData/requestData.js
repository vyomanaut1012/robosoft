const { client_update } = require('../../configuration/database/databaseUpdate.js');
const { v4: uuidv4 } = require('uuid');

exports.requestData = async (req, res) => {
    // const userId = uuidv4();
    const {
        id,
        request_id,
        table_id,
        table_name,
        row_id,
        old_data,
        new_data,
        status,
        maker,
        checker,
        created_at,
        updated_at,
        comments,
    } = req.body;

    if (!table_name || !maker) {
        return res.status(400).json({
            success: false,
            message: 'table_name and maker are required fields',
        });
    }

    try {
        if (!client_update || client_update.ended) {
            throw new Error('Database client is not connected');
        }

        const insertQuery = `
            INSERT INTO app.change_tracker (
                request_id,
                table_id,
                table_name,
                row_id,
                old_data,
                new_data,
                status,
                maker,
                checker,
                created_at,
                updated_at,
                comments
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW(), $10)
            RETURNING *;
        `;

        const values = [
            request_id || uuidv4(),
            table_id || null,
            table_name,
            row_id || null,
            old_data ? JSON.stringify(old_data) : null,
            new_data ? JSON.stringify(new_data) : null,
            status || 'pending',
            maker,
            checker || null,
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
