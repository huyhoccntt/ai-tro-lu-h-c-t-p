const express = require('express')
const cors = require('cors')
const path = require('path')
const env = require('./config/env')
const authRoutes = require('./routes/authRoutes')
const chatRoutes = require('./routes/chatRoutes')
const healthRoutes = require('./routes/healthRoutes')
const questionRoutes = require('./routes/questionRoutes')
const { login, register } = require('./controllers/authController')
const { addQuestion } = require('./controllers/questionController')
const asyncHandler = require('./utils/asyncHandler')
const errorHandler = require('./middleware/errorHandler')

const app = express()
const allowedOrigins = new Set([
  env.clientOrigin,
  'http://localhost',
  'http://127.0.0.1',
  `http://localhost:${env.port}`,
  `http://127.0.0.1:${env.port}`,
])

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true)
        return
      }

      callback(new Error('Origin not allowed by CORS'))
    },
    credentials: true,
  }),
)
app.use(express.json({ limit: '10mb' }))
app.use(express.static(path.join(process.cwd())))

app.use('/api/auth', authRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/questions', questionRoutes)
app.use('/health', healthRoutes)

// Legacy aliases so old HTML forms can still call the original endpoints.
app.post('/api/register', asyncHandler(register))
app.post('/api/login', asyncHandler(login))
app.post('/api/add-question', asyncHandler(addQuestion))

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint khong ton tai.',
  })
})

app.use(errorHandler)

module.exports = app
