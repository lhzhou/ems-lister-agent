import type { UserInfo } from "@/src/types/express";

const AUDIO_ENABLED_KEY = "chinapost_vip_audio_enabled";
const USER_SESSION_KEY = "chinapost_vip_user_session";
export const AUTH_TOKEN_KEY = "chinapost_auth_token_v1";
export const TOKEN_EXPIRY_KEY = "chinapost_auth_token_expiry_v1";

export function saveStoredToken(token: string, daysValid: number = 30): void {
  try {
    const expiresAt = Date.now() + daysValid * 24 * 60 * 60 * 1000;
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(TOKEN_EXPIRY_KEY, String(expiresAt));
  } catch (e) {
    console.error("Failed to store authentication token", e);
  }
}

export function getStoredToken(): string | null {
  try {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const expiryStr = localStorage.getItem(TOKEN_EXPIRY_KEY);

    if (!token) return null;

    if (expiryStr) {
      const expiry = Number(expiryStr);
      if (Date.now() > expiry) {
        removeStoredToken();
        return null;
      }
    }
    return token;
  } catch (e) {
    console.error("Failed to retrieve authentication token", e);
    return null;
  }
}

export function removeStoredToken(): void {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
  } catch (e) {
    console.error("Failed to clear authentication token", e);
  }
}

export function getStoredUser(): UserInfo | null {
  try {
    const token = getStoredToken();
    const data = localStorage.getItem(USER_SESSION_KEY);
    if (data) {
      const parsed: UserInfo = JSON.parse(data);
      if (token) parsed.token = token;
      return parsed;
    }
  } catch (e) {
    console.error("Failed to load user session", e);
  }
  return null;
}

export function saveStoredUser(user: UserInfo | null, token?: string): void {
  try {
    if (user) {
      if (token) {
        user.token = token;
        saveStoredToken(token, 30);
      }
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_SESSION_KEY);
      removeStoredToken();
    }
  } catch (e) {
    console.error("Failed to save user session", e);
  }
}

export function isAudioEnabled(): boolean {
  try {
    return localStorage.getItem(AUDIO_ENABLED_KEY) !== "false";
  } catch {
    return true;
  }
}

export function setAudioEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(AUDIO_ENABLED_KEY, String(enabled));
  } catch {
    // ignore
  }
}
