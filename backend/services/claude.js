// ══════════════════════════════════════
// backend/services/claude.js
// Replace your existing claude.js
// ══════════════════════════════════════

const Anthropic = require('@anthropic-ai/sdk')

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

async function detectDisease(imageBlocks) {
  const prompt = `You are an expert agricultural scientist for chilli crops in Andhra Pradesh India. Analyze these crop photos and respond ONLY with this exact JSON, no other text:
{"disease":"name","teluguName":"తెలుగు పేరు","confidence":"85%","severity":"High","spread":"Active","treatWithin":"48 hours","healthy":false,"whatIsThis":"Brief English explanation","whatIsThisTelugu":"తెలుగు వివరణ","symptomsFound":"English symptoms","symptomsFoundTelugu":"తెలుగు లక్షణాలు","prevention":"English prevention","preventionTelugu":"తెలుగు నివారణ","teluguSummary":"తెలుగులో సారాంశం","pesticides":[{"name":"name","brand":"brand","usage":"English usage","usageTelugu":"తెలుగు వాడకం","priceRytu":200,"priceMRP":280,"icon":"🧴"}]}`

  try {
    console.log('Calling Claude...')
    console.log('API Key exists:', !!process.env.ANTHROPIC_API_KEY)
    console.log('Image blocks count:', imageBlocks.length)

    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 4096,
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
  console.log('JSON parse failed, trying to extract...')
  // Try to extract valid JSON
  const jsonMatch = clean.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    // Fix truncated JSON by completing it
    let jsonStr = jsonMatch[0]
    try {
      result = JSON.parse(jsonStr)
    } catch(e) {
      // Force close unclosed JSON
      jsonStr = jsonStr.replace(/,\s*$/, '') + ']}}'
      try {
        result = JSON.parse(jsonStr)
      } catch(e2) {
        throw new Error('Cannot parse Claude response: ' + parseErr.message)
      }
    }
  } else {
    throw new Error('No JSON found in response')
  }
}
return result

  } catch (err) {
    console.log('Claude Error:', err.message)
    throw err
  }
}

module.exports = { detectDisease }