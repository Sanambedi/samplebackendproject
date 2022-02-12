require('dotenv').config();
const app = require('./app');


app.listen(process.env.PORT,()=>{
    console.log(`SERVER IS RUNNING AT PORT: ${process.env.PORT}`)
})