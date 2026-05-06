import express from 'express';
import { healthHandler } from './health';

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.get('/health', healthHandler);

app.listen(port, '0.0.0.0', () => {
  console.log(`Auth service listening on port ${port}`);
});
