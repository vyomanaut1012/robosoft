const { client_update } = require('../../configuration/database/databaseUpdate.js');

exports.fetchRowRequest = async (req, res) => {
    try {
        const query = `
            SELECT table_name, array_agg(row_to_json(t)) AS rows
            FROM (
                SELECT *
                FROM app.add_row_table
            ) t
            GROUP BY table_name;
        `;

        const result = await client_update.query(query);

        // Transform data to an array of arrays
        const groupedData = result.rows.map((group) => group.rows);

        return res.status(200).json({
            success: true,
            message: 'Rows fetched successfully.',
            data: groupedData,
        });
    } catch (error) {
        await client_update.query('ROLLBACK');
        console.error('Error:', error);

        return res.status(500).json({
            success: false,
            message: 'An error occurred while processing the request.',
            error: error.message,
        });
    }
};
