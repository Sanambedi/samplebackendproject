require('dotenv').config();
const express= require('express');
const app = express();
const morgan = require('morgan');
const cookieParser = require('cookie-parser')
const filUpload = require('express-fileupload')


// for swagger documentation
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');    

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


//regular middlewares
app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))

//cookies and file middlewares
app.use(cookieParser())
app.use(filUpload({
    useTempFiles:true,
    tempFileDir: "/temp/"
}))

//temp check
app.set('view engine','ejs')

//morgan middleware
app.use(morgan('tiny'))


//import all routes here
const home = require('./routes/home');
const user = require('./routes/user');


//router middleware
app.use('/api/v1',home)
app.use('/api/v1',user)
app.get('/signuptest',(req,res)=>{
    res.render('signuptest')
})

//export app.js


module.exports = app;