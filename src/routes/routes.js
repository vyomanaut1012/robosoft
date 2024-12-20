const express = require('express');
const router = express.Router();

const { signin } = require('../controllers/signin/signin.js');
const { signup } = require('../controllers/signup/signup.js');
const { table } = require('../controllers/table/table.js');
const { tableData } = require('../controllers/tableData/tableData.js');
const { requestData } = require('../controllers/requestData/requestData.js');
const { approve } = require('../controllers/approve/approve.js');
const { reject } = require('../controllers/reject/reject.js');
const { fetchChangeTrackerData } = require('../controllers/changeTrackerData/fetchChangeTrackerData.js');
const { columnStatusPermission } = require('../controllers/columnStatusPermission/columnStatusPermission.js');
const { fetchColumn } = require('../controllers/fetchColumn/fetchColumn.js');
const { fetchColumnStatus } = require('../controllers/fetchColumnStatus/fetchcolumnstatus.js');
const { updateColumnDropDown } = require('../controllers/updateColumnDropdown/updateColumnDropDown.js');
const { fetchColumnDropDown } = require('../controllers/fetchColumnDropdown/fetchColumnDropDown.js');
const { fetchDropDownOptions } = require('../controllers/fetchDropDownOptions/fetchDropDownOptions.js');
const { allApprove } = require('../controllers/approveAll/allApprove.js');
const { allReject } = require('../controllers/allReject/allReject.js');


router.post('/signin', signin);
router.post('/signup', signup);
router.get('/table', table);
router.get('/tableData/:name', tableData);
router.post('/requestdata', requestData);
router.post('/approve', approve);
router.post('/reject', reject);
router.get('/fetchchangetrackerdata', fetchChangeTrackerData);
router.post('/columnstatuspermission', columnStatusPermission);
router.post('/fetchcolumn', fetchColumn);
router.post('/fetchcolumnstatus', fetchColumnStatus);
router.post('/updatecolumndropdown', updateColumnDropDown);
router.post('/fetchcolumndropdown', fetchColumnDropDown);
router.post('/fetchdropdownoptions', fetchDropDownOptions);
router.post('/approveall', allApprove);
router.post('/rejectall', allReject);

module.exports = router;