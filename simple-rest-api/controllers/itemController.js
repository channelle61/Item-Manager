const items = require('../data/items');

/**
 * Helpers to keep every success response in the same JSON shape.
 */
const sendSuccess = (res, statusCode, data, message, extra = {}) =>
  res.status(statusCode).json({
    success: true,
    ...(message ? { message } : {}),
    ...extra,
    data
  });

const sendNotFound = (res, id) =>
  res.status(404).json({
    success: false,
    error: `Item with id ${id} was not found.`
  });

const getNextId = () =>
  items.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1;

/**
 * GET /api/items
 * 200 OK - all items
 */
const getAllItems = (req, res) =>
  sendSuccess(res, 200, items, undefined, { count: items.length });

/**
 * GET /api/items/:id
 * 200 OK - single item
 * 404 Not Found - no item with that id (validation of :id happens in middleware)
 */
const getItemById = (req, res) => {
  const id = Number(req.params.id);
  const item = items.find((current) => current.id === id);

  if (!item) return sendNotFound(res, id);

  return sendSuccess(res, 200, item);
};

/**
 * POST /api/items
 * 201 Created - newly created item (with a newly generated id)
 */
const createItem = (req, res) => {
  const { name, price } = req.body;

  const newItem = {
    id: getNextId(),
    name: name.trim(),
    price: Number(price)
  };

  items.push(newItem);

  return sendSuccess(res, 201, newItem, 'Item created successfully.');
};

/**
 * PUT /api/items/:id
 * 200 OK - updated item
 * 404 Not Found - no item with that id
 * Body validation happens in middleware before this handler runs.
 */
const updateItem = (req, res) => {
  const id = Number(req.params.id);
  const item = items.find((current) => current.id === id);

  if (!item) return sendNotFound(res, id);

  if (req.body.name !== undefined) item.name = req.body.name.trim();
  if (req.body.price !== undefined) item.price = Number(req.body.price);

  return sendSuccess(res, 200, item, 'Item updated successfully.');
};

/**
 * DELETE /api/items/:id
 * 200 OK - the deleted item
 * 404 Not Found - no item with that id
 */
const deleteItem = (req, res) => {
  const id = Number(req.params.id);
  const index = items.findIndex((current) => current.id === id);

  if (index === -1) return sendNotFound(res, id);

  const [deletedItem] = items.splice(index, 1);

  return sendSuccess(res, 200, deletedItem, 'Item deleted successfully.');
};

module.exports = {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem
};
