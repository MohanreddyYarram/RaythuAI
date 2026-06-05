// ══════════════════════════════════════
// backend/routes/auth.js — UPDATED
// Phone + Password authentication
// ══════════════════════════════════════

const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const supabase = require('../services/supabase')

const JWT_SECRET = process.env.JWT_SECRET || 'rytuai2024secret'
const SALT_ROUNDS = 10

function sanitizePhone(phone) {
  return phone ? phone.replace(/[^0-9]/g, '').substring(0, 10) : ''
}

function sanitizeText(text) {
  return text ? text.replace(/<[^>]*>/g, '').trim().substring(0, 500) : ''
}



// ── REGISTER ──
router.post('/register', async (req, res) => {
  const phone = sanitizePhone(req.body.phone)
  const name = sanitizeText(req.body.name)
  const village = sanitizeText(req.body.village)
  const district = sanitizeText(req.body.district)
  const crop_type = sanitizeText(req.body.crop_type)
  const {  password,land_acres, sowing_date } = req.body
  const passwordError = validatePassword(password)
  if (!phone || phone.length !== 10) {
    return res.status(400).json({ message: 'Valid 10-digit phone number required' })
  }
  if (passwordError){
   return res.status(400).json({message:passwordError})
  }
  if (!name || !village || !district) {
    return res.status(400).json({ message: 'Name, village and district are required' })
  }

  try {
    // Check if farmer already exists
    const { data: existing } = await supabase
      .from('farmers')
      .select('phone')
      .eq('phone', phone)
      .single()

    if (existing) {
      return res.status(400).json({ message: 'Phone number already registered. Please login.' })
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS)

    // Create farmer
    const { data, error } = await supabase
      .from('farmers')
      .insert({
        phone, name, village, district,
        land_acres: parseFloat(land_acres) || 0,
        crop_type, sowing_date,
        password_hash,
        is_approved:false
      })
      .select()

    if (error) return res.status(400).json({ message: error.message })

    // Generate token
    const token = jwt.sign({ phone }, JWT_SECRET, { expiresIn: '30d' })
    
    var farmerData = data[0]
    delete farmerData.password_hash
    res.status(201).json({
      message: 'Registration successful! Your account is oending approval. we will contact you within 24 hours.',
      pending: true,
      
    })
  } catch(err) {
    console.log('Register error:', err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

// ── LOGIN ──
router.post('/login', async (req, res) => {
  const phone = sanitizePhone(req.body.phone)
  const {  password } = req.body

  if (!phone || phone.length !== 10) {
    return res.status(400).json({ message: 'Valid 10-digit phone number required' })
  }
  if (!password) {
    return res.status(400).json({ message: 'Password required' })
  }

  try {
    // Find farmer
    const { data: farmer, error } = await supabase
      .from('farmers')
      .select('phone,name,village,district,land_acres,crop_type,sowing_date,password_hash')
      .eq('phone', phone)
      .single()

    if (error || !farmer) {
      return res.status(400).json({ message: 'Phone number not registered. Please sign up.' })
    }

    // Check if farmer has password
    if (!farmer.password_hash) {
      return res.status(400).json({ message: 'Please set up your password first.' })
    }

    // Verify password
    const isValid = await bcrypt.compare(password, farmer.password_hash)
    if (!isValid) {
      return res.status(400).json({ message: 'Incorrect password. Please try again.' })
    }
    // After bcrypt.compare succeeds
   if (!farmer.is_approved) {
    return res.status(403).json({
    message: 'Your account is pending approval. We will call you within 24 hours.',
    pending: true
     })
    }

    // Generate token
    const token = jwt.sign({ phone }, JWT_SECRET, { expiresIn: '30d' })

    // Remove password_hash before sending
    delete farmer.password_hash

    res.status(200).json({
      message: 'Login successful!',
      token,
      farmer
    })
  } catch(err) {
    console.log('Login error:', err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

// ── FORGOT PASSWORD — Send OTP ──
router.post('/forgot-password', async (req, res) => {
  const { phone } = req.body
  if (!phone || phone.length !== 10) {
    return res.status(400).json({ message: 'Valid phone number required' })
  }

  try {
    const { data: farmer } = await supabase
      .from('farmers')
      .select('phone')
      .eq('phone', phone)
      .single()

    if (!farmer) {
      return res.status(400).json({ message: 'Phone number not registered' })
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    console.log('Reset OTP for', phone, ':', otp)

    await supabase.from('otp_store').delete().eq('phone', phone)
    await supabase.from('otp_store').insert({
      phone,
      otp,
      expiry: new Date(Date.now() + 5 * 60 * 1000).toISOString()
    })

    res.status(200).json({
      message: 'OTP sent. Check Railway logs for OTP during testing.',
      ...(process.env.NODE_ENV !== 'production' && { debug_otp: otp })
    })
  } catch(err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// ── RESET PASSWORD ──
router.post('/reset-password', async (req, res) => {
  const { phone, otp, new_password } = req.body
  const passwordError=validatePassword(new_password)
  if (!phone || !otp || !new_password) {
    return res.status(400).json({ message: 'Phone, OTP and new password required' })
  }
  if (passwordError) {
    return res.status(400).json({ message: passwordError })
  }

  try {
    // Verify OTP
    const { data: otpData } = await supabase
      .from('otp_store')
      .select('*')
      .eq('phone', phone)
      .single()

    if (!otpData || otpData.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' })
    }
    if (new Date() > new Date(otpData.expiry)) {
      return res.status(400).json({ message: 'OTP expired' })
    }

    // Hash new password
    const password_hash = await bcrypt.hash(new_password, SALT_ROUNDS)

    // Update password
    await supabase.from('farmers').update({ password_hash }).eq('phone', phone)
    await supabase.from('otp_store').delete().eq('phone', phone)

    res.status(200).json({ message: 'Password reset successful! Please login.' })
  } catch(err) {
    res.status(500).json({ message: 'Server error' })
  }
})

 function validatePassword(password){
  if (!password || password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' })

  }
  if(!/[0-9]/.test(password)){
    return res.status(400).json({message:'Password must contain at least one number'})
  }
  if(!/[A-Z]/.test(password)){
    return 'Password must contain at least one capital letter'
  }
  if(!/[!@#$%^&*]/.test(password)){
    return 'Password must contain at least one special character (!@#$%^&*)'
  }
  return null
 }

// ── PING ──
router.get('/ping', (req, res) => {
  res.status(200).json({ status: 'alive', time: new Date().toISOString() })
})


module.exports = router