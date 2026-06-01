
const jwt = require('jsonwebtoken')
const express = require('express')
const router = express.Router()
const multer = require('multer')
const claude = require('../services/claude')
 
const upload = multer({ storage: multer.memoryStorage() })
 
router.post('/', upload.array('photos', 4), async (req, res) => {
  console.log('=== DETECT ROUTE HIT ===')
   //Check if the farmer is logged in
   const authHeader = req.headers.authorization
   if(!authHeader || !authHeader.startsWith('Bearer')){
    return res.status(401).json({
        message:'Please login to use disease detection'
    })
   }
   const token = authHeader.split(' ')[1]
   try{
    jwt.verify(token,process.env.JWT_SECRET)
   }catch(err){
    return res.status(401).json({
        message:'Session expired. Please login again'
    })
   }
  
  try {
    console.log('Files count:', req.files ? req.files.length : 0)
    
    if (!req.files || req.files.length < 1) {
      return res.status(400).json({ message: 'Please upload atleast one image' })
    }
 
    console.log('Building image blocks...')
    
    const imageBlocks = req.files.map(file => ({
      type: 'image',
      source: {
        type: 'base64',
        media_type: file.mimetype,
        data: file.buffer.toString('base64')
      }
    }))
 
    console.log('Image blocks built:', imageBlocks.length)
    console.log('Calling Claude...')
 
    const result = await claude.detectDisease(imageBlocks)
    
    console.log('Got result from Claude!')
 
    res.status(200).json({
      message: 'Detection Complete',
      result: result
    })
 
  } catch (err) {
    console.log('ERROR:', err.message)
    res.status(500).json({
      message: 'Detection failed',
      error: err.message
    })
  }
})
 
module.exports = router
 