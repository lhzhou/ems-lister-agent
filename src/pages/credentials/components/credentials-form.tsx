import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import { useState } from "react";
import {
  Button,
  Form,
  Input,
  Modal,
  Password,
  Select,
  ViewFields,
  credentialStatusTone,
  formatDateTime,
  notify,
  statusDot,
} from "@/src/components/Form";
import { copyText } from "@/src/lib/clipboard";
import type { CustomerRecord } from "@/src/pages/customers/model/types";
import {
  CREDENTIAL_STATUS_OPTIONS,
  credentialInterfaceLabel,
  credentialProtocolNo,
  credentialPublishURL,
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

function SecretValue({ value, configured }: { value?: string; configured?: boolean }) {
  const [visible, setVisible] = useState(false);
  const secret = String(value ?? "").trim();
  if (!secret) {
    return <span>{configured ? "已配置" : "未配置"}</span>;
  }
  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      <span className="min-w-0 break-all font-mono">{visible ? secret : "••••••••"}</span>
      <Button
        type="link"
        className="app-action-view px-0"
        icon={visible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
        onClick={() => setVisible((current) => !current)}
      >
        {visible ? "隐藏" : "查看"}
      </Button>
    </span>
  );
}

function CopyableValue({ value }: { value: string }) {
  if (!value) return <span>—</span>;
  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      <span className="min-w-0 break-all font-mono">{value}</span>
      <Button
        type="link"
        className="app-action-view px-0"
        onClick={() => {
          void copyText(value).then((ok) => {
            if (ok) notify.success("已复制");
            else notify.error("复制失败");
          });
        }}
      >
        复制
      </Button>
    </span>
  );
}

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
  const publishURL = credentialPublishURL(record?.gateway_route_key);

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
            { label: "测试协议号", value: credentialProtocolNo(record, "testing") || "—" },
            {
              label: "测试授权码",
              value: (
                <SecretValue
                  value={record.test_authorization}
                  configured={record.test_configured}
                />
              ),
            },
            {
              label: "测试签名密钥",
              value: (
                <SecretValue
                  value={record.test_signature_key}
                  configured={record.test_configured}
                />
              ),
            },
            { label: "正式协议号", value: credentialProtocolNo(record, "production") || "—" },
            {
              label: "正式授权码",
              value: (
                <SecretValue
                  value={record.production_authorization}
                  configured={record.production_configured}
                />
              ),
            },
            {
              label: "正式签名密钥",
              value: (
                <SecretValue
                  value={record.production_signature_key}
                  configured={record.production_configured}
                />
              ),
            },
            { label: "接口", value: credentialInterfaceLabel(record) },
            { label: "路由键", value: <CopyableValue value={publishURL} /> },
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
