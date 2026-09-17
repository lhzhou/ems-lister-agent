/** @route
meta:
  layout: default
  title: 密钥管理
*/

import { useState } from "react";
import { credentialsApi } from "@/src/api";
import { Button, notify } from "@/src/components/Form";
import { CredentialsForm, type CredentialFormValues } from "../components/credentials-form";
import { CredentialsSearch } from "../components/credentials-search";
import { CredentialsTable } from "../components/credentials-table";
import { useCredentials } from "../hooks/use-credentials";
import type { CustomerCredentialInput, CustomerCredentialRecord } from "../model/credential-types";

function toInput(values: CredentialFormValues): CustomerCredentialInput {
  const interfaces = values.interfaces ?? [];
  return {
    name: values.name,
    description: values.description,
    sender_no: values.sender_no,
    test_protocol_no: values.test_protocol_no,
    production_protocol_no: values.production_protocol_no,
    test_authorization: values.test_authorization,
    test_signature_key: values.test_signature_key,
    production_authorization: values.production_authorization,
    production_signature_key: values.production_signature_key,
    status: values.status,
    supports_tracking_publish: interfaces.includes("publish"),
    supports_tracking_query: interfaces.includes("query"),
  };
}

export default function CredentialsPage() {
  const credentials = useCredentials();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit" | "view">("create");
  const [selected, setSelected] = useState<CustomerCredentialRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const openDrawer = (
    nextMode: "create" | "edit" | "view",
    record: CustomerCredentialRecord | null = null,
  ) => {
    setMode(nextMode);
    setSelected(record);
    setFormError("");
    setOpen(true);
  };

  const submit = async (values: CredentialFormValues) => {
    const customerId = values.customer_id || selected?.customer_id;
    if (!customerId) {
      setFormError("请选择客户");
      return;
    }
    if (!values.test_protocol_no?.trim() && !values.production_protocol_no?.trim()) {
      setFormError("请至少填写测试协议号或正式协议号");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      if (mode === "create") {
        await credentialsApi.create(customerId, toInput(values));
        notify.success("密钥已创建");
      } else if (selected) {
        await credentialsApi.update(selected.id, toInput(values));
        notify.success("密钥已更新");
      }
      setOpen(false);
      credentials.reload();
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : "保存失败");
      throw cause;
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item: CustomerCredentialRecord) => {
    try {
      await credentialsApi.remove(item.id);
      notify.success("密钥已删除");
      credentials.reload();
    } catch (cause) {
      notify.error(cause instanceof Error ? cause.message : "删除失败");
    }
  };

  return (
    <div className="space-y-4">
      <CredentialsSearch
        keyword={credentials.keyword}
        status={credentials.status}
        onKeywordChange={credentials.setKeyword}
        onStatusChange={credentials.setStatus}
        onReset={credentials.resetFilters}
      />
      <CredentialsTable
        items={credentials.items}
        total={credentials.total}
        loading={credentials.loading}
        error={credentials.error}
        extra={
          <Button type="create" onClick={() => openDrawer("create")}>
            新增密钥
          </Button>
        }
        onReload={credentials.reload}
        onView={(item) => openDrawer("view", item)}
        onEdit={(item) => openDrawer("edit", item)}
        onDelete={remove}
      />
      <CredentialsForm
        open={open}
        mode={mode}
        saving={saving}
        record={selected}
        customers={credentials.customers}
        customersLoading={credentials.customersLoading}
        error={formError}
        onClose={() => setOpen(false)}
        onSubmit={submit}
        onEdit={selected ? () => openDrawer("edit", selected) : undefined}
      />
    </div>
  );
}
