const axios = require('axios')
const env = require('../config/env')
const AppError = require('../utils/appError')

async function askGemini(question) {
  if (!env.geminiApiKey) {
    throw new AppError('Chua cau hinh GEMINI_API_KEY trong .env.', 500)
  }

  const endpoint = env.geminiApiUrl

  const response = await axios.post(
    endpoint,
    {
      contents: [
        {
          parts: [
            {
              text: [
                'Ban la tro ly hoc tap bang tieng Viet.',
                'Hay giai thich ro rang, de hieu, uu tien cach hoc theo buoc.',
                `Cau hoi: ${question}`,
              ].join('\n'),
            },
          ],
        },
      ],
    },
    {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000,
    },
  )

  const answer = response.data?.candidates?.[0]?.content?.parts?.[0]?.text
  return answer || 'Minh chua tao duoc cau tra loi phu hop. Ban thu dat cau hoi cu the hon nhe.'
}

module.exports = {
  askGemini,
}
