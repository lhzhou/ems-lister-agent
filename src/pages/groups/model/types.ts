export type GroupRecord = {
  id: number;
  code: string;
  name: string;
  admin_division_id?: number;
  postal_organization_id?: number;
  leader_account_id: number;
  enabled: boolean;
};

export type GroupPage = {
  items: GroupRecord[];
  total: number;
  page: number;
  size: number;
};

export type CreateGroupInput = {
  name: string;
  code?: string;
  leader_account_id: number;
};

export type UpdateGroupInput = {
  name: string;
  leader_account_id: number;
  enabled?: boolean;
};

export const GROUP_STATUS_OPTIONS = [
  { value: "", label: "全部状态" },
  { value: "true", label: "启用" },
  { value: "false", label: "停用" },
] as const;
