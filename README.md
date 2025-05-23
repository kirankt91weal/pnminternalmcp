# PayNearMe API Client

A Node.js client for the PayNearMe API, implementing the Model Context Protocol (MCP).

## Features

- Order lookup functionality
- HMAC authentication
- Sandbox environment support

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
Create a `.env` file with the following variables:
```
PNM_API_BASE=https://www.paynearme-sandbox.com/json-api
PNM_API_KEY=your_api_key
PNM_CLIENT_SECRET=your_client_secret
PNM_MERCHANT_ID=your_merchant_id
```

## Usage

Example of looking up an order:

```javascript
const PayNearMeClient = require('./client/paynearme');

const client = new PayNearMeClient();
const orderId = '89804488355';

client.findOrder(orderId)
  .then(order => console.log(order))
  .catch(error => console.error(error));
```

## Testing

Run the test sandbox:
```bash
node test-sandbox.js
``` 