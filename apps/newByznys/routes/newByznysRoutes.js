const express = require('express');
const router = express.Router();


const newByznys = require('../app');

router.get('/', newByznys.getIndex);

module.exports = router;