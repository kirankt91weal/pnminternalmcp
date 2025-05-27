#!/bin/bash

# Test variables
ORDER_ID="84128188198"
API_KEY="6c17a469e9b368ffdbec96f6c"
SITE_ID="S6959116372"
BASE_URL="https://api.paynearme-sandbox.com/json-api"
TIMESTAMP=$(date +%s)
VERSION="3.0"

# Create signature string
# Format: key1value1key2value2... (sorted alphabetically)
SIGNATURE_STRING="pnm_order_identifier${ORDER_ID}site_identifier${SITE_ID}timestamp${TIMESTAMP}version${VERSION}"
SIGNATURE=$(echo -n "$SIGNATURE_STRING" | openssl dgst -sha256 -hmac "$API_KEY" | cut -d' ' -f2)

echo "Testing direct API call..."
curl -v "${BASE_URL}/find_orders" \
  -X POST \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "site_identifier": "'${SITE_ID}'",
    "pnm_order_identifier": "'${ORDER_ID}'",
    "version": "'${VERSION}'",
    "timestamp": "'${TIMESTAMP}'",
    "signature": "'${SIGNATURE}'"
  }'

echo -e "\n\nTesting through our MCP server..."
curl -v "http://localhost:3000/execute" \
  -H "Content-Type: application/json" \
  -d '{
    "version": "0.1",
    "type": "function_call",
    "name": "find_order",
    "arguments": {
      "orderId": "'${ORDER_ID}'"
    },
    "credentials": {
      "apiKey": "'${API_KEY}'",
      "siteId": "'${SITE_ID}'",
      "siteUrl": "'${BASE_URL}'"
    },
    "requestId": "curl-test-1"
  }'

# Alternative URL format test
echo -e "\n\nTesting alternative API URL format..."
curl -v "${BASE_URL}/v2/sites/${SITE_ID}/orders/${ORDER_ID}" \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Accept: application/xml" 