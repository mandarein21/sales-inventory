// routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Route for dashboard
router.get('/dashboard', dashboardController.getDashboardData);

module.exports = router;
