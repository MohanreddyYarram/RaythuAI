const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'rytuai2024secret'

function authenticateToken(req, res, next) {
  var authHeader = req.headers['authorization']
  var token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Access denied. Please login.' })
  }

  try {
    var decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch(err) {
    return res.status(401).json({ message: 'Invalid or expired token. Please login again.' })
  }
}

module.exports = authenticateToken