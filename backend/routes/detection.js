// ══════════════════════════════════════
// backend/routes/detection.js
// ══════════════════════════════════════

const jwt = require('jsonwebtoken')
const express = require('express')
const router = express.Router()
const multer = require('multer')
const claude = require('../services/claude')
const supabase = require('../services/supabase')

const upload = multer({ storage: multer.memoryStorage() })

function sanitizePhone(phone) {
  return phone ? phone.replace(/[^0-9]/g, '').substring(0, 10) : ''
}

// ══════════════════════════════════════
// POST /detect — AI Disease Detection
// ══════════════════════════════════════
router.post('/', upload.array('photos', 4), async (req, res) => {
  console.log('=== DETECT ROUTE HIT ===')

  // Check login
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer')) {
    return res.status(401).json({ message: 'Please login to use disease detection' })
  }

  const token = authHeader.split(' ')[1]
  let farmerPhone = null

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    farmerPhone = decoded.phone
  } catch(err) {
    return res.status(401).json({ message: 'Session expired. Please login again' })
  }

  try {
    // ── Check Monthly Scan Limit ──
    var startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { data: scanCount } = await supabase
      .from('scans')
      .select('id')
      .eq('farmer_id', farmerPhone)
      .gte('created_at', startOfMonth.toISOString())

    const freeScansUsed = scanCount ? scanCount.length : 0

    // BUG FIX 1: 'Plan' → 'plan' (lowercase)
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('farmer_id', farmerPhone)
      .eq('plan', 'unlimited')
      .gte('valid_until', new Date().toISOString())
      .maybeSingle() // BUG FIX 2: maybeSingle() instead of single() — no error if not found

    // BUG FIX 3: maybeSingle() for pay per scan too
    const { data: payPerScan } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('farmer_id', farmerPhone)
      .in('plan', ['pay_per_scan', 'scan_pack_5'])
      .gt('scans_purchased', 0)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    // Decision logic
    if (subscription) {
      console.log('Unlimited plan active for:', farmerPhone)
    } else if (payPerScan && payPerScan.scans_purchased > payPerScan.scans_used) {
      // Deduct one paid scan credit
      await supabase
        .from('subscriptions')
        .update({ scans_used: payPerScan.scans_used + 1 })
        .eq('id', payPerScan.id)
      console.log('Pay per scan credit used for:', farmerPhone)
    } else if (freeScansUsed >= 5) {
      // Limit reached — show upgrade UI
      return res.status(429).json({
        message: 'Monthly free scans used',
        limit: 5,
        used: freeScansUsed,
        upgrade: true,
        resets: 'Next month'
      })
    }

    // ── Check Images ──
    if (!req.files || req.files.length < 1) {
      return res.status(400).json({ message: 'Please upload at least one image' })
    }

    // ── Build Image Blocks for Claude ──
    const imageBlocks = req.files.map(file => ({
      type: 'image',
      source: {
        type: 'base64',
        media_type: file.mimetype,
        data: file.buffer.toString('base64')
      }
    }))

    console.log('Calling Claude with', imageBlocks.length, 'images...')
    const result = await claude.detectDisease(imageBlocks)
    console.log('Claude result:', result.disease)

    // ── Save Scan to Database ──
    try {
      const { error: scanError } = await supabase.from('scans').insert({
        farmer_id: farmerPhone,
        field_id:req.body.field_id ? parseInt(req.body.field_id) : null,
        disease: result.disease || 'Unknown',
        telugu_name: result.teluguName || '',
        confidence: result.confidence || '',
        severity: result.severity || '',
        spread: result.spread || '',
        treat_within: result.treatWithin || '',
        healthy: result.healthy || false,
        what_is_this: result.whatIsThis || '',
        what_is_this_telugu: result.whatIsThisTelugu || '',
        symptoms: result.symptomsFound || '',
        symptoms_telugu: result.symptomsFoundTelugu || '',
        prevention: result.prevention || '',
        prevention_telugu: result.preventionTelugu || '',
        telugu_summary: result.teluguSummary || '',
        pesticides: result.pesticides || [],
        images_count: req.files.length
      })

      if (scanError) {
        console.log('Scan save error:', scanError.message)
      } else {
        console.log('Scan saved for farmer:', farmerPhone)
      }
    } catch(scanErr) {
      console.log('Scan save exception:', scanErr.message)
    }

    res.status(200).json({
      message: 'Detection Complete',
      result: result
    })

  } catch(err) {
    console.log('Detection ERROR:', err.message)
    res.status(500).json({
      message: 'Detection failed',
      error: err.message
    })
  }
})

// ══════════════════════════════════════
// POST /detect/search-pesticides
// ══════════════════════════════════════
router.post('/search-pesticides', async (req, res) => {
  const { pesticide_names } = req.body
  if (!pesticide_names || !pesticide_names.length) {
    return res.status(400).json({ message: 'pesticide_names required' })
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, stores(id, name, address, phone, open_time, close_time)')
      .eq('is_available', true)

    if (error) return res.status(400).json({ message: error.message })

    var matched = {}

    pesticide_names.forEach(function(pestName) {
      var matches = data.filter(function(product) {
        var pName = product.name.toLowerCase()
        var searchName = pestName.toLowerCase()
        return pName.includes(searchName.split(' ')[0]) ||
               searchName.includes(pName.split(' ')[0]) ||
               pName.includes(searchName) ||
               searchName.includes(pName)
      })
      if (matches.length > 0) {
        matched[pestName] = matches
      }
    })

    res.status(200).json({ matched })
  } catch(err) {
    res.status(500).json({ message: err.message })
  }
})

// ══════════════════════════════════════
// GET /detect/history/:phone
// ══════════════════════════════════════
router.get('/history/:phone', async (req, res) => {
  const { phone } = req.params
  const {field_id} = req.query
  try {

    let query = supabase
      .from('scans')
      .select('*')
      .eq('farmer_id',phone)
      .order('created_at',{ascending:false})
    if(field_id){
      query = query.eq('field_id',parseInt(field_id))
    }
    const { data, error } = await query

    if (error) return res.status(400).json({ message: error.message })
    res.status(200).json({ scans: data })
  } catch(err) {
    res.status(500).json({ message: err.message })
  }
})

// ══════════════════════════════════════
// GET /detect/scan-count/:phone
// ══════════════════════════════════════
router.get('/scan-count/:phone', async (req, res) => {
  const { phone } = req.params
  try {
    var startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { data, error } = await supabase
      .from('scans')
      .select('id')
      .eq('farmer_id', phone)
      .gte('created_at', startOfMonth.toISOString())

    if (error) return res.status(400).json({ message: error.message })
    res.status(200).json({ count: data.length, limit: 5 })
  } catch(err) {
    res.status(500).json({ message: err.message })
  }
})

// BUG FIX 4: 'route' → 'router'
module.exports = router