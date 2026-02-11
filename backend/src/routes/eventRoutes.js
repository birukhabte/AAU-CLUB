const express = require('express');
const router = express.Router();
const {
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    rsvpEvent,
    getUserRSVPs,
} = require('../controllers/eventController');
const { authenticate } = require('../middleware/auth');

// Public routes
router.get('/', getAllEvents);
router.get('/:id', getEventById);

// Protected routes
router.use(authenticate);

router.post('/', createEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);
router.post('/:id/rsvp', rsvpEvent);
router.get('/user/rsvps', getUserRSVPs);

module.exports = router;
