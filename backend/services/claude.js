process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const Anthropic = require('@anthropic-ai/sdk')
 
//const Anthropic = require('@anthropic-ai/sdk')
 
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})
 
async function detectDisease(imageBlocks) {
 
  const prompt = "You are an expert agricultural scientist specializing in chilli crops in Andhra Pradesh India. Analyze these crop photos and respond ONLY with valid JSON in this exact format with no other text: {\"disease\": \"name\", \"teluguName\": \"telugu name\", \"confidence\": \"90%\", \"severity\": \"High\", \"spread\": \"Active\", \"treatWithin\": \"48 hours\", \"healthy\": false, \"whatIsThis\": \"explanation here\", \"symptomsFound\": \"symptoms here\", \"prevention\": \"prevention tips\", \"pesticides\": [{\"name\": \"pesticide name\", \"brand\": \"brand\", \"priceRytu\": 200, \"priceMRP\": 280, \"icon\": \"🧴\"}]}"
 
  try {
    console.log('Calling Claude...')
    console.log('API Key exists:', !!process.env.ANTHROPIC_API_KEY)
    console.log('Image blocks count:', imageBlocks.length)
 
    const response = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            ...imageBlocks,
            {
              type: 'text',
              text: prompt
            }
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