const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const recoverPasswordTemplate = require('../mailTemplates/recoverPasswordTemplate')
const createToken = require('../helpers/createToken')

const Schema = mongoose.Schema

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
)

// static signup method
userSchema.statics.signup = async function (email, password) {
  if (!email || !password) throw Error('All fields must be filled')
  if (!validator.isEmail(email)) throw Error('Email is not valid')
  if (!validator.isStrongPassword(password))
    throw Error('Password not strong enough')

  const exists = await this.findOne({ email })
  if (exists) throw Error('Email already in use')

  const salt = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash(password, salt)

  const user = await this.create({ email, password: hash })

  return user
}

// static login method
userSchema.statics.login = async function (email, password) {
  if (!email || !password) throw Error('All fields must be filled')

  const user = await this.findOne({ email })

  if (!user) throw Error('Incorrect email')

  const match = await bcrypt.compare(password, user.password)

  if (!match) throw Error('Incorrect password')

  return user
}

// static recover password method
userSchema.statics.recoverPassword = async function (email) {
  if (!email) throw Error('Please enter an email')
  if (!validator.isEmail(email)) throw Error('Email is not valid')

  const user = await this.findOne({ email })
  if (!user) throw Error('Incorrect email')

  const token = createToken(user._id, '1d')

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.NODEMAILER_EMAIL,
      pass: process.env.NODEMAILER_PASSWORD
    }
  })

  await new Promise((resolve, reject) => {
    // verify connection configuration
    transporter.verify(function (error, success) {
      if (error) {
        console.log(error)
        reject(error)
      } else {
        console.log('Server is ready to take our messages')
        resolve(success)
      }
    })
  })

  const domain =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000/'
      : process.env.FRONTEND_URI
  const link = domain + `reset-password/${user._id}/${token}`

  const mailOptions = {
    from: process.env.NODEMAILER_EMAIL,
    to: user.email,
    subject: 'Reset password',
    html: recoverPasswordTemplate(link)
  }

  await new Promise((resolve, reject) => {
    // send mail
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error(err)
        reject(err)
      } else {
        console.log(info)
        resolve(info)
      }
    })
  })
}

// static recover password method
userSchema.statics.resetPassword = async function (password, userId, token) {
  if (!password) throw Error('Please enter a password')
  if (!validator.isStrongPassword(password))
    throw Error("New password isn't strong enough")

  const { _id } = jwt.verify(token, process.env.SECRET)
  if (userId !== _id)
    throw Error('Authorization failed, try send recovery email again')

  const salt = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash(password, salt)

  const user = await this.findByIdAndUpdate({ _id: userId }, { password: hash })

  return user
}

module.exports = mongoose.model('User', userSchema)
