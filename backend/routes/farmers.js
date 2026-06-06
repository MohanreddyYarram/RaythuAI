// Handles Farmers related API routes
const express = require('express')
const router = express.Router()
const supabase = require('../services/supabase')

// ══════════════════════════════════════
// IMPORTANT: /pending and /approve MUST
// come BEFORE /:phone route
// Otherwise Express treats "pending" and
// "approve" as phone number params
// ══════════════════════════════════════

// GET all farmers
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('farmers')
      .select('*')

    if (error) {
      return res.status(400).json({
        message: 'Error fetching farmers',
        error: error.message
      })
    }

    res.status(200).json({
      message: 'Farmers fetched successfully',
      count: data.length,
      farmers: data
    })
  } catch(err) {
    res.status(500).json({
      message: 'Server error',
      error: err.message
    })
  }
})

// ── GET PENDING FARMERS ──
// Must be BEFORE /:phone
router.get('/pending', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('farmers')
      .select('phone, name, village, district, land_acres, crop_type, created_at, is_approved')
      .order('created_at', { ascending: false })

    if (error) return res.status(400).json({ message: error.message })

    res.status(200).json({ farmers: data })
  } catch(err) {
    res.status(500).json({ message: err.message })
  }
})

// ── APPROVE OR REJECT FARMER ──
// Must be BEFORE /:phone
router.put('/approve/:phone', async (req, res) => {
  const { phone } = req.params
  const { is_approved } = req.body

  try {
    const { data, error } = await supabase
      .from('farmers')
      .update({ is_approved })
      .eq('phone', phone)
      .select()

    if (error) return res.status(400).json({ message: error.message })

    res.status(200).json({
      message: is_approved ? 'Farmer approved!' : 'Farmer rejected',
      farmer: data[0]
    })
  } catch(err) {
    res.status(500).json({ message: err.message })
  }
})

// ── GET FARMER BY PHONE ──
// Must be AFTER /pending and /approve
router.get('/:phone', async (req, res) => {
  try {
    const { phone } = req.params

    const { data, error } = await supabase
      .from('farmers')
      .select('*')
      .eq('phone', phone)
      .single()

    if (error) {
      return res.status(404).json({
        message: 'Farmer not found',
        error: error.message
      })
    }

    res.status(200).json({
      message: 'Farmer Found',
      farmer: data
    })
  } catch(err) {
    res.status(500).json({
      message: 'Server error',
      error: err.message
    })
  }
})

// ── CREATE FARMER ──
router.post('/', async (req, res) => {
  try {
    const { name, phone, village, district, land_acres, crop_type } = req.body

    if (!name || !phone || !village || !district) {
      return res.status(400).json({
        message: 'Please provide name, phone, village and district'
      })
    }

    if (phone.length !== 10) {
      return res.status(400).json({
        message: 'Please enter a valid 10-digit phone number'
      })
    }

    if (name.length < 2 || name.length > 100) {
      return res.status(400).json({
        message: 'Name must be between 2 and 100 characters'
      })
    }

    // Check if farmer already exists
    const { data: existing } = await supabase
      .from('farmers')
      .select('phone')
      .eq('phone', phone)
      .single()

    if (existing) {
      return res.status(400).json({
        message: 'Farmer with this phone number already exists'
      })
    }

    const { data, error } = await supabase
      .from('farmers')
      .insert([{ name, phone, village, district, land_acres, crop_type }])
      .select()

    if (error) {
      return res.status(400).json({
        message: 'Error creating farmer',
        error: error.message
      })
    }

    res.status(201).json({
      message: 'Farmer created successfully',
      farmer: data[0]
    })
  } catch(err) {
    res.status(500).json({
      message: 'Server error',
      error: err.message
    })
  }
})

// ── UPDATE FARMER ──
// Must be AFTER /approve/:phone
router.put('/:phone', async (req, res) => {
  const { phone } = req.params
  const { name, village, district, land_acres, crop_type, sowing_date } = req.body

  try {
    console.log('Updating farmer:', phone, { name, village })

    const { data, error } = await supabase
      .from('farmers')
      .update({
        name,
        village,
        district,
        land_acres,
        crop_type,
        sowing_date: sowing_date || null
      })
      .eq('phone', phone)
      .select()

    if (error) {
      return res.status(400).json({
        message: 'Error updating farmer',
        error: error.message
      })
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      farmer: data[0]
    })
  } catch(err) {
    res.status(500).json({
      message: 'Server error',
      error: err.message
    })
  }
})

module.exports = router