/** @route
meta:
  layout: default
  title: 客服组管理
*/

import { useEffect, useState } from "react";
import { accountsApi, groupsApi } from "@/src/api";
import { Button, notify } from "@/src/components/Form";
import type { AccountRecord } from "@/src/pages/accounts/model/types";
import { GroupsForm, type GroupFormValues } from "./components/groups-form";
import { GroupsSearch } from "./components/groups-search";
import { GroupsTable } from "./components/groups-table";
import { useGroups } from "./hooks/use-groups";
import type { GroupRecord } from "./model/types";

export default function GroupsPage() {
  const groups = useGroups();
  const [leaders, setLeaders] = useState<AccountRecord[]>([]);
  const [leadersLoading, setLeadersLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit" | "view">("create");
  const [selected, setSelected] = useState<GroupRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void accountsApi
      .list({ page: 1, size: 100, type: "service_group_leader", status: "active" })
      .then((payload) => {
        if (!cancelled) setLeaders(payload.items ?? []);
      })
      .catch(() => {
        if (!cancelled) setLeaders([]);
      })
      .finally(() => {
        if (!cancelled) setLeadersLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const openDrawer = (nextMode: "create" | "edit" | "view", record: GroupRecord | null = null) => {
    setMode(nextMode);
    setSelected(record);
    setFormError("");
    setOpen(true);
  };

  const submit = async (values: GroupFormValues) => {
    setSaving(true);
    setFormError("");
    try {
      if (mode === "create") {
        await groupsApi.create({
          name: values.name,
          code: values.code?.trim() || undefined,
          leader_account_id: Number(values.leader_account_id),
        });
        notify.success("客服组已创建");
      } else if (selected) {
        await groupsApi.update(selected.id, {
          name: values.name,
          leader_account_id: Number(values.leader_account_id),
          enabled: values.enabled === undefined ? undefined : Boolean(values.enabled),
        });
        notify.success("客服组已更新");
      }
      setOpen(false);
      groups.reload();
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : "保存失败");
      throw cause;
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item: GroupRecord) => {
    try {
      await groupsApi.remove(item.id);
      notify.success("客服组已删除");
      groups.reload();
    } catch (cause) {
      notify.error(cause instanceof Error ? cause.message : "删除失败");
    }
  };

  return (
    <div className="space-y-4">
      <GroupsSearch
        keyword={groups.keyword}
        enabled={groups.enabled}
        onKeywordChange={groups.setKeyword}
        onEnabledChange={groups.setEnabled}
        onReset={groups.resetFilters}
      />
      <GroupsTable
        items={groups.items}
        total={groups.total}
        page={groups.page}
        size={groups.size}
        loading={groups.loading}
        error={groups.error}
        leaders={leaders}
        extra={
          <Button type="create" onClick={() => openDrawer("create")}>
            新增客服组
          </Button>
        }
        onReload={groups.reload}
        onPageChange={groups.setPage}
        onSizeChange={groups.setSize}
        onView={(item) => openDrawer("view", item)}
        onEdit={(item) => openDrawer("edit", item)}
        onDelete={remove}
      />
      <GroupsForm
        open={open}
        mode={mode}
        saving={saving}
        record={selected}
        leaders={leaders}
        leadersLoading={leadersLoading}
        error={formError}
        onClose={() => setOpen(false)}
        onSubmit={submit}
      />
    </div>
  );
}
