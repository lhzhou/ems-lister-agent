export type CustomerStatus = "normal" | "frozen";
export type CustomerLoginRole = "customer_admin" | "customer_member";

export type CustomerRecord = {
  id: number;
  customer_no: string;
  customer_name: string;
  customer_type?: string;
  contact_name: string;
  contact_phone: string;
  description?: string;
  remark?: string;
  status: CustomerStatus | string;
  enabled: boolean;
  login_account_id?: number;
  login_username?: string;
  login_display_name?: string;
  login_role?: string;
  created_at?: string;
  updated_at?: string;
};

export type CustomerPage = {
  items: CustomerRecord[];
  total: number;
  page: number;
  size: number;
};

export type CreateCustomerInput = {
  customer_id?: number;
  customer_name?: string;
  customer_type?: string;
  contact_name?: string;
  contact_phone?: string;
  description?: string;
  remark?: string;
  status?: CustomerStatus;
  login_username?: string;
  login_password?: string;
  login_display_name?: string;
  login_role?: CustomerLoginRole;
};

export type UpdateCustomerInput = {
  customer_name?: string;
  customer_type?: string;
  contact_name?: string;
  contact_phone?: string;
  description?: string;
  remark?: string;
  status?: CustomerStatus;
  enabled?: boolean;
  login_username?: string;
  login_password?: string;
  login_display_name?: string;
  login_role?: CustomerLoginRole;
  login_account_id?: number;
};

export const CUSTOMER_STATUS_OPTIONS = [
  { value: "", label: "全部状态" },
  { value: "normal", label: "正常" },
  { value: "frozen", label: "冻结" },
] as const;

export const CUSTOMER_LOGIN_ROLE_OPTIONS = [
  { value: "customer_admin", label: "客户管理员" },
  { value: "customer_member", label: "客户成员" },
] as const;

export function customerStatusLabel(status: string) {
  return CUSTOMER_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;
}

export function customerLoginRoleLabel(role?: string) {
  if (!role) return "未绑定";
  return CUSTOMER_LOGIN_ROLE_OPTIONS.find((option) => option.value === role)?.label ?? role;
}
