import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import type { PublicKeyCredentialCreationOptionsJSON, PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/browser';

export async function fetchRegistrationOptions(username: string): Promise<PublicKeyCredentialCreationOptionsJSON> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username }),
  });

  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error || 'Failed to get registration options');
  }

  return res.json();
}

export async function registerWithPasskey(username: string): Promise<{ userId: string; username: string }> {
  const options = await fetchRegistrationOptions(username);
  const credential = await startRegistration({ optionsJSON: options });

  const res = await fetch('/api/auth/register/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, credential }),
  });

  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error || 'Registration failed');
  }

  return res.json();
}

export async function fetchLoginOptions(username: string): Promise<PublicKeyCredentialRequestOptionsJSON> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username }),
  });

  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error || 'Failed to get login options');
  }

  return res.json();
}

export async function refreshSession(): Promise<{ userId: string; username: string } | null> {
  const res = await fetch('/api/auth/refresh', {
    method: 'POST',
    credentials: 'same-origin',
  });

  if (!res.ok) return null;

  return res.json();
}

export async function logoutSession(): Promise<void> {
  await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'same-origin',
  });
}

export async function loginWithPasskey(username: string): Promise<{ userId: string; username: string }> {
  const options = await fetchLoginOptions(username);
  const credential = await startAuthentication({ optionsJSON: options });

  const res = await fetch('/api/auth/login/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, credential }),
  });

  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error || 'Login failed');
  }

  return res.json();
}
