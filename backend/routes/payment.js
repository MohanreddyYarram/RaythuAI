

const express = require('express')
const router = express.Router()
const Razorpay = require('razorpay') 
const crypto = require('crypto')
const supabase = require('../services/supabase')
const authenticateToken = require('../middleware/auth')

const razorpay = new Razorpay({
    key_id : process.env.RAZORPAY_KEY_ID,
    key_secret : process.env.RAZORPAY_KEY_SECRET
})

// Ordere Creation

router.post('/create-order',authenticateToken,async(req,res)=>{
    const {amount,farmer_id,store_id,items,delivery_address,notes=''} = req.body

    if(!amount || amount <= 0){
        return res.status(400).json({message:'Invalid amount'})
    }
    try{
        const razorpayOrder = await razorpay.orders.create({
            amount:Math.round(amount*100),
            currency:'INR',
            receipt :'rytuai_' + Date.now(),
            notes:{
                farmer_id:farmer_id || '',
                store_id: String(store_id || '')
            }
        })

        //Save pending order to database
        const {data:order,error} = await supabase
            .from('orders')
            .insert({
                farmer_id ,
                farmer_phone:farmer_id,
                store_id,
                items:JSON.stringify(items),
                total_amount:amount,
                delivery_address,
                notes,
                status:'payment_pending',
                razorpay_order_id:razorpayOrder.id
        })
        .select()
        if(error){
            console.log('Order DB error:',error.message)
            return res.status(400).json({message:error.message})
        }
        res.status(200).json({
            razorpay_order_id:razorpayOrder.id,
            amount:razorpayOrder.amount,
            currency:razorpayOrder.currency,
            order_id:order[0].id,
            key_id:process.env.RAZORPAY_KEY_ID
        })
    }catch(err){
        console.log('Creat order error:',err.message)
        res.status(500).json({message:'Payment initialization failed'})
    }
})

//Payment Verification
router.post('/verify',authenticateToken,async(req,res)=>{
    const{
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        order_id
    }=req.body

    try{
        //Verify signature

        const body = razorpay_order_id + '|' +razorpay_payment_id
        const expectedSignature = crypto
            .createHmac('sha256',process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest('hex')
        
        if(expectedSignature !== razorpay_signature){
            return res.status(400).json({message:'Payment verification failed'})
        }

        //Updating order status to confirmed

        const{data,error} = await supabase
            .from('orders')
            .update({
                status:'confirmed',
                razorpay_payment_id,
                razorpay_signature
            })
            .eq('id',order_id)
            .select()

        if(error) return res.status(400).json({message:error.message})
        
            res.status(200).json({
                success:true,
                message:'Payment successful!',
                order:data[0]
            })

    }catch(err){
        console.log('Verify Payment Error', err.message)
        res.status(500).json({message:'Payment verification error'})
    }
})

//── PAYMENT FAILED ──
router.post('/failed', authenticateToken, async (req, res) => {
  const { order_id } = req.body
  try {
    await supabase
      .from('orders')
      .update({ status: 'payment_failed' })
      .eq('id', order_id)
    res.status(200).json({ message: 'Order marked as failed' })
  } catch(err) {
    res.status(500).json({ message: err.message })
  }
})
// ── CREATE SUBSCRIPTION ORDER ──
router.post('/subscribe', async (req, res) => {
  const { farmer_id, plan } = req.body

  const plans = {
    pay_per_scan: { amount: 29, scans: 1, label: '1 Extra Scan' },
    scan_pack_5: { amount: 99, scans: 5, label: '5 Scan Pack' },
    unlimited: { amount: 99, scans: 999, label: 'Unlimited Monthly' }
  }

  const selectedPlan = plans[plan]
  if (!selectedPlan) {
    return res.status(400).json({ message: 'Invalid plan' })
  }

  try {
    const razorpayOrder = await razorpay.orders.create({
      amount: selectedPlan.amount * 100,
      currency: 'INR',
      receipt: 'scan_' + Date.now(),
      notes: { farmer_id, plan }
    })

    res.status(200).json({
      razorpay_order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: 'INR',
      plan,
      label: selectedPlan.label,
      key_id: process.env.RAZORPAY_KEY_ID
    })
  } catch(err) {
    res.status(500).json({ message: 'Payment init failed' })
  }
})

// ── VERIFY SUBSCRIPTION PAYMENT ──
router.post('/subscribe/verify', async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    farmer_id,
    plan
  } = req.body

  // Verify signature
  const body = razorpay_order_id + '|' + razorpay_payment_id
  const expectedSignature = require('crypto')
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex')

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ message: 'Payment verification failed' })
  }

  const plans = {
    pay_per_scan: { scans: 1, months: 0 },
    scan_pack_5: { scans: 5, months: 0 },
    unlimited: { scans: 999, months: 1 }
  }

  const selectedPlan = plans[plan]

  // Set validity
  var validUntil = null
  if (selectedPlan.months > 0) {
    validUntil = new Date()
    validUntil.setMonth(validUntil.getMonth() + selectedPlan.months)
  }

  // Save subscription
  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
      farmer_id,
      plan,
      scans_purchased: selectedPlan.scans,
      scans_used: 0,
      valid_until: validUntil,
      razorpay_payment_id
    })
    .select()

  if (error) return res.status(400).json({ message: error.message })

  res.status(200).json({
    success: true,
    message: 'Subscription activated!',
    subscription: data[0]
  })
})

module.exports = router