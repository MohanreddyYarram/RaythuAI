
//process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')


//Main Entry point for backend

//Import express (the framework that handles request)
const express = require('express')
const compression = require('compression')

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
    origin : [
        'https://rytuai.in',
        'https://www.rytuai.in',
        'https://raythuai.up.railway.app',
        'http://localhost:8080'
    ],
    methods:['GET','POST','PUT','DELETE'],
    allowedHeaders:['Content-Type','Authorization']

}))

app.use(helmet({
    contentSecurityPolicy:false
}))

app.use(compression())

/**
 * Production related code for sequrity
 * const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const cors = require('cors')

// Security headers
app.use(helmet())

// CORS — only allow your domain
app.use(cors({
  origin: [
    'https://raythuai.up.railway.app',
    'http://localhost:8080'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Rate limiting — prevent brute force
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { message: 'Too many requests, please try again later' }
})
app.use(limiter)

// Stricter limit for OTP — prevent OTP spam
const otpLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // max 3 OTP requests per minute
  message: { message: 'Too many OTP requests. Wait 1 minute.' }
})
app.use('/auth/send-otp', otpLimiter)

// JWT secret must be strong
// Make sure JWT_SECRET in Railway is a long random string
// Not 'rytuai2024secret' — change to something like:
// openssl rand -base64 32
 */


//Import Routes for farmers
const farmersRoute = require('./routes/farmers')
const authRoute = require('./routes/auth')
const detectionRoute = require('./routes/detection')
const activitiesRoute = require('./routes/activities')
const shopRoute = require('./routes/shop')
const paymentRoute = require('./routes/payment')

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
app.use('/payment',paymentRoute)
// Home Route
app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,'web','index.html'))
})

//Shop Admin Portal
app.get('/shop-admin',(req,res)=>{
    res.sendFile(path.join(__dirname,'web','shop-admin.html'))
})


// Start the server on port 3000
const PORT = process.env.PORT || 3000
app.listen(PORT,()=>{
    console.log(`RythuAiI Server running on port ${PORT}`)
})
