const { client_update } = require('../../configuration/database/databaseUpdate.js');

exports.columnStatusPermission = async (req, res) => {
    const { table_id, column_list } = req.body;

    if (!table_id || !Array.isArray(column_list)) {
        return res.status(400).json({
            success: false,
            message: '"table_id" and "column_list" are required fields, and "column_list" must be an array.',
        });
    }

    try {
        await client_update.query('BEGIN');

        const checkQuery = `
            SELECT column_list 
            FROM app.column_permission
            WHERE table_id = $1;
        `;
        const checkResult = await client_update.query(checkQuery, [table_id]);

        if (checkResult.rowCount > 0) {
            const existingColumnList = checkResult.rows[0].column_list || [];
            const updatedColumnList = existingColumnList.map((existingColumn) => {
                const match = column_list.find(col => col.column_name === existingColumn.column_name);
                return match ? { ...existingColumn, column_status: match.column_status } : existingColumn;
            });

            column_list.forEach(newColumn => {
                if (!updatedColumnList.some(col => col.column_name === newColumn.column_name)) {
                    updatedColumnList.push(newColumn);
                }
            });

            // Update the row
            const updateQuery = `
                UPDATE app.column_permission
                SET column_list = $1,
                    updated_at = NOW()
                WHERE table_id = $2;
            `;
            await client_update.query(updateQuery, [JSON.stringify(updatedColumnList), table_id]);
        } else {
            // Row does not exist, insert a new row
            const insertQuery = `
                INSERT INTO app.column_permission (table_id, column_list, created_at, updated_at)
                VALUES ($1, $2, NOW(), NOW());
            `;
            await client_update.query(insertQuery, [table_id, JSON.stringify(column_list)]);
        }

        await client_update.query('COMMIT');

        return res.status(200).json({
            success: true,
            message: 'Column statuses updated successfully.',
        });
    } catch (error) {
        await client_update.query('ROLLBACK');
        console.error('Error:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while processing the request',
            error: error.message,
        });
    }
};
