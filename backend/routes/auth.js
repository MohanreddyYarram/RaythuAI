
// Helps the farmers for login

const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const axios = require('axios')
const supabase = require('@supabase/supabase-js')

//Store OTP temporarily in memeory
const otpStore = {}

// POST/auth/send-otp
// Farmer enters phone number receive otp
router.post('/send-otp',async(req,res)=>{
    
        // Get phone number from request
    const { phone } = req.body

    if(!phone){
         return res.status(400).json({
                message:'Phone number required'
            })
    }
        //Generates a random 6-digit otp
    const otp = Math.floor(100000+Math.random()*900000).toString()

        //Save OTP with phone number and expires in 5 minutes
    otpStore[phone] = {
            otp :otp,
            expiry: Date.now()+5*60*1000
    }
    console.log(`OTP for ${phone} : ${otp}`)
    try{
        //Send OTP via Fast2SMS
        const response = await axios({
            method :'post',
            url:'https://www.fast2sms.com/dev/bulkV2',
            headers:{
                authorization:process.env.FAST2SMS_KEY
            },
            data:{
                variables_values:otp,
                route:'otp',
                phone:phone
            }


        })
        console.log('Fast2SMS response: ',response)
        res.status(200).json({
            message:'OTP sent sucessfully',
            phone:phone
        })
    }catch(err){
        console.log("Error sending OTP:",err.message)
        res.status(200).json({
            message:'OTP Sent Sucessfully',
            phone:phone,
            dev_otp :otp
        })
    }
})

//Farmer enters OTP

router.post('/veify-otp',async(req,res)=>{
    try{
        const {phone,otp} = req.body
        if(!phone || !otp){
            return res.status(400).json({
                message:'Phone and otp are required'
            })
        }
         const stored =otpStore[phone]
         
        if(!stored){
            return res.status(400).json({
                message:"OTP not found.Please request a new one"
            })
        }
        //Check if otp expires
        if(Date.now()>stored.expiry){
            delete otpStore[phone]
            return res.status(400).json({
                message:"OTP has expired . Please request new one"
            })
        }

        //Check if otp matches
        if(stored.opt !== otp){
            return res.status(400).json({
                message:'Invalid OTP. please try again'
            })
        }

        //OTP correct delete it 
        delete otpStore[phone]

        //Check if farmer exists in database

        const {data:farmer} = await supabase
            .from('farmers')
            .select('*')
            .eq('phone',phone)
            .single()

        //Create JWT token
        const token = jwt.sign(
            {
                phone : phone,
                farmerId :farmer?farmer.id:null
            },
            process.env.JWT_SECRET,
            {expiresIn:'7d'}
        )
        res.status(200).json({
            message:'Login Sucessful',
            token:token,
            farmer :farmer||null,
            isNewFarmer:!farmer
        })


    }catch(err){
        res.status(500).json({
            message:'Server error',
            error:err.message
        })
    }
})

module.exports = router