/** @route
meta:
  layout: default
  title: 账号管理
*/

import { useEffect, useState } from "react";
import { Button, Input as AntInput, Modal, message } from "antd";
import { Plus } from "lucide-react";
import { accountsApi, groupsApi } from "@/src/api";
import { AccountsForm, type AccountFormValues } from "./components/accounts-form";
import { AccountsSearch } from "./components/accounts-search";
import { AccountsTable } from "./components/accounts-table";
import { useAccounts } from "./hooks/use-accounts";
import { canManageAccount, type AccountRecord } from "./model/types";
import type { GroupRecord } from "@/src/pages/groups/model/types";

export default function AccountsPage() {
  const accounts = useAccounts();
  const [groups, setGroups] = useState<GroupRecord[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit" | "view">("create");
  const [selected, setSelected] = useState<AccountRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setGroupsLoading(true);
    void groupsApi
      .list({ page: 1, size: 100 })
      .then((payload) => {
        if (!cancelled) setGroups(payload.items ?? []);
      })
      .catch(() => {
        if (!cancelled) setGroups([]);
      })
      .finally(() => {
        if (!cancelled) setGroupsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const openDrawer = (nextMode: "create" | "edit" | "view", record: AccountRecord | null = null) => {
    setMode(nextMode);
    setSelected(record);
    setFormError("");
    setOpen(true);
  };

  const submit = async (values: AccountFormValues) => {
    setSaving(true);
    setFormError("");
    try {
      if (mode === "create") {
        await accountsApi.create({
          username: values.username,
          display_name: values.display_name,
          type: values.type,
          password: values.password ?? "",
          group_id: values.group_id,
        });
        message.success("账号已创建");
      } else if (selected) {
        await accountsApi.update(selected.id, {
          username: values.username,
          display_name: values.display_name,
          type: values.type,
          status: values.status,
          group_id: values.group_id ?? 0,
        });
        message.success("账号已更新");
      }
      setOpen(false);
      accounts.reload();
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item: AccountRecord) => {
    try {
      await accountsApi.remove(item.id);
      message.success("账号已删除");
      accounts.reload();
    } catch (cause) {
      message.error(cause instanceof Error ? cause.message : "删除失败");
    }
  };

  const resetPassword = (item: AccountRecord) => {
    if (!canManageAccount(item.type)) return;
    let password = "";
    Modal.confirm({
      title: `重置 ${item.display_name} 的密码`,
      content: (
        <AntInput.Password
          className="mt-3"
          placeholder="至少 8 位新密码"
          onChange={(event) => {
            password = event.target.value;
          }}
        />
      ),
      okText: "重置",
      cancelText: "取消",
      onOk: async () => {
        if (password.length < 8) {
          message.error("密码至少 8 位");
          return Promise.reject();
        }
        await accountsApi.resetPassword(item.id, { password });
        message.success("密码已重置");
      },
    });
  };

  return (
    <div className="space-y-4">
      <AccountsSearch
        keyword={accounts.keyword}
        type={accounts.type}
        status={accounts.status}
        onKeywordChange={(value) => {
          accounts.setKeyword(value);
          accounts.setPage(1);
        }}
        onTypeChange={(value) => {
          accounts.setType(value);
          accounts.setPage(1);
        }}
        onStatusChange={(value) => {
          accounts.setStatus(value);
          accounts.setPage(1);
        }}
        onReset={accounts.resetFilters}
      />
      <div className="flex justify-end">
        <Button type="primary" icon={<Plus className="h-4 w-4" />} onClick={() => openDrawer("create")}>
          新增账号
        </Button>
      </div>
      <AccountsTable
        items={accounts.items}
        total={accounts.total}
        page={accounts.page}
        size={accounts.size}
        loading={accounts.loading}
        error={accounts.error}
        onReload={accounts.reload}
        onPageChange={accounts.setPage}
        onSizeChange={(size) => {
          accounts.setSize(size);
          accounts.setPage(1);
        }}
        onView={(item) => openDrawer("view", item)}
        onEdit={(item) => openDrawer("edit", item)}
        onResetPassword={resetPassword}
        onDelete={remove}
      />
      <AccountsForm
        open={open}
        mode={mode}
        saving={saving}
        record={selected}
        groups={groups}
        groupsLoading={groupsLoading}
        error={formError}
        onClose={() => setOpen(false)}
        onSubmit={submit}
      />
    </div>
  );
}
