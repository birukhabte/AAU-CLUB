const express = require('express');
const router = express.Router();
const {
    getAllClubs,
    getClubById,
    createClub,
    updateClub,
    updateClubStatus,
    deleteClub,
    updateClubLeader,
    getCategories,
    getClubMembers,
    getMyLeaderClubs,
} = require('../controllers/clubController');
const { authenticate, authorize, isClubLeader } = require('../middleware/auth');

// Public routes
router.get('/', getAllClubs);
router.get('/categories', getCategories);

// Protected routes
router.use(authenticate);

router.get('/my/leader', authorize('CLUB_LEADER', 'ADMIN'), getMyLeaderClubs);
router.get('/:id', getClubById);
router.post('/', authorize('ADMIN', 'CLUB_LEADER', 'MEMBER'), createClub);
router.put('/:id', isClubLeader, updateClub);
router.patch('/:id/status', authorize('ADMIN'), updateClubStatus);
router.patch('/:id/leader', authorize('ADMIN'), updateClubLeader);
router.delete('/:id', authorize('ADMIN'), deleteClub);
router.get('/:id/members', getClubMembers);

module.exports = router;
