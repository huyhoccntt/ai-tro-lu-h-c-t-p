const path = require('path')
const dotenv = require('dotenv')

dotenv.config({ path: path.join(process.cwd(), '.env') })

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  geminiApiUrl:
    process.env.GEMINI_API_URL ||
    `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || 'gemini-2.5-flash'}:generateContent?key=${process.env.GEMINI_API_KEY || ''}`,
  jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
  databaseUrl: process.env.DATABASE_URL || '',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
}

env.isProduction = env.nodeEnv === 'production'

module.exports = env
