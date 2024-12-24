const { client_update } = require('../../configuration/database/databaseUpdate.js');

exports.addGroup = async (req, res) => {
    const { group_name } = req.body;

    if (!group_name) {
        return res.status(400).json({
            success: false,
            message: 'Group name is required',
        });
    }

    try {
        const existingGroup = await client_update.query(
            `SELECT * FROM app.group_table WHERE group_name = $1`,
            [group_name]
        );

        if (existingGroup.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'This name of group has already been created.',
            });
        }

        await client_update.query(
            `INSERT INTO app.group_table (group_name) VALUES ($1)`,
            [group_name]
        );

        res.status(200).json({
            success: true,
            message: 'Group name added successfully',
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

exports.addTable = async (req, res) => {
    const { group_name, table_list } = req.body;

    if (!group_name || !Array.isArray(table_list)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid input: group_name and table_list are required, and table_list must be an array.',
        });
    }

    try {
        const existingGroup = await client_update.query(
            `SELECT table_list FROM app.group_table WHERE group_name = $1`,
            [group_name]
        );

        if (existingGroup.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Group name not found.',
            });
        }

        const existingTableList = existingGroup.rows[0].table_list || [];
        const updatedTableList = Array.from(new Set([...existingTableList, ...table_list]));

        await client_update.query(
            `UPDATE app.group_table SET table_list = $1 WHERE group_name = $2`,
            [JSON.stringify(updatedTableList), group_name]
        );

        res.status(200).json({
            success: true,
            message: 'Table list updated successfully.',
            data: updatedTableList,
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while processing the request.',
            error: error.message,
        });
    }
};
