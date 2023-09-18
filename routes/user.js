const express = require('express')
const {
  loginUser,
  recoverPassword,
  resetPassword,
  signupUser
} = require('../controllers/userController')

const router = express.Router()

//register a new user
router.post('/signup', signupUser)

//user login
router.post('/login', loginUser)

//password recovery
router.post('/recover-password', recoverPassword)

//password reset
router.post('/reset-password', resetPassword)

module.exports = router
