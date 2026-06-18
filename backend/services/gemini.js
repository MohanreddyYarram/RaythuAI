// ══════════════════════════════════════
// backend/services/gemini.js
// RytuAI Crop Disease Detection
// Gemini 1.5 Pro Vision API
// Version 3.0 | rytuai.in
// ══════════════════════════════════════

const { GoogleGenerativeAI } = require('@google/generative-ai')

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

// ─────────────────────────────────────
// USER PROMPT
// ─────────────────────────────────────
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

// ─────────────────────────────────────
// RESPONSE VALIDATOR
// ─────────────────────────────────────
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

// ─────────────────────────────────────
// MAIN DETECT DISEASE FUNCTION
// Called from detection.js route
// ─────────────────────────────────────
async function detectDisease(imageBlocks) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

    // Convert imageBlocks from Claude format to Gemini format
    const imageParts = imageBlocks.map(block => ({
      inlineData: {
        mimeType: block.source.media_type,
        data: block.source.data
      }
    }))

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        temperature: 0.1,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 4096,
        responseMimeType: 'application/json'
      }
    })

    console.log('🔍 RytuAI: Analyzing crop with Gemini 1.5 Pro...')

    const result = await model.generateContent([
      USER_PROMPT,
      ...imageParts
    ])

    const responseText = result.response.text()

    // Clean any accidental markdown fences
    const cleaned = responseText
      .replace(/```json\n?/gi, '')
      .replace(/```\n?/gi, '')
      .trim()

    const parsed = JSON.parse(cleaned)

    // Add image count
    parsed.images_count = imageBlocks.length

    // Validate response quality
    const validation = validateScanResponse(parsed)

    if (!validation.valid) {
      console.warn('⚠️ Gemini response validation warnings:', validation.errors)
    }

    console.log(`✅ Gemini scan complete: ${parsed.disease} | Quality: ${validation.score}%`)

    return parsed

  } catch(err) {
    console.log('❌ Gemini error:', err.message)

    // Return fallback response — do not crash the app
    return getFallbackResponse(imageBlocks.length)
  }
}

module.exports = { detectDisease, validateScanResponse }