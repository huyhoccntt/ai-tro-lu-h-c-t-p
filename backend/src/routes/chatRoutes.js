const express = require('express')
const asyncHandler = require('../utils/asyncHandler')
const { chat, deleteChatHistory, getChatHistory } = require('../controllers/chatController')

const router = express.Router()

router.get('/history', asyncHandler(getChatHistory))
router.delete('/history', asyncHandler(deleteChatHistory))
router.post('/', asyncHandler(chat))

module.exports = router
