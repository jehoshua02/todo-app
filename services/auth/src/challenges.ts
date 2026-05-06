const challenges = new Map<string, string>();

export function storeChallenge(userId: string, challenge: string): void {
  challenges.set(userId, challenge);
}

export function getChallenge(userId: string): string | undefined {
  return challenges.get(userId);
}

export function deleteChallenge(userId: string): void {
  challenges.delete(userId);
}
