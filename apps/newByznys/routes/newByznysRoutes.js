const express = require('express');
const router = express.Router();


const newByznysApp = require('../app');

const newByznysAPI = require('../controllers/api');


// GET  /feed/posts
router.get('/getreport', newByznysAPI.getReport);


router.get('/', newByznysApp.getIndex);

module.exports = router;