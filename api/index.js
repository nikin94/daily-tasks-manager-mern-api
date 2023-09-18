require('dotenv').config()

const { PORT, MONGO_URI, NODE_ENV, FRONTEND_URI } = process.env
const isDev = NODE_ENV === 'development'
console.log(NODE_ENV + ' mode')

const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const taskRoutes = require('../routes/tasks')
const userRoutes = require('../routes/user')

// express app
const app = express()

app.use(
  cors({
    origin: [isDev ? 'http://localhost:3000' : FRONTEND_URI],
    methods: ['POST', 'GET', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true
  })
)

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  next()
})

// middleware
app.use(express.json())

//routes
app.get('/', async (req, res) => res.send('hello'))
app.use('/api/tasks', taskRoutes)
app.use('/api/user', userRoutes)

// connect to db
mongoose
  .connect(`${MONGO_URI}`)
  .then(() => {
    if (!isDev) return

    // listen for requests
    app.listen(PORT, () => {
      console.log('connected to db & listening port', PORT)
    })
  })
  .catch(error => {
    console.log(error)
  })

module.exports = app
