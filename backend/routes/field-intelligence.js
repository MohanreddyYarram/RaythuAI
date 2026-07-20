

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

// ─────────────────────────────────────
// SPRAY INTERVAL RULES (days)
// Based on standard AP chilli farm practice
// ─────────────────────────────────────
const SPRAY_INTERVALS = {
  pesticide: 10,   // Insecticide / pesticide sprays
  fungicide: 7,    // Fungicide sprays
  fertilizer: 14,  // Foliar fertilizer
  irrigation: 3,   // Drip/flood irrigation check
  default: 10
}

const TYPE_LABEL_MAP = {
  pesticide: 'Pesticide Spray',
  fungicide: 'Fungicide Spray',
  fertilizer: 'Fertilizer Application',
  irrigation: 'Irrigation',
  spray: 'Spray',
  default: 'Activity'
}

function daysSince(dateString) {
  const activityDate = new Date(dateString)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  activityDate.setHours(0, 0, 0, 0)
  return Math.floor((today - activityDate) / (1000 * 60 * 60 * 24))
}

function getAlertLevel(daysSinceLast, interval) {
  const overdue = daysSinceLast - interval
  if (overdue >= 5) return 'critical'   // 5+ days overdue
  if (overdue >= 1) return 'warning'    // 1–4 days overdue
  if (daysSinceLast >= interval - 2) return 'due_soon'  // Due in 2 days
  return 'ok'
}

// ─────────────────────────────────────
// GET /field-intelligence/:farmerId
// Returns alerts + summary for all active fields
// ─────────────────────────────────────
router.get('/:farmerId', auth, async (req, res) => {
  const { farmerId } = req.params
  const { field_id } = req.query

  try {
    // Load fields
    let fieldQuery = supabase
      .from('fields')
      .select('*')
      .eq('farmer_id', farmerId)
      .eq('is_active', true)

    if (field_id) {
      fieldQuery = fieldQuery.eq('id', parseInt(field_id))
    }

    const { data: fields, error: fieldError } = await fieldQuery
    if (fieldError) return res.status(400).json({ message: fieldError.message })
    if (!fields || fields.length === 0) {
      return res.status(200).json({ alerts: [], summary: [], fields: [] })
    }

    const fieldIds = fields.map(f => f.id)

    // Load recent activities (last 60 days)
    const since60Days = new Date()
    since60Days.setDate(since60Days.getDate() - 60)

    const { data: activities, error: actError } = await supabase
      .from('activities')
      .select('*')
      .eq('farmer_id', farmerId)
      .in('field_id', fieldIds)
      .gte('date', since60Days.toISOString().split('T')[0])
      .order('date', { ascending: false })

    if (actError) return res.status(400).json({ message: actError.message })

    // Load recent scans (last 30 days)
    const since30Days = new Date()
    since30Days.setDate(since30Days.getDate() - 30)

    const { data: scans } = await supabase
      .from('scans')
      .select('field_id, disease, severity, confidence, created_at')
      .eq('farmer_id', farmerId)
      .in('field_id', fieldIds)
      .gte('created_at', since30Days.toISOString())
      .order('created_at', { ascending: false })

    // ─────────────────────────────────
    // Build intelligence per field
    // ─────────────────────────────────
    const fieldIntelligence = fields.map(field => {
      const fieldActivities = (activities || []).filter(a => a.field_id === field.id)
      const fieldScans = (scans || []).filter(s => s.field_id === field.id)

      // Group activities by type → find last occurrence of each type
      const lastByType = {}
      fieldActivities.forEach(activity => {
        const type = activity.type?.toLowerCase() || 'default'
        if (!lastByType[type]) {
          lastByType[type] = activity  // already sorted desc, so first = most recent
        }
      })

      // Build alerts for this field
      const alerts = []

      Object.entries(lastByType).forEach(([type, lastActivity]) => {
        const interval = SPRAY_INTERVALS[type] || SPRAY_INTERVALS.default
        const days = daysSince(lastActivity.date)
        const level = getAlertLevel(days, interval)
        const label = TYPE_LABEL_MAP[type] || TYPE_LABEL_MAP.default

        if (level === 'critical') {
          alerts.push({
            field_id: field.id,
            field_name: field.field_name,
            type: 'overdue',
            level: 'critical',
            activity_type: type,
            label: label,
            message: `${label} is ${days - interval} days overdue`,
            message_telugu: `${label} ${days - interval} రోజులు ఆలస్యంగా ఉంది — వెంటనే చేయండి`,
            last_done: lastActivity.date,
            days_since: days,
            recommended_interval: interval,
            icon: '🚨'
          })
        } else if (level === 'warning') {
          alerts.push({
            field_id: field.id,
            field_name: field.field_name,
            type: 'overdue',
            level: 'warning',
            activity_type: type,
            label: label,
            message: `${label} is due — last done ${days} days ago`,
            message_telugu: `${label} చేయాల్సిన సమయం — చివరిసారి ${days} రోజుల క్రితం`,
            last_done: lastActivity.date,
            days_since: days,
            recommended_interval: interval,
            icon: '⚠️'
          })
        } else if (level === 'due_soon') {
          alerts.push({
            field_id: field.id,
            field_name: field.field_name,
            type: 'reminder',
            level: 'info',
            activity_type: type,
            label: label,
            message: `${label} due in ${interval - days} day(s)`,
            message_telugu: `${label} ${interval - days} రోజుల్లో చేయాలి`,
            last_done: lastActivity.date,
            days_since: days,
            recommended_interval: interval,
            icon: '📅'
          })
        }
      })

      // Disease alert from recent scans
      if (fieldScans.length > 0) {
        const latestScan = fieldScans[0]
        const scanDays = daysSince(latestScan.created_at.split('T')[0])

        if (!latestScan.healthy && latestScan.severity === 'Critical' && scanDays <= 7) {
          alerts.push({
            field_id: field.id,
            field_name: field.field_name,
            type: 'disease',
            level: 'critical',
            activity_type: 'scan',
            label: 'Disease Alert',
            message: `Critical: ${latestScan.disease} detected ${scanDays} day(s) ago`,
            message_telugu: `తీవ్రమైన తెగులు: ${scanDays} రోజుల క్రితం గుర్తించబడింది — వెంటనే చికిత్స చేయండి`,
            last_done: latestScan.created_at,
            days_since: scanDays,
            disease: latestScan.disease,
            severity: latestScan.severity,
            icon: '🦠'
          })
        }
      }

      // Sowing-based growth stage
      let growthStage = null
      if (field.sowing_date) {
        const sowingDays = daysSince(field.sowing_date)
        if (sowingDays < 20) {
          growthStage = { stage: 'Germination', stage_telugu: 'మొలక దశ', days: sowingDays, icon: '🌱' }
        } else if (sowingDays < 45) {
          growthStage = { stage: 'Vegetative', stage_telugu: 'పెరుగుదల దశ', days: sowingDays, icon: '🌿' }
        } else if (sowingDays < 75) {
          growthStage = { stage: 'Flowering', stage_telugu: 'పూత దశ', days: sowingDays, icon: '🌸' }
        } else if (sowingDays < 120) {
          growthStage = { stage: 'Fruiting', stage_telugu: 'కాయ దశ', days: sowingDays, icon: '🌶️' }
        } else {
          growthStage = { stage: 'Harvest Ready', stage_telugu: 'కోత దశ', days: sowingDays, icon: '✂️' }
        }
      }

      // Field summary
      const summary = {
        field_id: field.id,
        field_name: field.field_name,
        crop_type: field.crop_type,
        land_acres: field.land_acres,
        village: field.village,
        sowing_date: field.sowing_date,
        growth_stage: growthStage,
        total_activities_60d: fieldActivities.length,
        last_activity: fieldActivities[0] || null,
        recent_scans: fieldScans.slice(0, 3),
        alert_count: alerts.filter(a => a.level === 'critical').length,
        activities_by_type: Object.fromEntries(
          Object.entries(lastByType).map(([type, act]) => [
            type,
            { last_date: act.date, days_since: daysSince(act.date) }
          ])
        )
      }

      return { field, summary, alerts }
    })

    // Flatten alerts across all fields, sorted by severity
    const severityOrder = { critical: 0, warning: 1, info: 2 }
    const allAlerts = fieldIntelligence
      .flatMap(fi => fi.alerts)
      .sort((a, b) => (severityOrder[a.level] ?? 3) - (severityOrder[b.level] ?? 3))

    res.status(200).json({
      alerts: allAlerts,
      alert_counts: {
        critical: allAlerts.filter(a => a.level === 'critical').length,
        warning: allAlerts.filter(a => a.level === 'warning').length,
        info: allAlerts.filter(a => a.level === 'info').length
      },
      fields: fieldIntelligence.map(fi => fi.summary)
    })

  } catch(err) {
    console.log('Field intelligence error:', err.message)
    res.status(500).json({ message: err.message })
  }
})

