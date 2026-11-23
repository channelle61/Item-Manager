/**
 * In-memory data store.
 *
 * The array is exported (not a copy) so controllers can mutate it with
 * push()/splice() and changes persist for the lifetime of the server.
 * Restarting the server resets the data to these samples.
 */
const items = [
  { id: 1, name: 'Laptop', price: 999.99 },
  { id: 2, name: 'Wireless Mouse', price: 24.5 },
  { id: 3, name: 'Mechanical Keyboard', price: 89.0 },
  { id: 4, name: 'USB-C Hub', price: 39.99 },
  { id: 5, name: '27-inch Monitor', price: 249.0 }
];

module.exports = items;
