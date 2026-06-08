const express = require('express')
const router = express.Router()
const supabase = require('../services/supabase')
const jwt = require('jsonwebtoken')

// Auth middleware
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'Login required' })
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch(e) {
    res.status(401).json({ message: 'Session expired' })
  }
}

// GET all fields for farmer
router.get('/:farmerId', auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('fields')
      .select('*')
      .eq('farmer_id', req.params.farmerId)
      .eq('is_active', true)
      .order('created_at', { ascending: true })

    if (error) return res.status(400).json({ message: error.message })
    res.status(200).json({ fields: data })
  } catch(err) {
    res.status(500).json({ message: err.message })
  }
})

// POST create new field
router.post('/', auth, async (req, res) => {
  const { farmer_id, field_name, crop_type, land_acres,
          village, district, sowing_date, soil_type, irrigation_type } = req.body

  if (!farmer_id || !field_name || !crop_type) {
    return res.status(400).json({ 
      message: 'Field name and crop type required' 
    })
  }

  try {
    const { data, error } = await supabase
      .from('fields')
      .insert({
        farmer_id, field_name, crop_type,
        land_acres: parseFloat(land_acres) || 0,
        village, district, sowing_date: sowing_date || null,
        soil_type, irrigation_type
      })
      .select()

    if (error) return res.status(400).json({ message: error.message })
    res.status(201).json({ field: data[0] })
  } catch(err) {
    res.status(500).json({ message: err.message })
  }
})

// PUT update field
router.put('/:id', auth, async (req, res) => {
  const { field_name, crop_type, land_acres,
          village, district, sowing_date, 
          soil_type, irrigation_type } = req.body
  try {
    const { data, error } = await supabase
      .from('fields')
      .update({
        field_name, crop_type,
        land_acres: parseFloat(land_acres) || 0,
        village, district,
        sowing_date: sowing_date || null,
        soil_type, irrigation_type
      })
      .eq('id', req.params.id)
      .select()

    if (error) return res.status(400).json({ message: error.message })
    res.status(200).json({ field: data[0] })
  } catch(err) {
    res.status(500).json({ message: err.message })
  }
})

// DELETE field (soft delete)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { error } = await supabase
      .from('fields')
      .update({ is_active: false })
      .eq('id', req.params.id)

    if (error) return res.status(400).json({ message: error.message })
    res.status(200).json({ message: 'Field removed' })
  } catch(err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router