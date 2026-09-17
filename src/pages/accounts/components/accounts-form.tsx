import {
  Form,
  accountStatusTone,
  Input,
  Modal,
  Password,
  Select,
  ViewFields,
  statusDot,
} from "@/src/components/Form";
import type { GroupRecord } from "@/src/pages/groups/model/types";
import {
  ACCOUNT_STATUS_OPTIONS,
  WRITABLE_ACCOUNT_TYPE_OPTIONS,
  accountStatusLabel,
  accountTypeLabel,
  canManageAccount,
  type AccountRecord,
} from "../model/types";

export type AccountFormValues = {
  username: string;
  display_name: string;
  password?: string;
  type: "service_group_leader" | "customer_service";
  group_id?: number;
  status?: "active" | "disabled" | "locked";
};

export function AccountsForm({
  open,
  mode,
  saving,
  record,
  groups,
  groupsLoading,
  error,
  onClose,
  onSubmit,
}: {
  open: boolean;
  mode: "create" | "edit" | "view";
  saving: boolean;
  record: AccountRecord | null;
  groups: GroupRecord[];
  groupsLoading: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (values: AccountFormValues) => void;
}) {
  const [form] = Form.useForm<AccountFormValues>();
  const readOnly = mode === "view";
  const title = mode === "create" ? "新增账号" : mode === "edit" ? "编辑账号" : "查看账号";

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onClose}
      onOk={() => (readOnly ? onClose() : form.validateFields().then(onSubmit))}
      confirmLoading={saving}
      okButtonProps={{ style: readOnly ? { display: "none" } : undefined }}
      cancelText={readOnly ? "关闭" : "取消"}
    >
      {error ? <p className="mb-4 text-sm text-error">{error}</p> : null}
      {mode === "view" && record ? (
        <ViewFields
          items={[
            { label: "登录账号", value: record.username },
            { label: "姓名", value: record.display_name },
            { label: "岗位", value: accountTypeLabel(record.type) },
            { label: "客服组", value: record.group_name || "—" },
            {
              label: "状态",
              value: statusDot(accountStatusLabel(record.status), accountStatusTone(record.status)),
            },
          ]}
        />
      ) : (
        <Form
          form={form}
          size="large"
          initialValues={
            record
              ? {
                  username: record.username,
                  display_name: record.display_name,
                  type: canManageAccount(record.type) ? record.type : "customer_service",
                  group_id: record.group_id || undefined,
                  status: record.status,
                }
              : { type: "customer_service" }
          }
          onFinish={onSubmit}
        >
          <Form.Item
            name="username"
            label="登录账号"
            rules={[{ required: true, message: "请输入登录账号" }]}
          >
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item
            name="display_name"
            label="姓名"
            rules={[{ required: true, message: "请输入姓名" }]}
          >
            <Input maxLength={100} />
          </Form.Item>
          {mode === "create" ? (
            <Form.Item
              name="password"
              label="初始密码"
              rules={[{ required: true, min: 8, message: "密码至少 8 位" }]}
            >
              <Password maxLength={256} />
            </Form.Item>
          ) : null}
          <Form.Item name="type" label="岗位" rules={[{ required: true, message: "请选择岗位" }]}>
            <Select
              allowClear={false}
              options={WRITABLE_ACCOUNT_TYPE_OPTIONS.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
            />
          </Form.Item>
          <Form.Item name="group_id" label="客服组">
            <Select
              loading={groupsLoading}
              placeholder="可选"
              options={groups.map((group) => ({ value: group.id, label: group.name }))}
            />
          </Form.Item>
          {mode === "edit" ? (
            <Form.Item name="status" label="状态">
              <Select
                allowClear={false}
                options={ACCOUNT_STATUS_OPTIONS.filter((option) => option.value).map((option) => ({
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
