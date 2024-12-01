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
        // Create the table 'change_tracker' if it doesn't already exist
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS change_tracker (
                id SERIAL PRIMARY KEY,
                table_name TEXT NOT NULL,
                old_data JSONB,
                new_data JSONB,
                "user" TEXT NOT NULL, -- Note: using "user" as a column name to avoid conflict with reserved word
                status TEXT DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW(),
                comment TEXT
            );
        `;
        
        await client.query(createTableQuery);

        // Insert the data into the 'change_tracker' table
        const insertQuery = `
            INSERT INTO change_tracker (table_name, old_data, new_data, "user", comment)
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
