import express from 'express';
import { findOrder } from './tools/findOrder';
import { parseString } from 'xml2js';
import { promisify } from 'util';

const parseXMLAsync = promisify(parseString);

interface XMLOrderResult {
  result: {
    $: { status: string };
    errors?: [{
      error: Array<{
        $: { description: string }
      }>
    }];
    order?: [any];  // We'll keep this as any for now since we don't know the full structure
  }
}

interface Credentials {
  apiKey: string;
  siteId: string;
  siteUrl: string;
}

const app = express();
app.use(express.json());

// Add CORS support
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Tool documentation for Lovable
const toolDocs = {
  find_order: {
    name: 'find_order',
    description: 'Find a PayNearMe order by ID, customer identifier, or tracking URL',
    parameters: {
      type: 'object',
      properties: {
        orderId: {
          type: 'string',
          description: 'The PayNearMe order ID'
        },
        customerIdentifier: {
          type: 'string',
          description: 'Customer identifier associated with the order'
        },
        orderTrackingUrl: {
          type: 'string',
          description: 'URL used to track the order'
        }
      }
    },
    credentials: {
      type: 'object',
      required: ['apiKey', 'siteId', 'siteUrl'],
      properties: {
        apiKey: {
          type: 'string',
          description: 'Your PayNearMe API key'
        },
        siteId: {
          type: 'string',
          description: 'Your PayNearMe site ID'
        },
        siteUrl: {
          type: 'string',
          description: 'Your PayNearMe site URL (e.g. https://sandbox.paynearme.com)'
        }
      }
    }
  }
};

// Endpoint to get tool documentation
app.get('/tools', (req, res) => {
  res.json({
    version: '0.1',
    tools: Object.values(toolDocs)
  });
});

// Validate credentials
function validateCredentials(credentials: any): credentials is Credentials {
  return (
    typeof credentials === 'object' &&
    typeof credentials.apiKey === 'string' &&
    typeof credentials.siteId === 'string' &&
    typeof credentials.siteUrl === 'string'
  );
}

// Main endpoint for tool execution
app.post('/execute', async (req, res) => {
  try {
    const { type, name, arguments: args, requestId, credentials } = req.body;

    if (type !== 'function_call') {
      return res.status(400).json({
        type: 'error',
        error: 'Invalid request type. Expected "function_call"',
        id: requestId
      });
    }

    // Validate credentials
    if (!validateCredentials(credentials)) {
      return res.status(400).json({
        type: 'error',
        error: 'Missing or invalid credentials. Please provide apiKey, siteId, and siteUrl.',
        id: requestId
      });
    }

    let result;
    switch (name) {
      case 'find_order':
        const orderResult = await findOrder({
          ...args,
          credentials
        });
        
        if (orderResult) {
          // Parse XML response
          try {
            const parsedXML = await parseXMLAsync(orderResult) as XMLOrderResult;
            result = {
              type: 'tool_response',
              id: requestId,
              result: {
                status: parsedXML.result.$.status,
                errors: parsedXML.result.errors?.[0].error?.map(e => ({
                  description: e.$.description
                })),
                order: parsedXML.result.order?.[0]
              }
            };
          } catch (error) {
            // If XML parsing fails, return raw result
            result = {
              type: 'tool_response',
              id: requestId,
              result: orderResult
            };
          }
        } else {
          result = {
            type: 'error',
            error: 'Order not found',
            id: requestId
          };
        }
        break;

      default:
        result = {
          type: 'error',
          error: `Unknown tool: ${name}`,
          id: requestId
        };
    }

    res.json(result);
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({
      type: 'error',
      error: error instanceof Error ? error.message : 'Internal server error',
      id: req.body.requestId
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`PayNearMe MCP Server running on port ${PORT}`);
}); 