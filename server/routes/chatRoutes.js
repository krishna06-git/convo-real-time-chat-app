const express = require('express');
const {
  accessChat,
  getChats,
  createGroupChat,
  updateGroupChat,
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/').post(protect, accessChat).get(protect, getChats);
router.route('/group').post(protect, createGroupChat);
router.route('/group/:id').put(protect, updateGroupChat);

module.exports = router;
