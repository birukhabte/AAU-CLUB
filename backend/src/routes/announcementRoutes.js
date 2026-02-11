const express = require('express');
const router = express.Router();
const {
    getAnnouncements,
    createAnnouncement,
    deleteAnnouncement,
} = require('../controllers/announcementController');
const { authenticate } = require('../middleware/auth');

router.get('/', getAnnouncements);

router.use(authenticate);
router.post('/', createAnnouncement);
router.delete('/:id', deleteAnnouncement);

module.exports = router;
