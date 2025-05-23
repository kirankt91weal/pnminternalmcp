const crypto = require('crypto');

function generateSignature(canonicalString) {
  const clientSecret = process.env.PNM_CLIENT_SECRET;
  
  return crypto
    .createHmac('sha256', clientSecret)
    .update(Buffer.from(canonicalString, 'utf8'))
    .digest('hex');
}

function validateRequest(req, res, next) {
  try {
    const timestamp = req.headers['x-pnm-timestamp'];
    const providedSignature = req.headers['x-pnm-signature'];
    const keyId = req.headers['x-pnm-key-id'];
    
    // Validate required headers
    if (!timestamp || !providedSignature || !keyId) {
      return res.status(401).json({ error: 'Missing authentication headers' });
    }
    
    // Validate API key
    if (keyId !== process.env.PNM_KEY_ID) {
      return res.status(401).json({ error: 'Invalid API key' });
    }
    
    // Generate signature for comparison
    const body = req.method === 'GET' ? '' : JSON.stringify(req.body);
    const signature = generateSignature(body);
    
    // Compare signatures
    if (signature !== providedSignature) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ error: 'Authentication error' });
  }
}

module.exports = {
  generateSignature,
  validateRequest
}; 