// ─────────────────────────────────────
// GET /field-intelligence/alerts/:fieldId
// Alerts for a single field only
// ─────────────────────────────────────
router.get('/alerts/:fieldId', auth, async (req, res) => {
  const { fieldId } = req.params
  const farmerPhone = req.user.phone

  // Delegate to the main endpoint with field_id filter
  req.params.farmerId = farmerPhone
  req.query.field_id = fieldId

  // Re-use logic by redirect — or just call it directly
  // Simple re-implementation for single field
  try {
    const { data: field } = await supabase
      .from('fields')
      .select('*')
      .eq('id', parseInt(fieldId))
      .eq('farmer_id', farmerPhone)
      .maybeSingle()

    if (!field) return res.status(404).json({ message: 'Field not found' })

    const since60Days = new Date()
    since60Days.setDate(since60Days.getDate() - 60)

    const { data: activities } = await supabase
      .from('activities')
      .select('*')
      .eq('farmer_id', farmerPhone)
      .eq('field_id', parseInt(fieldId))
      .gte('date', since60Days.toISOString().split('T')[0])
      .order('date', { ascending: false })

    // Just return the last activity per type with days since
    const lastByType = {}
    ;(activities || []).forEach(activity => {
      const type = activity.type?.toLowerCase() || 'default'
      if (!lastByType[type]) lastByType[type] = activity
    })

    const activityStatus = Object.entries(lastByType).map(([type, act]) => {
      const interval = SPRAY_INTERVALS[type] || SPRAY_INTERVALS.default
      const days = daysSince(act.date)
      return {
        type,
        label: TYPE_LABEL_MAP[type] || type,
        last_date: act.date,
        days_since: days,
        recommended_interval: interval,
        status: getAlertLevel(days, interval),
        days_overdue: Math.max(0, days - interval),
        days_until_due: Math.max(0, interval - days)
      }
    })

    res.status(200).json({
      field_id: parseInt(fieldId),
      field_name: field.field_name,
      activity_status: activityStatus
    })

  } catch(err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router