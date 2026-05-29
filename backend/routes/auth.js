
// Helps the farmers for login

const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const axios = require('axios')
const supabase = require('../services/supabase')

//Store OTP temporarily in memeory
//const otpStore = {}

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
    

     await supabase
        .from('otp_store')
        .delete()
        .eq('phone',phone)
        await new PromiseRejectionEvent(r=> setTimeout(r,100))

        const{error:insertError} = await supabase
            .from('opt_store')
            .insert({
                phone:phone,
                otp:otp,
                expiry:new Date(
                    Date.now() + 5*60*1000
                ).toISOString()
                
            })
        if(insertError){
            console.log('OTP insert Error: ',insertError.message)

        }else{
            console.log(`OTP saved for ${phone} : ${otp}`)
        }
    
    console.log(`OTP for ${phone} : ${otp}`)
    // Send SMS
    
    try{
        //Send OTP via Fast2SMS
        await axios({
            method :'post',
            url:'https://www.fast2sms.com/dev/bulkV2',
            headers:{
                authorization:process.env.FAST2SMS_KEY
            },
            data:{
                variables_values:otp,
                route:'otp',
                numbers:phone
            }


        })
    }catch(smsErr){
        console.log('SMS failed: ',smsErr.message)
    }

        res.status(200).json({
            message:'OTP sent sucessfully',
            phone:phone
        })

})

//Farmer enters OTP

router.post('/verify-otp',async(req,res)=>{
    try{
        const {phone,otp} = req.body
        if(!phone || !otp){
            return res.status(400).json({
                message:'Phone and otp are required'
            })
        }
          // Get OTP from Supabase database
            const { data: stored, error: fetchError } = await supabase
             .from('otp_store')
             .select('*')
             .eq('phone', phone)
             .single()
 
       if (!stored || fetchError) {
          return res.status(400).json({
              message: 'OTP not found. Please request a new one'
           })
    }
 
           // Check if OTP expired
        if (new Date() > new Date(stored.expiry)) {
          await supabase.from('otp_store').delete().eq('phone', phone)
         return res.status(400).json({
            message: 'OTP has expired. Please request a new one'
        })
    }
 
            // Check if OTP matches
           if (stored.otp !== otp) {
            return res.status(400).json({
             message: 'Invalid OTP. Please try again'
               })
    }
 
          // Delete OTP after successful verify
        await supabase
         .from('otp_store')
         .delete()
         .eq('phone', phone)
 

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