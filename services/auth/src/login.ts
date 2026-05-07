import { Request, Response } from 'express';
import crypto from 'node:crypto';
import { prisma } from './db';
import { storeChallenge, getChallenge, deleteChallenge } from './challenges';
import { generateAccessToken, generateRefreshToken } from './tokens';
import { setTokenCookies } from './cookies';

const RP_ID = process.env.RP_ID || 'localhost';
const RP_ORIGIN = process.env.RP_ORIGIN || 'http://localhost:8080';

export async function loginOptions(req: Request, res: Response): Promise<void> {
  const { username } = req.body;

  if (!username || typeof username !== 'string') {
    res.status(400).json({ error: 'username is required' });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { username },
    include: { credentials: true },
  });

  if (!user) {
    res.status(404).json({ error: 'user not found' });
    return;
  }

  const { generateAuthenticationOptions } = await import('@simplewebauthn/server');

  const options = await generateAuthenticationOptions({
    rpID: RP_ID,
    allowCredentials: user.credentials.map((cred) => ({
      id: cred.credentialId,
      transports: cred.transports as AuthenticatorTransport[],
    })),
    userVerification: 'preferred',
  });

  storeChallenge(username, options.challenge);

  res.status(200).json(options);
}

export async function loginVerify(req: Request, res: Response): Promise<void> {
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
    res.status(400).json({ error: 'no pending login for this username' });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { username },
    include: { credentials: true },
  });

  if (!user) {
    res.status(404).json({ error: 'user not found' });
    return;
  }

  const matchedCredential = user.credentials.find(
    (cred) => cred.credentialId === credential.id
  );

  if (!matchedCredential) {
    res.status(400).json({ error: 'credential not recognized' });
    return;
  }

  const { verifyAuthenticationResponse } = await import('@simplewebauthn/server');

  let verification;
  try {
    verification = await verifyAuthenticationResponse({
      response: credential,
      expectedChallenge,
      expectedOrigin: RP_ORIGIN,
      expectedRPID: RP_ID,
      credential: {
        id: matchedCredential.credentialId,
        publicKey: matchedCredential.publicKey,
        counter: matchedCredential.counter,
        transports: matchedCredential.transports as AuthenticatorTransport[],
      },
    });
  } catch {
    res.status(400).json({ error: 'assertion verification failed' });
    return;
  }

  if (!verification.verified) {
    res.status(400).json({ error: 'assertion verification failed' });
    return;
  }

  deleteChallenge(username);

  await prisma.credential.update({
    where: { id: matchedCredential.id },
    data: { counter: verification.authenticationInfo.newCounter },
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
  res.status(200).json({ userId: user.id, username: user.username });
}

type AuthenticatorTransport = 'ble' | 'cable' | 'hybrid' | 'internal' | 'nfc' | 'smart-card' | 'usb';
