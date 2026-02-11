const express = require('express');
const router = express.Router();
const { getDashboardStats, getActivityLog } = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/admin-dashboard', getDashboardStats);
router.get('/activity', getActivityLog);

module.exports = router;
