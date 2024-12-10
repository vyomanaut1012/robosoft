const { client_update } = require('../../configuration/database/databaseUpdate.js');

exports.fetchcolumnstatus = async (req, res) => {
    try {
       
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while processing the request',
            error: error.message,
        });
    }
};