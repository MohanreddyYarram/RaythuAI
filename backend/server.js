
//process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
//Main Entry point for backend

//Import express (the framework that handles request)
const express = require('express')

//Import cors (allows frontend to talk with backend)
const cors = require('cors')

const path = require('path')
// Import dotenv (reads secerates)
require('dotenv').config()

//Creates express app
const app = express()
app.set('trust proxy',1)

//Tells express to accept JSON data in request
app.use(express.json())

// Enable cors so frontend can connect
app.use(cors({
    origin :'*',
    methods:['GET','POST','PUT','DELETE'],
    allowedHeaders:['Content-Type','Authorization']

}))

app.use(helmet({
    contentSecurityPolicy:false
}))

//Import Routes for farmers
const farmersRoute = require('./routes/farmers')
const authRoute = require('./routes/auth')
const detectionRoute = require('./routes/detection')
const activitiesRoute = require('./routes/activities')
const shopRoute = require('../backend/routes/shop')

//Detect limit for detect route
const detectLimiter = rateLimit({
    windowMs:15 * 60 *1000,
    max : 10,
    message:{
        message:'Too many scan request. Please try after 15 minutes'
    }
})

//Rate limiting for auth route
const authLimiter = rateLimit({
    windowMs: 60 * 60 *1000,
    max : 25,
    message:{
        message:' Too many otp requests,please try after 1 hour.'
    }
})

app.use('/detect',detectLimiter)
app.use('/auth/send-otp',authLimiter)


app.use(express.static(path.join(__dirname,'web')))



app.use('/farmers',farmersRoute)

//Importing routes for auth

app.use('/auth',authRoute)

app.use('/detect',detectionRoute)

app.use('/activities',activitiesRoute)

app.use('/shop',shopRoute)
// Home Route
app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,'web','index.html'))
})

// Start the server on port 3000
const PORT = process.env.PORT || 3000
app.listen(PORT,()=>{
    console.log(`RythuAiI Server running on port ${PORT}`)
})
