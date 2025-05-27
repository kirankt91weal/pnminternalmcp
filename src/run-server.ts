// Set up test environment
process.env.PNM_SITE_ID = 'test_site_id';
process.env.PNM_API_KEY = 'test_api_key';
process.env.PNM_API_URL = 'https://api-test.paynearme.com/api';
process.env.PNM_API_VERSION = '2.0';

// Import and start server
import { MCPServer } from './index';

const server = new MCPServer();
server.start(); 