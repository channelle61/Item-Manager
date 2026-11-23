/**
 * Request validation middleware.
 * Invalid input is answered with 400 Bad Request and a consistent JSON body:
 * { "success": false, "error": "..." }
 */

const badRequest = (res, error) =>
  res.status(400).json({ success: false, error });

const hasOwn = (object, key) =>
  Object.prototype.hasOwnProperty.call(object, key);

const isValidId = (value) => /^\d+$/.test(String(value)) && Number(value) > 0;

/**
 * Validate the numeric :id route parameter.
 */
const validateId = (req, res, next) => {
  if (!isValidId(req.params.id)) {
    return badRequest(
      res,
      'Invalid item id. The id must be a positive integer.'
    );
  }

  return next();
};

/**
 * Validate the JSON body for POST and PUT requests.
 * POST requires both "name" and "price".
 * PUT requires at least one of them; omitted fields are left unchanged.
 */
const validateItemBody = (req, res, next) => {
  const body = req.body || {};
  const isCreate = req.method === 'POST';

  const hasName = hasOwn(body, 'name');
  const hasPrice = hasOwn(body, 'price');

  if (isCreate && !hasName) {
    return badRequest(res, 'Field "name" is required.');
  }

  if (isCreate && !hasPrice) {
    return badRequest(res, 'Field "price" is required.');
  }

  if (hasName && (typeof body.name !== 'string' || body.name.trim() === '')) {
    return badRequest(res, 'Field "name" must be a non-empty string.');
  }

  if (
    hasPrice &&
    (typeof body.price !== 'number' ||
      !Number.isFinite(body.price) ||
      body.price <= 0)
  ) {
    return badRequest(res, 'Field "price" must be a positive number.');
  }

  if (!isCreate && !hasName && !hasPrice) {
    return badRequest(
      res,
      'Provide at least one field ("name" or "price") to update.'
    );
  }

  return next();
};

module.exports = {
  validateId,
  validateItemBody
};
