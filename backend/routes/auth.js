
const express = require ('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const supabase = require('../services/supabase')
const {sendOTPSms} = require('../services/sms')

const JWT_SECRET = process.env.JWT_SECRET || 'rytuai2024secret'

//Send otp
router.post('/send-otp',async(req,res)=>{
    const{phone} = req.body

    if(!phone || phone.length !== 10){
        return res.status(400).json({message:'Valid 10-digit phone number required'})
    }

    //Generate OTP
    const otp = Math.floor(100000 +Math.random()*900000).toString()
    console.log('OTP for',phone,':',otp)

    //Save Otp to database
    try{
        await supabase.from('otp_store').delete().eq('phone',phone)

        const {error:insertError} = await supabase.from('otp_stor').insert({
            phone:phone,
            otp:otp,
            expiry : new Date(Date.now()+5*60*1000).toISOString()
        })
        if(insertError){
            console.log('OTP insert error :',insertError.message)
        }
    }catch(dbErr){
        console.log('OTP DB error: ',dbErr.message)
    }

    //Semd SMS

    const smsResult = await sendOTPSms(phone,otp)

    if(smsResult.sucess){
        console.log('SMS sent successfully to:',phone)
    }else{
        console.log('SMS failed:',smsResult.message,'--OTP is:',otp)
    }

    return res.status(200).json({
        message:'OTP sent successfully',
        phone:phone,

        //Remove in prod
        ...(process.env.NODE_ENV !=='production' && {debug_otp:otp})
    })
})


// ── VERIFY OTP ──
router.post('/verify-otp', async (req, res) => {
  const { phone, otp } = req.body
 
  if (!phone || !otp) {
    return res.status(400).json({ message: 'Phone and OTP required' })
  }
 
  try {
    // Get OTP from database
    const { data, error } = await supabase
      .from('otp_store')
      .select('*')
      .eq('phone', phone)
      .single()
 
    if (error || !data) {
      return res.status(400).json({ message: 'OTP not found. Please request a new OTP.' })
    }
 
    // Check expiry
    if (new Date() > new Date(data.expiry)) {
      await supabase.from('otp_store').delete().eq('phone', phone)
      return res.status(400).json({ message: 'OTP expired. Please request a new OTP.' })
    }
 
    // Check OTP
    if (data.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' })
    }
 
    // OTP correct — delete it
    await supabase.from('otp_store').delete().eq('phone', phone)
 
    // Generate JWT
    const token = jwt.sign(
      { phone: phone },
      JWT_SECRET,
      { expiresIn: '30d' }
    )
 
    // Check if farmer exists
    const { data: farmer } = await supabase
      .from('farmers')
      .select('*')
      .eq('phone', phone)
      .single()
 
    return res.status(200).json({
      message: 'OTP verified successfully',
      token: token,
      farmer: farmer || null
    })
 
  } catch (err) {
    console.log('Verify OTP error:', err.message)
    return res.status(500).json({ message: 'Server error' })
  }
})
 
// ── PING (keep server alive) ──
router.get('/ping', (req, res) => {
  res.status(200).json({ status: 'alive', time: new Date().toISOString() })
})
 
module.exports = router