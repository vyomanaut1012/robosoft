const { client_update } = require('../../configuration/database/databaseUpdate.js');

exports.approve = async (req, res) => {
    const { table_id, row_id, new_data, comment, checker } = req.body;

    if (!table_id || !new_data || !checker) {
        return res.status(400).json({
            success: false,
            message: 'table_id, new_data, and checker are required fields',
        });
    }

    try {
        if (!client_update || client_update.ended) {
            throw new Error('Database client is not connected');
        }

        await client_update.query('BEGIN');

        // Update or insert in the public schema
        let publicSchemaQuery;
        let publicSchemaValues;

        if (row_id) {
            publicSchemaQuery = `
                UPDATE public."${table_id}"
                SET ${Object.keys(new_data).map((key, index) => `"${key}" = $${index + 1}`).join(', ')}
                WHERE id = $${Object.keys(new_data).length + 1}
                RETURNING *;
            `;
            publicSchemaValues = [...Object.values(new_data), row_id];
        } else {
            publicSchemaQuery = `
                INSERT INTO public."${table_id}" (${Object.keys(new_data).map(key => `"${key}"`).join(', ')})
                VALUES (${Object.keys(new_data).map((_, index) => `$${index + 1}`).join(', ')})
                RETURNING *;
            `;
            publicSchemaValues = Object.values(new_data);
        }

        const publicSchemaResult = await client_update.query(publicSchemaQuery, publicSchemaValues);

        // Update in the app schema
        const appSchemaQuery = `
            UPDATE app.change_tracker
            SET 
                status = 'approved',
                comments = COALESCE($1, comments),
                checker_id = $2,
                updated_at = NOW()
            WHERE id = $3
            RETURNING *;
        `;

        const appSchemaValues = [comment, checker, row_id];

        const appSchemaResult = await client_update.query(appSchemaQuery, appSchemaValues);

        await client_update.query('COMMIT');

        if (appSchemaResult.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'No row found in app.change_tracker with the provided row_id',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Change request approved successfully',
            publicData: publicSchemaResult.rows[0],
            trackerData: appSchemaResult.rows[0],
        });
    } catch (error) {
        await client_update.query('ROLLBACK');
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while processing the request',
            error: error.message,
        });
    }
};