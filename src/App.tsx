/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from "react";
import { authApi, menusApi } from "@/src/api";
import { DashboardShell, Header, PageContainer, PageTabs, Sidebar, type SidebarTab } from "@/src/components/Layout";
import { HOME_TAB, ORDERS_TAB } from "@/src/constants/workspace";
import { useWorkspaceScope } from "@/src/hooks/use-workspace-scope";
import { AUTH_UNAUTHORIZED_EVENT } from "@/src/interceptors/auth";
import { visiblePortalMenus, type PortalMenu } from "@/src/lib/portal-menu";
import DashboardPage from "@/src/pages/dashboard";
import LoginPage from "@/src/pages/login";
import OrdersPage from "@/src/pages/orders";
import { appTabFromWorkspace } from "@/src/routers/workspace-tab";
import { useWorkspaceStore } from "@/src/stores/workspace-store";
import type { UserInfo } from "@/src/types/express";
import type { AppTab } from "@/src/types/tabs";
import { getStoredUser, isAudioEnabled, saveStoredUser } from "@/src/lib/storage";
import { playNotificationChime } from "@/src/lib/sound";

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(() => getStoredUser());
  const [audioOn, setAudioOn] = useState<boolean>(() => isAudioEnabled());
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [portalMenus, setPortalMenus] = useState<PortalMenu[]>([]);

  const workspaceTabs = useWorkspaceStore((state) => state.tabs);
  const workspaceActiveId = useWorkspaceStore((state) => state.activeId);
  const tabs: AppTab[] = (workspaceTabs.length ? workspaceTabs : [HOME_TAB]).map(appTabFromWorkspace);
  const activeTabId = workspaceActiveId || tabs[0]?.id || HOME_TAB.id;

  useWorkspaceScope(currentUser ? currentUser.empId : null);

  const currentTab = useMemo(
    () => tabs.find((tab) => tab.id === activeTabId) || tabs[0],
    [tabs, activeTabId],
  );

  const activeSidebarTab: SidebarTab = useMemo(() => {
    if (currentTab?.tabType === "orders" || currentTab?.tabType === "tracking") return "orders";
    return "dashboard";
  }, [currentTab?.tabType]);

  useEffect(() => {
    if (!currentUser) {
      setPortalMenus([]);
      return;
    }
    let cancelled = false;
    void menusApi
      .list()
      .then((items) => {
        if (!cancelled) setPortalMenus(visiblePortalMenus(items));
      })
      .catch(() => {
        if (!cancelled) setPortalMenus([]);
      });
    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  useEffect(() => {
    const handleUnauthorized = () => {
      setCurrentUser(null);
      saveStoredUser(null);
      useWorkspaceStore.getState().resetForScope(null, HOME_TAB);
    };
    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
  }, []);

  const handleSelectSidebarTab = (tabType: SidebarTab) => {
    useWorkspaceStore.getState().open(tabType === "orders" ? ORDERS_TAB : HOME_TAB);
  };

  const handleLogin = (user: UserInfo, token: string) => {
    setCurrentUser(user);
    saveStoredUser(user, token);
    playNotificationChime("success");
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.warn("退出登录接口调用结束:", error);
    } finally {
      setCurrentUser(null);
      saveStoredUser(null);
      useWorkspaceStore.getState().resetForScope(null, HOME_TAB);
    }
  };

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <DashboardShell
      header={
        <Header
          audioOn={audioOn}
          setAudioOn={setAudioOn}
          currentUser={currentUser}
          onLogout={handleLogout}
          onToggleSidebar={() => {
            if (typeof window !== "undefined" && window.innerWidth < 768) {
              setIsMobileSidebarOpen((prev) => !prev);
            } else {
              setIsSidebarCollapsed((prev) => !prev);
            }
          }}
        />
      }
      sidebar={
        <Sidebar
          activeTab={activeSidebarTab}
          onSelectTab={handleSelectSidebarTab}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          isMobileOpen={isMobileSidebarOpen}
          setIsMobileOpen={setIsMobileSidebarOpen}
          menus={portalMenus}
        />
      }
      tabs={
        <PageTabs
          tabs={tabs}
          activeTabId={activeTabId}
          onSelectTab={(id) => useWorkspaceStore.getState().activate(id)}
          onCloseTab={(id) => useWorkspaceStore.getState().close(id)}
          onCloseOtherTabs={(id) => useWorkspaceStore.getState().closeOthers(id)}
          onCloseAllTabs={() => useWorkspaceStore.getState().closeAll()}
          onCloseRightTabs={(id) => useWorkspaceStore.getState().closeRight(id)}
          onRefreshTab={(id) => useWorkspaceStore.getState().refresh(id)}
        />
      }
    >
      <PageContainer>
        {currentTab?.tabType === "dashboard" && (
          <DashboardPage onViewMoreStagnant={() => handleSelectSidebarTab("orders")} />
        )}
        {(currentTab?.tabType === "orders" || currentTab?.tabType === "tracking") && <OrdersPage />}
      </PageContainer>
      <footer className="mt-auto border-t border-stone-200 bg-white py-5 text-center text-xs text-stone-500">
        <div className="flex w-full flex-col items-center justify-between gap-3 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 font-medium">
            <span className="h-2.5 w-2.5 rounded-full bg-[#00703C]"></span>
            <span>中国邮政重点快递与特快邮件综合管理系统 · 官方运行平台</span>
          </div>
          <div className="flex items-center gap-4 text-stone-400">
            <span>全国统一客服：11183</span>
          </div>
        </div>
      </footer>
    </DashboardShell>
  );
}
