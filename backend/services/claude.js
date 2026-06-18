// ══════════════════════════════════════
// backend/services/claude.js
// Replace your existing claude.js
// ══════════════════════════════════════

const Anthropic = require('@anthropic-ai/sdk')

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})
// ─────────────────────────────────────
// SYSTEM PROMPT
// ─────────────────────────────────────
const SYSTEM_PROMPT = `You are RytuAI's expert crop disease detection engine, 
purpose-built for farmers in Andhra Pradesh and Telangana, India.

IDENTITY:
- Senior agricultural scientist with 20+ years AP/Telangana field experience
- Specializes in: Chilli, Paddy, Cotton, Groundnut, Tobacco, Onion, Tomato
- Uses real farmer language — warm, honest, and practical
- Like a trusted knowledgeable neighbor to the farmer

TELUGU LANGUAGE RULES:
Use ONLY these local AP farmer disease names:
- Leaf Curl Virus = బొబ్బర / పై ముడుత (NEVER వైరస్ వ్యాధి)
- Powdery Mildew = పిండి తెగులు
- Downy Mildew = తుప్పు తెగులు
- Anthracnose = కాయ కుళ్ళు తెగులు
- Damping Off = కాలు కుళ్ళు తెగులు
- Bacterial Wilt = ఎండు తెగులు
- Fusarium Wilt = వేరు కుళ్ళు తెగులు
- Blast (Paddy) = అగ్గి తెగులు
- Whitefly = తెల్లదోమ
- Aphids = పేను పురుగు
- Thrips = పీతపురుగు

ALWAYS start teluguSummary with: "అన్నదాతా నమస్కారం!"
ALWAYS end teluguSummary with: "ధైర్యంగా ఉండండి, మీ పంట కోలుకుంటుంది! 🌱"

⚠️ MANDATORY DOSAGE TABLE — NEVER DEVIATE:
Imidacloprid 17.8% SL    = 0.3 ml per liter (NOT 0.5ml)
Thiamethoxam 25% WG      = 0.2 g per liter
Acetamiprid 20% SP       = 0.2 g per liter
Diafenthiuron 50% WP     = 1.25 g per liter
Fipronil 5% SC           = 1.5 ml per liter (NOT 2.0ml)
Spiromesifen 22.9% SC    = 0.5 ml per liter
Spinosad 45% SC          = 0.3 ml per liter
Profenofos 50% EC        = 2.0 ml per liter
Chlorpyrifos 20% EC      = 2.5 ml per liter
Cypermethrin 10% EC      = 1.0 ml per liter
Mancozeb 75% WP          = 2.5 g per liter
Copper Oxychloride 50%WP = 3.0 g per liter
Carbendazim 50% WP       = 1.0 g per liter
Hexaconazole 5% EC       = 2.0 ml per liter
Propiconazole 25% EC     = 1.0 ml per liter
Azadirachtin/Neem 1%     = 3.0 ml per liter

OUTPUT RULES:
- Respond ONLY in valid JSON
- NO markdown, NO backticks, NO text before/after JSON
- NO trailing commas
- priceMRP must always be integer and higher than priceRytu`

