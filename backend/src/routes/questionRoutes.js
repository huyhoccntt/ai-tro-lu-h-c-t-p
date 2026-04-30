const express = require('express')
const asyncHandler = require('../utils/asyncHandler')
const { addQuestion, getQuestions } = require('../controllers/questionController')

const router = express.Router()

router.get('/', asyncHandler(getQuestions))
router.post('/', asyncHandler(addQuestion))

module.exports = router
