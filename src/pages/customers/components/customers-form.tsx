import { Form } from "antd";
import { BankOutlined } from "@ant-design/icons";
import {
  Input,
  Modal,
  Password,
  Select,
  TextArea,
  ViewFields,
  formatDateTime,
  formatRelativeTime,
  statusDot,
  type ViewField,
} from "@/src/components/Form";
import {
  CUSTOMER_LOGIN_ROLE_OPTIONS,
  CUSTOMER_STATUS_OPTIONS,
  customerLoginRoleLabel,
  customerStatusLabel,
  type CustomerRecord,
} from "../model/types";

export type CustomerFormValues = {
  customer_id?: number;
  customer_name?: string;
  customer_type?: string;
  contact_name?: string;
  contact_phone?: string;
  description?: string;
  remark?: string;
  status?: "normal" | "frozen";
  login_username?: string;
  login_password?: string;
  login_display_name?: string;
  login_role?: "customer_admin" | "customer_member";
};

export function CustomersForm({
  open,
  mode,
  variant = "enterprise",
  saving,
  record,
  enterprises = [],
  error,
  onClose,
  onSubmit,
  onEdit,
}: {
  open: boolean;
  mode: "create" | "edit" | "view";
  variant?: "enterprise" | "account";
  saving: boolean;
  record: CustomerRecord | null;
  enterprises?: CustomerRecord[];
  error: string;
  onClose: () => void;
  onSubmit: (values: CustomerFormValues) => void;
  onEdit?: () => void;
}) {
  const [form] = Form.useForm<CustomerFormValues>();
  const readOnly = mode === "view";
  const accountMode = variant === "account";
  const entity = accountMode ? "客户" : "企业";
  const title =
    mode === "create" ? "新增" + entity : mode === "edit" ? "编辑" + entity : "查看" + entity;
  const selectableEnterprises = enterprises;

  return (
    <Modal
      title={
        readOnly ? (
          <span className="inline-flex items-center gap-2">
            <BankOutlined className="text-primary" />
            {title}
          </span>
        ) : (
          title
        )
      }
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
          items={
            [
              { label: "公司名称", value: record.customer_name },
              {
                label: "客户编号",
                value: (
                  <span className="rounded-md border border-outline bg-surface px-2 py-0.5 font-mono text-xs text-on-surface">
                    {record.customer_no || "—"}
                  </span>
                ),
              },
              { label: "联系人", value: record.contact_name },
              {
                label: "联系电话",
                value: record.contact_phone,
                extra: record.contact_phone ? (
                  <a className="text-xs text-primary" href={"tel:" + record.contact_phone}>
                    呼叫
                  </a>
                ) : null,
              },
              ...(accountMode
                ? [
                    { label: "登录账号", value: record.login_username || "未绑定" },
                    { label: "角色", value: customerLoginRoleLabel(record.login_role) },
                  ]
                : []),
              {
                label: "状态",
                value: statusDot(
                  customerStatusLabel(record.status),
                  record.status === "frozen" ? "warning" : "success",
                ),
              },
              {
                label: "备注",
                value: record.remark ? record.remark : "—",
                extra: record.remark ? null : (
                  <span className="font-normal text-on-surface-disabled">(暂无补充说明)</span>
                ),
              },
            ] satisfies ViewField[]
          }
          footer={
            <>
              <span>档案创建：{formatDateTime(record.created_at)}</span>
              <span>最近同步：{formatRelativeTime(record.updated_at)}</span>
            </>
          }
        />
      ) : (
        <Form
          form={form}
          layout="vertical"
          size="large"
          requiredMark
          initialValues={
            record
              ? {
                  customer_id: record.id,
                  customer_name: record.customer_name,
                  customer_type: record.customer_type,
                  contact_name: record.contact_name,
                  contact_phone: record.contact_phone,
                  description: record.description,
                  remark: record.remark,
                  status: record.status === "frozen" ? "frozen" : "normal",
                  login_username: record.login_username,
                  login_display_name: record.login_display_name || record.contact_name,
                  login_role:
                    record.login_role === "customer_member" ? "customer_member" : "customer_admin",
                }
              : { status: "normal", login_role: "customer_admin" }
          }
          onFinish={onSubmit}
        >
          {accountMode ? (
            <Form.Item
              name="customer_id"
              label="公司"
              rules={[{ required: true, message: "请选择公司" }]}
            >
              <Select
                allowClear={false}
                showSearch
                optionFilterProp="label"
                placeholder="请选择本机构企业"
                disabled={mode === "edit"}
                options={selectableEnterprises.map((item) => ({
                  value: item.id,
                  label: item.customer_name,
                }))}
                onChange={(id) => {
                  const selected = selectableEnterprises.find((item) => item.id === id);
                  if (!selected) return;
                  form.setFieldsValue({
                    contact_name: selected.contact_name,
                    contact_phone: selected.contact_phone,
                    login_display_name: selected.contact_name,
                    remark: selected.remark,
                    status: selected.status === "frozen" ? "frozen" : "normal",
                  });
                }}
              />
            </Form.Item>
          ) : (
            <Form.Item
              name="customer_name"
              label="公司名称"
              rules={[{ required: true, message: "请输入公司名称" }]}
            >
              <Input maxLength={100} />
            </Form.Item>
          )}
          <Form.Item
            name={accountMode ? "login_display_name" : "contact_name"}
            label="联系人"
            rules={[{ required: true, message: "请输入联系人" }]}
          >
            <Input maxLength={50} />
          </Form.Item>
          <Form.Item
            name="contact_phone"
            label="联系电话"
            rules={[{ required: true, message: "请输入联系电话" }]}
          >
            <Input maxLength={30} />
          </Form.Item>
          {accountMode ? (
            <>
              <Form.Item
                name="login_username"
                label="登录账号"
                rules={[{ required: true, message: "请输入登录账号" }]}
              >
                <Input maxLength={100} disabled={mode === "edit"} />
              </Form.Item>
              <Form.Item
                name="login_password"
                label={mode === "create" || !record?.login_account_id ? "登录密码" : "重置登录密码"}
                rules={
                  mode === "create" || !record?.login_account_id
                    ? [{ required: true, min: 8, message: "密码至少 8 位" }]
                    : []
                }
              >
                <Password
                  maxLength={256}
                  placeholder={
                    mode === "create" || !record?.login_account_id ? "至少 8 位" : "留空则不修改"
                  }
                />
              </Form.Item>
              <Form.Item
                name="login_role"
                label="客户角色"
                rules={[{ required: true, message: "请选择客户角色" }]}
              >
                <Select
                  allowClear={false}
                  options={CUSTOMER_LOGIN_ROLE_OPTIONS.map((option) => ({
                    value: option.value,
                    label: option.label,
                  }))}
                />
              </Form.Item>
            </>
          ) : (
            <Form.Item name="remark" label="备注">
              <TextArea
                maxLength={200}
                showCount
                rows={4}
                placeholder="请输入企业补充信息、开户许可证号或特殊服务约定..."
              />
            </Form.Item>
          )}
          {mode === "edit" ? (
            <Form.Item
              name="status"
              label="状态"
              rules={[{ required: true, message: "请选择状态" }]}
            >
              <Select
                allowClear={false}
                options={CUSTOMER_STATUS_OPTIONS.filter((option) => option.value).map((option) => ({
                  value: option.value,
                  label: option.label,
                }))}
              />
            </Form.Item>
          ) : null}
        </Form>
      )}
    </Modal>
  );
}
