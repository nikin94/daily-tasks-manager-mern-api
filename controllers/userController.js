const User = require('../models/userModel')
const createToken = require('../helpers/createToken')

// login
const loginUser = async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await User.login(email, password)

    // create a token
    const token = createToken(user._id)

    res.status(200).json({ email, token })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// register a new user
const signupUser = async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await User.signup(email, password)

    // create a token
    const token = createToken(user._id)

    res.status(200).json({ email, token })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// password recovery
const recoverPassword = async (req, res) => {
  const { email } = req.body

  try {
    const success = await User.recoverPassword(email)
    res.status(200).json({ success })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// password reset
const resetPassword = async (req, res) => {
  const { password, userId, token } = req.body

  try {
    const user = await User.resetPassword(password, userId, token)
    res.status(200).json({ user })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

module.exports = {
  signupUser,
  loginUser,
  recoverPassword,
  resetPassword
}
