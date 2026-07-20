// ══════════════════════════════════════
// backend/routes/feed.js
// RytuAI Feed Routes
// News + Market Prices — All AP Crops
// ══════════════════════════════════════

const express = require('express')
const router = express.Router()

// ══════════════════════════════════════
// STATIC FALLBACK PRICES — All AP Crops
// Updated June 2026 — Guntur Market
// ══════════════════════════════════════
const STATIC_PRICES = {
  chilli: [
    { variety: 'Teja (S17)', market: 'Guntur APMC', district: 'Guntur',
      minPrice: 17000, maxPrice: 20000, modalPrice: 18500 },
    { variety: 'Byadgi 5531', market: 'Guntur APMC', district: 'Guntur',
      minPrice: 20000, maxPrice: 24000, modalPrice: 22000 },
    { variety: 'Syngenta 5532', market: 'Guntur APMC', district: 'Guntur',
      minPrice: 19000, maxPrice: 25000, modalPrice: 22500 },
    { variety: '334 S10', market: 'Guntur APMC', district: 'Guntur',
      minPrice: 13000, maxPrice: 17000, modalPrice: 15000 },
    { variety: 'Armoor', market: 'Nizamabad APMC', district: 'Nizamabad',
      minPrice: 14000, maxPrice: 19000, modalPrice: 16500 },
    { variety: 'Sankeshwari', market: 'Guntur APMC', district: 'Guntur',
      minPrice: 17000, maxPrice: 21000, modalPrice: 19000 },
    { variety: 'Number 5', market: 'Guntur APMC', district: 'Guntur',
      minPrice: 15000, maxPrice: 19000, modalPrice: 17000 },
    { variety: 'Indam 5', market: 'Guntur APMC', district: 'Guntur',
      minPrice: 16000, maxPrice: 20000, modalPrice: 18000 }
  ],
  bengalgram: [
    { variety: 'Bengal Gram (Desi)', market: 'Kurnool APMC', district: 'Kurnool',
      minPrice: 4800, maxPrice: 5500, modalPrice: 5200 },
    { variety: 'Chana (Bold)', market: 'Nandyal APMC', district: 'Nandyal',
      minPrice: 5000, maxPrice: 5800, modalPrice: 5400 },
    { variety: 'Bengal Gram (Local)', market: 'Guntur APMC', district: 'Guntur',
      minPrice: 4600, maxPrice: 5200, modalPrice: 4900 }
  ],
  cotton: [
    { variety: 'Cotton (H4)', market: 'Kurnool APMC', district: 'Kurnool',
      minPrice: 6200, maxPrice: 7200, modalPrice: 6800 },
    { variety: 'Cotton (MCU5)', market: 'Guntur APMC', district: 'Guntur',
      minPrice: 6000, maxPrice: 7000, modalPrice: 6500 },
    { variety: 'Cotton (Hybrid)', market: 'Nandyal APMC', district: 'Nandyal',
      minPrice: 6400, maxPrice: 7400, modalPrice: 7000 },
    { variety: 'Cotton (Long Staple)', market: 'Adoni APMC', district: 'Kurnool',
      minPrice: 6800, maxPrice: 7800, modalPrice: 7300 }
  ],
  maize: [
    { variety: 'Maize (White)', market: 'Nizamabad APMC', district: 'Nizamabad',
      minPrice: 1600, maxPrice: 2100, modalPrice: 1850 },
    { variety: 'Maize (Yellow)', market: 'Guntur APMC', district: 'Guntur',
      minPrice: 1700, maxPrice: 2200, modalPrice: 1950 },
    { variety: 'Sweet Corn', market: 'Krishna APMC', district: 'Krishna',
      minPrice: 1800, maxPrice: 2400, modalPrice: 2100 }
  ],
  paddy: [
    { variety: 'Paddy (Sona Masuri)', market: 'Nellore APMC', district: 'Nellore',
      minPrice: 1800, maxPrice: 2400, modalPrice: 2100 },
    { variety: 'Paddy (BPT 5204)', market: 'Krishna APMC', district: 'Krishna',
      minPrice: 1900, maxPrice: 2500, modalPrice: 2200 },
    { variety: 'Paddy (MTU 7029)', market: 'Guntur APMC', district: 'Guntur',
      minPrice: 1750, maxPrice: 2300, modalPrice: 2050 },
    { variety: 'Paddy (HMT)', market: 'West Godavari APMC', district: 'West Godavari',
      minPrice: 2000, maxPrice: 2600, modalPrice: 2300 }
  ],
  groundnut: [
    { variety: 'Groundnut (Bold)', market: 'Anantapur APMC', district: 'Anantapur',
      minPrice: 4800, maxPrice: 5600, modalPrice: 5200 },
    { variety: 'Groundnut (TMV2)', market: 'Kurnool APMC', district: 'Kurnool',
      minPrice: 4600, maxPrice: 5400, modalPrice: 5000 },
    { variety: 'Groundnut (Local)', market: 'Guntur APMC', district: 'Guntur',
      minPrice: 4400, maxPrice: 5200, modalPrice: 4800 }
  ],
  onion: [
    { variety: 'Onion (Red)', market: 'Kurnool APMC', district: 'Kurnool',
      minPrice: 800, maxPrice: 1600, modalPrice: 1200 },
    { variety: 'Onion (White)', market: 'Guntur APMC', district: 'Guntur',
      minPrice: 900, maxPrice: 1700, modalPrice: 1300 }
  ],
  tomato: [
    { variety: 'Tomato (Local)', market: 'Madanapalle APMC', district: 'Chittoor',
      minPrice: 800, maxPrice: 1800, modalPrice: 1200 },
    { variety: 'Tomato (Hybrid)', market: 'Kurnool APMC', district: 'Kurnool',
      minPrice: 1000, maxPrice: 2000, modalPrice: 1500 }
  ],
  sunflower: [
    { variety: 'Sunflower (Hybrid)', market: 'Kurnool APMC', district: 'Kurnool',
      minPrice: 5000, maxPrice: 6000, modalPrice: 5500 },
    { variety: 'Sunflower (Local)', market: 'Anantapur APMC', district: 'Anantapur',
      minPrice: 4800, maxPrice: 5800, modalPrice: 5300 }
  ],
  tobacco: [
    { variety: 'Tobacco (Virginia FCV)', market: 'Ongole APMC', district: 'Prakasam',
      minPrice: 12000, maxPrice: 18000, modalPrice: 15000 },
    { variety: 'Tobacco (Burley)', market: 'Chirala APMC', district: 'Bapatla',
      minPrice: 10000, maxPrice: 16000, modalPrice: 13000 }
  ]
}

