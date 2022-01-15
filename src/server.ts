// Import the express in typescript file
import { InversifyExpressServer } from 'inversify-express-utils';
import './controllers/activities-controller';
import { container } from './inversify.config';
import { useClient } from './routes/client';

const server = new InversifyExpressServer(container);

const app = server.build();

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
