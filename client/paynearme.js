const fetch = require('node-fetch');
const { generateSignature } = require('../auth/hmac');

class PayNearMeClient {
  constructor(config = {}) {
    this.baseUrl = process.env.PNM_API_BASE || 'https://www.paynearme-sandbox.com/json-api';
    this.apiKey = process.env.PNM_API_KEY;
    this.clientSecret = process.env.PNM_CLIENT_SECRET;
    this.siteId = process.env.PNM_MERCHANT_ID;
    
    if (!this.apiKey || !this.clientSecret || !this.siteId) {
      throw new Error('Missing required configuration: PNM_API_KEY, PNM_CLIENT_SECRET, and PNM_MERCHANT_ID must be set');
    }
  }

  async request(endpoint, data = {}) {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const version = '3.0';
      
      // Add required parameters
      const basePayload = {
        site_identifier: this.siteId,
        version,
        timestamp,
        ...data
      };

      // Create canonical string for signature
      const fieldsToSign = Object.keys(basePayload)
        .filter(key => key !== 'signature')
        .sort();

      console.log('🔍 Canonical fields and values:');
      fieldsToSign.forEach(key => {
        const val = (basePayload[key] || '').toString().trim();
        console.log(`  ${key} → '${val}'`);
      });

      const canonicalString = fieldsToSign
        .map(key => `${key}${(basePayload[key] || '').toString().trim()}`)
        .join('');

      console.log('🧾 Canonical string for signature:', canonicalString);

      const signature = generateSignature(canonicalString);

      const finalPayload = {
        ...basePayload,
        signature
      };

      // Log any unsigned fields
      const signedKeys = new Set(fieldsToSign);
      const actualKeys = Object.keys(finalPayload);
      const unsignedFields = actualKeys.filter(
        k => !signedKeys.has(k) && k !== 'signature'
      );

      if (unsignedFields.length > 0) {
        console.warn('⚠️ You are sending fields not included in signature:', unsignedFields);
      }

      console.log('Making request:', {
        url: `${this.baseUrl}${endpoint}`,
        headers: {
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: finalPayload
      });

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(finalPayload)
      });

      const responseData = await response.json();
      console.log('Response:', responseData);

      if (responseData.status === 'error') {
        throw new Error(responseData.errors?.[0]?.description || 'API request failed');
      }

      return responseData;
    } catch (error) {
      console.error('Request failed:', error.message);
      throw error;
    }
  }

  // API Methods
  async findOrder(orderId) {
    return this.request('/find_orders', {
      pnm_order_identifier: orderId,
      sort_payments: 'asc'
    });
  }

  async createPaymentMethod(data) {
    return this.request('/create_payment_method', {
      ...data
    });
  }

  async processPayment(data) {
    return this.request('/make_payment', {
      ...data,
      payment_currency: 'USD',
      site_channel: 'consumer'
    });
  }
}

module.exports = PayNearMeClient; 