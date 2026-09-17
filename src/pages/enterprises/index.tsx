/** @route
meta:
  layout: default
  title: 企业管理
*/

import { useState } from "react";
import { customersApi } from "@/src/api";
import { Button, notify } from "@/src/components/Form";
import { EnterprisesForm, type EnterpriseFormValues } from "./components/enterprises-form";
import { EnterprisesSearch } from "./components/enterprises-search";
import { EnterprisesTable } from "./components/enterprises-table";
import { useEnterprises } from "./hooks/use-enterprises";
import type { CustomerRecord } from "@/src/pages/customers/model/types";

export default function EnterprisesPage() {
  const enterprises = useEnterprises();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit" | "view">("create");
  const [selected, setSelected] = useState<CustomerRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const openDrawer = (
    nextMode: "create" | "edit" | "view",
    record: CustomerRecord | null = null,
  ) => {
    setMode(nextMode);
    setSelected(record);
    setFormError("");
    setOpen(true);
  };

  const submit = async (values: EnterpriseFormValues) => {
    setSaving(true);
    setFormError("");
    try {
      if (mode === "create") {
        await customersApi.create({
          customer_name: values.customer_name,
          contact_name: values.contact_name,
          contact_phone: values.contact_phone,
          remark: values.remark,
          status: values.status,
        });
        notify.success("企业已创建");
      } else if (selected) {
        await customersApi.update(selected.id, {
          customer_name: values.customer_name || selected.customer_name,
          contact_name: values.contact_name || selected.contact_name,
          contact_phone: values.contact_phone || selected.contact_phone,
          remark: values.remark,
          status: values.status,
        });
        notify.success("企业已更新");
      }
      setOpen(false);
      enterprises.reload();
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : "保存失败");
      throw cause;
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item: CustomerRecord) => {
    try {
      await customersApi.remove(item.id);
      notify.success("企业已删除");
      enterprises.reload();
    } catch (cause) {
      notify.error(cause instanceof Error ? cause.message : "删除失败");
    }
  };

  return (
    <div className="space-y-4">
      <EnterprisesSearch
        keyword={enterprises.keyword}
        status={enterprises.status}
        onKeywordChange={enterprises.setKeyword}
        onStatusChange={enterprises.setStatus}
        onReset={enterprises.resetFilters}
      />
      <EnterprisesTable
        items={enterprises.items}
        total={enterprises.total}
        page={enterprises.page}
        size={enterprises.size}
        loading={enterprises.loading}
        error={enterprises.error}
        extra={
          <Button type="create" onClick={() => openDrawer("create")}>
            新增企业
          </Button>
        }
        onReload={enterprises.reload}
        onPageChange={enterprises.setPage}
        onSizeChange={enterprises.setSize}
        onView={(item) => openDrawer("view", item)}
        onEdit={(item) => openDrawer("edit", item)}
        onDelete={remove}
      />
      <EnterprisesForm
        open={open}
        mode={mode}
        saving={saving}
        record={selected}
        error={formError}
        onClose={() => setOpen(false)}
        onSubmit={submit}
        onEdit={selected ? () => openDrawer("edit", selected) : undefined}
      />
    </div>
  );
}
