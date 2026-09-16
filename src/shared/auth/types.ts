export type AuthSession = { userId: string; scope?: string };

export type AuthAdapter = {
  getSession: () => Promise<AuthSession | null>;
  signIn: (options?: { redirect?: string }) => Promise<void>;
  signOut: () => Promise<void>;
  onSessionExpired?: (reason: "expired" | "revoked") => void;
};
