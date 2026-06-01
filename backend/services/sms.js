
const axios = require('axios')

async function sendOTPSms(phone,otp){
    const provider = process.env.SMS_PROVIDER || 'msg91'
    const message = 'Your RytuAI OTP is ' + otp + '. Valid for 5 minutes. Do not share with anyone'

    console.log('Sending OTP via: ',provider,'to:',phone)

    try{
        if (provider === 'msg91'){
            return await sendViaMSG91(phone,otp)
        }else if(provider === 'fast2sms'){
            return await sendViaFast2SMS(phone,otp,message)
        }else if (provider === 'twilio'){
            return await sendViaTwilio(phone,message)
        }else{
            console.log('No SMS provider configured - OTP:',otp)
            return {sucess:false,message:'No SMS provider configured'}
        }
    }catch(err){
        console.log('SMS send error:',err.message)
        return {sucess:false,message:err.message}
    }
}
//-MSG91---
async function sendViaMSG91(phone,otp){
    const apiKey = process.env.MSG91_API_KEY
    const templatedId = process.env.MSG91_TEMPLATE_ID
    const senderId = process.env.MSG91_SENDER_ID || 'RYTUAI'

    if(!apiKey){
        console.log("MSG_API_KEY not set")
        return {success:false, message:'MSG91 not configured'}
    }

    const url = 'https://control.msg91.com/api/v5/otp'

    const payload = {
        template_id : templatedId,
        mobile:'91' + phone,
        authkey: apiKey,
        otp:otp
    }
    const response = await axios.post(url,payload,{
        headers:{'Content-Type':'application/json'}
    })

    console.log('MSG91 response:',response.data)

    if(response.data && response.data.type === 'success'){
        return {success:true}
    }else{
        return {sucess:false,message:JSON.stringify(response.data)}
    }
}
// ── Fast2SMS (backup) ──
async function sendViaFast2SMS(phone, otp, message) {
  const apiKey = process.env.FAST2SMS_KEY
 
  if (!apiKey) {
    return { success: false, message: 'FAST2SMS_KEY not set' }
  }
 
  const response = await axios({
    method: 'post',
    url: 'https://www.fast2sms.com/dev/bulkV2',
    headers: { authorization: apiKey },
    data: {
      variables_values: otp,
      route: 'otp',
      numbers: phone
    }
  })
 
  console.log('Fast2SMS response:', response.data)
 
  if (response.data && response.data.return === true) {
    return { success: true }
  } else {
    return { success: false, message: JSON.stringify(response.data) }
  }
}
 
// ── Twilio (backup) ──
async function sendViaTwilio(phone, message) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = process.env.TWILIO_PHONE_NUMBER
 
  if (!accountSid || !authToken) {
    return { success: false, message: 'Twilio not configured' }
  }
 
  const url = 'https://api.twilio.com/2010-04-01/Accounts/' + accountSid + '/Messages.json'
 
  const response = await axios.post(url,
    new URLSearchParams({
      To: '+91' + phone,
      From: fromNumber,
      Body: message
    }),
    {
      auth: { username: accountSid, password: authToken }
    }
  )
 
  console.log('Twilio response:', response.data.sid)
  return { success: true }
}
 
module.exports = { sendOTPSms }

