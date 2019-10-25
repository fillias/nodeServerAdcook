const express = require('express');
const router = express.Router();

const newByznys = require('../apps/newByznys/app');
const homePage = require('../controllers/home');


router.get('/', homePage.home);

router.get('/newbyznys', newByznys.getIndex)

module.exports = router;