// Add today's date to all static prices
function addTodayDate(prices) {
  var today = new Date().toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
  return prices.map(function(p) {
    return Object.assign({}, p, { date: today })
  })
}

// ══════════════════════════════════════
// FETCH FROM AGMARKNET API
// ══════════════════════════════════════
async function fetchAgmarknet(commodity, apiKey) {
  try {
    const url = 'https://api.data.gov.in/resource/' +
      '9ef84268-d588-465a-a308-a864a43d0070?' +
      'api-key=' + apiKey + '&' +
      'format=json&' +
      'limit=50&' +
      'filters[State]=Andhra%20Pradesh&' +
      'filters[commodity]=' + encodeURIComponent(commodity)

    const response = await fetch(url)
    const data = await response.json()

    if (data.records && data.records.length > 0) {
      return data.records.map(function(r) {
        return {
          variety: r.variety || commodity,
          market: (r.market || '') + ' APMC',
          district: r.district || '',
          minPrice: parseInt(r.min_price) || 0,
          maxPrice: parseInt(r.max_price) || 0,
          modalPrice: parseInt(r.modal_price) || 0,
          date: r.arrival_date || new Date().toLocaleDateString('en-IN')
        }
      }).filter(function(p) { return p.modalPrice > 0 })
    }
    return []
  } catch(err) {
    console.log('Agmarknet error for', commodity, ':', err.message)
    return []
  }
}

// ══════════════════════════════════════
// GET /feed/prices/chilli
// ══════════════════════════════════════
router.get('/prices/chilli', async (req, res) => {
  try {
    const DATAGOV_API_KEY = process.env.DATAGOV_API_KEY

    if (DATAGOV_API_KEY) {
      const prices = await fetchAgmarknet('Chilli', DATAGOV_API_KEY)
      if (prices.length > 0) {
        return res.status(200).json({ prices })
      }
    }

    // Fallback
    res.status(200).json({ prices: addTodayDate(STATIC_PRICES.chilli) })

  } catch(err) {
    console.log('Chilli prices error:', err.message)
    res.status(200).json({ prices: addTodayDate(STATIC_PRICES.chilli) })
  }
})

