const express = require('express');
const router = express.Router();
const {
    sendMessage,
    getConversations,
    getMessages,
} = require('../controllers/messageController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.post('/', sendMessage);
router.get('/conversations', getConversations);
router.get('/:userId', getMessages);

module.exports = router;
