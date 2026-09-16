import { Button, Drawer, Form } from "antd";
import { Input, Select } from "@/src/components/Form";
import type { AccountRecord } from "@/src/pages/accounts/model/types";
import type { GroupRecord } from "../model/types";

export type GroupFormValues = {
  name: string;
  code?: string;
  leader_account_id: number;
  enabled?: boolean;
};

export function GroupsForm({
  open,
  mode,
  saving,
  record,
  leaders,
  leadersLoading,
  error,
  onClose,
  onSubmit,
}: {
  open: boolean;
  mode: "create" | "edit" | "view";
  saving: boolean;
  record: GroupRecord | null;
  leaders: AccountRecord[];
  leadersLoading: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (values: GroupFormValues) => void;
}) {
  const [form] = Form.useForm<GroupFormValues>();
  const readOnly = mode === "view";
  const title = mode === "create" ? "新增客服组" : mode === "edit" ? "编辑客服组" : "查看客服组";
  const leaderName = (id: number) =>
    leaders.find((item) => item.id === id)?.display_name ?? String(id);

  return (
    <Drawer
      title={title}
      open={open}
      onClose={onClose}
      width={440}
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
            <dt className="text-stone-400">组名称</dt>
            <dd>{record.name}</dd>
          </div>
          <div>
            <dt className="text-stone-400">组编码</dt>
            <dd className="font-mono">{record.code}</dd>
          </div>
          <div>
            <dt className="text-stone-400">组长</dt>
            <dd>{leaderName(record.leader_account_id)}</dd>
          </div>
          <div>
            <dt className="text-stone-400">状态</dt>
            <dd>{record.enabled ? "启用" : "停用"}</dd>
          </div>
        </dl>
      ) : (
        <Form
          form={form}
          layout="vertical"
          initialValues={
            record
              ? {
                  name: record.name,
                  code: record.code,
                  leader_account_id: record.leader_account_id,
                  enabled: record.enabled,
                }
              : { enabled: true }
          }
          onFinish={onSubmit}
        >
          <Form.Item name="name" label="组名称" rules={[{ required: true, message: "请输入组名称" }]}>
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item name="code" label="组编码">
            <Input maxLength={50} disabled={mode === "edit"} placeholder="留空则自动生成" />
          </Form.Item>
          <Form.Item name="leader_account_id" label="组长" rules={[{ required: true, message: "请选择组长" }]}>
            <Select
              allowClear={false}
              loading={leadersLoading}
              options={leaders.map((item) => ({
                value: item.id,
                label: `${item.display_name}（${item.username}）`,
              }))}
            />
          </Form.Item>
          {mode === "edit" ? (
            <Form.Item name="enabled" label="状态">
              <Select
                allowClear={false}
                options={[
                  { value: true, label: "启用" },
                  { value: false, label: "停用" },
                ]}
              />
            </Form.Item>
          ) : null}
        </Form>
      )}
    </Drawer>
  );
}
