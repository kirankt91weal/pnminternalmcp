import axios from 'axios';
import * as crypto from 'crypto';

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

function createSignature(params: Record<string, string>, apiKey: string): string {
  // Sort keys alphabetically and create signature string
  const signatureString = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}${value}`)
    .join('');

  // Create HMAC SHA256 signature
  return crypto
    .createHmac('sha256', apiKey)
    .update(signatureString)
    .digest('hex');
}

export async function findOrder(params: FindOrderParams): Promise<string | null> {
  const { credentials, ...searchParams } = params;
  const { apiKey, siteId, siteUrl } = credentials;

  if (!searchParams.orderId) {
    throw new Error('orderId is required');
  }

  try {
    // Use the correct find_orders endpoint
    const apiUrl = `${siteUrl}/find_orders`;

    // Prepare request parameters
    const timestamp = Math.floor(Date.now() / 1000);
    const version = '3.0';
    
    const requestParams = {
      site_identifier: siteId,
      pnm_order_identifier: searchParams.orderId,
      version,
      timestamp: timestamp.toString()
    } as const;

    // Generate signature
    const signature = createSignature(requestParams, apiKey);

    // Make the API request with the provided credentials
    const response = await axios.post(apiUrl, {
      ...requestParams,
      signature
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Return the error response as XML
      return `<?xml version="1.0" encoding="UTF-8"?>
<result status="error">
  <errors>
    <error description="${error.response?.data?.errors?.map((e: any) => e.description).join(', ') || 
      error.response?.status === 404 ? 'Order not found' : 
      error.response?.status === 401 ? 'Unauthorized - Invalid credentials' : 
      error.message}"/>
  </errors>
</result>`;
    }
    throw error;
  }
}
