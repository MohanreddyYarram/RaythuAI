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
            return res.status(404).json({
                message:'Farmer not found',
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

//Post method to add new farmer

router.post('/',async(req,res)=>{
    try{

        //Get farmer details
        const {name,phone,village,district,land_acres,crop_type} = req.body

        //Checking all the required fields are provided

        if(!name || !phone || !village || !district ){
            return res.status(400).json({
                message : 'Please provide name ,phone, village and district'
            })
        }
        //Validating phone  number
        if(phone.length !==10){
            return res.status(400).json({
                message:'Please enter a valid 10-digit phone number'
            })

        }
        //Validating name length
        if(name.length<2 || name.length>100){
            return res.status(400).json({
                message:'Name must be in between 2 and 100 characters'
            })
        }
        // Checking farmer details with this phone number
        const {data:existing} = await supabase
            .from('farmers')
            .select('*')
            .eq('phone',phone)
            .single()
        if(existing){
            return res.status(400).json({
                message :'Farmer with this phone number already exists'
            })
        }

        const{data,error}=await supabase
            .from('farmers')
            .insert([{
                name,
                phone,
                village,
                district,
                land_acres,
                crop_type
            }])
            .select()
        if (error){
            res.status(400).json({
                message:'Error creating the farmer',
                error:error.message
            })
        }
        res.status(201).json({
            message:'Farmer Created Sucessfully',
            farmer:data[0]

        })


    }catch(err){
        res.status(500).json({
            message:"Server Error",
            error:err.message
        })
    }
})

//PUT/Method
router.put('/:phone',async(req,res)=>{
     const {phone} = req.params
        const{
            name,village,district,
            land_acres,crop_type,sowing_date
        } = req.body
    try{
        console.log('Updating farmer: ',phone,{name,village} )
       

        const {data,error} = await supabase
            .from('farmers')
            .update({
                name,
                village,
                district,
                land_acres,
                crop_type,
                sowing_date: sowing_date || null
    })
    .eq('phone',phone)
    .select()
        if(error){
            return res.status(400).json({
                message:'Error updating farmer',
                error:error.message
            })
        }
        res.status(200).json({
            message:'Profile updated successfully',
            farmer:data[0]
        })
    }catch(err){
        res.status(500).json({
            message:'Server error',
            error:err.message
        })
    }
})

// Get all pending farmers
router.get('/pending', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('farmers')
      .select('phone, name, village, district, land_acres, crop_type, created_at, is_approved')
      .order('created_at', { ascending: false })

    if (error) return res.status(400).json({ message: error.message })
    res.status(200).json({ farmers: data })
  } catch(err) {
    res.status(500).json({ message: err.message })
  }
})

// Approve or reject farmer
router.put('/approve/:phone', async (req, res) => {
  const { phone } = req.params
  const { is_approved } = req.body

  try {
    const { data, error } = await supabase
      .from('farmers')
      .update({ is_approved })
      .eq('phone', phone)
      .select()

    if (error) return res.status(400).json({ message: error.message })
    res.status(200).json({ 
      message: is_approved ? 'Farmer approved!' : 'Farmer rejected',
      farmer: data[0] 
    })
  } catch(err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router