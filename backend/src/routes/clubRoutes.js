const express = require('express');
const router = express.Router();
const {
    getAllClubs,
    getClubById,
    createClub,
    updateClub,
    updateClubStatus,
    deleteClub,
    getCategories,
    getClubMembers,
} = require('../controllers/clubController');
const { authenticate, authorize, isClubLeader } = require('../middleware/auth');

// Public routes
router.get('/', getAllClubs);
router.get('/categories', getCategories);
router.get('/:id', getClubById);

// Protected routes
router.use(authenticate);

router.post('/', authorize('ADMIN', 'CLUB_LEADER', 'MEMBER'), createClub);
router.put('/:id', isClubLeader, updateClub);
router.patch('/:id/status', authorize('ADMIN'), updateClubStatus);
router.delete('/:id', authorize('ADMIN'), deleteClub);
router.get('/:id/members', getClubMembers);

module.exports = router;
