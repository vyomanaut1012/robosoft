const { client } = require('../../configuration/database/database.js');

exports.requestData = async (req, res) => {
    const {
        table_name,
        old_data,
        new_data,
        user,
        comment,
    } = req.body;

    try {
        // Use the correct schema (e.g., "app")
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS app.change_tracker (
                id SERIAL PRIMARY KEY,
                table_name TEXT NOT NULL,
                old_data JSONB,
                new_data JSONB,
                "user" TEXT NOT NULL, -- Avoid reserved keyword conflict
                status TEXT DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW(),
                comment TEXT
            );
        `;
        
        await client.query(createTableQuery);

        const insertQuery = `
            INSERT INTO app.change_tracker (table_name, old_data, new_data, "user", comment)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;

        const values = [table_name, old_data, new_data, user, comment];

        const result = await client.query(insertQuery, values);

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
