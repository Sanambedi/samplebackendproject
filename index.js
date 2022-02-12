require('dotenv').config();
const app = require('./app');
const connectWithDb = require('./config/db');
const cloudinary = require("cloudinary")


//Connection with database
connectWithDb();

//cloudinary config goes here
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLODINARY_API_SECRET
})
app.listen(process.env.PORT,()=>{
    console.log(`SERVER IS RUNNING AT PORT: ${process.env.PORT}`)
})