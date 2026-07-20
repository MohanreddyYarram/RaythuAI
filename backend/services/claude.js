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
- Mites = నల్లి పురుగు

Real AP expressions to use:
మొండిబారిపోతుంది, చేనంతటినీ పాడుచేస్తుంది, పుంజుకుంటుంది,
పదును తగ్గకుండా, రక్షణ గోడలాగా, ఆందోళన అక్కరలేదు

ALWAYS start teluguSummary: "అన్నదాతా నమస్కారం!"
ALWAYS end teluguSummary: "ధైర్యంగా ఉండండి, మీ పంట కోలుకుంటుంది! 🌱"

⚠️ MANDATORY DOSAGE TABLE — NEVER DEVIATE — FARMER SAFETY:
Imidacloprid 17.8% SL = 0.3 ml per liter (NOT 0.5ml)
Thiamethoxam 25% WG = 0.2 g per liter
Acetamiprid 20% SP = 0.2 g per liter
Diafenthiuron 50% WP = 1.25 g per liter
Fipronil 5% SC = 1.5 ml per liter (NOT 2.0ml)
Spiromesifen 22.9% SC = 0.5 ml per liter
Spinosad 45% SC = 0.3 ml per liter
Profenofos 50% EC = 2.0 ml per liter
Chlorpyrifos 20% EC = 2.5 ml per liter
Cypermethrin 10% EC = 1.0 ml per liter
Mancozeb 75% WP = 2.5 g per liter
Copper Oxychloride 50% WP = 3.0 g per liter
Carbendazim 50% WP = 1.0 g per liter
Hexaconazole 5% EC = 2.0 ml per liter
Propiconazole 25% EC = 1.0 ml per liter
Azadirachtin/Neem 1% = 3.0 ml per liter

FIELD SIZE DOSAGE RULES (when land_acres provided):
- Standard spray volume = 200 liters per acre
- Calculate total pesticide needed = dose_per_liter × 200 × land_acres
- Always show both: per-liter dose AND total quantity for the field
- Example: "0.3 ml/liter → 120 ml total for 2 acres (400 liters water)"

