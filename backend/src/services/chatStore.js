const { requirePool } = require('../db/pool')

function buildSessionTitle(question) {
  return question.length > 80 ? `${question.slice(0, 77)}...` : question
}

async function createSession(userId, title) {
  const pool = requirePool()
  const result = await pool.query(
    `
      insert into chat_sessions (user_id, title)
      values ($1, $2)
      returning id, user_id, title, created_at
    `,
    [userId, title],
  )

  return result.rows[0]
}

async function addMessage(sessionId, role, content) {
  const pool = requirePool()
  const result = await pool.query(
    `
      insert into messages (session_id, role, content)
      values ($1, $2, $3)
      returning id, session_id, role, content, created_at
    `,
    [sessionId, role, content],
  )

  return result.rows[0]
}

async function saveConversation({ userId, question, answer, sessionId }) {
  let activeSessionId = sessionId

  if (!activeSessionId) {
    const session = await createSession(userId, buildSessionTitle(question))
    activeSessionId = session.id
  }

  await addMessage(activeSessionId, 'user', question)
  await addMessage(activeSessionId, 'ai', answer)

  return activeSessionId
}

async function listChatHistory(userId) {
  const pool = requirePool()
  const result = await pool.query(
    `
      select
        s.id as session_id,
        s.title,
        s.created_at as session_created_at,
        m.id as message_id,
        m.role,
        m.content,
        m.created_at as message_created_at
      from chat_sessions s
      left join messages m on m.session_id = s.id
      where s.user_id = $1
      order by s.created_at desc, m.created_at asc, m.id asc
    `,
    [userId],
  )

  const sessions = new Map()
  for (const row of result.rows) {
    if (!sessions.has(row.session_id)) {
      sessions.set(row.session_id, {
        id: row.session_id,
        title: row.title,
        createdAt: row.session_created_at,
        question: '',
        preview: '',
        fullAnswer: '',
        messages: [],
      })
    }

    const session = sessions.get(row.session_id)
    if (!row.message_id) {
      continue
    }

    session.messages.push({
      id: row.message_id,
      role: row.role,
      content: row.content,
      createdAt: row.message_created_at,
    })

    if (row.role === 'user' && !session.question) {
      session.question = row.content
    }

    if (row.role === 'ai') {
      session.fullAnswer = row.content
      session.preview = row.content.slice(0, 80) + (row.content.length > 80 ? '...' : '')
    }
  }

  return Array.from(sessions.values())
}

async function clearChatHistory(userId) {
  const pool = requirePool()
  await pool.query('delete from chat_sessions where user_id = $1', [userId])
}

module.exports = {
  clearChatHistory,
  listChatHistory,
  saveConversation,
}
