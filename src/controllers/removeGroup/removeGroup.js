const { client_update } = require('../../configuration/database/databaseUpdate.js');

exports.removeGroup = async (req, res) => {
    try {
        const { group_name } = req.body;
       
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
