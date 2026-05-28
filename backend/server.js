process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
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

//Tells express to accept JSON data in request
app.use(express.json())

// Enable cors so frontend can connect
app.use(cors({
    origin :'*',
    methods:['GET','POST','PUT','DELETE'],
    allowedHeaders:['Content-Type','Authorization']

}))


app.use(express.static(path.join(__dirname,'../web')))

//Import Routes for farmers
const farmersRoute = require('./routes/farmers')
const authRoute = require('./routes/auth')
const detectionRoute = require('./routes/detection')

app.use('/farmers',farmersRoute)

//Importing routes for auth

app.use('/auth',authRoute)

app.use('/detect',detectionRoute)

// Home Route
app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,'../web','index.html'))
})

// Start the server on port 3000
const PORT = process.env.PORT || 3000
app.listen(PORT,()=>{
    console.log(`RythuAiI Server running on port ${PORT}`)
})
