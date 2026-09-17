import {
  Form,
  enabledStatusTone,
  Input,
  Modal,
  Select,
  ViewFields,
  statusDot,
} from "@/src/components/Form";
import type { AccountRecord } from "@/src/pages/accounts/model/types";
import type { GroupRecord } from "../model/types";

export type GroupFormValues = {
  name: string;
  code?: string;
  leader_account_id: number;
  enabled?: boolean | number;
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
            { label: "组名称", value: record.name },
            { label: "组编码", value: record.code },
            { label: "组长", value: leaderName(record.leader_account_id) },
            {
              label: "状态",
              value: statusDot(record.enabled ? "启用" : "停用", enabledStatusTone(record.enabled)),
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
                  name: record.name,
                  code: record.code,
                  leader_account_id: record.leader_account_id,
                  enabled: record.enabled ? 1 : 0,
                }
              : { enabled: true }
          }
          onFinish={onSubmit}
        >
          <Form.Item
            name="name"
            label="组名称"
            rules={[{ required: true, message: "请输入组名称" }]}
          >
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item name="code" label="组编码">
            <Input maxLength={50} disabled={mode === "edit"} placeholder="留空则自动生成" />
          </Form.Item>
          <Form.Item
            name="leader_account_id"
            label="组长"
            rules={[{ required: true, message: "请选择组长" }]}
          >
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
                  { value: 1, label: "启用" },
                  { value: 0, label: "停用" },
                ]}
              />
            </Form.Item>
          ) : null}
        </Form>
      )}
    </Modal>
  );
}
