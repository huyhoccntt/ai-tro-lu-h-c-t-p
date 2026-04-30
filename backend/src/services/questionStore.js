const { requirePool } = require('../db/pool')

function normalizeQuestion(row) {
  return {
    id: row.id,
    subject: row.subject,
    grade: row.grade,
    topic: row.topic,
    difficulty: row.difficulty,
    question: row.question,
    options: Array.isArray(row.options) ? row.options : [],
    answer: row.answer,
    explanation: row.explanation,
    author: row.author,
    createdBy: row.created_by,
    createdAt: row.created_at,
  }
}

async function listQuestions(filters = {}) {
  const pool = requirePool()
  const clauses = []
  const values = []

  if (filters.subject) {
    values.push(filters.subject)
    clauses.push(`subject = $${values.length}`)
  }

  if (filters.grade) {
    values.push(filters.grade)
    clauses.push(`grade = $${values.length}`)
  }

  if (filters.difficulty) {
    values.push(filters.difficulty)
    clauses.push(`difficulty = $${values.length}`)
  }

  if (filters.topic) {
    values.push(`%${filters.topic.toLowerCase()}%`)
    clauses.push(`(lower(topic) like $${values.length} or lower(question) like $${values.length})`)
  }

  const whereClause = clauses.length ? `where ${clauses.join(' and ')}` : ''
  const result = await pool.query(
    `
      select
        id,
        subject,
        grade,
        topic,
        difficulty,
        question,
        options,
        answer,
        explanation,
        author,
        created_by,
        created_at
      from quiz_questions
      ${whereClause}
      order by created_at desc, id desc
    `,
    values,
  )

  return result.rows.map(normalizeQuestion)
}

async function createQuestion(payload) {
  const pool = requirePool()
  const result = await pool.query(
    `
      insert into quiz_questions (
        subject,
        grade,
        topic,
        difficulty,
        question,
        options,
        answer,
        explanation,
        author,
        created_by
      )
      values ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9, $10)
      returning
        id,
        subject,
        grade,
        topic,
        difficulty,
        question,
        options,
        answer,
        explanation,
        author,
        created_by,
        created_at
    `,
    [
      payload.subject,
      payload.grade,
      payload.topic,
      payload.difficulty,
      payload.question,
      JSON.stringify(payload.options),
      payload.answer,
      payload.explanation || null,
      payload.author,
      payload.createdBy || null,
    ],
  )

  return normalizeQuestion(result.rows[0])
}

module.exports = {
  createQuestion,
  listQuestions,
}