const USER_PROMPT = `Analyze this crop photo carefully and return a complete 
disease diagnosis. Study the actual visible symptoms before responding.

Return ONLY this exact JSON:

{
  "disease": "Full scientific disease name",
  "teluguName": "స్థానిక AP రైతు పదం (బొబ్బర వంటివి తప్పనిసరి)",
  "confidence": "80-92% range only",
  "severity": "Low or Medium or High or Critical",
  "spread": "Low or Medium or High",
  "treatWithin": "48 గంటల్లో (within 48 hours)",
  "healthy": false,
  "whatIsThis": "2-3 sentence scientific explanation in English",
  "whatIsThisTelugu": "2-3 వాక్యాలు సరళమైన AP తెలుగులో",
  "symptomsFound": "EXACTLY 5 numbered symptoms visible in THIS photo",
  "symptomsFoundTelugu": "సరిగ్గా 5 లక్షణాలు నంబర్లతో తెలుగులో",
  "prevention": "EXACTLY 8 numbered prevention tips in English",
  "preventionTelugu": "సరిగ్గా 8 నివారణ చర్యలు తెలుగులో (వయారిభామ, అడ్డు పంటలు తప్పనిసరి)",
  "teluguSummary": "3-4 వాక్యాలు. అన్నదాతా నమస్కారం! తో మొదలు. ధైర్యంగా ఉండండి, మీ పంట కోలుకుంటుంది! 🌱 తో ముగింపు.",
  "pesticides": [
    {
      "name": "Active ingredient % formulation",
      "brand": "Brand (Company)",
      "usage": "Exact dose from table + method + timing + repeat interval",
      "usageTelugu": "తెలుగులో వాడకం విధానం",
      "priceMRP": 0,
      "priceRytu": 0,
      "icon": "🧴 or 💊 or 🔬 or 🌱"
    }
  ]
}

SELF-CHECK before sending:
- JSON valid, no trailing commas? ✓
- All doses from mandatory table? ✓
- Telugu is natural AP farmer language? ✓
- Symptoms from THIS photo specifically? ✓
- priceMRP > priceRytu (integers)? ✓
- Exactly 4 pesticides? ✓
- Exactly 5 symptoms, 8 prevention tips? ✓
- teluguSummary starts and ends correctly? ✓`

function validateScanResponse(data) {
  const errors = []

  const required = [
    'disease', 'teluguName', 'confidence', 'severity', 'spread',
    'treatWithin', 'healthy', 'whatIsThis', 'whatIsThisTelugu',
    'symptomsFound', 'symptomsFoundTelugu', 'prevention',
    'preventionTelugu', 'teluguSummary', 'pesticides'
  ]

  required.forEach(field => {
    if (!data[field] && data[field] !== false) {
      errors.push(`Missing field: ${field}`)
    }
  })

  if (!Array.isArray(data.pesticides) || data.pesticides.length !== 4) {
    errors.push(`Pesticides count: expected 4, got ${data.pesticides?.length}`)
  }

  if (Array.isArray(data.pesticides)) {
    data.pesticides.forEach((p, i) => {
      if (!p.name) errors.push(`Pesticide ${i+1}: missing name`)
      if (!p.brand) errors.push(`Pesticide ${i+1}: missing brand`)
      if (!p.usage) errors.push(`Pesticide ${i+1}: missing usage`)
      if (!p.usageTelugu) errors.push(`Pesticide ${i+1}: missing usageTelugu`)
      if (!p.icon) errors.push(`Pesticide ${i+1}: missing icon`)
      if (typeof p.priceMRP !== 'number' || typeof p.priceRytu !== 'number') {
        errors.push(`Pesticide ${i+1}: prices must be numbers`)
      }
      if (p.priceMRP <= p.priceRytu) {
        errors.push(`Pesticide ${i+1}: priceMRP must be > priceRytu`)
      }
    })
  }

  if (data.teluguSummary) {
    if (!data.teluguSummary.includes('అన్నదాతా')) {
      errors.push('teluguSummary must start with అన్నదాతా నమస్కారం!')
    }
    if (!data.teluguSummary.includes('ధైర్యంగా ఉండండి')) {
      errors.push('teluguSummary must end with ధైర్యంగా ఉండండి...')
    }
  }

  if (data.confidence) {
    const confNum = parseInt(data.confidence)
    if (confNum < 80 || confNum > 92) {
      errors.push(`Confidence ${data.confidence} outside 80-92% range`)
    }
  }

  const validSeverity = ['Low', 'Medium', 'High', 'Critical']
  if (!validSeverity.includes(data.severity)) {
    errors.push(`Invalid severity: ${data.severity}`)
  }

  return {
    valid: errors.length === 0,
    errors,
    score: Math.round(((required.length - errors.length) / required.length) * 100)
  }
}

