// ══════════════════════════════════════
// backend/services/email.js
// Nodemailer Gmail OTP Service
// ══════════════════════════════════════

const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
})

async function sendOTPEmail(email, otp, name) {
  try {
    await transporter.sendMail({
      from: '"RytuAI 🌶️" <' + process.env.EMAIL_USER + '>',
      to: email,
      subject: 'RytuAI — Your Verification OTP | మీ OTP కోడ్',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:420px;
          margin:0 auto;padding:24px;background:#f5f5f5;
          border-radius:12px;">

          <div style="text-align:center;margin-bottom:24px;">
            <div style="font-size:56px;">🌶️</div>
            <div style="font-size:24px;font-weight:900;color:#1a2e1e;">
              RytuAI
            </div>
            <div style="font-size:13px;color:#888;margin-top:4px;">
              రైతు AI అప్లికేషన్ — Smart Farming AP
            </div>
          </div>

          <div style="background:white;border-radius:14px;
            padding:28px 24px;text-align:center;
            border:1.5px solid #e8e0d0;">

            <div style="font-size:15px;color:#333;
              font-weight:700;margin-bottom:4px;">
              నమస్కారం ${name} గారు 🙏
            </div>
            <div style="font-size:13px;color:#888;margin-bottom:20px;">
              Your RytuAI verification OTP is:
            </div>

            <div style="background:#e8f5ee;border-radius:12px;
              padding:20px;margin:16px 0;">
              <div style="font-size:52px;font-weight:900;
                color:#1a6e35;letter-spacing:12px;
                font-family:monospace;">
                ${otp}
              </div>
            </div>

            <div style="font-size:13px;color:#e74c3c;font-weight:700;">
              ⏱️ Valid for 10 minutes only
            </div>
            <div style="font-size:12px;color:#888;margin-top:4px;">
              10 నిమిషాల వరకు మాత్రమే చెల్లుతుంది
            </div>
          </div>

          <div style="background:white;border-radius:12px;
            padding:16px;margin-top:16px;
            border:1.5px solid #e8e0d0;">
            <div style="font-size:12px;font-weight:800;
              color:#1a2e1e;margin-bottom:10px;">
              How to use:
            </div>
            <div style="font-size:12px;color:#555;line-height:1.8;">
              1. Go back to RytuAI app<br>
              2. Enter the 6-digit OTP above<br>
              3. Your account will be activated instantly
            </div>
          </div>

          <div style="text-align:center;margin-top:20px;
            font-size:11px;color:#aaa;line-height:1.6;">
            Do not share this OTP with anyone.<br>
            మీ OTP ని ఎవరికీ చెప్పకండి.<br><br>
            <strong style="color:#1a6e35;">rytuai.in</strong>
          </div>

        </div>
      `
    })
    console.log('OTP email sent to:', email)
    return true
  } catch(err) {
    console.log('Email error:', err.message)
    return false
  }
}

module.exports = { sendOTPEmail }