const express = require('express');
const { testProduct } = require('../controllers/productController');
const router = express.Router()

//Middlewares
const { isLoggedIn, customRole } = require('../middlewares/user');

router.route("/testProduct").get(testProduct);






module.exports = router