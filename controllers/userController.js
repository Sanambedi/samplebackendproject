const User = require("../models/user");
const BigPromise = require('../middlewares/bigPromise')
const CustomError = require("../utils/customError");
const cookieToken = require("../utils/cookieToken");
const cloudinary = require('cloudinary');
const mailHelper = require("../utils/emailHelper");
const crypto = require('crypto');
exports.signup = BigPromise(async(/* err, */req,res,next)=>{

    if(!req.files){
        return next(new CustomError("Photo is required for signup",400));
    }
    
    const {name,email,password} = req.body
    
    
    if(!email || !password || !name){
        return next(new CustomError('Name, email and password are required', 400))
    }

    let file = req.files.photo

    
    const result = await cloudinary.v2.uploader.upload(file.tempFilePath,{
        folder: "users",
        width: 150,
        crop: "scale",
    })
    

    const user = await User.create({
        name,
        email,
        password,
        photo:{
            id: result.public_id,
            secure_url: result.secure_url
        }
    })

    cookieToken(user,res);
});
exports.login = BigPromise(async(req,res,next)=>{
    const {email,password} = req.body
    //check for presence of email and password
    if(!email || !password){
        return next(new CustomError("Please provide email and password",400))
    }
    //Get User from DB
    const user = await User.findOne({email}).select("+password");
    
    //if user not found in DB
    if(!user){
        return next(new CustomError("Email or Password does not match or exist",400))
    }
    
    //match the password
    const isPasswordCorrect = await user.IsValidatePassword(password);
    
    //if password do not match
    if(!isPasswordCorrect){
        return next(new CustomError("Email or Password does not match or exist",400))
    }

    //if all goes good and we send the token
    cookieToken(user,res);
});
exports.logout = BigPromise(async(req,res,next)=>{
    res.cookie('token',null,{
        expires: new Date(Date.now()),
        httpOnly: true
    })
    res.status(200).json({
        success: true,
        message:"Logout Success",
    })
});
exports.forgotPassword = BigPromise(async(req,res,next)=>{
    //Recieving the email response from the user
    const {email} = req.body
    
    // finding for the user in the database
    const user = await User.findOne({email});

    //If no user was existing in the database
    if(!user){
        return next(new CustomError("Email not found as registered",400))
    }
    
    //Get token from models methods
    const forgotToken = user.getForgotPasswordToken()

    //save user fields in the DB
    await user.save({validateBeforeSave: false})

    //create a URL
    const myUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${forgotToken}`;

    //craft a message
    const message = `Copy paste this link in your URL and hit enter \n\n ${myUrl}`;

    //attempt to send an email
    try{
        await mailHelper({
            email: user.email,
            subject: "LCO t-store Password reset email",
            message
        })
        res.status(200).json({
            success:true,
            message:"Email Sent Successfully"
        })
    }
    //If any error occurs
    catch(error){
        user.forgotPasswordToken = undefined
        user.forgotPasswordExpiry = undefined
        await user.save({validateBeforeSave: false})

        return next(new CustomError(error,500))
    }
});
exports.passwordReset = BigPromise(async(req,res,next)=>{
    const token = req.params.token
    const encryToken = crypto
    .createHash("sha256")
    .update(token)
    .digest('hex')

    const user = await User.findOne({
        encryToken,
        forgotPasswordExpiry:{
            $gt:Date.now()
        }
    })

    if(!user){
        return next(new CustomError('Token is invalid or expired',400))
    }
    
    if(req.body.password !== req.body.confirmPassword){
        return next(new CustomError('Password and confirm password do not match',400))
    }

    user.password = req.body.password


    user.forgotPasswordToken = undefined
    user.forgotPasswordExpiry = undefined

    await user.save()
    

    //send a JSON response or send a token

    cookieToken(user,res)
});
exports.getLoggedInUserDetails = BigPromise(async(req,res,next)=>{
    
    const user = await User.findById(req.user.id)
    res.status(200).json({
        success:true,
        user
    });
});
exports.changePassword = BigPromise(async(req,res,next)=>{
    
    const userId = req.user.id

    const user = await User.findById(userId).select("+password");

    const isCorrectOldPassword =  await user.IsValidatePassword(req.body.oldPassword)

    if(!isCorrectOldPassword){
        return next(new CustomError('Old password is incorrect',400))
    }
    user.password = req.body.password
    await user.save()

    cookieToken(user,res)
});
exports.updateUserDetails = BigPromise(async(req,res,next)=>{
    
    const newData = {
        name: req.body.name,
        email: req.body.email
    };

    if(req.files){
        const user = User.findById(req.user.id)
        const imageId = user.photo.id
        //Delete photo on cloudinary
        const resp = await cloudinary.v2.uploader.destroy(imageId)
        //Upload the new photo
        const result = await cloudinary.v2.uploader.upload(req.files.photo.tempFilePath,{
            folder: "users",
            width: 150,
            crop: "scale",
        })
        newData.photo = {
            id:result.public_id,
            secure_url: result.secure_url
        }
    }
    
    await User.findByIdAndUpdate(req.user.id,newData,{
        new: true,
        runValidators: true,
        useFindAndModify: false
    })
    res.status(200).json({
        success: true,
        
    })


});
exports.adminAllUser = BigPromise(async(req,res,next)=>{
    const users = await User.find()

    res.status(200).json({
        success: true,
        users
    })
});
exports.managerAllUser = BigPromise(async(req,res,next)=>{
    const users = await User.find({
        role:'user'
    })

    res.status(200).json({
        success: true,
        users
    })
});
exports.admingetOneUser = BigPromise(async(req,res,next)=>{
    const user = await User.findById(req.params.id)
    if(!user){
        next(new CustomError("No user was found",400));
    }

    res.status(200).json({
        success: true,
        user
    })
});
exports.adminUpdateOneUserDetails = BigPromise(async(req,res,next)=>{
    
    const newData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    };

    
    
    await User.findByIdAndUpdate(req.params.id,newData,{
        new: true,
        runValidators: true,
        useFindAndModify: false
    })
    res.status(200).json({
        success: true,
    })


});
exports.adminDeleteOneUser = BigPromise(async(req,res,next)=>{
    const user = await User.findById(req.params.id)
    if(!user){
        return next(new CustomError('No such user found',401))
    }

    const imageId = user.photo.id;
    cloudinary.v2.uploader.destroy(imageId)
    await user.remove()
    res.status(200).json({
        success: true
    })
});