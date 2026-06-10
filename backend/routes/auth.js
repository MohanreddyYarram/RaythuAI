// ══════════════════════════════════════
// backend/routes/auth.js — UPDATED
// Phone + Password authentication
// ══════════════════════════════════════

const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const supabase = require('../services/supabase')
const { sendOTPEmail } = require('../services/email')

const JWT_SECRET = process.env.JWT_SECRET || 'rytuai2024secret'
const SALT_ROUNDS = 10

function sanitizePhone(phone) {
  return phone ? phone.replace(/[^0-9]/g, '').substring(0, 10) : ''
}

function sanitizeText(text) {
  return text ? text.replace(/<[^>]*>/g, '').trim().substring(0, 500) : ''
}



// ── REGISTER ──
const nodemailer = require('nodemailer')

// ── EMAIL TRANSPORTER ──
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,  // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
})

// ── SEND OTP EMAIL ──
async function sendOTPEmail(email, otp, name) {
  try {
    await transporter.sendMail({
      from: '"RytuAI 🌶️" <' + process.env.EMAIL_USER + '>',
      to: email,
      subject: 'RytuAI — Your Verification OTP',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:400px;
          margin:0 auto;padding:24px;background:#f5f5f5;border-radius:12px;">
          <div style="text-align:center;margin-bottom:20px;">
            <div style="font-size:48px;">🌶️</div>
            <div style="font-size:22px;font-weight:900;color:#1a2e1e;">RytuAI</div>
            <div style="font-size:13px;color:#888;">రైతు AI అప్లికేషన్</div>
          </div>
          <div style="background:white;border-radius:12px;padding:20px;
            text-align:center;border:1.5px solid #e8e0d0;">
            <div style="font-size:14px;color:#555;margin-bottom:8px;">
              నమస్కారం ${name} గారు,
            </div>
            <div style="font-size:13px;color:#555;margin-bottom:16px;">
              Your RytuAI verification OTP:
            </div>
            <div style="font-size:48px;font-weight:900;color:#1a6e35;
              letter-spacing:10px;margin:12px 0;">
              ${otp}
            </div>
            <div style="font-size:12px;color:#888;">
              Valid for 10 minutes only<br>
              10 నిమిషాల వరకు మాత్రమే చెల్లుతుంది
            </div>
          </div>
          <div style="text-align:center;margin-top:16px;
            font-size:11px;color:#aaa;">
            Do not share this OTP with anyone.<br>
            మీ OTP ని ఎవరికీ చెప్పకండి.
          </div>
        </div>
      `
    })
    return true
  } catch(err) {
    console.log('Email error:', err.message)
    return false
  }
}

// ══════════════════════════════════════
// STEP 1 — REGISTER (Save details + Send OTP)
// ══════════════════════════════════════
router.post('/register', async (req, res) => {
  const {
    phone, name, village, district,
    land_acres, crop_type, sowing_date,
    password, email
  } = req.body

  // Validate required fields
  if (!phone || !name || !village || !district) {
    return res.status(400).json({
      message: 'Please fill all required fields'
    })
  }

  if (!email || !email.includes('@')) {
    return res.status(400).json({
      message: 'Please enter valid Gmail address'
    })
  }

  if (!password || password.length < 8) {
    return res.status(400).json({
      message: 'Password must be at least 8 characters'
    })
  }

  try {
    // Check phone already exists
    const { data: existingPhone } = await supabase
      .from('farmers')
      .select('phone')
      .eq('phone', phone)
      .maybeSingle()

    if (existingPhone) {
      return res.status(400).json({
        message: 'This phone number is already registered'
      })
    }

    // Check email already exists
    const { data: existingEmail } = await supabase
      .from('farmers')
      .select('email')
      .eq('email', email)
      .maybeSingle()

    if (existingEmail) {
      return res.status(400).json({
        message: 'This email is already registered'
      })
    }

    // Hash password
    const bcrypt = require('bcrypt')
    const password_hash = await bcrypt.hash(password, 10)

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    // Save farmer with email_verified = false
    const { data: farmer, error } = await supabase
      .from('farmers')
      .insert({
        phone, name, village, district,
        land_acres: parseFloat(land_acres) || 0,
        crop_type, sowing_date: sowing_date || null,
        password_hash,
        email,
        email_verified: false,
        is_approved: false  // will be set true after OTP verify
      })
      .select()
      .single()

    if (error) {
      return res.status(400).json({ message: error.message })
    }

    // Save OTP
    await supabase.from('otp_store').upsert({
      phone,
      otp,
      expires_at: expiresAt.toISOString(),
      type: 'registration'
    })

    // Send OTP email
    const sent = await sendOTPEmail(email, otp, name)

    if (!sent) {
      return res.status(500).json({
        message: 'Could not send OTP email. Check your Gmail address.'
      })
    }

    res.status(200).json({
      message: 'OTP sent to ' + email,
      phone: phone,
      requires_otp: true
    })

  } catch(err) {
    console.log('Register error:', err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

// ══════════════════════════════════════
// STEP 2 — VERIFY OTP (Auto approve)
// ══════════════════════════════════════
router.post('/verify-registration-otp', async (req, res) => {
  const { phone, otp } = req.body

  if (!phone || !otp) {
    return res.status(400).json({ message: 'Phone and OTP required' })
  }

  try {
    // Get OTP record
    const { data: otpRecord } = await supabase
      .from('otp_store')
      .select('*')
      .eq('phone', phone)
      .eq('type', 'registration')
      .maybeSingle()

    if (!otpRecord) {
      return res.status(400).json({
        message: 'OTP not found. Please register again.'
      })
    }

    // Check expiry
    if (new Date() > new Date(otpRecord.expires_at)) {
      return res.status(400).json({
        message: 'OTP expired. Please register again.'
      })
    }

    // Check OTP
    if (otpRecord.otp !== otp.toString()) {
      return res.status(400).json({
        message: 'Invalid OTP. Please try again.'
      })
    }

    // Auto approve farmer
    const { data: farmer, error } = await supabase
      .from('farmers')
      .update({
        is_approved: true,
        email_verified: true
      })
      .eq('phone', phone)
      .select()
      .single()

    if (error) {
      return res.status(400).json({ message: error.message })
    }

    // Delete used OTP
    await supabase
      .from('otp_store')
      .delete()
      .eq('phone', phone)
      .eq('type', 'registration')

    // Generate login token
    const token = jwt.sign(
      { phone },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    )

    res.status(200).json({
      message: 'Account verified successfully!',
      token,
      farmer
    })

  } catch(err) {
    console.log('OTP verify error:', err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

// ══════════════════════════════════════
// LOGIN WITH EMAIL OTP
// ══════════════════════════════════════
router.post('/send-login-otp', async (req, res) => {
  const { email } = req.body

  if (!email) {
    return res.status(400).json({ message: 'Email required' })
  }

  try {
    // Find farmer by email
    const { data: farmer } = await supabase
      .from('farmers')
      .select('name, phone, is_approved, email_verified')
      .eq('email', email)
      .maybeSingle()

    if (!farmer) {
      return res.status(404).json({
        message: 'No account found with this email'
      })
    }

    if (!farmer.is_approved) {
      return res.status(403).json({
        message: 'Account not verified yet'
      })
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    // Save OTP
    await supabase.from('otp_store').upsert({
      phone: farmer.phone,
      otp,
      expires_at: expiresAt.toISOString(),
      type: 'login'
    })

    // Send OTP
    const sent = await sendOTPEmail(email, otp, farmer.name)

    if (!sent) {
      return res.status(500).json({
        message: 'Could not send OTP email'
      })
    }

    res.status(200).json({
      message: 'OTP sent to ' + email,
      phone: farmer.phone
    })

  } catch(err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// ══════════════════════════════════════
// VERIFY LOGIN OTP
// ══════════════════════════════════════
router.post('/verify-login-otp', async (req, res) => {
  const { phone, otp } = req.body

  try {
    // Get OTP
    const { data: otpRecord } = await supabase
      .from('otp_store')
      .select('*')
      .eq('phone', phone)
      .eq('type', 'login')
      .maybeSingle()

    if (!otpRecord) {
      return res.status(400).json({
        message: 'OTP not found. Please request again.'
      })
    }

    if (new Date() > new Date(otpRecord.expires_at)) {
      return res.status(400).json({
        message: 'OTP expired. Please request again.'
      })
    }

    if (otpRecord.otp !== otp.toString()) {
      return res.status(400).json({
        message: 'Invalid OTP. Please try again.'
      })
    }

    // Get farmer
    const { data: farmer } = await supabase
      .from('farmers')
      .select('*')
      .eq('phone', phone)
      .maybeSingle()

    if (!farmer) {
      return res.status(404).json({ message: 'Farmer not found' })
    }

    // Delete OTP
    await supabase
      .from('otp_store')
      .delete()
      .eq('phone', phone)
      .eq('type', 'login')

    // Generate token
    const token = jwt.sign(
      { phone },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    )

    res.status(200).json({ token, farmer })

  } catch(err) {
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
      .select('phone,name,village,district,land_acres,crop_type,sowing_date,password_hash,is_approved')
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