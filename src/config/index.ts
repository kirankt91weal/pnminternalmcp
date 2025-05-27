import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const config = {
  paynearme: {
    siteId: process.env.PNM_SITE_ID,
    apiKey: process.env.PNM_API_KEY,
    apiUrl: process.env.PNM_API_URL || 'https://api.paynearme.com/api',
    version: process.env.PNM_API_VERSION || '2.0'
  },
  server: {
    port: process.env.PORT || 3000,
    environment: process.env.NODE_ENV || 'development'
  }
};

// Validate required configuration
const requiredEnvVars = ['PNM_SITE_ID', 'PNM_API_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}
