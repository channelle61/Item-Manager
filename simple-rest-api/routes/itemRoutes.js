const express = require('express');

const {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem
} = require('../controllers/itemController');

const { validateId, validateItemBody } = require('../middleware/validateItem');

const router = express.Router();

// GET /api/items
router.get('/', getAllItems);

// GET /api/items/:id
router.get('/:id', validateId, getItemById);

// POST /api/items
router.post('/', validateItemBody, createItem);

// PUT /api/items/:id
router.put('/:id', validateId, validateItemBody, updateItem);

// DELETE /api/items/:id
router.delete('/:id', validateId, deleteItem);

module.exports = router;
