const express = require('express');
const router = express.Router();

const { signin } = require('../controllers/signin/signin.js');
const { signup } = require('../controllers/signup/signup.js');
const { table } = require('../controllers/table/table.js');
const { tableData } = require('../controllers/tableData/tableData.js');
const { requestData } = require('../controllers/requestData/requestData.js');
const { approve } = require('../controllers/approve/approve.js');
const { reject } = require('../controllers/reject/reject.js');


router.post('/signin', signin);
router.post('/signup', signup);
router.get('/table', table);
router.get('/tableData/:name', tableData);
router.post('/requestdata', requestData);
router.post('/approve', approve);
router.post('/reject', reject);

module.exports = router;