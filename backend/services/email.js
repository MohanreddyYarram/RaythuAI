
const nodemailer = require('nodemailer')

// Create transporter using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,         // your gmail address
    pass: process.env.GMAIL_APP_PASSWORD  // 16 digit app password
  }
})

// Send OTP Email
async function sendOTPEmail(email, otp, name) {
  try {
    const mailOptions = {
      from: `RytuAI <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'RytuAI - Your OTP Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          
          <h2 style="color: #2d7a2d;">RytuAI - రైతు AI</h2>
          
          <p>Hello ${name},</p>
          
          <p>Your OTP verification code is:</p>
          
          <div style="
            background: #f0f7f0;
            border: 2px solid #2d7a2d;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
          ">
            <h1 style="
              color: #2d7a2d;
              font-size: 40px;
              letter-spacing: 10px;
              margin: 0;
            ">${otp}</h1>
          </div>
          
          <p>This OTP is valid for <strong>10 minutes.</strong></p>
          <p>Do not share this OTP with anyone.</p>
          
          <hr/>
          
          <p style="color: #666; font-size: 13px;">
            మీ OTP కోడ్: <strong>${otp}</strong><br/>
            ఈ కోడ్ 10 నిమిషాలు మాత్రమే చెల్లుతుంది.<br/>
            దీన్ని ఎవరితోనూ పంచుకోవద్దు.
          </p>
          
        </div>
      `
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('Email sent successfully:', result.messageId)
    return true

  } catch (error) {
    console.log('Email error:', error.message)
    return false
  }
}

module.exports = { sendOTPEmail }