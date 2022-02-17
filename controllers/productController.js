const BigPromise = require("../middlewares/bigPromise");


exports.testProduct = BigPromise(async(req,res,next)=>{
    res.status(200).json({
        success:true,
        greeting:"This is a test for product route"
    })
});