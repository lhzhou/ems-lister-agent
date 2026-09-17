export type CustomerCredentialRecord = {
  id: number;
  customer_id: number;
  customer_name?: string;
  name: string;
  description?: string;
  postal_customer_no?: string;
  test_protocol_no?: string;
  production_protocol_no?: string;
  sender_no?: string;
  gateway_route_key?: string;
  status: string;
  test_configured?: boolean;
  production_configured?: boolean;
  supports_tracking_publish?: boolean;
  supports_tracking_query?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type CustomerCredentialInput = {
  name: string;
  description?: string;
  test_protocol_no?: string;
  production_protocol_no?: string;
  postal_customer_no?: string;
  sender_no?: string;
  test_authorization?: string;
  test_signature_key?: string;
  production_authorization?: string;
  production_signature_key?: string;
  status?: "active" | "disabled";
  supports_tracking_publish?: boolean;
  supports_tracking_query?: boolean;
};

export const CREDENTIAL_STATUS_OPTIONS = [
  { value: "", label: "全部状态" },
  { value: "active", label: "启用" },
  { value: "disabled", label: "停用" },
];

export function credentialStatusLabel(status: string) {
  if (status === "active") return "启用";
  if (status === "disabled") return "停用";
  return status || "未知";
}

export function credentialConfiguredLabel(configured?: boolean) {
  return configured ? "已配置" : "未配置";
}

export function credentialProtocolNo(
  record: Pick<
    CustomerCredentialRecord,
    "test_protocol_no" | "production_protocol_no" | "postal_customer_no"
  >,
  environment: "testing" | "production",
) {
  if (environment === "testing") {
    return record.test_protocol_no || record.postal_customer_no || "";
  }
  return record.production_protocol_no || record.postal_customer_no || "";
}

export function credentialInterfaceLabel(record: CustomerCredentialRecord) {
  return (
    [
      record.supports_tracking_publish ? "轨迹订阅" : "",
      record.supports_tracking_query ? "轨迹查询" : "",
    ]
      .filter(Boolean)
      .join("、") || "未配置"
  );
}