// ─────────────────────────────────────
// FALLBACK RESPONSE
// ─────────────────────────────────────
function getFallbackResponse(imageCount) {
  return {
    disease: 'Analysis Incomplete',
    teluguName: 'విశ్లేషణ పూర్తికాలేదు',
    confidence: '80%',
    severity: 'Low',
    spread: 'Low',
    treatWithin: 'నిపుణుడిని సంప్రదించండి (Consult expert)',
    healthy: false,
    whatIsThis: 'Could not analyze clearly. Please retake photos in good natural lighting, close-up of affected leaves.',
    whatIsThisTelugu: 'స్పష్టంగా విశ్లేషించలేకపోయాం. మంచి సూర్యకాంతిలో దగ్గరగా మళ్ళీ ఫోటో తీయండి.',
    symptomsFound: '1. Image quality insufficient for accurate diagnosis\n2. Please retake in natural daylight\n3. Show close-up of affected leaf\n4. Include both healthy and affected areas\n5. Avoid blur and shadows',
    symptomsFoundTelugu: '1. ఫోటో నాణ్యత తక్కువగా ఉంది\n2. సూర్యకాంతిలో మళ్ళీ తీయండి\n3. తెగులు సోకిన ఆకు దగ్గరగా చూపండి\n4. ఆరోగ్యకరమైన మరియు రోగగ్రస్త భాగాలు రెండూ చూపండి\n5. అస్పష్టత మరియు నీడలు తగ్గించండి',
    prevention: '1. Take clear close-up photos\n2. Use natural daylight\n3. Show affected plant parts clearly\n4. Avoid shadows on leaves\n5. Take multiple angles\n6. Clean lens before taking photo\n7. Hold camera steady\n8. Include both healthy and affected areas',
    preventionTelugu: '1. స్పష్టమైన దగ్గరి ఫోటోలు తీయండి\n2. సహజ వెలుతురు ఉపయోగించండి\n3. తెగులు సోకిన భాగాలు స్పష్టంగా చూపండి\n4. ఆకులపై నీడలు పడకుండా జాగ్రత్తపడండి\n5. వివిధ కోణాల నుండి తీయండి\n6. ఫోటో తీయడానికి ముందు లెన్స్ శుభ్రం చేయండి\n7. కెమెరా స్థిరంగా పట్టుకోండి\n8. ఆరోగ్యకరమైన మరియు రోగగ్రస్త భాగాలు రెండూ చేర్చండి',
    teluguSummary: 'అన్నదాతా నమస్కారం! మీ ఫోటో స్పష్టంగా లేదు. మంచి సూర్యకాంతిలో, తెగులు సోకిన ఆకుకు దగ్గరగా మళ్ళీ ఫోటో తీసి పంపండి. మీ పంటను రక్షించడానికి మేము సిద్ధంగా ఉన్నాం. ధైర్యంగా ఉండండి, మీ పంట కోలుకుంటుంది! 🌱',
    pesticides: [],
    images_count: imageCount
  }
}

