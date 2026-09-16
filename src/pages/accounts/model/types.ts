export type AccountStatus = "active" | "disabled" | "locked";

export type AccountType = "postal_admin" | "service_group_leader" | "customer_service";

export type AccountRecord = {
  id: number;
  type: AccountType | string;
  platform_code?: string;
  username: string;
  display_name: string;
  status: AccountStatus | string;
  postal_organization_id?: number;
  postal_organization_name?: string;
  group_id?: number;
  group_name?: string;
};

export type AccountPage = {
  items: AccountRecord[];
  total: number;
  page: number;
  size: number;
};

export type CreateAccountInput = {
  username: string;
  display_name: string;
  type: "service_group_leader" | "customer_service";
  password: string;
  group_id?: number;
};

export type UpdateAccountInput = {
  username?: string;
  display_name?: string;
  status?: AccountStatus;
  password?: string;
  type?: "service_group_leader" | "customer_service";
  group_id?: number;
};

export type ResetAccountPasswordInput = {
  password: string;
};

export const ACCOUNT_TYPE_OPTIONS = [
  { value: "", label: "全部岗位" },
  { value: "service_group_leader", label: "客服组长" },
  { value: "customer_service", label: "客服成员" },
  { value: "postal_admin", label: "邮政管理员" },
] as const;

export const ACCOUNT_STATUS_OPTIONS = [
  { value: "", label: "全部状态" },
  { value: "active", label: "启用" },
  { value: "disabled", label: "停用" },
  { value: "locked", label: "锁定" },
] as const;

export const WRITABLE_ACCOUNT_TYPE_OPTIONS = [
  { value: "service_group_leader", label: "客服组长" },
  { value: "customer_service", label: "客服成员" },
] as const;

export function accountTypeLabel(type: string) {
  return ACCOUNT_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? type;
}

export function accountStatusLabel(status: string) {
  return ACCOUNT_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;
}

export function canManageAccount(type: string) {
  return type === "service_group_leader" || type === "customer_service";
}
