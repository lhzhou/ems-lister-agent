import { BankOutlined } from "@ant-design/icons";
import {
  Form,
  Input,
  Modal,
  Select,
  TextArea,
  ViewFields,
  formatDateTime,
  customerStatusTone,
  formatRelativeTime,
  statusDot,
  type ViewField,
} from "@/src/components/Form";
import {
  CUSTOMER_STATUS_OPTIONS,
  customerStatusLabel,
  type CustomerRecord,
} from "@/src/pages/customers/model/types";

export type EnterpriseFormValues = {
  customer_name?: string;
  contact_name?: string;
  contact_phone?: string;
  remark?: string;
  status?: "normal" | "frozen";
};

export function EnterprisesForm({
  open,
  mode,
  saving,
  record,
  error,
  onClose,
  onSubmit,
  onEdit,
}: {
  open: boolean;
  mode: "create" | "edit" | "view";
  saving: boolean;
  record: CustomerRecord | null;
  error: string;
  onClose: () => void;
  onSubmit: (values: EnterpriseFormValues) => void;
  onEdit?: () => void;
}) {
  const [form] = Form.useForm<EnterpriseFormValues>();
  const readOnly = mode === "view";
  const title = mode === "create" ? "新增企业" : mode === "edit" ? "编辑企业" : "查看企业";

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
              {
                label: "状态",
                value: statusDot(
                  customerStatusLabel(record.status),
                  customerStatusTone(record.status),
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
          requiredMark
          initialValues={
            record
              ? {
                  customer_name: record.customer_name,
                  contact_name: record.contact_name,
                  contact_phone: record.contact_phone,
                  remark: record.remark,
                  status: record.status === "frozen" ? "frozen" : "normal",
                }
              : { status: "normal" }
          }
          onFinish={onSubmit}
        >
          <Form.Item
            name="customer_name"
            label="公司名称"
            rules={[{ required: true, message: "请输入公司名称" }]}
          >
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item
            name="contact_name"
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
          <Form.Item name="remark" label="备注">
            <TextArea
              maxLength={200}
              showCount
              rows={4}
              placeholder="请输入企业补充信息、开户许可证号或特殊服务约定..."
            />
          </Form.Item>
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
