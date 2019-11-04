const express = require('express');
const router = express.Router();


const newByznysApp = require('../app');

const newByznysAPI = require('../controllers/api');



router.get('/getreport', newByznysAPI.getReport);

router.get('/downloadresult', newByznysAPI.downloadResult);


router.get('/', newByznysApp.getIndex);

module.exports = router;