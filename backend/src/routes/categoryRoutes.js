const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { validateCategory } = require('../middleware/validator');

router.get('/', categoryController.getAllCategories);
router.post('/', validateCategory, categoryController.createCategory);

module.exports = router;
