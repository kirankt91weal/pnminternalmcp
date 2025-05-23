const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { validateRequest } = require('./auth/hmac');
const PayNearMeClient = require('./client/paynearme');

const app = express();
const client = new PayNearMeClient();

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Simple health check (no auth required)
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Protected routes use HMAC auth
app.use('/api', validateRequest);

// Order lookup endpoint
app.post('/api/orders/find', async (req, res) => {
  try {
    const { order_id } = req.body;
    const order = await client.findOrder(order_id);
    res.json(order);
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      details: 'Error processing order lookup request'
    });
  }
});

// Create payment method endpoint
app.post('/api/payment-methods', async (req, res) => {
  try {
    const paymentMethod = await client.createPaymentMethod(req.body);
    res.json(paymentMethod);
  } catch (error) {
    res.status(500).json({
      error: error.message,
      details: 'Error creating payment method'
    });
  }
});

// Process payment endpoint
app.post('/api/payments', async (req, res) => {
  try {
    const payment = await client.processPayment(req.body);
    res.json(payment);
  } catch (error) {
    res.status(500).json({
      error: error.message,
      details: 'Error processing payment'
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`MCP Server running on port ${PORT}`);
  console.log(`Test the server: http://localhost:${PORT}/health`);
}); 