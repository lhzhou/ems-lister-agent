/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import {
  getStoredPackages,
  saveStoredPackages,
  getStoredNotifications,
  saveStoredNotifications,
  isAudioEnabled,
  setAudioEnabled,
  getStoredUser,
  saveStoredUser,
} from "./utils/storage";
import { playNotificationChime } from "./utils/sound";
import {
  ExpressPackage,
  NotificationLog,
  ReminderConfig,
  ExpressStatus,
  UserInfo,
} from "./types/express";
import { INITIAL_PACKAGES } from "./data/mockData";
import { authApi } from "./api/auth";
import { visiblePortalMenus, type PortalMenu } from "./lib/portal-menu";

// Components
import { Header } from "./components/Header";
import { Sidebar, SidebarTab } from "./components/Sidebar";
import { TrackingDetail } from "./components/TrackingDetail";
import { ReminderModal } from "./components/ReminderModal";
import { ElectronicReceiptModal } from "./components/ElectronicReceiptModal";
import { NotificationDrawer } from "./components/NotificationDrawer";
import { BatchQueryModal } from "./components/BatchQueryModal";
import { NewPackageModal } from "./components/NewPackageModal";
import { ToastAlert } from "./components/ToastAlert";
import { ReminderCenterView } from "./components/ReminderCenterView";
import { ElectronicPodView } from "./components/ElectronicPodView";
import { VipServiceView } from "./components/VipServiceView";
import { LogisticsStatsView } from "./components/LogisticsStatsView";
import { DashboardView } from "./components/DashboardView";
import { OrderIndexView } from "./components/OrderIndexView";
import { LoginPage } from "./components/LoginPage";
import { MultiTabBar } from "./components/MultiTabBar";
import { AppTab, DEFAULT_TABS, TabType, TabColorTheme } from "./types/tabs";
import {
  getStoredTabs,
  saveStoredTabs,
  getStoredActiveTabId,
  saveStoredActiveTabId,
} from "./utils/storage";
import {
  Sparkles,
  HelpCircle,
  PhoneCall,
  ArrowLeft,
  X,
  ExternalLink,
  BellRing,
  FileCheck,
} from "lucide-react";

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(() => getStoredUser());
  const [packages, setPackages] = useState<ExpressPackage[]>(() => getStoredPackages());

  const [notifications, setNotifications] = useState<NotificationLog[]>(() =>
    getStoredNotifications(),
  );
  const [selectedId, setSelectedId] = useState<string | null>(packages[0]?.id || null);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [phoneQuery, setPhoneQuery] = useState<string>("");
  const [audioOn, setAudioOn] = useState<boolean>(() => isAudioEnabled());

  // Multi-Tab / Multi-Window Management State
  const [tabs, setTabs] = useState<AppTab[]>(() => getStoredTabs<AppTab>(DEFAULT_TABS));
  const [activeTabId, setActiveTabId] = useState<string>(() =>
    getStoredActiveTabId(DEFAULT_TABS[0]?.id || "tab-dashboard"),
  );

  // Left Sidebar State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [portalMenus, setPortalMenus] = useState<PortalMenu[]>([]);

  // Auto-sync tabs to storage
  useEffect(() => {
    saveStoredTabs(tabs);
  }, [tabs]);

  useEffect(() => {
    saveStoredActiveTabId(activeTabId);
  }, [activeTabId]);

  // Current active tab object
  const currentTab = useMemo(() => {
    return tabs.find((t) => t.id === activeTabId) || tabs[0] || DEFAULT_TABS[0];
  }, [tabs, activeTabId]);

  // Left Sidebar active tab reflects current active tab
  const activeSidebarTab: SidebarTab = useMemo(() => {
    if (currentTab.tabType === "orders" || currentTab.tabType === "tracking") {
      return "orders";
    }
    return "dashboard";
  }, [currentTab.tabType]);

  useEffect(() => {
    if (!currentUser) {
      setPortalMenus([]);
      return;
    }
    let cancelled = false;
    void authApi
      .getMenus()
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

  // Modals state
  const [reminderModalPkg, setReminderModalPkg] = useState<ExpressPackage | null>(null);
  const [podModalPkg, setPodModalPkg] = useState<ExpressPackage | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState<boolean>(false);
  const [isNewPackageModalOpen, setIsNewPackageModalOpen] = useState<boolean>(false);

  // Real-time toast state
  const [activeToast, setActiveToast] = useState<NotificationLog | null>(null);

  // Auto-sync storage
  useEffect(() => {
    saveStoredPackages(packages);
  }, [packages]);

  useEffect(() => {
    saveStoredNotifications(notifications);
  }, [notifications]);

  // Listen for 401 unauthorized events to redirect to login
  useEffect(() => {
    const handleUnauthorized = () => {
      setCurrentUser(null);
      saveStoredUser(null);
    };
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, []);

  // Selected package object
  const selectedPackage = useMemo(() => {
    return packages.find((p) => p.id === selectedId) || packages[0] || null;
  }, [packages, selectedId]);

  // Filtering packages
  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      // Status filter
      if (activeFilter !== "all" && pkg.status !== activeFilter) {
        return false;
      }

      // Tracking number / item name / sender / recipient query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchNumber = pkg.trackingNumber.toLowerCase().includes(q);
        const matchItem = pkg.itemName.toLowerCase().includes(q);
        const matchSender =
          pkg.origin.sender.toLowerCase().includes(q) || pkg.origin.city.toLowerCase().includes(q);
        const matchRecipient =
          pkg.destination.recipient.toLowerCase().includes(q) ||
          pkg.destination.city.toLowerCase().includes(q);
        if (!matchNumber && !matchItem && !matchSender && !matchRecipient) {
          return false;
        }
      }

      // Phone last 4 digits filter
      if (phoneQuery.trim()) {
        const phone = pkg.destination.phoneFull || "";
        if (!phone.endsWith(phoneQuery.trim())) {
          return false;
        }
      }

      return true;
    });
  }, [packages, activeFilter, searchQuery, phoneQuery]);

  // Trigger a new notification log
  const pushNotification = (log: NotificationLog) => {
    setNotifications((prev) => [log, ...prev]);
    setActiveToast(log);
    if (audioOn) {
      playNotificationChime(log.eventType === "delivered" ? "success" : "alert");
    }
  };

  // Simulate next logistics step
  const handleSimulateNextStep = (pkg: ExpressPackage) => {
    const now = new Date();
    const nowTimeStr = now.toLocaleTimeString("zh-CN", { hour12: false });
    const fullDateStr = now.toISOString().replace("T", " ").slice(0, 19);

    if (pkg.status === "in_transit") {
      // Advance to branch arrival & out for delivery
      const courierName = pkg.courier?.name || "李文强";
      const courierPhone = pkg.courier?.phone || "13810992388";
      const newNode = {
        id: `n-${Date.now()}`,
        time: fullDateStr,
        title: "正在派送中",
        description: `【${pkg.destination.city}特快揽投部】邮政金牌投递员 [${courierName} ${courierPhone}] 正在为您上门派送，重点邮件优先投递，预计40分钟内送达。`,
        location: pkg.destination.city,
        status: "delivering" as ExpressStatus,
        operator: courierName,
        phone: courierPhone,
        facilityType: "courier" as const,
      };

      const updated = {
        ...pkg,
        status: "delivering" as ExpressStatus,
        statusText: "派送中",
        nodes: [newNode, ...pkg.nodes],
        courier: pkg.courier || {
          name: courierName,
          phone: courierPhone,
          workId: `EMS-${pkg.destination.city.slice(0, 2)}-2048`,
          rating: 4.99,
          avatar:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
          currentLocation: `${pkg.destination.city}投递段·距离约800米`,
          vehicleType: "中国邮政机要特投巡回车",
        },
      };

      setPackages((prev) => prev.map((p) => (p.id === pkg.id ? updated : p)));

      if (pkg.reminderConfig.events.outForDelivery) {
        pushNotification({
          id: `notif-${Date.now()}`,
          packageId: pkg.id,
          trackingNumber: pkg.trackingNumber,
          title: "【派送提醒】重点邮件已安排专人派送",
          message: `尊敬的${pkg.destination.recipient}：您的${pkg.serviceType}（${pkg.trackingNumber}）正由邮递员${courierName}（${courierPhone}）派送中，请保持手机畅通。`,
          time: fullDateStr,
          channel: pkg.reminderConfig.enableSMS ? "SMS" : "BROWSER",
          status: "delivered",
          eventType: "outForDelivery",
        });
      }
    } else if (pkg.status === "delivering") {
      // Advance to sign off
      handleSimulateSignOff(pkg);
    } else if (pkg.status === "exception") {
      // Clear exception, resume transit
      const newNode = {
        id: `n-${Date.now()}`,
        time: fullDateStr,
        title: "应急调度恢复正常运输",
        description: `【综合转运中心】：应急接驳陆空班车已按最高优先级发往目的地【${pkg.destination.city}】，温控监控恢复绿色指标。`,
        location: "华东应急综合集散港",
        status: "in_transit" as ExpressStatus,
        facilityType: "hub" as const,
      };

      const updated = {
        ...pkg,
        status: "in_transit" as ExpressStatus,
        statusText: "运输中",
        nodes: [newNode, ...pkg.nodes],
      };

      setPackages((prev) => prev.map((p) => (p.id === pkg.id ? updated : p)));
    }
  };

  // Directly simulate sign-off
  const handleSimulateSignOff = (pkg: ExpressPackage) => {
    const now = new Date();
    const fullDateStr = now.toISOString().replace("T", " ").slice(0, 19);

    const signee = pkg.destination.recipient;
    const courier = pkg.courier?.name || "李文强";
    const workId = pkg.courier?.workId || "EMS-投递工号9928";

    const deliveryNode = {
      id: `n-${Date.now()}`,
      time: fullDateStr,
      title: "已妥投签收",
      description: `重点快件已妥投。签收人：【${signee}】（出示有效证件当面核验无误，已完成电子笔迹签名签收）。感谢使用中国邮政！`,
      location: pkg.destination.city,
      status: "delivered" as ExpressStatus,
      operator: courier,
      phone: pkg.courier?.phone,
      facilityType: "recipient" as const,
    };

    const pod = {
      signeeName: signee,
      signeePhoneMasked: pkg.destination.phoneMasked,
      signTime: fullDateStr,
      signType: "本人签收" as const,
      receiptNumber: `POD-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${pkg.trackingNumber.slice(-6)}`,
      courierWorkId: workId,
      courierName: courier,
      sealText: `中国邮政速递物流${pkg.destination.city}特快揽投部 投递专用章`,
    };

    const updated: ExpressPackage = {
      ...pkg,
      status: "delivered",
      statusText: "已签收",
      pod,
      nodes: [deliveryNode, ...pkg.nodes],
    };

    setPackages((prev) => prev.map((p) => (p.id === pkg.id ? updated : p)));

    // Fire Sign-Off Reminder Notification
    const channel = pkg.reminderConfig.enableSMS
      ? "SMS"
      : pkg.reminderConfig.enableWeChat
        ? "WECHAT"
        : "BROWSER";

    pushNotification({
      id: `notif-${Date.now()}`,
      packageId: pkg.id,
      trackingNumber: pkg.trackingNumber,
      title: "【签收提醒】重点快递已成功妥投签收",
      message: `尊敬的${signee}：您的${pkg.serviceType}（${pkg.trackingNumber}）已于 ${fullDateStr.slice(11)} 成功妥投本人签收。电子签收回单已归档，感谢使用中国邮政EMS！`,
      time: fullDateStr,
      channel,
      status: "delivered",
      eventType: "delivered",
    });
  };

  // Re-arm / reset simulation for testing
  const handleResetSimulation = (pkg: ExpressPackage) => {
    const original = INITIAL_PACKAGES.find((p) => p.id === pkg.id);
    if (original) {
      setPackages((prev) =>
        prev.map((p) => (p.id === pkg.id ? JSON.parse(JSON.stringify(original)) : p)),
      );
    } else {
      // Revert to delivering
      setPackages((prev) =>
        prev.map((p) => {
          if (p.id === pkg.id) {
            return {
              ...p,
              status: "delivering",
              statusText: "派送中",
              pod: undefined,
              nodes: p.nodes.filter((n) => n.title !== "已妥投签收"),
            };
          }
          return p;
        }),
      );
    }
  };

  // Send a test reminder
  const handleSendTestReminder = (pkg: ExpressPackage, channel: "SMS" | "WECHAT" | "BROWSER") => {
    const nowStr = new Date().toISOString().replace("T", " ").slice(0, 19);
    const channelName =
      channel === "SMS" ? "手机短信" : channel === "WECHAT" ? "微信模板" : "系统桌面";

    pushNotification({
      id: `notif-test-${Date.now()}`,
      packageId: pkg.id,
      trackingNumber: pkg.trackingNumber,
      title: `【测试${channelName}】签收提醒功能已开通`,
      message: `【中国邮政EMS】您已成功开通邮件（${pkg.trackingNumber}）的实时签收提醒服务。当快件派送、到达或签收时，将在此渠道第一时间收到通知。`,
      time: nowStr,
      channel,
      status: "delivered",
      eventType: "approaching",
    });
  };

  // Save modified reminder config
  const handleSaveReminderConfig = (pkgId: string, config: ReminderConfig) => {
    setPackages((prev) => prev.map((p) => (p.id === pkgId ? { ...p, reminderConfig: config } : p)));
  };

  // Add a newly registered package
  const handleAddPackage = (newPkg: ExpressPackage) => {
    setPackages((prev) => [newPkg, ...prev]);
    setSelectedId(newPkg.id);
    pushNotification({
      id: `notif-${Date.now()}`,
      packageId: newPkg.id,
      trackingNumber: newPkg.trackingNumber,
      title: "【系统登记】新重点邮件已纳入实时监控",
      message: `重点快件（${newPkg.trackingNumber} / ${newPkg.itemName}）已成功登记，签收提醒服务已同步开启。`,
      time: new Date().toISOString().replace("T", " ").slice(0, 19),
      channel: "BROWSER",
      status: "delivered",
      eventType: "outForDelivery",
    });
  };

  // Batch query handler
  const handleBatchQuery = (numbers: string[]) => {
    if (numbers.length === 0) return;
    setSearchQuery(numbers[0]);
    // Find matching package
    const matched = packages.find((p) => numbers.some((num) => p.trackingNumber.includes(num)));
    if (matched) {
      setSelectedId(matched.id);
    }
  };

  // Multi-Tab & Window Management Handlers
  const handleSelectSidebarTab = (tabType: SidebarTab) => {
    const existing = tabs.find((t) =>
      tabType === "orders"
        ? t.tabType === "orders" || t.tabType === "tracking"
        : t.tabType === tabType,
    );
    if (existing) {
      setActiveTabId(existing.id);
    } else {
      const titleMap: Record<SidebarTab, string> = {
        dashboard: "看板",
        orders: "订单管理",
      };
      const colorMap: Record<SidebarTab, TabColorTheme> = {
        dashboard: "emerald",
        orders: "blue",
      };
      const newTab: AppTab = {
        id: `tab-${tabType}-${Date.now()}`,
        title: titleMap[tabType] || "业务窗口",
        tabType,
        closable: tabType !== "dashboard",
        colorTheme: colorMap[tabType] || "emerald",
      };
      setTabs((prev) => [...prev, newTab]);
      setActiveTabId(newTab.id);
    }
  };

  const handleOpenNewTab = (type: TabType, data?: any) => {
    if (type === "batch_query") {
      setIsBatchModalOpen(true);
      return;
    }
    if (type === "new_package") {
      setIsNewPackageModalOpen(true);
      return;
    }
    if (type === "tracking" || type === "orders") {
      handleSelectSidebarTab("orders");
      return;
    }
    if (type === "dashboard") {
      handleSelectSidebarTab("dashboard");
    }
  };

  const handleOpenPackageTab = (pkg: ExpressPackage) => {
    const tabId = `tab-mail-${pkg.trackingNumber}`;
    const existing = tabs.find((t) => t.id === tabId);
    if (existing) {
      setActiveTabId(existing.id);
    } else {
      const colorTheme: TabColorTheme =
        pkg.status === "delivered"
          ? "emerald"
          : pkg.status === "delivering"
            ? "amber"
            : pkg.status === "exception"
              ? "rose"
              : "blue";

      const newTab: AppTab = {
        id: tabId,
        title: `邮件 · ${pkg.trackingNumber.slice(-6)}`,
        tabType: "mail_detail",
        closable: true,
        colorTheme,
        badge: pkg.statusText,
        data: { packageId: pkg.id, mailNo: pkg.trackingNumber },
      };
      setTabs((prev) => [...prev, newTab]);
      setActiveTabId(newTab.id);
    }
    setSelectedId(pkg.id);
  };

  const handleCloseTab = (tabIdToClose: string) => {
    const targetTab = tabs.find((t) => t.id === tabIdToClose);
    if (!targetTab || !targetTab.closable) return;

    const newTabs = tabs.filter((t) => t.id !== tabIdToClose);
    setTabs(newTabs);

    if (activeTabId === tabIdToClose) {
      const closedIndex = tabs.findIndex((t) => t.id === tabIdToClose);
      const nextTab = newTabs[Math.max(0, closedIndex - 1)] || newTabs[0];
      if (nextTab) {
        setActiveTabId(nextTab.id);
      }
    }
  };

  const handleCloseOtherTabs = (tabIdToKeep: string) => {
    const newTabs = tabs.filter((t) => t.id === tabIdToKeep || !t.closable);
    setTabs(newTabs);
    setActiveTabId(tabIdToKeep);
  };

  const handleCloseAllTabs = () => {
    const newTabs = tabs.filter((t) => !t.closable);
    const fallback = newTabs.length > 0 ? newTabs : [DEFAULT_TABS[0]];
    setTabs(fallback);
    setActiveTabId(fallback[0].id);
  };

  const handleCloseRightTabs = (targetTabId: string) => {
    const targetIndex = tabs.findIndex((t) => t.id === targetTabId);
    if (targetIndex === -1) return;
    const newTabs = tabs.filter((t, index) => index <= targetIndex || !t.closable);
    setTabs(newTabs);
    if (!newTabs.some((t) => t.id === activeTabId)) {
      setActiveTabId(targetTabId);
    }
  };

  const handleRefreshTab = (tabId: string) => {
    setPackages(getStoredPackages());
    setNotifications(getStoredNotifications());
    setActiveToast({
      id: `refresh-${Date.now()}`,
      packageId: "",
      trackingNumber: "",
      title: "窗口已重新加载",
      message: "当前标签页物流数据与监控状态已同步更新至最新状态。",
      time: new Date().toLocaleTimeString("zh-CN", { hour12: false }),
      channel: "BROWSER",
      status: "delivered",
      eventType: "outForDelivery",
    });
  };

  // Jump from other views to package detail in tracking tab
  const handleSelectPackageFromOtherView = (pkgId: string) => {
    setSelectedId(pkgId);
    handleSelectSidebarTab("orders");
  };

  const handleLogin = (user: UserInfo, token: string) => {
    setCurrentUser(user);
    saveStoredUser(user, token);
    playNotificationChime("success");
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      console.warn("退出登录接口调用结束:", e);
    } finally {
      setCurrentUser(null);
      saveStoredUser(null);
    }
  };

  // If not logged in, render the China Post Login Page
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-stone-100 text-stone-800 flex flex-col font-sans selection:bg-[#00703C] selection:text-white">
      {/* Real-time Toast Pop-up */}
      <ToastAlert
        notification={activeToast}
        onClose={() => setActiveToast(null)}
        onViewPackage={(num) => {
          const target = packages.find((p) => p.trackingNumber === num);
          if (target) {
            setSelectedId(target.id);
            handleSelectSidebarTab("orders");
          }
        }}
      />

      {/* Official Header */}
      <Header
        unreadCount={notifications.length}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenNewPackage={() => setIsNewPackageModalOpen(true)}
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

      {/* Main Body with Left Sidebar */}
      <div className="flex-1 flex w-full relative">
        {/* Left Sidebar Menu */}
        <Sidebar
          activeTab={activeSidebarTab}
          onSelectTab={(tab) => handleSelectSidebarTab(tab)}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          isMobileOpen={isMobileSidebarOpen}
          setIsMobileOpen={setIsMobileSidebarOpen}
          menus={portalMenus}
        />

        {/* Content Area - 100% adaptive width right next to sidebar */}
        <div className="flex-1 flex flex-col min-w-0 w-full">
          {/* Multi-Tab & Window Navigation Bar */}
          <MultiTabBar
            tabs={tabs}
            activeTabId={activeTabId}
            onSelectTab={(id) => setActiveTabId(id)}
            onCloseTab={handleCloseTab}
            onCloseOtherTabs={handleCloseOtherTabs}
            onCloseAllTabs={handleCloseAllTabs}
            onCloseRightTabs={handleCloseRightTabs}
            onOpenNewTab={handleOpenNewTab}
            onRefreshTab={handleRefreshTab}
          />

          <main className="flex-1 w-full px-3 sm:px-5 lg:px-6 py-4 space-y-4">
            {/* 0. Dashboard View (今日订单状态 / 最新滞留信息 / 最新异常信息 / 当日走势) */}
            {currentTab.tabType === "dashboard" && (
              <DashboardView
                packages={packages}
                onSelectPackage={(mailNoOrId) => {
                  const target = packages.find(
                    (p) => p.trackingNumber === mailNoOrId || p.id === mailNoOrId,
                  );
                  if (target) {
                    setSelectedId(target.id);
                  } else {
                    setSearchQuery(mailNoOrId);
                  }
                  handleSelectSidebarTab("orders");
                }}
                onViewMoreStagnant={() => handleSelectSidebarTab("orders")}
                onOpenReminderModal={(pkg) => setReminderModalPkg(pkg)}
              />
            )}

            {(currentTab.tabType === "orders" || currentTab.tabType === "tracking") && (
              <OrderIndexView />
            )}

            {/* 2. Dedicated Mail Detail Window */}
            {currentTab.tabType === "mail_detail" &&
              (() => {
                const mailPkg =
                  packages.find(
                    (p) =>
                      p.id === currentTab.data?.packageId ||
                      p.trackingNumber === currentTab.data?.mailNo,
                  ) || selectedPackage;
                if (!mailPkg) {
                  return (
                    <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-400">
                      <p>该邮件数据未找到或已被归档</p>
                      <button
                        type="button"
                        onClick={() => handleCloseTab(currentTab.id)}
                        className="mt-4 px-4 py-2 bg-[#00703C] text-white rounded-xl text-xs font-semibold"
                      >
                        关闭当前窗口
                      </button>
                    </div>
                  );
                }
                return (
                  <div className="space-y-4">
                    {/* Window Toolbar Header */}
                    <div className="bg-white rounded-2xl border border-stone-200 p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleSelectSidebarTab("orders")}
                          className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors"
                          title="返回重点快递查询列表"
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-base font-bold text-stone-900">
                              邮件独立跟踪窗口 · {mailPkg.trackingNumber}
                            </h2>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                              {mailPkg.statusText}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-mono">
                              {mailPkg.serviceType}
                            </span>
                          </div>
                          <p className="text-xs text-stone-500 mt-0.5">
                            寄件：{mailPkg.origin.city}（{mailPkg.origin.sender}） ➔ 收件：
                            {mailPkg.destination.city}（{mailPkg.destination.recipient}）
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setReminderModalPkg(mailPkg)}
                          className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
                        >
                          <BellRing className="w-3.5 h-3.5 text-amber-600" />
                          <span>设置签收提醒</span>
                        </button>

                        {mailPkg.status === "delivered" && mailPkg.pod && (
                          <button
                            type="button"
                            onClick={() => setPodModalPkg(mailPkg)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#00703C] border border-emerald-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
                          >
                            <FileCheck className="w-3.5 h-3.5" />
                            <span>电子签单存根</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleCloseTab(currentTab.id)}
                          className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-rose-50 hover:text-rose-700 text-stone-600 border border-stone-200 text-xs font-medium flex items-center gap-1 transition-colors"
                          title="关闭当前独立窗口"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>关闭窗口</span>
                        </button>
                      </div>
                    </div>

                    {/* Full width tracking visualizer */}
                    <TrackingDetail
                      pkg={mailPkg}
                      onOpenReminderModal={(pkg) => setReminderModalPkg(pkg)}
                      onOpenPODModal={(pkg) => setPodModalPkg(pkg)}
                      onSimulateNextStep={handleSimulateNextStep}
                      onSimulateSignOff={handleSimulateSignOff}
                      onResetSimulation={handleResetSimulation}
                    />
                  </div>
                );
              })()}

            {/* 3. Reminder Center View */}
            {currentTab.tabType === "reminders" && (
              <ReminderCenterView
                packages={packages}
                notifications={notifications}
                onSaveReminderConfig={handleSaveReminderConfig}
                onSendTestReminder={handleSendTestReminder}
                onSelectPackage={handleSelectPackageFromOtherView}
                onClearNotifications={() => setNotifications([])}
              />
            )}

            {/* 4. Electronic POD Receipts Archive View */}
            {currentTab.tabType === "pod" && (
              <ElectronicPodView
                packages={packages}
                onOpenPODModal={(pkg) => setPodModalPkg(pkg)}
                onSelectPackage={handleSelectPackageFromOtherView}
              />
            )}

            {/* 5. VIP Guarantee Services View */}
            {currentTab.tabType === "vip" && (
              <VipServiceView
                packages={packages}
                onSelectPackage={handleSelectPackageFromOtherView}
              />
            )}

            {/* 6. Logistics Statistics & Radar View */}
            {currentTab.tabType === "statistics" && <LogisticsStatsView packages={packages} />}
          </main>

          {/* Official Footer */}
          <footer className="mt-auto border-t border-stone-200 bg-white py-5 text-center text-xs text-stone-500">
            <div className="w-full px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00703C]"></span>
                <span>中国邮政重点快递与特快邮件综合管理系统 · 官方运行平台</span>
              </div>
              <div className="flex items-center gap-4 text-stone-400">
                <span>全国统一客服：11183</span>
                <span>航空特快时效准时率保障</span>
                <span>电子回执防伪归档</span>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Modals & Drawers */}
      {reminderModalPkg && (
        <ReminderModal
          pkg={reminderModalPkg}
          isOpen={!!reminderModalPkg}
          onClose={() => setReminderModalPkg(null)}
          onSave={handleSaveReminderConfig}
          onSendTestReminder={handleSendTestReminder}
        />
      )}

      {podModalPkg && (
        <ElectronicReceiptModal
          pkg={podModalPkg}
          isOpen={!!podModalPkg}
          onClose={() => setPodModalPkg(null)}
        />
      )}

      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onClearAll={() => setNotifications([])}
        onSelectPackageByTracking={(num) => {
          const found = packages.find((p) => p.trackingNumber === num);
          if (found) setSelectedId(found.id);
        }}
      />

      <BatchQueryModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        onSearchBatch={handleBatchQuery}
        availablePackages={packages}
      />

      <NewPackageModal
        isOpen={isNewPackageModalOpen}
        onClose={() => setIsNewPackageModalOpen(false)}
        onAddPackage={handleAddPackage}
      />
    </div>
  );
}
