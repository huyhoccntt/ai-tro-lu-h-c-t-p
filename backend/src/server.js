const app = require('./app')
const env = require('./config/env')

app.listen(env.port, () => {
  console.log(`StudyMate AI backend is running on http://localhost:${env.port}`)
})
