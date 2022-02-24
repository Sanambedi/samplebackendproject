const express = require('express');
const {  } = require('../controllers/productController');
const router = express.Router()

//Middlewares
const { isLoggedIn, customRole } = require('../middlewares/user');








module.exports = router