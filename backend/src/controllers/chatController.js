const { askGemini } = require('../services/geminiService')
const { clearChatHistory, listChatHistory, saveConversation } = require('../services/chatStore')
const AppError = require('../utils/appError')

async function chat(req, res) {
  const { question, userId, sessionId } = req.body

  if (!question || !question.trim()) {
    throw new AppError('Vui long nhap cau hoi.', 400)
  }

  const answer = await askGemini(question.trim())
  let savedSessionId = null

  if (userId) {
    savedSessionId = await saveConversation({
      userId: Number(userId),
      question: question.trim(),
      answer,
      sessionId: sessionId ? Number(sessionId) : null,
    })
  }

  res.json({
    success: true,
    answer,
    sessionId: savedSessionId,
  })
}

async function getChatHistory(req, res) {
  const userId = Number(req.query.userId)
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new AppError('User ID khong hop le.', 400)
  }

  const history = await listChatHistory(userId)

  res.json({
    success: true,
    history,
  })
}

async function deleteChatHistory(req, res) {
  const userId = Number(req.query.userId)
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new AppError('User ID khong hop le.', 400)
  }

  await clearChatHistory(userId)

  res.json({
    success: true,
    message: 'Da xoa lich su chat.',
  })
}

module.exports = {
  chat,
  deleteChatHistory,
  getChatHistory,
}
