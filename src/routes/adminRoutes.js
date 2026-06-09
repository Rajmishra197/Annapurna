const express = require('express');
const router = express.Router();
const {
  createAdmin,
  adminLogin,
  getDashboardStats,
  getAllUsers,
  getAllSubscriptions,
  getAllTransactions,
  toggleMenuItem,
} = require('../controllers/adminController');
const adminMiddleware = require('../middleware/adminMiddleware');
const {
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  seedMenu,
} = require('../controllers/menuController');

// Public routes
router.post('/create', createAdmin);
router.post('/login', adminLogin);

// Protected routes
router.get('/dashboard', adminMiddleware, getDashboardStats);
router.get('/users', adminMiddleware, getAllUsers);
router.get('/subscriptions', adminMiddleware, getAllSubscriptions);
router.get('/transactions', adminMiddleware, getAllTransactions);
router.put('/menu/toggle/:id', adminMiddleware, toggleMenuItem);
router.post('/menu/add', adminMiddleware, addMenuItem);
router.put('/menu/update/:id', adminMiddleware, updateMenuItem);
router.delete('/menu/delete/:id', adminMiddleware, deleteMenuItem);
router.post('/menu/seed', adminMiddleware, seedMenu);

module.exports = router;