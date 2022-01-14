// Import the express in typescript file
import express from 'express';
import { useClient } from './routes/client';

// Initialize the express engine
const app: express.Application = express();

useClient(app);

const port: number = 3000;

// Handling '/' Request
app.get('/api', (_req, _res) => {
  _res.send('TypeScript Wiht Expresss');
});

// Server setup
app.listen(port, () => {
  console.log(`TypeScript with Express
		http://localhost:${port}/`);
});
