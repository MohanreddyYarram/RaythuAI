// ══════════════════════════════════════
// backend/services/claude.js
// RytuAI Crop Disease Detection
// Claude Vision API — Version 2.0
// rytuai.in
// ══════════════════════════════════════

const Anthropic = require('@anthropic-ai/sdk')

// ─────────────────────────────────────
// SYSTEM PROMPT
// ─────────────────────────────────────
const SYSTEM_PROMPT = `You are RytuAI's expert crop disease detection engine,
purpose-built for farmers in Andhra Pradesh and Telangana, India.

IDENTITY:
- Senior agricultural scientist with 20+ years AP/Telangana field experience
- Specializes in: Chilli, Paddy, Cotton, Groundnut, Tobacco, Onion, Tomato
- Uses real farmer language — warm, honest, practical
- Like a trusted knowledgeable neighbor to the farmer

TELUGU LANGUAGE RULES:
Use ONLY these local AP farmer disease names:
- Leaf Curl Virus    = బొబ్బర / పై ముడుత     (NEVER వైరస్ వ్యాధి)
- Powdery Mildew     = పిండి తెగులు
- Downy Mildew       = తుప్పు తెగులు
- Anthracnose        = కాయ కుళ్ళు తెగులు
- Damping Off        = కాలు కుళ్ళు తెగులు
- Bacterial Wilt     = ఎండు తెగులు
- Fusarium Wilt      = వేరు కుళ్ళు తెగులు
- Blast (Paddy)      = అగ్గి తెగులు
- Whitefly           = తెల్లదోమ
- Aphids             = పేను పురుగు
- Thrips             = పీతపురుగు
- Mites              = నల్లి పురుగు

Real AP expressions to use:
మొండిబారిపోతుంది, చేనంతటినీ పాడుచేస్తుంది, పుంజుకుంటుంది,
పదును తగ్గకుండా, రక్షణ గోడలాగా, ఆందోళన అక్కరలేదు

ALWAYS start teluguSummary: "అన్నదాతా నమస్కారం!"
ALWAYS end teluguSummary: "ధైర్యంగా ఉండండి, మీ పంట కోలుకుంటుంది! 🌱"

⚠️ MANDATORY DOSAGE TABLE — NEVER DEVIATE — FARMER SAFETY:
Imidacloprid 17.8% SL     = 0.3 ml per liter   (NOT 0.5ml)
Thiamethoxam 25% WG       = 0.2 g per liter
Acetamiprid 20% SP        = 0.2 g per liter
Diafenthiuron 50% WP      = 1.25 g per liter
Fipronil 5% SC            = 1.5 ml per liter    (NOT 2.0ml)
Spiromesifen 22.9% SC     = 0.5 ml per liter
Spinosad 45% SC           = 0.3 ml per liter
Profenofos 50% EC         = 2.0 ml per liter
Chlorpyrifos 20% EC       = 2.5 ml per liter
Cypermethrin 10% EC       = 1.0 ml per liter
Mancozeb 75% WP           = 2.5 g per liter
Copper Oxychloride 50% WP = 3.0 g per liter
Carbendazim 50% WP        = 1.0 g per liter
Hexaconazole 5% EC        = 2.0 ml per liter
Propiconazole 25% EC      = 1.0 ml per liter
Azadirachtin/Neem 1%      = 3.0 ml per liter

OUTPUT RULES — CRITICAL:
- Respond ONLY with the JSON object
- NO explanation before or after JSON
- NO markdown code fences (no \`\`\`json)
- NO trailing commas
- priceMRP must be integer and higher than priceRytu`