async function detectDisease(imageBlocks) {
 const prompt = `You are an expert agricultural scientist specializing in chilli crops in Andhra Pradesh India. Analyze these crop photos and respond ONLY with valid JSON in this exact format with no other text:
{
  "disease": "Disease name in English",
  "teluguName": "వ్యాధి పేరు తెలుగులో",
  "confidence": "90%",
  "severity": "High",
  "spread": "Active",
  "treatWithin": "48 hours",
  "healthy": false,
  "whatIsThis": "max 2 sentences English",
  "whatIsThisTelugu": "గరిష్టంగా 2 వాక్యాలు తెలుగులో",
  "symptomsFound": "max 2 sentences English",
  "symptomsFoundTelugu": "గరిష్టంగా 2 వాక్యాలు తెలుగులో",
  "prevention": "max 2 sentences English.",
  "preventionTelugu": " గరిష్టంగా 2 వాక్యాలు తెలుగులో",
  "teluguSummary": "రైతుకు 2-3 వాక్యాల సారాంశం మాత్రమే",
  "pesticides": [
    {
      "name": "Pesticide name",
      "brand": "Brand name",
      "usage": "How to use in English — dosage and method",
      "usageTelugu": "వాడే విధానం తెలుగులో — మోతాదు మరియు పద్ధతి",
      "priceRytu": 200,
      "priceMRP": 280,
      "icon": "🧴"
    }
  ]
}
Important: Maximum 2 pesticides only. Keep every field under 20 words. Telugu text must be simple and short.`
  try {
    console.log('Calling Claude...')
    console.log('API Key exists:', !!process.env.ANTHROPIC_API_KEY)
    console.log('Image blocks count:', imageBlocks.length)

    const response = await client.messages.create({
      model: 'claude-opus-4-5',
      systemInstruction: SYSTEM_PROMPT,
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: [
            ...imageBlocks,
            { type: 'text', text: prompt }
          ]
        }
      ]
    })

    console.log('Claude responded!')
    const text = response.content[0].text
    console.log('Raw response:', text)
const clean = text.replace(/```json/g, '').replace(/```/g, '').trim()
let result

try {
  result = JSON.parse(clean)
} catch(parseErr) {
  console.log('Trying to repair truncated JSON...')
  try {
    // Find last complete pesticide entry and close JSON properly
    let repaired = clean

    // Remove incomplete last entry
    const lastCompleteObj = repaired.lastIndexOf('},')
    const lastCompleteArr = repaired.lastIndexOf('}]')

    if (lastCompleteArr > lastCompleteObj) {
      repaired = repaired.substring(0, lastCompleteArr + 2) + '}'
    } else if (lastCompleteObj > 0) {
      repaired = repaired.substring(0, lastCompleteObj + 1) + ']}'
    }

    result = JSON.parse(repaired)
    console.log('JSON repaired successfully!')
  } catch(repairErr) {
    // Last resort — return basic result
    console.log('JSON repair failed, using basic result')
    result = {
      disease: 'Detection incomplete',
      teluguName: 'గుర్తింపు అసంపూర్ణం',
      confidence: '—',
      severity: '—',
      spread: '—',
      treatWithin: '—',
      healthy: false,
      whatIsThis: 'Analysis was incomplete. Please try again with clearer photos.',
      whatIsThisTelugu: 'విశ్లేషణ అసంపూర్ణంగా ఉంది. దయచేసి స్పష్టమైన ఫోటోలతో మళ్ళీ ప్రయత్నించండి.',
      symptomsFound: '—',
      symptomsFoundTelugu: '—',
      prevention: '—',
      preventionTelugu: '—',
      teluguSummary: 'విశ్లేషణ పూర్తి కాలేదు. మళ్ళీ ప్రయత్నించండి.',
      pesticides: []
    }
  }
}
     return result
} catch (err) {
    console.log('Claude Error:', err.message)
    throw err
  }
}

// Retry logic for Claude API failures
async function detectWithRetry(imageBlocks, maxRetries = 3) {
  for (var i = 0; i < maxRetries; i++) {
    try {
      var response = await client.messages.create({
        model: 'claude-opus-4-5',
        max_tokens: 2048,
        messages: [{ role: 'user', content: imageBlocks }]
      })
      return response
    } catch(err) {
      console.log('Claude attempt', i + 1, 'failed:', err.message)
      if (i === maxRetries - 1) throw err
      // Wait before retry
      await new Promise(function(resolve) {
        setTimeout(resolve, 1000 * (i + 1))
      })
    }
  }
}

module.exports = { detectDisease }