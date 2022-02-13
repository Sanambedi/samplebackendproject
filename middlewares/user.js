const User = require("../models/user");
const CustomError = require("../utils/customError");
const BigPromise = require("./bigPromise");
const jwt  = require("jsonwebtoken");


exports.isLoggedIn = BigPromise(async(req,res,next)=>{
    const token = req.cookies.token || req.header("Authorization").replace('Bearer ','')
    if(!token){
        return next(new CustomError('Login first to access this page',401))
    }
    const decoded = await jwt.verify(token,process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id)

    next()
});