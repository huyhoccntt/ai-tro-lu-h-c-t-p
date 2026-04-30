const { testDatabaseConnection } = require('../db/pool')

async function health(req, res) {
  const db = await testDatabaseConnection()

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: db,
  })
}

module.exports = {
  health,
}
