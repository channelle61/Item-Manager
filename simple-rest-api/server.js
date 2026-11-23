const express = require('express');
const cors = require('cors');

const itemRoutes = require('./routes/itemRoutes');
const {
  notFoundHandler,
  globalErrorHandler
} = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Allow the browser frontend (file:// or localhost) to call this API.
app.use(cors());

// Built-in middleware to parse application/json request bodies.
app.use(express.json());

// Small landing page; the actual API lives under /api/items.
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Simple REST API is running.',
    endpoints: '/api/items'
  });
});

// Mount the item routes.
app.use('/api/items', itemRoutes);

// Anything that reaches this point did not match a route above.
app.use(notFoundHandler);

// Must be registered last.
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
  console.log(`Items API: http://localhost:${PORT}/api/items`);
});
