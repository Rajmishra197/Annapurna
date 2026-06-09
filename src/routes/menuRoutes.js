const express = require('express');
const router = express.Router();
const {
  getMenuItems,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  seedMenu,
} = require('../controllers/menuController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.get('/', getMenuItems);

// Protected routes (auth needed)
router.post('/seed', authMiddleware, seedMenu);
router.post('/add', authMiddleware, addMenuItem);
router.put('/update/:id', authMiddleware, updateMenuItem);
router.delete('/delete/:id', authMiddleware, deleteMenuItem);

module.exports = router;