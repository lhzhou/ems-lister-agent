export interface UserInfo {
  empId: string;
  name: string;
  role: string;
  department: string;
  phone: string;
  avatarUrl?: string;
  lastLoginTime?: string;
  token?: string;
  tokenExpiresAt?: number | string;
  tokenType?: string;
  serviceAccountId?: string;
  companyName?: string;
  tenants?: unknown[];
}
