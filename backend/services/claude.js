// ══════════════════════════════════════
// backend/services/claude.js
// Replace your existing claude.js
// ══════════════════════════════════════

const Anthropic = require('@anthropic-ai/sdk')

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

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

module.exports = { detectDisease }