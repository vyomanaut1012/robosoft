const { client_update } = require('../../configuration/database/databaseUpdate.js');

exports.approveAllRow = async (req, res) => {
    
    const { request_ids, comments, checker } = req.body;
    
    try {
       
    } catch (error) {
        // Rollback in case of error
        await client_update.query('ROLLBACK');
        console.error('Error:', error);

        return res.status(500).json({
            success: false,
            message: 'An error occurred while processing the request.',
            error: error.message,
        });
    }
};
