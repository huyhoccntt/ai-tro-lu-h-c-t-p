const express = require('express')
const asyncHandler = require('../utils/asyncHandler')
const { health } = require('../controllers/healthController')

const router = express.Router()

router.get('/', asyncHandler(health))

module.exports = router
