const AppError = require('../utils/appError')
const { createQuestion, listQuestions } = require('../services/questionStore')

async function getQuestions(req, res) {
  const questions = await listQuestions({
    subject: req.query.subject,
    grade: req.query.grade,
    difficulty: req.query.difficulty,
    topic: req.query.topic,
  })

  res.json({
    success: true,
    questions,
  })
}

async function addQuestion(req, res) {
  const {
    subject,
    grade,
    topic,
    difficulty,
    question,
    options,
    answer,
    explanation,
    author,
    createdBy,
  } = req.body

  if (!subject || !grade || !topic || !difficulty || !question || !author) {
    throw new AppError('Thieu thong tin cau hoi bat buoc.', 400)
  }

  if (!Array.isArray(options) || options.length < 2) {
    throw new AppError('Danh sach dap an khong hop le.', 400)
  }

  if (!answer) {
    throw new AppError('Thieu dap an dung.', 400)
  }

  const savedQuestion = await createQuestion({
    subject: String(subject).trim(),
    grade: String(grade).trim(),
    topic: String(topic).trim(),
    difficulty: String(difficulty).trim(),
    question: String(question).trim(),
    options: options.map((item) => String(item).trim()),
    answer: String(answer).trim(),
    explanation: explanation ? String(explanation).trim() : '',
    author: String(author).trim(),
    createdBy: createdBy ? Number(createdBy) : null,
  })

  res.status(201).json({
    success: true,
    message: 'Them cau hoi thanh cong.',
    question: savedQuestion,
  })
}

module.exports = {
  addQuestion,
  getQuestions,
}
