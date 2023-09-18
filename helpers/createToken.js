const jwt = require('jsonwebtoken')

const createToken = (_id, expiresIn = '3d') =>
  jwt.sign({ _id }, `${process.env.SECRET}`, { expiresIn })

module.exports = createToken
