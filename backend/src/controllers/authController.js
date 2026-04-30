const jwt = require('jsonwebtoken')
const env = require('../config/env')
const {
  createUser,
  findUserByEmail,
  findUserById,
  updateUserProfile,
  verifyUserCredentials,
} = require('../services/userStore')
const AppError = require('../utils/appError')

const validRoles = new Set(['student', 'teacher'])
const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/

function normalizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    school: user.school,
    className: user.class_name || user.className,
    teachingGrade: user.teaching_grade || user.teachingGrade,
    rank: user.rank,
    teacherInfo: user.role === 'teacher'
      ? {
          teacherStatus: user.teacher_status || user.teacherStatus || 'active',
          school: user.school || null,
          grade: user.teaching_grade || user.teachingGrade || null,
        }
      : null,
    teacherStatus: user.teacher_status || user.teacherStatus || null,
    loginDays: user.login_days || user.loginDays || 0,
    postsCount: user.posts_count || user.postsCount || 0,
    status: user.status,
    createdAt: user.created_at || user.createdAt,
  }
}

function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email, role: user.role }, env.jwtSecret, {
    expiresIn: '7d',
  })
}

async function register(req, res) {
  const { name, email, password, role } = req.body

  if (!name || !email || !password || !role) {
    throw new AppError('Thieu thong tin bat buoc.', 400)
  }

  if (!emailRegex.test(email)) {
    throw new AppError('Email khong dung dinh dang.', 400)
  }

  if (password.length < 6) {
    throw new AppError('Mat khau phai co it nhat 6 ky tu.', 400)
  }

  if (!validRoles.has(role)) {
    throw new AppError('Vai tro khong hop le.', 400)
  }

  const existingUser = await findUserByEmail(email)
  if (existingUser) {
    throw new AppError('Email nay da duoc dang ky.', 409)
  }

  const user = await createUser({ name, email, password, role })

  res.status(201).json({
    success: true,
    message: 'Dang ky thanh cong.',
    token: signToken(user),
    user: normalizeUser(user),
  })
}

async function login(req, res) {
  const { email, password } = req.body

  if (!email || !password) {
    throw new AppError('Vui long nhap email va mat khau.', 400)
  }

  const user = await verifyUserCredentials(email, password)
  if (!user) {
    throw new AppError('Thong tin dang nhap khong dung.', 401)
  }

  if (user.status && user.status !== 'active') {
    throw new AppError('Tai khoan hien khong kha dung.', 403)
  }

  res.json({
    success: true,
    message: 'Dang nhap thanh cong.',
    token: signToken(user),
    user: normalizeUser(user),
  })
}

async function getProfile(req, res) {
  const userId = Number(req.params.userId)
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new AppError('User ID khong hop le.', 400)
  }

  const user = await findUserById(userId)
  if (!user) {
    throw new AppError('Khong tim thay nguoi dung.', 404)
  }

  res.json({
    success: true,
    user: normalizeUser(user),
  })
}

async function saveProfile(req, res) {
  const userId = Number(req.params.userId)
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new AppError('User ID khong hop le.', 400)
  }

  const existingUser = await findUserById(userId)
  if (!existingUser) {
    throw new AppError('Khong tim thay nguoi dung.', 404)
  }

  const payload = {
    name: req.body.name ? String(req.body.name).trim() : null,
    school: req.body.school ? String(req.body.school).trim() : null,
    className: req.body.className ? String(req.body.className).trim() : null,
    teachingGrade: req.body.teachingGrade ? String(req.body.teachingGrade).trim() : null,
    rank: req.body.rank ? String(req.body.rank).trim() : null,
    teacherStatus: req.body.teacherStatus ? String(req.body.teacherStatus).trim() : null,
  }

  const user = await updateUserProfile(userId, payload)

  res.json({
    success: true,
    message: 'Cap nhat ho so thanh cong.',
    user: normalizeUser(user),
  })
}

module.exports = {
  getProfile,
  login,
  register,
  saveProfile,
}
