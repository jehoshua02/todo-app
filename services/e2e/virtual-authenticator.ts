import type { Page, CDPSession } from "@playwright/test";

export interface VirtualAuthenticator {
  authenticatorId: string;
  cdp: CDPSession;
}

export async function addVirtualAuthenticator(
  page: Page
): Promise<VirtualAuthenticator> {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("WebAuthn.enable");
  const { authenticatorId } = await cdp.send("WebAuthn.addVirtualAuthenticator", {
    options: {
      protocol: "ctap2",
      transport: "internal",
      hasResidentKey: true,
      hasUserVerification: true,
      isUserVerified: true,
    },
  });
  return { authenticatorId, cdp };
}

export async function removeVirtualAuthenticator(
  auth: VirtualAuthenticator
): Promise<void> {
  await auth.cdp.send("WebAuthn.removeVirtualAuthenticator", {
    authenticatorId: auth.authenticatorId,
  });
  await auth.cdp.send("WebAuthn.disable");
  await auth.cdp.detach();
}
