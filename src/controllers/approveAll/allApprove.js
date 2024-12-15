const { client_update } = require('../../configuration/database/databaseUpdate.js');

exports.allApprove = async (req, res) => {
    const { request_ids, comments, checker } = req.body;

    if (!Array.isArray(request_ids) || request_ids.length === 0 || !checker) {
        return res.status(400).json({
            success: false,
            message: '"request_ids" must be a non-empty array, and "checker" is required.',
        });
    }

    try {
        // Start transaction
        await client_update.query('BEGIN');

        // Initialize a results array to store responses for each request_id
        const results = [];

        for (const request_id of request_ids) {
            // Step 1: Retrieve the relevant data from change_tracker
            const selectQuery = `
                SELECT table_name, row_id, new_data
                FROM app.change_tracker
                WHERE request_id = $1;
            `;
            const selectResult = await client_update.query(selectQuery, [request_id]);

            if (selectResult.rowCount === 0) {
                throw new Error(`No record found for request_id: ${request_id}`);
            }

            const { table_name, row_id, new_data } = selectResult.rows[0];

            if (!table_name || !row_id || !new_data) {
                throw new Error(
                    `Invalid data in change_tracker for request_id: ${request_id}. Missing table_name, row_id, or new_data.`
                );
            }

            // Step 2: Parse new_data JSON
            const updates = Object.entries(new_data); // Extract column-value pairs

            // Step 3: Construct dynamic SQL for the target table
            const updateColumns = updates
                .map(([column, value], index) => `${column} = $${index + 1}`)
                .join(', ');
            const updateValues = updates.map(([, value]) => value);
            updateValues.push(row_id); // Add row_id as the last parameter for WHERE clause

            const dynamicUpdateQuery = `
                UPDATE app.${table_name}
                SET ${updateColumns}
                WHERE row_id = $${updates.length + 1};
            `;

            // Execute the dynamic update query
            await client_update.query(dynamicUpdateQuery, updateValues);

            // Step 4: Update the status of the request in change_tracker
            const updateTrackerQuery = `
                UPDATE app.change_tracker
                SET 
                    status = $1,
                    comments = $2,
                    updated_at = NOW(),
                    checker = $3
                WHERE request_id = $4
                RETURNING *;
            `;

            const trackerValues = ['approved', comments || null, checker, request_id];
            const trackerResult = await client_update.query(updateTrackerQuery, trackerValues);

            if (trackerResult.rowCount === 0) {
                throw new Error(`Failed to update change_tracker for request_id: ${request_id}`);
            }

            // Add successful result to the results array
            results.push({
                request_id,
                success: true,
                trackerData: trackerResult.rows[0],
            });
        }

        // Commit transaction
        await client_update.query('COMMIT');

        return res.status(200).json({
            success: true,
            message: 'Change requests approved and applied successfully',
            results,
        });
    } catch (error) {
        await client_update.query('ROLLBACK'); // Rollback transaction on error
        console.error('Error:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while processing the requests',
            error: error.message,
        });
    }
};
