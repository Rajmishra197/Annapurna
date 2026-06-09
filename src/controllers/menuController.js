const MenuItem = require('../models/Menu');

// Get all available menu items
const getMenuItems = async (req, res) => {
  try {
    const menuItems = await MenuItem.find({ isAvailable: true });

    // Group by category
    const groupedMenu = {
      sabzi: menuItems.filter(item => item.category === 'sabzi'),
      dal: menuItems.filter(item => item.category === 'dal'),
      rice: menuItems.filter(item => item.category === 'rice'),
      roti: menuItems.filter(item => item.category === 'roti'),
      extras: menuItems.filter(item => item.category === 'extras'),
    };

    return res.status(200).json({
      success: true,
      menu: groupedMenu,
      total: menuItems.length,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Add menu item (Admin only)
const addMenuItem = async (req, res) => {
  try {
    const { name, category, price, emoji, isSeasonal, tags } = req.body;

    const menuItem = await MenuItem.create({
      name,
      category,
      price,
      emoji,
      isSeasonal,
      tags,
    });

    return res.status(201).json({
      success: true,
      message: 'Menu item added successfully',
      menuItem,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Update menu item (Admin only)
const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const menuItem = await MenuItem.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    );

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Menu item updated successfully',
      menuItem,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Delete menu item (Admin only)
const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    await MenuItem.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Menu item deleted successfully',
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Seed default menu items
const seedMenu = async (req, res) => {
  try {
    // Delete existing items
    await MenuItem.deleteMany({});

    const defaultItems = [
      // Sabzi
      { name: 'Aloo Gobi', category: 'sabzi', price: 20, emoji: '🥔' },
      { name: 'Aloo Matar', category: 'sabzi', price: 22, emoji: '🫛' },
      { name: 'Bhindi Masala', category: 'sabzi', price: 22, emoji: '🫑' },
      { name: 'Paneer Sabzi', category: 'sabzi', price: 35, emoji: '🧀' },
      { name: 'Mix Veg', category: 'sabzi', price: 22, emoji: '🥬' },
      { name: 'Palak Sabzi', category: 'sabzi', price: 20, emoji: '🥬' },
      { name: 'Lauki Sabzi', category: 'sabzi', price: 18, emoji: '🥒' },
      { name: 'Baingan Bharta', category: 'sabzi', price: 20, emoji: '🍆' },

      // Dal
      { name: 'Dal Tadka', category: 'dal', price: 20, emoji: '🥣' },
      { name: 'Dal Makhani', category: 'dal', price: 25, emoji: '🥣' },
      { name: 'Chana Dal', category: 'dal', price: 20, emoji: '🫘' },
      { name: 'Rajma', category: 'dal', price: 25, emoji: '🫘' },
      { name: 'Chana Masala', category: 'dal', price: 25, emoji: '🫘' },

      // Rice
      { name: 'Steamed Rice', category: 'rice', price: 15, emoji: '🍚' },
      { name: 'Jeera Rice', category: 'rice', price: 18, emoji: '🍚' },

      // Roti
      { name: 'Phulka (2 pcs)', category: 'roti', price: 10, emoji: '🫓' },
      { name: 'Phulka (4 pcs)', category: 'roti', price: 18, emoji: '🫓' },

      // Extras
      { name: 'Salad', category: 'extras', price: 10, emoji: '🥗' },
      { name: 'Papad', category: 'extras', price: 5, emoji: '🫓' },
      { name: 'Pickle', category: 'extras', price: 5, emoji: '🫙' },
      { name: 'Curd', category: 'extras', price: 15, emoji: '🥛' },
    ];

    await MenuItem.insertMany(defaultItems);

    return res.status(200).json({
      success: true,
      message: 'Menu seeded successfully',
      total: defaultItems.length,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

module.exports = {
  getMenuItems,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  seedMenu,
};