import express from 'express';
import cookieParser from 'cookie-parser';
import { healthHandler } from './health';
import { listsRouter } from './lists';
import { requireAuth } from './auth';

export const app = express();

app.use(express.json());
app.use(cookieParser());

const jwtSecret = process.env.JWT_SECRET || 'dev-secret-change-me';

app.get('/health', healthHandler);
app.use('/api/tasks/lists', requireAuth(jwtSecret), listsRouter);