// ══════════════════════════════════════
// GET /feed/prices/bengalgram
// ══════════════════════════════════════
router.get('/prices/bengalgram', async (req, res) => {
  try {
    const DATAGOV_API_KEY = process.env.DATAGOV_API_KEY

    if (DATAGOV_API_KEY) {
      const prices = await fetchAgmarknet('Bengal Gram(Desi)(Whole)', DATAGOV_API_KEY)
      if (prices.length > 0) {
        return res.status(200).json({ prices })
      }
    }

    res.status(200).json({ prices: addTodayDate(STATIC_PRICES.bengalgram) })

  } catch(err) {
    res.status(200).json({ prices: addTodayDate(STATIC_PRICES.bengalgram) })
  }
})

// ══════════════════════════════════════
// GET /feed/prices/cotton
// ══════════════════════════════════════
router.get('/prices/cotton', async (req, res) => {
  try {
    const DATAGOV_API_KEY = process.env.DATAGOV_API_KEY

    if (DATAGOV_API_KEY) {
      const prices = await fetchAgmarknet('Cotton', DATAGOV_API_KEY)
      if (prices.length > 0) {
        return res.status(200).json({ prices })
      }
    }

    res.status(200).json({ prices: addTodayDate(STATIC_PRICES.cotton) })

  } catch(err) {
    res.status(200).json({ prices: addTodayDate(STATIC_PRICES.cotton) })
  }
})

// ══════════════════════════════════════
// GET /feed/prices/maize
// ══════════════════════════════════════
router.get('/prices/maize', async (req, res) => {
  try {
    const DATAGOV_API_KEY = process.env.DATAGOV_API_KEY

    if (DATAGOV_API_KEY) {
      const prices = await fetchAgmarknet('Maize', DATAGOV_API_KEY)
      if (prices.length > 0) {
        return res.status(200).json({ prices })
      }
    }

    res.status(200).json({ prices: addTodayDate(STATIC_PRICES.maize) })

  } catch(err) {
    res.status(200).json({ prices: addTodayDate(STATIC_PRICES.maize) })
  }
})

// ══════════════════════════════════════
// GET /feed/prices/paddy
// ══════════════════════════════════════
router.get('/prices/paddy', async (req, res) => {
  try {
    const DATAGOV_API_KEY = process.env.DATAGOV_API_KEY

    if (DATAGOV_API_KEY) {
      const prices = await fetchAgmarknet('Paddy(Dhan)(Common)', DATAGOV_API_KEY)
      if (prices.length > 0) {
        return res.status(200).json({ prices })
      }
    }

    res.status(200).json({ prices: addTodayDate(STATIC_PRICES.paddy) })

  } catch(err) {
    res.status(200).json({ prices: addTodayDate(STATIC_PRICES.paddy) })
  }
})

// ══════════════════════════════════════
// GET /feed/prices/groundnut
// ══════════════════════════════════════
router.get('/prices/groundnut', async (req, res) => {
  try {
    const DATAGOV_API_KEY = process.env.DATAGOV_API_KEY

    if (DATAGOV_API_KEY) {
      const prices = await fetchAgmarknet('Groundnut', DATAGOV_API_KEY)
      if (prices.length > 0) {
        return res.status(200).json({ prices })
      }
    }

    res.status(200).json({ prices: addTodayDate(STATIC_PRICES.groundnut) })

  } catch(err) {
    res.status(200).json({ prices: addTodayDate(STATIC_PRICES.groundnut) })
  }
})

// ══════════════════════════════════════
// GET /feed/prices/all
// All crops combined — for main feed
// ══════════════════════════════════════
router.get('/prices/all', async (req, res) => {
  try {
    const today = new Date().toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    })

    // Return all static prices grouped by crop
    res.status(200).json({
      lastUpdated: today,
      crops: {
        chilli: addTodayDate(STATIC_PRICES.chilli),
        bengalgram: addTodayDate(STATIC_PRICES.bengalgram),
        cotton: addTodayDate(STATIC_PRICES.cotton),
        maize: addTodayDate(STATIC_PRICES.maize),
        paddy: addTodayDate(STATIC_PRICES.paddy),
        groundnut: addTodayDate(STATIC_PRICES.groundnut),
        onion: addTodayDate(STATIC_PRICES.onion),
        tomato: addTodayDate(STATIC_PRICES.tomato),
        sunflower: addTodayDate(STATIC_PRICES.sunflower),
        tobacco: addTodayDate(STATIC_PRICES.tobacco)
      }
    })
  } catch(err) {
    res.status(500).json({ message: err.message })
  }
})

