//Main Entry point for backend

//Import express (the framework that handles request)
const express = require('express')

//Import cors (allows frontend to talk with backend)
const cors = require('cors')

// Import dotenv (reads secerates)
require('dotenv').config()

//Creates express app
const app = express()

//Tells express tp accept JSON data in request
app.use(express.json())

// Enable cors so frontend can connect
app.use(cors())

// First Route
app.get('/',(req,res)=>{
    res.json({
        message :"RytuAI Backend is running",
        status : 'Success'
    })
})

// Start the server on port 3000
const PORT = process.env.PORT || 3000
app.listen(PORT,()=>{
    console.log(`RythuAiI Server running on port ${PORT}`)
})
