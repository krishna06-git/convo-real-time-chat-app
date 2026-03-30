const express = require('express');
const {
  sendMessage,
  getMessages,
  toggleReaction,
  markAsRead,
  markAllAsRead,
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/').post(protect, sendMessage);
router.route('/:chatId').get(protect, getMessages);
router.route('/:id/react').put(protect, toggleReaction);
router.route('/:id/read').put(protect, markAsRead);
router.route('/read-all/:chatId').put(protect, markAllAsRead);

module.exports = router;