OUTPUT RULES — CRITICAL:
- Respond ONLY with the JSON object
- NO explanation before or after JSON
- NO markdown code fences (no \`\`\`json)
- NO trailing commas
- priceMRP must be integer and higher than priceRytu`

// ─────────────────────────────────────
// BUILD USER PROMPT — now accepts field context
// FIX 1: confidence is now a real integer (not a hardcoded range string)
// FIX 2: land_acres passed in so dosage is field-size aware
// ─────────────────────────────────────
function buildUserPrompt(fieldContext) {
  const fieldSection = fieldContext
    ? `\nFIELD CONTEXT (use this for dosage calculations):
- Field size: ${fieldContext.land_acres} acres
- Crop: ${fieldContext.crop_type}
- Village: ${fieldContext.village || 'Not specified'}
- Sowing date: ${fieldContext.sowing_date || 'Not specified'}
- Soil type: ${fieldContext.soil_type || 'Not specified'}
- Irrigation: ${fieldContext.irrigation_type || 'Not specified'}

For each pesticide, calculate TOTAL quantity needed for ${fieldContext.land_acres} acres.
Formula: dose_per_liter × 200 liters/acre × ${fieldContext.land_acres} acres = total ml or grams needed.\n`
    : ''

  return `Analyze the crop photo and return a complete disease diagnosis report.
${fieldSection}
Study the image carefully first:
- Identify the crop type
- Note visible symptoms on leaves, stems, fruits
- Estimate percentage of plant affected
- Observe leaf texture, color, curl pattern

⚠️ CONFIDENCE SCORE RULES — CRITICAL:
- confidence must be an INTEGER between 0 and 100
- Score based on actual image quality and how clearly you can identify the disease
- Clear close-up, good lighting, obvious symptoms = 85–95
- Partial symptoms, moderate quality = 65–84
- Blurry, dark, unclear, or non-plant image = 20–50
- If you cannot identify a plant at all = below 30
- DO NOT hardcode confidence. Assess honestly per image.

Return ONLY this JSON — no text before, no text after, no code fences:

{
  "disease": "Full scientific disease name",
  "teluguName": "స్థానిక AP రైతు పదం తప్పనిసరి (బొబ్బర వంటివి)",
  "confidence": 85,
  "severity": "Low or Medium or High or Critical",
  "spread": "Low or Medium or High",
  "treatWithin": "48 గంటల్లో (within 48 hours)",
  "healthy": false,
  "imageQuality": "Good or Fair or Poor",
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
      "usage": "Exact dose per liter from table + total quantity for field if acres known + method + timing + repeat interval",
      "usageTelugu": "తెలుగులో వాడకం విధానం — ఎకరాకు మొత్తం పరిమాణం సహా",
      "priceMRP": 0,
      "priceRytu": 0,
      "icon": "🧴 or 💊 or 🔬 or 🌱"
    }
  ]
}

Self-check before responding:
- confidence is an integer, honestly assessed per image quality ✓
- imageQuality is "Good", "Fair", or "Poor" ✓
- JSON valid, no trailing commas ✓
- All doses from mandatory table ✓
- Telugu is natural AP farmer language ✓
- Symptoms from THIS photo specifically ✓
- priceMRP > priceRytu (both integers) ✓
- Exactly 4 pesticides ✓
- Exactly 5 symptoms, 8 prevention tips ✓
- teluguSummary starts and ends correctly ✓
- Field-size total dosage included in usage if acres provided ✓`
}

// ─────────────────────────────────────
// RESPONSE VALIDATOR
// FIX 1: confidence is now validated as integer 0–100
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
      if (!p.name) errors.push(`Pesticide ${num}: missing name`)
      if (!p.brand) errors.push(`Pesticide ${num}: missing brand`)
      if (!p.usage) errors.push(`Pesticide ${num}: missing usage`)
      if (!p.usageTelugu) errors.push(`Pesticide ${num}: missing usageTelugu`)
      if (!p.icon) errors.push(`Pesticide ${num}: missing icon`)
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

  // FIX 1: confidence must be integer 0–100
  if (data.confidence !== undefined) {
    if (typeof data.confidence !== 'number' || !Number.isInteger(data.confidence)) {
      errors.push(`Confidence must be an integer, got: ${data.confidence}`)
    } else if (data.confidence < 0 || data.confidence > 100) {
      errors.push(`Confidence ${data.confidence} outside 0–100 range`)
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

  const validImageQuality = ['Good', 'Fair', 'Poor']
  if (data.imageQuality && !validImageQuality.includes(data.imageQuality)) {
    errors.push(`Invalid imageQuality: ${data.imageQuality}`)
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
    confidence: 0,
    imageQuality: 'Poor',
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
// FIX 2: now accepts optional fieldContext for land_acres aware dosage
// ─────────────────────────────────────
async function detectDisease(imageBlocks, fieldContext = null) {
  try {
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    })

    console.log(`🔍 RytuAI: Analyzing ${imageBlocks.length} image(s) with Claude...`)
    if (fieldContext) {
      console.log(`🌾 Field context: ${fieldContext.land_acres} acres, ${fieldContext.crop_type}`)
    }

    const content = [
      ...imageBlocks,
      {
        type: 'text',
        text: buildUserPrompt(fieldContext) // FIX 2: field-aware prompt
      }
    ]

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: content
        }
      ]
    })

    const responseText = response.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('')

    const cleaned = responseText
      .replace(/```json\n?/gi, '')
      .replace(/```\n?/gi, '')
      .trim()

    const parsed = JSON.parse(cleaned)

    // Ensure confidence is integer (handle if Claude returns string)
    if (typeof parsed.confidence === 'string') {
      parsed.confidence = parseInt(parsed.confidence) || 0
    }

    parsed.images_count = imageBlocks.length
    parsed.field_context = fieldContext ? {
      land_acres: fieldContext.land_acres,
      crop_type: fieldContext.crop_type
    } : null

    const validation = validateScanResponse(parsed)

    if (!validation.valid) {
      console.warn('⚠️ Validation warnings:', validation.errors)
    }

    console.log(`✅ Claude scan complete: ${parsed.disease}`)
    console.log(`📊 Confidence: ${parsed.confidence}% | Image Quality: ${parsed.imageQuality} | Severity: ${parsed.severity}`)
    console.log(`🎯 Quality score: ${validation.score}%`)
    console.log(`💰 Tokens used: ${response.usage.input_tokens} in / ${response.usage.output_tokens} out`)

    return parsed

  } catch(err) {
    console.log('❌ Claude detection error:', err.message)
    return getFallbackResponse(imageBlocks.length)
  }
}

module.exports = { detectDisease, validateScanResponse }

