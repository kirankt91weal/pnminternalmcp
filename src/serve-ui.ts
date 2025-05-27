import express from 'express';
import { resolve } from 'path';

const app = express();
const PORT = 8080;

app.get('/', (req, res) => {
  res.sendFile(resolve(__dirname, 'test-ui.html'));
});

app.listen(PORT, () => {
  console.log(`Test UI server running at http://localhost:${PORT}`);
}); 