const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')
const userRouter = require('./router/userRouter')
dotenv.config();
const app = express()


mongoose.connect(process.env.MONGODB_URL,()=>{
    console.log("connect to mongoose");
})
app.use(cors())
app.use(express.json())
app.use(cookieParser())

app.use('/v1/user',userRouter)

app.listen(9000,()=>{
    console.log('Server is running 9k');
})