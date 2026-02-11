const express = require('express');
const router = express.Router();
const {
    joinClub,
    updateMembershipStatus,
    leaveClub,
    removeMember,
    getUserMemberships,
    checkMembership,
} = require('../controllers/membershipController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/my-memberships', getUserMemberships);
router.get('/check/:clubId', checkMembership);
router.post('/join/:clubId', joinClub);
router.patch('/:membershipId/status', updateMembershipStatus);
router.delete('/leave/:clubId', leaveClub);
router.delete('/remove/:membershipId', removeMember);

module.exports = router;
