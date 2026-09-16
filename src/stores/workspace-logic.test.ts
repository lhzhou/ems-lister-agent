import { describe, expect, test } from "bun:test";
import type { WorkspaceTab } from "../../types/workspace";
import {
  closeOtherTabs,
  closeRightTabs,
  closeTab,
  getNextTabIdAfterClose,
  openTab,
} from "./workspace-logic";

const home: WorkspaceTab = { id: "/", href: "/", title: "首页", closable: false, keepAlive: false };
const tracking: WorkspaceTab = {
  id: "/tracking",
  href: "/tracking",
  title: "查询",
  closable: true,
  keepAlive: false,
};
const reminders: WorkspaceTab = {
  id: "/reminders",
  href: "/reminders",
  title: "提醒",
  closable: true,
  keepAlive: false,
};

describe("workspace logic", () => {
  test("deduplicates a tab by normalized id", () => {
    expect(openTab([home, tracking], tracking)).toEqual([home, tracking]);
  });

  test("activates the right tab, then the left tab after close", () => {
    expect(getNextTabIdAfterClose([home, tracking, reminders], tracking.id)).toBe(reminders.id);
    expect(getNextTabIdAfterClose([home, tracking], tracking.id)).toBe(home.id);
  });

  test("never closes a fixed home tab", () => {
    expect(closeTab([home, tracking], home.id)).toEqual([home, tracking]);
  });

  test("keeps fixed tabs when closing other or right tabs", () => {
    expect(closeOtherTabs([home, tracking, reminders], tracking.id)).toEqual([home, tracking]);
    expect(closeRightTabs([home, tracking, reminders], tracking.id)).toEqual([home, tracking]);
  });
});
