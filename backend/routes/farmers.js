//Handels Farmers related API routes
//Import express 
const express = require('express')

//Create router
const router = express.Router()

// Import Supabase Connection
const supabase = require('../services/supabase')

// GET/farmers - Fetch all farmers from database

router.get('/',async(req,res)=>{
    try{
        //Asking supabase to get all rows from farmers table
        const {data,error} = await supabase
         .from('farmers')
         .select('*')
        if(error){
            return res.status(400).json({
                message:'Error fetching farmers',
                error : error.message
             })
        }
        res.status(200).json({
            message:'Farmers fetched successfully',
            count : data.length,
            farmers:data
        })

    }catch(err){
        res.status(500).json({
            message:'server error',
            error:err.message
        })
    }
})

//Get Farmers Phone Number finding one farmer by using phone number

router.get('/:phone',async(req,res)=>{
    try{
        //get phone numner from the url
        const {phone} = req.params

        // Searching for the farmer with that phone number
        const {data,error} = await supabase
         .from('farmers')
         .select('*')
         .eq('phone',phone)
         .single()
        if(error){
            return res.status(400).json({
                message:'Error fetching farmers',
                error : error.message
            })
        }
        res.status(200).json({
            message:'Farmer Found',
            farmer:data
        })

    }catch(err){
        res.status(500).json({
            message:'server error',
            error:err.message
        })

    }
})

module.exports = router