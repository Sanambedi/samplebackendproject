require('dotenv').config();
const app = require('./app');
const connectWithDb = require('./config/db');

//Connection with database
connectWithDb();

app.listen(process.env.PORT,()=>{
    console.log(`SERVER IS RUNNING AT PORT: ${process.env.PORT}`)
})