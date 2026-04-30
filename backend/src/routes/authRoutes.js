const express = require('express')
const asyncHandler = require('../utils/asyncHandler')
const { getProfile, login, register, saveProfile } = require('../controllers/authController')

const router = express.Router()

router.post('/register', asyncHandler(register))
router.post('/login', asyncHandler(login))
router.get('/users/:userId', asyncHandler(getProfile))
router.put('/users/:userId', asyncHandler(saveProfile))

module.exports = router
