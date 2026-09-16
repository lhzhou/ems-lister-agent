import { Button, Drawer, Form, Input as AntInput } from "antd";
import { Input, Select } from "@/src/components/Form";
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
    <Drawer
      title={title}
      open={open}
      onClose={onClose}
      width={460}
      destroyOnClose
      extra={
        readOnly ? null : (
          <Button type="primary" loading={saving} onClick={() => form.submit()}>
            保存
          </Button>
        )
      }
    >
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
      {mode === "view" && record ? (
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-stone-400">登录账号</dt>
            <dd className="font-mono text-stone-900">{record.username}</dd>
          </div>
          <div>
            <dt className="text-stone-400">姓名</dt>
            <dd>{record.display_name}</dd>
          </div>
          <div>
            <dt className="text-stone-400">岗位</dt>
            <dd>{accountTypeLabel(record.type)}</dd>
          </div>
          <div>
            <dt className="text-stone-400">客服组</dt>
            <dd>{record.group_name || "—"}</dd>
          </div>
          <div>
            <dt className="text-stone-400">状态</dt>
            <dd>{accountStatusLabel(record.status)}</dd>
          </div>
        </dl>
      ) : (
        <Form
          form={form}
          layout="vertical"
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
          <Form.Item name="username" label="登录账号" rules={[{ required: true, message: "请输入登录账号" }]}>
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item name="display_name" label="姓名" rules={[{ required: true, message: "请输入姓名" }]}>
            <Input maxLength={100} />
          </Form.Item>
          {mode === "create" ? (
            <Form.Item
              name="password"
              label="初始密码"
              rules={[{ required: true, min: 8, message: "密码至少 8 位" }]}
            >
              <AntInput.Password maxLength={256} />
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
    </Drawer>
  );
}
