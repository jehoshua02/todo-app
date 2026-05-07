import express from 'express';
import cookieParser from 'cookie-parser';
import { healthHandler } from './health';
import { registerOptions, registerVerify } from './register';
import { loginOptions, loginVerify } from './login';

export const app = express();

app.use(express.json());
app.use(cookieParser());

app.get('/health', healthHandler);
app.post('/api/auth/register', registerOptions);
app.post('/api/auth/register/verify', registerVerify);
app.post('/api/auth/login', loginOptions);
app.post('/api/auth/login/verify', loginVerify);
