import { useState } from "react";
import { customersApi } from "@/src/api";
import { Button, notify } from "@/src/components/Form";
import { useCustomers } from "../hooks/use-customers";
import type { CustomerRecord } from "../model/types";
import { CustomersForm, type CustomerFormValues } from "./customers-form";
import { CustomersSearch } from "./customers-search";
import { CustomersTable } from "./customers-table";

export function CustomersDirectory({
  title,
  createLabel,
  variant = "enterprise",
}: {
  title: string;
  createLabel: string;
  variant?: "enterprise" | "account";
}) {
  const customers = useCustomers();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit" | "view">("create");
  const [selected, setSelected] = useState<CustomerRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [enterprises, setEnterprises] = useState<CustomerRecord[]>([]);
  const accountMode = variant === "account";

  const loadEnterprises = () => {
    if (!accountMode) return;
    void customersApi
      .list({ page: 1, size: 200 })
      .then((payload) => setEnterprises(payload.items ?? []))
      .catch(() => setEnterprises([]));
  };

  const openDrawer = (
    nextMode: "create" | "edit" | "view",
    record: CustomerRecord | null = null,
  ) => {
    setMode(nextMode);
    setSelected(record);
    setFormError("");
    setOpen(true);
    if (accountMode) setEnterprises(customers.items);
    loadEnterprises();
  };

  const submit = async (values: CustomerFormValues) => {
    setSaving(true);
    setFormError("");
    try {
      if (accountMode) {
        const contactName = values.login_display_name || values.contact_name || "";
        if (mode === "create") {
          await customersApi.create({
            customer_id: values.customer_id,
            contact_name: contactName,
            contact_phone: values.contact_phone,
            login_username: values.login_username,
            login_password: values.login_password,
            login_display_name: contactName,
            login_role: values.login_role,
          });
          notify.success("客户已创建");
        } else if (selected) {
          await customersApi.update(selected.id, {
            customer_name: selected.customer_name,
            contact_name: contactName,
            contact_phone: values.contact_phone || selected.contact_phone,
            status: values.status,
            login_username: selected.login_username,
            login_password: values.login_password,
            login_display_name: contactName,
            login_role: values.login_role,
            login_account_id: selected.login_account_id,
          });
          notify.success("客户已更新");
        }
      } else if (mode === "create") {
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
      customers.reload();
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
      notify.success(accountMode ? "客户已删除" : "企业已删除");
      customers.reload();
    } catch (cause) {
      notify.error(cause instanceof Error ? cause.message : "删除失败");
    }
  };

  return (
    <div className="space-y-4">
      <CustomersSearch
        keyword={customers.keyword}
        status={customers.status}
        onKeywordChange={customers.setKeyword}
        onStatusChange={customers.setStatus}
        onReset={customers.resetFilters}
      />
      <CustomersTable
        title={title}
        items={customers.items}
        total={customers.total}
        page={customers.page}
        size={customers.size}
        loading={customers.loading}
        error={customers.error}
        extra={
          <Button type="create" onClick={() => openDrawer("create")}>
            {createLabel}
          </Button>
        }
        onReload={customers.reload}
        onPageChange={customers.setPage}
        onSizeChange={customers.setSize}
        onView={(item) => openDrawer("view", item)}
        onEdit={(item) => openDrawer("edit", item)}
        onDelete={remove}
      />
      <CustomersForm
        open={open}
        mode={mode}
        variant={variant}
        saving={saving}
        record={selected}
        enterprises={enterprises}
        error={formError}
        onClose={() => setOpen(false)}
        onSubmit={submit}
        onEdit={selected ? () => openDrawer("edit", selected) : undefined}
      />
    </div>
  );
}
