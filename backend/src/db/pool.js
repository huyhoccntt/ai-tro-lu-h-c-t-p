const { Pool } = require('pg')
const env = require('../config/env')
const AppError = require('../utils/appError')

let pool = null

if (env.databaseUrl) {
  pool = new Pool({
    connectionString: env.databaseUrl,
    ssl: env.isProduction ? { rejectUnauthorized: false } : false,
  })
}

function getPool() {
  return pool
}

function requirePool() {
  if (!pool) {
    throw new AppError('Chua cau hinh DATABASE_URL trong .env de ket noi PostgreSQL.', 500)
  }

  return pool
}

async function testDatabaseConnection() {
  if (!pool) {
    return { connected: false, mode: 'missing-database-url' }
  }

  await pool.query('select now()')
  return { connected: true, mode: 'postgres' }
}

module.exports = {
  getPool,
  requirePool,
  testDatabaseConnection,
}
