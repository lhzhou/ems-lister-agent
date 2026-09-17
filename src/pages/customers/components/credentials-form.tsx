import {
  Form,
  Input,
  Modal,
  Password,
  Select,
  ViewFields,
  credentialStatusTone,
  formatDateTime,
  statusDot,
} from "@/src/components/Form";
import type { CustomerRecord } from "../model/types";
import {
  CREDENTIAL_STATUS_OPTIONS,
  credentialConfiguredLabel,
  credentialInterfaceLabel,
  credentialProtocolNo,
  credentialStatusLabel,
  type CustomerCredentialRecord,
} from "../model/credential-types";

export type CredentialFormValues = {
  customer_id?: number;
  name: string;
  description?: string;
  sender_no?: string;
  test_protocol_no?: string;
  test_authorization?: string;
  test_signature_key?: string;
  production_protocol_no?: string;
  production_authorization?: string;
  production_signature_key?: string;
  interfaces?: string[];
  status?: "active" | "disabled";
};

export function CredentialsForm({
  open,
  mode,
  saving,
  record,
  customers,
  customersLoading,
  error,
  onClose,
  onSubmit,
  onEdit,
}: {
  open: boolean;
  mode: "create" | "edit" | "view";
  saving: boolean;
  record: CustomerCredentialRecord | null;
  customers: CustomerRecord[];
  customersLoading: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (values: CredentialFormValues) => void;
  onEdit?: () => void;
}) {
  const [form] = Form.useForm<CredentialFormValues>();
  const readOnly = mode === "view";
  const title = mode === "create" ? "新增密钥" : mode === "edit" ? "编辑密钥" : "查看密钥";

  return (
    <Modal
      title={title}
      size="large"
      open={open}
      onCancel={onClose}
      onOk={() => (readOnly ? onEdit?.() : form.validateFields().then(onSubmit))}
      confirmLoading={saving}
      okText={readOnly ? "进入编辑" : "保存"}
      okButtonProps={{ style: readOnly && !onEdit ? { display: "none" } : undefined }}
      cancelText={readOnly ? "关闭" : "取消"}
    >
      {error ? <p className="mb-4 text-sm text-error">{error}</p> : null}
      {mode === "view" && record ? (
        <ViewFields
          items={[
            { label: "客户", value: record.customer_name || "—" },
            { label: "密钥名称", value: record.name },
            { label: "描述", value: record.description || "—" },
            { label: "协议号（兼容）", value: record.postal_customer_no || "—" },
            { label: "测试协议号", value: credentialProtocolNo(record, "testing") || "—" },
            { label: "测试授权码", value: credentialConfiguredLabel(record.test_configured) },
            { label: "测试签名密钥", value: credentialConfiguredLabel(record.test_configured) },
            { label: "正式协议号", value: credentialProtocolNo(record, "production") || "—" },
            {
              label: "正式授权码",
              value: credentialConfiguredLabel(record.production_configured),
            },
            {
              label: "正式签名密钥",
              value: credentialConfiguredLabel(record.production_configured),
            },
            { label: "接口", value: credentialInterfaceLabel(record) },
            { label: "路由键", value: record.gateway_route_key || "—" },
            {
              label: "状态",
              value: statusDot(
                credentialStatusLabel(record.status),
                credentialStatusTone(record.status),
              ),
            },
            { label: "创建时间", value: formatDateTime(record.created_at) },
            { label: "更新时间", value: formatDateTime(record.updated_at) },
          ]}
        />
      ) : (
        <Form
          key={`${mode}-${record?.id ?? "new"}`}
          form={form}
          size="large"
          initialValues={
            record
              ? {
                  customer_id: record.customer_id,
                  name: record.name,
                  description: record.description,
                  sender_no: record.sender_no,
                  test_protocol_no: record.test_protocol_no || record.postal_customer_no,
                  production_protocol_no: record.production_protocol_no,
                  interfaces: [
                    record.supports_tracking_publish ? "publish" : "",
                    record.supports_tracking_query ? "query" : "",
                  ].filter(Boolean),
                  status: record.status === "disabled" ? "disabled" : "active",
                }
              : { status: "active", interfaces: ["publish", "query"] }
          }
          onFinish={onSubmit}
        >
          <Form.Item
            name="customer_id"
            label="所属客户"
            rules={[{ required: true, message: "请选择客户" }]}
          >
            <Select
              disabled={mode === "edit"}
              loading={customersLoading}
              placeholder="请选择客户"
              options={customers.map((customer) => ({
                value: customer.id,
                label: customer.customer_name,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="name"
            label="密钥名称"
            rules={[{ required: true, message: "请输入名称" }]}
          >
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item name="sender_no" label="协议客户标识码">
            <Input maxLength={64} />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input maxLength={200} />
          </Form.Item>

          <p className="mb-3 border-b border-outline pb-1 text-sm font-medium text-on-surface">
            测试密钥
          </p>
          <Form.Item
            name="test_protocol_no"
            label="测试协议号"
            rules={[
              {
                validator: async () => {
                  const testing = String(form.getFieldValue("test_protocol_no") ?? "").trim();
                  const production = String(
                    form.getFieldValue("production_protocol_no") ?? "",
                  ).trim();
                  if (!testing && !production) {
                    throw new Error("请至少填写测试协议号或正式协议号");
                  }
                },
              },
            ]}
          >
            <Input maxLength={64} />
          </Form.Item>
          <Form.Item name="test_authorization" label="测试授权码">
            <Password
              placeholder={record?.test_configured ? "已配置，留空保持不变" : "请输入测试授权码"}
            />
          </Form.Item>
          <Form.Item name="test_signature_key" label="测试签名密钥">
            <Password
              placeholder={record?.test_configured ? "已配置，留空保持不变" : "请输入测试签名密钥"}
            />
          </Form.Item>

          <p className="mb-3 border-b border-outline pb-1 text-sm font-medium text-on-surface">
            正式密钥
          </p>
          <Form.Item name="production_protocol_no" label="正式协议号">
            <Input maxLength={64} />
          </Form.Item>
          <Form.Item name="production_authorization" label="正式授权码">
            <Password
              placeholder={
                record?.production_configured ? "已配置，留空保持不变" : "请输入正式授权码"
              }
            />
          </Form.Item>
          <Form.Item name="production_signature_key" label="正式签名密钥">
            <Password
              placeholder={
                record?.production_configured ? "已配置，留空保持不变" : "请输入正式签名密钥"
              }
            />
          </Form.Item>

          <Form.Item
            name="interfaces"
            label="可用接口"
            extra="测试密钥与正式密钥共用同一套接口地址，差异只在协议号、授权码和签名密钥。"
          >
            <Select
              mode="multiple"
              allowClear
              options={[
                { value: "publish", label: "轨迹订阅" },
                { value: "query", label: "轨迹查询" },
              ]}
            />
          </Form.Item>
          {mode === "edit" ? (
            <Form.Item name="status" label="状态">
              <Select
                allowClear={false}
                options={CREDENTIAL_STATUS_OPTIONS.filter((option) => option.value).map(
                  (option) => ({
                    value: option.value,
                    label: option.label,
                  }),
                )}
              />
            </Form.Item>
          ) : null}
        </Form>
      )}
    </Modal>
  );
}
