
const express = require('express')
const router = express.Router()



app.get('/feed/news', async (req, res) => {
  try {
    const NEWS_API_KEY = process.env.NEWS_API_KEY
    if (!NEWS_API_KEY) {
      return res.status(200).json({ articles: [] })
    }
    const url = `https://newsapi.org/v2/everything?q=andhra+pradesh+agriculture+chilli+farmer&language=te&sortBy=publishedAt&pageSize=8&apiKey=${NEWS_API_KEY}`
    const response = await fetch(url)
    const data = await response.json()
    if (data.articles) {
      return res.status(200).json({ articles: data.articles })
    }
    res.status(200).json({ articles: [] })
  } catch(err) {
    res.status(200).json({ articles: [] })
  }
})