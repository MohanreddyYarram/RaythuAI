// ══════════════════════════════════════
// backend/routes/detection.js
// Replace your existing detection.js
// ══════════════════════════════════════

const jwt = require('jsonwebtoken')
const express = require('express')
const router = express.Router()
const multer = require('multer')
const claude = require('../services/claude')
const supabase = require('../services/supabase')

const upload = multer({ storage: multer.memoryStorage() })

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
  } catch (err) {
    return res.status(401).json({ message: 'Session expired. Please login again' })
  }

  try {
    if (!req.files || req.files.length < 1) {
      return res.status(400).json({ message: 'Please upload at least one image' })
    }

    // Build image blocks for Claude
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

    // Auto save scan to database
    try {
      const { error: scanError } = await supabase.from('scans').insert({
        farmer_id: farmerPhone,
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
    } catch (scanErr) {
      console.log('Scan save exception:', scanErr.message)
    }

    res.status(200).json({
      message: 'Detection Complete',
      result: result
    })

  } catch (err) {
    console.log('Detection ERROR:', err.message)
    res.status(500).json({
      message: 'Detection failed',
      error: err.message
    })
  }
})

// Search products by pesticide name across all shops
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

    // Match products to pesticide names
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
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET scan history
router.get('/history/:phone', async (req, res) => {
  const { phone } = req.params
  try {
    const { data, error } = await supabase
      .from('scans')
      .select('*')
      .eq('farmer_id', phone)
      .order('created_at', { ascending: false })

    if (error) return res.status(400).json({ message: error.message })
    res.status(200).json({ scans: data })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router