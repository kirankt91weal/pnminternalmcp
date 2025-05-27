# PayNearMe Model Context Protocol (MCP) Implementation

A TypeScript/Node.js implementation of the Model Context Protocol for PayNearMe API integration, providing a standardized way to interact with PayNearMe's payment services.

## Features

* **MCP Server Implementation**
  - Express-based HTTP server
  - Standardized tool discovery and execution
  - PayNearMe API integration with proper authentication
  - Error handling and response formatting

* **Core PayNearMe Features**
  - Order lookup functionality with proper signature generation
  - HMAC authentication
  - Sandbox environment support
  - XML/JSON response handling

* **Testing UI**
  - Browser-based testing interface
  - Pre-configured API credentials support
  - Real-time response display
  - Support for all PayNearMe API parameters

## Project Structure

```
src/
├── server.ts           # Main MCP server implementation
├── serve-ui.ts        # Test UI server
├── test-ui.html       # Browser testing interface
├── tools/
│   └── findOrder.ts   # PayNearMe order lookup implementation
└── types/
    └── paynearme.ts   # TypeScript type definitions
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```env
PNM_API_BASE=https://api.paynearme-sandbox.com/json-api
PNM_API_KEY=your_api_key
PNM_SITE_ID=your_site_id
```

## Running the Servers

1. Start the MCP server:
```bash
npm run start
```

2. Start the test UI server:
```bash
npm run ui
```

Access the test UI at http://localhost:8080

## API Implementation Details

### Find Order Endpoint

The implementation includes proper handling of PayNearMe's required parameters:

```typescript
interface FindOrderParams {
  orderId?: string;
  customerIdentifier?: string;
  orderTrackingUrl?: string;
  credentials: {
    apiKey: string;
    siteId: string;
    siteUrl: string;
  };
}
```

Key features:
- Version 3.0 API support
- HMAC SHA256 signature generation
- Timestamp validation (±300 seconds)
- XML response parsing
- Error handling with descriptive messages

### Authentication

The implementation uses HMAC SHA256 for request signing:

1. Parameters are sorted alphabetically
2. Key-value pairs are concatenated
3. HMAC SHA256 hash is generated using the API key
4. Signature is included in the request

Example signature string format:
```
pnm_order_identifier{orderId}site_identifier{siteId}timestamp{timestamp}version{version}
```

## Testing

Use the provided test UI to:
1. Enter order details and credentials
2. Submit test requests
3. View formatted responses
4. Debug API interactions

Example test credentials:
```
Order ID: 84128188198
API Key: 6c17a469e9b368ffdbec96f6c
Site ID: S6959116372
Site URL: https://api.paynearme-sandbox.com/json-api/
```

## Response Format

Successful order lookup response includes:
- Order details (ID, status, type)
- Customer information
- Payment history
- Available payment methods
- Processing fees
- Settlement information

Example response:
```json
{
  "type": "tool_response",
  "id": "request-id",
  "result": {
    "status": "ok",
    "orders": [{
      "site_name": "Site Name",
      "pnm_order_identifier": "order-id",
      "order_status": "open",
      "customer": {
        "pnm_customer_name": "Customer Name"
      },
      "payments": []
    }]
  }
}
```

## Error Handling

The implementation handles various error cases:
- Invalid credentials
- Expired timestamps
- Incorrect signatures
- Missing required parameters
- Order not found
- API connection issues

Errors are returned in a consistent format:
```json
{
  "type": "error",
  "id": "request-id",
  "error": "Error description"
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details 