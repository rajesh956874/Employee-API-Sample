
const express = require('express');
const router = express.Router();

const {
  getEmployees
} = require('../controllers/employeeController');

const authMiddleware = require('../middleware/authMiddleware');

// Search employees and apply pagination
router.get('/', authMiddleware, getEmployees);

module.exports = router;
