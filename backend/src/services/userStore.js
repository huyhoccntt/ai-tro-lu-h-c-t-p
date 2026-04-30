const bcrypt = require('bcryptjs')
const { requirePool } = require('../db/pool')

async function findUserByEmail(email) {
  const normalizedEmail = email.toLowerCase()
  const pool = requirePool()
  const result = await pool.query(
    `
      select
        id,
        name,
        email,
        password_hash,
        role,
        avatar,
        school,
        class_name,
        teaching_grade,
        rank,
        teacher_status,
        login_days,
        posts_count,
        status,
        created_at,
        updated_at
      from users
      where email = $1
      limit 1
    `,
    [normalizedEmail],
  )

  return result.rows[0] || null
}

async function findUserById(userId) {
  const pool = requirePool()
  const result = await pool.query(
    `
      select
        id,
        name,
        email,
        password_hash,
        role,
        avatar,
        school,
        class_name,
        teaching_grade,
        rank,
        teacher_status,
        login_days,
        posts_count,
        status,
        created_at,
        updated_at
      from users
      where id = $1
      limit 1
    `,
    [userId],
  )

  return result.rows[0] || null
}

async function createUser({ name, email, password, role }) {
  const normalizedEmail = email.toLowerCase()
  const passwordHash = await bcrypt.hash(password, 10)
  const avatar = `https://ui-avatars.com/api/?background=0284c7&color=fff&name=${encodeURIComponent(name)}`
  const pool = requirePool()

  const result = await pool.query(
    `
      insert into users (
        name,
        email,
        password_hash,
        role,
        avatar,
        teacher_status,
        rank,
        status
      )
      values ($1, $2, $3, $4, $5, $6, $7, 'active')
      returning
        id,
        name,
        email,
        role,
        avatar,
        school,
        class_name,
        teaching_grade,
        rank,
        teacher_status,
        login_days,
        posts_count,
        status,
        created_at,
        updated_at
    `,
    [
      name.trim(),
      normalizedEmail,
      passwordHash,
      role,
      avatar,
      role === 'teacher' ? 'active' : null,
      role === 'student' ? 'Top 5%' : null,
    ],
  )

  return result.rows[0]
}

async function updateUserProfile(userId, payload) {
  const pool = requirePool()
  const result = await pool.query(
    `
      update users
      set
        name = coalesce($2, name),
        school = coalesce($3, school),
        class_name = coalesce($4, class_name),
        teaching_grade = coalesce($5, teaching_grade),
        rank = coalesce($6, rank),
        teacher_status = coalesce($7, teacher_status),
        updated_at = now()
      where id = $1
      returning
        id,
        name,
        email,
        role,
        avatar,
        school,
        class_name,
        teaching_grade,
        rank,
        teacher_status,
        login_days,
        posts_count,
        status,
        created_at,
        updated_at
    `,
    [
      userId,
      payload.name,
      payload.school,
      payload.className,
      payload.teachingGrade,
      payload.rank,
      payload.teacherStatus,
    ],
  )

  return result.rows[0] || null
}

async function verifyUserCredentials(email, password) {
  const user = await findUserByEmail(email)

  if (!user) {
    return null
  }

  const isValid = await bcrypt.compare(password, user.password_hash)
  return isValid ? user : null
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  updateUserProfile,
  verifyUserCredentials,
}
