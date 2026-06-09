const express = require('express')
const router = express.Router()
const supabase = require('../services/supabase')

// ══════════════════════════════════════
// GET all activities for a farmer
// Optional ?field_id=2 to filter by field
// ══════════════════════════════════════
router.get('/:phone', async (req, res) => {
  const { phone } = req.params
  const { field_id } = req.query  // ← get field_id from query string

  try {
    let query = supabase
      .from('activities')
      .select('*')
      .eq('farmer_id', phone)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    // Filter by field if provided
    if (field_id) {
      query = query.eq('field_id', parseInt(field_id))
    }

    const { data, error } = await query

    if (error) {
      return res.status(400).json({ message: error.message })
    }
    res.status(200).json({ activities: data })
  } catch(err) {
    res.status(500).json({ message: err.message })
  }
})

// ══════════════════════════════════════
// POST add new activity
// ══════════════════════════════════════
router.post('/', async (req, res) => {
  const {
    farmer_id, date, type,
    title, description,
    cost, quantity, unit,
    source, field_id  // ← added field_id
  } = req.body

  if (!farmer_id || !type || !title) {
    return res.status(400).json({
      message: 'farmer_id, type and title are required'
    })
  }

  try {
    const { data, error } = await supabase
      .from('activities')
      .insert({
        farmer_id,
        date: date || new Date().toISOString().split('T')[0],
        type,
        title,
        description,
        cost: parseFloat(cost) || 0,
        quantity,
        unit,
        source: source || 'manual',
        field_id: field_id ? parseInt(field_id) : null  // ← save field_id
      })
      .select()

    if (error) {
      return res.status(400).json({ message: error.message })
    }
    res.status(201).json({ activity: data[0] })
  } catch(err) {
    res.status(500).json({ message: err.message })
  }
})

// ══════════════════════════════════════
// PUT update existing activity
// ══════════════════════════════════════
router.put('/:id', async (req, res) => {
  const { id } = req.params
  const {
    date, type, title,
    description, cost,
    quantity, unit, field_id  // ← added field_id
  } = req.body

  if (!type || !title) {
    return res.status(400).json({
      message: 'Type and title are required'
    })
  }

  try {
    const { data, error } = await supabase
      .from('activities')
      .update({
        date,
        type,
        title,
        description,
        cost: parseFloat(cost) || 0,
        quantity,
        unit,
        field_id: field_id ? parseInt(field_id) : null  // ← update field_id
      })
      .eq('id', id)
      .select()

    if (error) {
      return res.status(400).json({ message: error.message })
    }
    if (!data || data.length === 0) {
      return res.status(404).json({ message: 'Activity not found' })
    }
    res.status(200).json({
      message: 'Activity updated',
      activity: data[0]
    })
  } catch(err) {
    res.status(500).json({ message: err.message })
  }
})

// ══════════════════════════════════════
// DELETE activity
// ══════════════════════════════════════
router.delete('/:id', async (req, res) => {
  const { id } = req.params
  try {
    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', id)

    if (error) {
      return res.status(400).json({ message: error.message })
    }
    res.status(200).json({ message: 'Activity deleted' })
  } catch(err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router