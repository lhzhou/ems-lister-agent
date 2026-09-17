export type CustomerCredentialRecord = {
  id: number;
  customer_id: number;
  name: string;
  description?: string;
  postal_customer_no?: string;
  sender_no?: string;
  gateway_route_key?: string;
  status: string;
  test_configured?: boolean;
  production_configured?: boolean;
};

export function credentialStatusLabel(status: string) {
  if (status === "active") return "启用";
  if (status === "disabled") return "停用";
  return status || "未知";
}