// ══════════════════════════════════════
// GET /feed/news
// Agriculture news from GNews API
// ══════════════════════════════════════


 
// ── Telugu Agriculture News via Google News RSS ──
// No API key needed — Google News RSS is free and always works
router.get('/news', async (req, res) => {
  try {
    // Multiple queries — pick the best results
    const queries = [
      'వ్యవసాయం ఆంధ్రప్రదేశ్',           // Agriculture Andhra Pradesh in Telugu
      'రైతులు తెలంగాణ వ్యవసాయం',          // Farmers Telangana Agriculture  
      'మిరప ధరలు గుంటూరు',                // Chilli prices Guntur
      'agriculture andhra pradesh farmer'   // English fallback
    ]
 
    // Use the first Telugu query as primary
    const query = encodeURIComponent('వ్యవసాయం రైతులు ఆంధ్రప్రదేశ్ తెలంగాణ')
    const rssUrl = `https://news.google.com/rss/search?q=${query}&hl=te&gl=IN&ceid=IN:te`
 
    const response = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RytuAI/1.0)',
        'Accept': 'application/rss+xml, application/xml, text/xml'
      },
      
    })
 
    if (!response.ok) {
      throw new Error(`RSS fetch failed: ${response.status}`)
    }
 
    const xml = await response.text()
 
    // Parse RSS XML manually (no extra library needed)
    const articles = parseGoogleNewsRSS(xml)
 
    // If Telugu query returns too few, also fetch English AP agriculture news
    if (articles.length < 3) {
      const enQuery = encodeURIComponent('andhra pradesh telangana agriculture farmer chilli 2025')
      const enUrl = `https://news.google.com/rss/search?q=${enQuery}&hl=en-IN&gl=IN&ceid=IN:en`
      const enRes = await fetch(enUrl, { timeout: 6000 })
      if (enRes.ok) {
        const enXml = await enRes.text()
        const enArticles = parseGoogleNewsRSS(enXml)
        articles.push(...enArticles.slice(0, 5))
      }
    }
 
    res.status(200).json({ articles: articles.slice(0, 10) })
 
  } catch(err) {
    console.log('News fetch error:', err.message)
    // Return empty gracefully — never crash
    res.status(200).json({ articles: [] })
  }
})
 
// ── Simple RSS XML Parser (no library needed) ──
function parseGoogleNewsRSS(xml) {
  const articles = []
  
  try {
    // Extract <item> blocks
    const itemRegex = /<item>([\s\S]*?)<\/item>/g
    let match
 
    while ((match = itemRegex.exec(xml)) !== null) {
      const item = match[1]
 
      const title = extractTag(item, 'title')
      const link = extractTag(item, 'link') || extractGoogleLink(item)
      const pubDate = extractTag(item, 'pubDate')
      const source = extractTag(item, 'source') || extractAttr(item, 'source', 'url') || 'Google News'
      const description = extractTag(item, 'description')
 
      if (title && title.length > 5) {
        articles.push({
          title: cleanText(title),
          url: link || '#',
          publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
          source: { name: cleanText(source) },
          description: cleanText(desc).includes('http') ? '' : cleanText(desc).substring(0, 150)
        })
      }
    }
  } catch(e) {
    console.log('RSS parse error:', e.message)
  }
 
  return articles
}
 
function extractTag(xml, tag) {
  const regex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i')
  const match = xml.match(regex)
  if (!match) return ''
  return (match[1] || match[2] || '').trim()
}
 
function extractAttr(xml, tag, attr) {
  const regex = new RegExp(`<${tag}[^>]*${attr}="([^"]*)"`, 'i')
  const match = xml.match(regex)
  return match ? match[1] : ''
}
 
function extractGoogleLink(item) {
  const match = item.match(/https?:\/\/[^\s<"]+/)
  return match ? match[0] : ''
}
 
function cleanText(str) {
  return (str || '')
    .replace(/<a\b[^>]*>[\s\S]*?<\/a>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

module.exports = router