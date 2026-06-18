// ══════════════════════════════════════
// backend/routes/feed.js
// RytuAI Feed Routes
// News + Market Prices
// ══════════════════════════════════════

const express = require('express')
const router = express.Router()

// ══════════════════════════════════════
// GET /feed/news
// Real agriculture news from NewsAPI
// ══════════════════════════════════════
router.get('/news', async (req, res) => {
  try {
    const NEWS_API_KEY = process.env.NEWS_API_KEY

    if (!NEWS_API_KEY) {
      console.log('NEWS_API_KEY missing — returning empty')
      return res.status(200).json({ articles: [] })
    }

    const url = 'https://newsapi.org/v2/everything?' +
      'q=andhra+pradesh+agriculture+farmer+chilli+rythu&' +
      'language=en&' +
      'sortBy=publishedAt&' +
      'pageSize=8&' +
      'apiKey=' + process.env.NEWS_API_KEY

    const response = await fetch(url)
    const data = await response.json()

    console.log('NewsAPI status:', data.status)

    if (data.status === 'ok' && data.articles && data.articles.length > 0) {
      const cleaned = data.articles.map(function(a) {
        return {
          title: a.title || '',
          description: a.description || '',
          url: a.url || '#',
          source: a.source || { name: 'News' },
          publishedAt: a.publishedAt || ''
        }
      }).filter(function(a) {
        return a.title && a.title !== '[Removed]'
      })

      return res.status(200).json({ articles: cleaned })
    }

    res.status(200).json({ articles: [] })

  } catch(err) {
    console.log('News API error:', err.message)
    res.status(200).json({ articles: [] })
  }
})

// ══════════════════════════════════════
// GET /feed/prices
// Real mandi prices from data.gov.in
// Agmarknet — Government of India
// ══════════════════════════════════════
router.get('/prices', async (req, res) => {
  try {
    const DATAGOV_API_KEY = process.env.DATAGOV_API_KEY

    if (!DATAGOV_API_KEY) {
      console.log('DATAGOV_API_KEY missing — returning empty')
      return res.status(200).json({ prices: [] })
    }

    const url = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?' +
      'api-key=' + DATAGOV_API_KEY + '&' +
      'format=json&' +
      'limit=100&' +
      'filters[State]=Andhra%20Pradesh'

    const response = await fetch(url)
    const data = await response.json()

    console.log('Agmarknet records:', data.count || 0)

    if (data.records && data.records.length > 0) {
      const relevantCrops = [
        'chilli', 'mirchi', 'mirch',
        'paddy', 'rice',
        'cotton',
        'groundnut',
        'maize', 'corn',
        'tomato',
        'onion',
        'tobacco',
        'sunflower'
      ]

      const prices = data.records
        .filter(function(r) {
          var crop = (r.commodity || '').toLowerCase()
          return relevantCrops.some(function(c) {
            return crop.includes(c)
          })
        })
        .map(function(r) {
          return {
            crop: r.commodity || '',
            variety: r.variety || '',
            market: (r.market || '') + ' APMC',
            district: r.district || '',
            state: r.state || 'Andhra Pradesh',
            minPrice: parseInt(r.min_price) || 0,
            maxPrice: parseInt(r.max_price) || 0,
            modalPrice: parseInt(r.modal_price) || 0,
            date: r.arrival_date || ''
          }
        })
        .filter(function(p) { return p.modalPrice > 0 })
        .slice(0, 10)

      if (prices.length > 0) {
        return res.status(200).json({ prices })
      }
    }

    res.status(200).json({ prices: [] })

  } catch(err) {
    console.log('Prices API error:', err.message)
    res.status(200).json({ prices: [] })
  }
})

module.exports = router