// ─────────────────────────────────────
// USER PROMPT
// ─────────────────────────────────────
const USER_PROMPT = `Analyze the crop photo and return a complete disease 
diagnosis report.

Study the image carefully first:
- Identify the crop type
- Note visible symptoms on leaves, stems, fruits
- Estimate percentage of plant affected
- Observe leaf texture, color, curl pattern

Return ONLY this JSON — no text before, no text after, no code fences:

{
  "disease": "Full scientific disease name",
  "teluguName": "స్థానిక AP రైతు పదం తప్పనిసరి (బొబ్బర వంటివి)",
  "confidence": "80-92% range only",
  "severity": "Low or Medium or High or Critical",
  "spread": "Low or Medium or High",
  "treatWithin": "48 గంటల్లో (within 48 hours)",
  "healthy": false,
  "whatIsThis": "2-3 sentence scientific explanation in English",
  "whatIsThisTelugu": "2-3 వాక్యాలు సరళమైన AP తెలుగులో",
  "symptomsFound": "EXACTLY 5 numbered symptoms visible in THIS photo only",
  "symptomsFoundTelugu": "సరిగ్గా 5 లక్షణాలు నంబర్లతో తెలుగులో",
  "prevention": "EXACTLY 8 numbered prevention tips in English",
  "preventionTelugu": "సరిగ్గా 8 నివారణ చర్యలు (వయారిభామ + అడ్డు పంటలు తప్పనిసరి)",
  "teluguSummary": "అన్నదాతా నమస్కారం! తో మొదలు. 3-4 వాక్యాలు రైతు భాషలో. ధైర్యంగా ఉండండి, మీ పంట కోలుకుంటుంది! 🌱 తో ముగింపు.",
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

Self-check before responding:
- JSON valid, no trailing commas ✓
- All doses from mandatory table ✓
- Telugu is natural AP farmer language ✓
- Symptoms from THIS photo specifically ✓
- priceMRP > priceRytu (both integers) ✓
- Exactly 4 pesticides ✓
- Exactly 5 symptoms, 8 prevention tips ✓
- teluguSummary starts and ends correctly ✓`

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
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      errors.push(`Missing field: ${field}`)
    }
  })

  if (!Array.isArray(data.pesticides) || data.pesticides.length !== 4) {
    errors.push(`Pesticides: expected 4, got ${data.pesticides?.length}`)
  }

  if (Array.isArray(data.pesticides)) {
    data.pesticides.forEach((p, i) => {
      const num = i + 1
      if (!p.name)        errors.push(`Pesticide ${num}: missing name`)
      if (!p.brand)       errors.push(`Pesticide ${num}: missing brand`)
      if (!p.usage)       errors.push(`Pesticide ${num}: missing usage`)
      if (!p.usageTelugu) errors.push(`Pesticide ${num}: missing usageTelugu`)
      if (!p.icon)        errors.push(`Pesticide ${num}: missing icon`)
      if (typeof p.priceMRP !== 'number' || typeof p.priceRytu !== 'number') {
        errors.push(`Pesticide ${num}: prices must be numbers`)
      } else if (p.priceMRP <= p.priceRytu) {
        errors.push(`Pesticide ${num}: priceMRP must be > priceRytu`)
      }
      if (p.priceMRP % 1 !== 0) errors.push(`Pesticide ${num}: priceMRP must be integer`)
      if (p.priceRytu % 1 !== 0) errors.push(`Pesticide ${num}: priceRytu must be integer`)
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

  const validSpread = ['Low', 'Medium', 'High']
  if (!validSpread.includes(data.spread)) {
    errors.push(`Invalid spread: ${data.spread}`)
  }

  const totalFields = required.length + 5
  const score = Math.min(
    Math.round(((totalFields - errors.length) / totalFields) * 100),
    100
  )

  return { valid: errors.length === 0, errors, score }
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
    symptomsFound: '1. Image quality insufficient\n2. Retake in natural daylight\n3. Show close-up of affected leaf\n4. Include healthy and affected areas\n5. Avoid blur and shadows',
    symptomsFoundTelugu: '1. ఫోటో నాణ్యత తక్కువగా ఉంది\n2. సూర్యకాంతిలో మళ్ళీ తీయండి\n3. తెగులు సోకిన ఆకు దగ్గరగా చూపండి\n4. ఆరోగ్యకరమైన మరియు రోగగ్రస్త భాగాలు చూపండి\n5. అస్పష్టత తగ్గించండి',
    prevention: '1. Take clear close-up photos\n2. Use natural daylight\n3. Show affected plant parts\n4. Avoid shadows\n5. Multiple angles\n6. Clean lens\n7. Hold camera steady\n8. Include healthy areas too',
    preventionTelugu: '1. స్పష్టమైన దగ్గరి ఫోటోలు తీయండి\n2. సహజ వెలుతురు ఉపయోగించండి\n3. తెగులు సోకిన భాగాలు చూపండి\n4. నీడలు తగ్గించండి\n5. వివిధ కోణాల నుండి తీయండి\n6. లెన్స్ శుభ్రం చేయండి\n7. కెమెరా స్థిరంగా పట్టుకోండి\n8. ఆరోగ్యకరమైన భాగాలు కూడా చేర్చండి',
    teluguSummary: 'అన్నదాతా నమస్కారం! మీ ఫోటో స్పష్టంగా లేదు. మంచి సూర్యకాంతిలో మళ్ళీ ఫోటో తీసి పంపండి. ధైర్యంగా ఉండండి, మీ పంట కోలుకుంటుంది! 🌱',
    pesticides: [],
    images_count: imageCount
  }
}

// ─────────────────────────────────────
// MAIN DETECT DISEASE FUNCTION
// Called from detection.js route
// imageBlocks = array of Claude image blocks
// ─────────────────────────────────────
async function detectDisease(imageBlocks) {
  try {
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    })

    console.log(`🔍 RytuAI: Analyzing ${imageBlocks.length} image(s) with Claude...`)

    // Build content array — images first then prompt
    const content = [
      ...imageBlocks,  // image blocks already in correct Claude format
      {
        type: 'text',
        text: USER_PROMPT
      }
    ]

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,  // ← correct Claude parameter
      messages: [
        {
          role: 'user',
          content: content
        }
      ]
    })

    // Extract text from response
    const responseText = response.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('')

    // Clean any accidental markdown fences
    const cleaned = responseText
      .replace(/```json\n?/gi, '')
      .replace(/```\n?/gi, '')
      .trim()

    // Parse JSON
    const parsed = JSON.parse(cleaned)

    // Add image count
    parsed.images_count = imageBlocks.length

    // Validate response quality
    const validation = validateScanResponse(parsed)

    if (!validation.valid) {
      console.warn('⚠️ Validation warnings:', validation.errors)
    }

    console.log(`✅ Claude scan complete: ${parsed.disease}`)
    console.log(`📊 Confidence: ${parsed.confidence} | Severity: ${parsed.severity}`)
    console.log(`🎯 Quality score: ${validation.score}%`)
    console.log(`💰 Tokens used: ${response.usage.input_tokens} in / ${response.usage.output_tokens} out`)

    return parsed

  } catch(err) {
    console.log('❌ Claude detection error:', err.message)

    // Return fallback — do not crash the app
    return getFallbackResponse(imageBlocks.length)
  }
}

module.exports = { detectDisease, validateScanResponse }