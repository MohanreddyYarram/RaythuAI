const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

async function sendOTPEmail(email, otp, name) {
  try {
    await sgMail.send({
      to: email,
      from: {
        email: process.env.EMAIL_FROM,
        name: 'RytuAI'
      },
      subject: 'RytuAI — Your OTP Code',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:400px;
          margin:0 auto;padding:24px;background:#f5f5f5;
          border-radius:12px;text-align:center;">
          <div style="font-size:48px;">🌶️</div>
          <div style="font-size:22px;font-weight:900;color:#1a2e1e;">
            RytuAI
          </div>
          <div style="font-size:13px;color:#888;margin-bottom:24px;">
            రైతు AI అప్లికేషన్
          </div>
          <div style="background:white;border-radius:12px;padding:24px;
            border:1.5px solid #e8e0d0;">
            <div style="font-size:14px;color:#555;margin-bottom:16px;">
              నమస్కారం ${name} గారు 🙏<br>
              Your verification OTP:
            </div>
            <div style="font-size:52px;font-weight:900;color:#1a6e35;
              letter-spacing:12px;font-family:monospace;
              background:#e8f5ee;padding:16px;border-radius:10px;">
              ${otp}
            </div>
            <div style="font-size:12px;color:#e74c3c;
              font-weight:700;margin-top:16px;">
              ⏱️ Valid for 10 minutes only
            </div>
            <div style="font-size:11px;color:#888;margin-top:4px;">
              10 నిమిషాల వరకు మాత్రమే చెల్లుతుంది
            </div>
          </div>
          <div style="font-size:11px;color:#aaa;margin-top:16px;">
            Do not share OTP with anyone.<br>
            మీ OTP ని ఎవరికీ చెప్పకండి.<br>
            <strong style="color:#1a6e35;">rytuai.in</strong>
          </div>
        </div>
      `
    })
    console.log('OTP sent to:', email)
    return true
  } catch(err) {
    console.log('SendGrid error:', err.message)
    if (err.response) {
      console.log('SendGrid body:', JSON.stringify(err.response.body))
    }
    return false
  }
}

module.exports = { sendOTPEmail }