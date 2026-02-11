const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    getUserById,
    updateUser,
    updateUserRole,
    toggleUserStatus,
    changePassword,
} = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', authorize('ADMIN'), getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.patch('/:id/role', authorize('ADMIN'), updateUserRole);
router.patch('/:id/toggle-status', authorize('ADMIN'), toggleUserStatus);
router.post('/change-password', changePassword);

module.exports = router;
