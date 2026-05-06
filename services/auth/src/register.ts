import { Request, Response } from 'express';
import crypto from 'node:crypto';
import { prisma } from './db';
import { storeChallenge, getChallenge, deleteChallenge } from './challenges';
import { generateAccessToken, generateRefreshToken } from './tokens';
import { setTokenCookies } from './cookies';

const RP_NAME = process.env.RP_NAME || 'Todo App';
const RP_ID = process.env.RP_ID || 'localhost';
const RP_ORIGIN = process.env.RP_ORIGIN || 'http://localhost:8080';

export async function registerOptions(req: Request, res: Response): Promise<void> {
  const { username } = req.body;

  if (!username || typeof username !== 'string') {
    res.status(400).json({ error: 'username is required' });
    return;
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    res.status(409).json({ error: 'username already taken' });
    return;
  }

  const { generateRegistrationOptions } = await import('@simplewebauthn/server');

  const options = await generateRegistrationOptions({
    rpName: RP_NAME,
    rpID: RP_ID,
    userName: username,
    attestationType: 'none',
    authenticatorSelection: {
      residentKey: 'preferred',
      userVerification: 'preferred',
    },
  });

  storeChallenge(username, options.challenge);

  res.status(200).json(options);
}

export async function registerVerify(req: Request, res: Response): Promise<void> {
  const { username, credential } = req.body;

  if (!username || typeof username !== 'string') {
    res.status(400).json({ error: 'username is required' });
    return;
  }

  if (!credential) {
    res.status(400).json({ error: 'credential is required' });
    return;
  }

  const expectedChallenge = getChallenge(username);
  if (!expectedChallenge) {
    res.status(400).json({ error: 'no pending registration for this username' });
    return;
  }

  const { verifyRegistrationResponse } = await import('@simplewebauthn/server');

  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response: credential,
      expectedChallenge,
      expectedOrigin: RP_ORIGIN,
      expectedRPID: RP_ID,
    });
  } catch {
    res.status(400).json({ error: 'attestation verification failed' });
    return;
  }

  if (!verification.verified || !verification.registrationInfo) {
    res.status(400).json({ error: 'attestation verification failed' });
    return;
  }

  deleteChallenge(username);

  const { credential: regCredential } = verification.registrationInfo;

  const user = await prisma.user.create({
    data: {
      username,
      credentials: {
        create: {
          credentialId: regCredential.id,
          publicKey: Buffer.from(regCredential.publicKey),
          counter: regCredential.counter,
          transports: credential.response.transports || [],
        },
      },
    },
  });

  const jwtSecret = process.env.JWT_SECRET!;
  const accessToken = generateAccessToken(user.id, jwtSecret);
  const refreshToken = generateRefreshToken();

  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  setTokenCookies(res, accessToken, refreshToken);
  res.status(201).json({ userId: user.id, username });
}
