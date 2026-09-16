import { ExpressPackage, NotificationLog, UserInfo } from "../types/express";
import { INITIAL_PACKAGES, INITIAL_NOTIFICATIONS } from "../data/mockData";

const PACKAGES_KEY = "chinapost_vip_packages_v1";
const NOTIFICATIONS_KEY = "chinapost_vip_notifications_v1";
const AUDIO_ENABLED_KEY = "chinapost_vip_audio_enabled";
const USER_SESSION_KEY = "chinapost_vip_user_session";
export const AUTH_TOKEN_KEY = "chinapost_auth_token_v1";
export const TOKEN_EXPIRY_KEY = "chinapost_auth_token_expiry_v1";

/**
 * Generate a simulated secure token for postal system dispatch authentication
 */
export function generateAuthToken(empId: string): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({
      sub: empId,
      iss: "chinapost-ems-auth-service",
      iat: Date.now(),
      exp: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days valid for long-term storage
    }),
  );
  const signature = Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join("");
  return `cp_ems.${header}.${payload}.${signature}`;
}

/**
 * Long-term Token storage (default 30 days persistence)
 */
export function saveStoredToken(token: string, daysValid: number = 30): void {
  try {
    const expiresAt = Date.now() + daysValid * 24 * 60 * 60 * 1000;
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(TOKEN_EXPIRY_KEY, String(expiresAt));
  } catch (e) {
    console.error("Failed to store authentication token", e);
  }
}

/**
 * Retrieve long-term Token, validating expiry
 */
export function getStoredToken(): string | null {
  try {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const expiryStr = localStorage.getItem(TOKEN_EXPIRY_KEY);

    if (!token) return null;

    if (expiryStr) {
      const expiry = Number(expiryStr);
      if (Date.now() > expiry) {
        // Token has expired
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

/**
 * Remove stored Token upon logout
 */
export function removeStoredToken(): void {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
  } catch (e) {
    console.error("Failed to clear authentication token", e);
  }
}

export const DEFAULT_USER: UserInfo = {
  empId: "CP-95018",
  name: "张志强",
  role: "调度指挥专员",
  department: "国家邮政速递物流总调控中心",
  phone: "138****8818",
  avatarUrl:
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
  lastLoginTime: "2026-09-13 08:30:12",
};

export function getStoredUser(): UserInfo | null {
  try {
    // Check token first
    const token = getStoredToken();
    const data = localStorage.getItem(USER_SESSION_KEY);
    if (data) {
      const parsed: UserInfo = JSON.parse(data);
      if (token) {
        parsed.token = token;
      }
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

export function getStoredPackages(): ExpressPackage[] {
  try {
    const data = localStorage.getItem(PACKAGES_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Failed to load packages from storage", e);
  }
  return INITIAL_PACKAGES;
}

export function saveStoredPackages(packages: ExpressPackage[]): void {
  try {
    localStorage.setItem(PACKAGES_KEY, JSON.stringify(packages));
  } catch (e) {
    console.error("Failed to save packages to storage", e);
  }
}

export function getStoredNotifications(): NotificationLog[] {
  try {
    const data = localStorage.getItem(NOTIFICATIONS_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Failed to load notifications", e);
  }
  return INITIAL_NOTIFICATIONS;
}

export function saveStoredNotifications(notifications: NotificationLog[]): void {
  try {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  } catch (e) {
    console.error("Failed to save notifications", e);
  }
}

export function isAudioEnabled(): boolean {
  try {
    const val = localStorage.getItem(AUDIO_ENABLED_KEY);
    return val !== "false";
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

const TABS_KEY = "chinapost_tabs_v1";
const ACTIVE_TAB_KEY = "chinapost_active_tab_v1";

export function getStoredTabs<T>(fallback: T[]): T[] {
  try {
    const data = localStorage.getItem(TABS_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to load tabs from storage", e);
  }
  return fallback;
}

export function saveStoredTabs<T>(tabs: T[]): void {
  try {
    localStorage.setItem(TABS_KEY, JSON.stringify(tabs));
  } catch (e) {
    console.error("Failed to save tabs to storage", e);
  }
}

export function getStoredActiveTabId(fallback: string): string {
  try {
    const val = localStorage.getItem(ACTIVE_TAB_KEY);
    return val || fallback;
  } catch {
    return fallback;
  }
}

export function saveStoredActiveTabId(tabId: string): void {
  try {
    localStorage.setItem(ACTIVE_TAB_KEY, tabId);
  } catch {
    // ignore
  }
}
