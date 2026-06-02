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
  "whatIsThis": "Clear explanation of the disease in English.",
  "whatIsThisTelugu": "తెలుగులో వ్యాధి గురించి స్పష్టమైన వివరణ.",
  "symptomsFound": "Symptoms visible in the uploaded photos in English.",
  "symptomsFoundTelugu": "అప్లోడ్ చేసిన ఫోటోలలో కనిపించే లక్షణాలు తెలుగులో.",
  "prevention": "Prevention and future protection tips in English.",
  "preventionTelugu": "తెలుగులో నివారణ మరియు భవిష్యత్తులో రక్షణ చర్యలు.",
  "teluguSummary": "రైతుకు సులభంగా అర్థమయ్యే విధంగా తెలుగులో పూర్తి సారాంశం - వ్యాధి ఏమిటి, ఎంత తీవ్రమైనది, వెంటనే ఏమి చేయాలి.",
  "pesticides": [
    {
      "name": "Pesticide name in English",
      "brand": "Brand name",
      "usage": "How to use — dosage and method in English",
      "usageTelugu": "వాడే విధానం తెలుగులో — మోతాదు మరియు పద్ధతి",
      "priceRytu": 200,
      "priceMRP": 280,
      "icon": "🧴"
    }
  ]
}`

  try {
    console.log('Calling Claude...')
    console.log('API Key exists:', !!process.env.ANTHROPIC_API_KEY)
    console.log('Image blocks count:', imageBlocks.length)

    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
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
    const result = JSON.parse(clean)
    return result

  } catch (err) {
    console.log('Claude Error:', err.message)
    throw err
  }
}

module.exports = { detectDisease }