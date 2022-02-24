const BigPromise = require("../middlewares/bigPromise");
const Product = require("../models/product");
const CustomError = require("../utils/customError");
const cloudinary = require('cloudinary');


exports.addProduct = BigPromise(async(req,res,next)=>{
    //images

    let imageArray = [];

    if(!req.files){
        return next(new CustomError("Images are required",401))
    }
    if(req.files){
        for(let index of req.files.photos.length){
            let result = await cloudinary.v2.uploader.upload(req.files.photos[index].tempFilePath,{
                folder: "products"
            })
            imageArray.push({
                id: result.public_id,
                secure_url: result.secure_url
            })
        }
    }

    req.body.photos = imageArray
    req.body.user = req.user.id

    const product = await Product.create(req.body)
    res.status(200).json({
        success: true,
        product
    })
})
