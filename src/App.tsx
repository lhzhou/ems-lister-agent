/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  getStoredPackages, 
  saveStoredPackages, 
  getStoredNotifications, 
  saveStoredNotifications,
  isAudioEnabled,
  setAudioEnabled,
  getStoredUser,
  saveStoredUser
} from './utils/storage';
import { playNotificationChime } from './utils/sound';
import { ExpressPackage, NotificationLog, ReminderConfig, ExpressStatus, UserInfo } from './types/express';
import { INITIAL_PACKAGES } from './data/mockData';
import { authApi } from './api/auth';

// Components
import { Header } from './components/Header';
import { Sidebar, SidebarTab } from './components/Sidebar';
import { MetricStats } from './components/MetricStats';
import { SearchBar } from './components/SearchBar';
import { PackageList } from './components/PackageList';
import { TrackingDetail } from './components/TrackingDetail';
import { ReminderModal } from './components/ReminderModal';
import { ElectronicReceiptModal } from './components/ElectronicReceiptModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { BatchQueryModal } from './components/BatchQueryModal';
import { NewPackageModal } from './components/NewPackageModal';
import { ToastAlert } from './components/ToastAlert';
import { ReminderCenterView } from './components/ReminderCenterView';
import { ElectronicPodView } from './components/ElectronicPodView';
import { VipServiceView } from './components/VipServiceView';
import { LogisticsStatsView } from './components/LogisticsStatsView';
import { DashboardView } from './components/DashboardView';
import { LoginPage } from './components/LoginPage';
import { Sparkles, ShieldCheck, HelpCircle, PhoneCall, RefreshCw } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(() => getStoredUser());
  const [packages, setPackages] = useState<ExpressPackage[]>(() => getStoredPackages());

  const [notifications, setNotifications] = useState<NotificationLog[]>(() => getStoredNotifications());
  const [selectedId, setSelectedId] = useState<string | null>(packages[0]?.id || null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [phoneQuery, setPhoneQuery] = useState<string>('');
  const [audioOn, setAudioOn] = useState<boolean>(() => isAudioEnabled());

  // Left Sidebar State - default to dashboard as requested by user
  const [activeSidebarTab, setActiveSidebarTab] = useState<SidebarTab>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

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
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  // Selected package object
  const selectedPackage = useMemo(() => {
    return packages.find(p => p.id === selectedId) || packages[0] || null;
  }, [packages, selectedId]);

  // Filtering packages
  const filteredPackages = useMemo(() => {
    return packages.filter(pkg => {
      // Status filter
      if (activeFilter !== 'all' && pkg.status !== activeFilter) {
        return false;
      }

      // Tracking number / item name / sender / recipient query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchNumber = pkg.trackingNumber.toLowerCase().includes(q);
        const matchItem = pkg.itemName.toLowerCase().includes(q);
        const matchSender = pkg.origin.sender.toLowerCase().includes(q) || pkg.origin.city.toLowerCase().includes(q);
        const matchRecipient = pkg.destination.recipient.toLowerCase().includes(q) || pkg.destination.city.toLowerCase().includes(q);
        if (!matchNumber && !matchItem && !matchSender && !matchRecipient) {
          return false;
        }
      }

      // Phone last 4 digits filter
      if (phoneQuery.trim()) {
        const phone = pkg.destination.phoneFull || '';
        if (!phone.endsWith(phoneQuery.trim())) {
          return false;
        }
      }

      return true;
    });
  }, [packages, activeFilter, searchQuery, phoneQuery]);

  // Trigger a new notification log
  const pushNotification = (log: NotificationLog) => {
    setNotifications(prev => [log, ...prev]);
    setActiveToast(log);
    if (audioOn) {
      playNotificationChime(log.eventType === 'delivered' ? 'success' : 'alert');
    }
  };

  // Simulate next logistics step
  const handleSimulateNextStep = (pkg: ExpressPackage) => {
    const now = new Date();
    const nowTimeStr = now.toLocaleTimeString('zh-CN', { hour12: false });
    const fullDateStr = now.toISOString().replace('T', ' ').slice(0, 19);

    if (pkg.status === 'in_transit') {
      // Advance to branch arrival & out for delivery
      const courierName = pkg.courier?.name || '李文强';
      const courierPhone = pkg.courier?.phone || '13810992388';
      const newNode = {
        id: `n-${Date.now()}`,
        time: fullDateStr,
        title: '正在派送中',
        description: `【${pkg.destination.city}特快揽投部】邮政金牌投递员 [${courierName} ${courierPhone}] 正在为您上门派送，重点邮件优先投递，预计40分钟内送达。`,
        location: pkg.destination.city,
        status: 'delivering' as ExpressStatus,
        operator: courierName,
        phone: courierPhone,
        facilityType: 'courier' as const
      };

      const updated = {
        ...pkg,
        status: 'delivering' as ExpressStatus,
        statusText: '派送中',
        nodes: [newNode, ...pkg.nodes],
        courier: pkg.courier || {
          name: courierName,
          phone: courierPhone,
          workId: `EMS-${pkg.destination.city.slice(0, 2)}-2048`,
          rating: 4.99,
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          currentLocation: `${pkg.destination.city}投递段·距离约800米`,
          vehicleType: '中国邮政机要特投巡回车'
        }
      };

      setPackages(prev => prev.map(p => p.id === pkg.id ? updated : p));

      if (pkg.reminderConfig.events.outForDelivery) {
        pushNotification({
          id: `notif-${Date.now()}`,
          packageId: pkg.id,
          trackingNumber: pkg.trackingNumber,
          title: '【派送提醒】重点邮件已安排专人派送',
          message: `尊敬的${pkg.destination.recipient}：您的${pkg.serviceType}（${pkg.trackingNumber}）正由邮递员${courierName}（${courierPhone}）派送中，请保持手机畅通。`,
          time: fullDateStr,
          channel: pkg.reminderConfig.enableSMS ? 'SMS' : 'BROWSER',
          status: 'delivered',
          eventType: 'outForDelivery'
        });
      }
    } else if (pkg.status === 'delivering') {
      // Advance to sign off
      handleSimulateSignOff(pkg);
    } else if (pkg.status === 'exception') {
      // Clear exception, resume transit
      const newNode = {
        id: `n-${Date.now()}`,
        time: fullDateStr,
        title: '应急调度恢复正常运输',
        description: `【综合转运中心】：应急接驳陆空班车已按最高优先级发往目的地【${pkg.destination.city}】，温控监控恢复绿色指标。`,
        location: '华东应急综合集散港',
        status: 'in_transit' as ExpressStatus,
        facilityType: 'hub' as const
      };

      const updated = {
        ...pkg,
        status: 'in_transit' as ExpressStatus,
        statusText: '运输中',
        nodes: [newNode, ...pkg.nodes]
      };

      setPackages(prev => prev.map(p => p.id === pkg.id ? updated : p));
    }
  };

  // Directly simulate sign-off
  const handleSimulateSignOff = (pkg: ExpressPackage) => {
    const now = new Date();
    const fullDateStr = now.toISOString().replace('T', ' ').slice(0, 19);

    const signee = pkg.destination.recipient;
    const courier = pkg.courier?.name || '李文强';
    const workId = pkg.courier?.workId || 'EMS-投递工号9928';

    const deliveryNode = {
      id: `n-${Date.now()}`,
      time: fullDateStr,
      title: '已妥投签收',
      description: `重点快件已妥投。签收人：【${signee}】（出示有效证件当面核验无误，已完成电子笔迹签名签收）。感谢使用中国邮政！`,
      location: pkg.destination.city,
      status: 'delivered' as ExpressStatus,
      operator: courier,
      phone: pkg.courier?.phone,
      facilityType: 'recipient' as const
    };

    const pod = {
      signeeName: signee,
      signeePhoneMasked: pkg.destination.phoneMasked,
      signTime: fullDateStr,
      signType: '本人签收' as const,
      receiptNumber: `POD-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${pkg.trackingNumber.slice(-6)}`,
      courierWorkId: workId,
      courierName: courier,
      sealText: `中国邮政速递物流${pkg.destination.city}特快揽投部 投递专用章`
    };

    const updated: ExpressPackage = {
      ...pkg,
      status: 'delivered',
      statusText: '已签收',
      pod,
      nodes: [deliveryNode, ...pkg.nodes]
    };

    setPackages(prev => prev.map(p => p.id === pkg.id ? updated : p));

    // Fire Sign-Off Reminder Notification
    const channel = pkg.reminderConfig.enableSMS 
      ? 'SMS' 
      : pkg.reminderConfig.enableWeChat 
      ? 'WECHAT' 
      : 'BROWSER';

    pushNotification({
      id: `notif-${Date.now()}`,
      packageId: pkg.id,
      trackingNumber: pkg.trackingNumber,
      title: '【签收提醒】重点快递已成功妥投签收',
      message: `尊敬的${signee}：您的${pkg.serviceType}（${pkg.trackingNumber}）已于 ${fullDateStr.slice(11)} 成功妥投本人签收。电子签收回单已归档，感谢使用中国邮政EMS！`,
      time: fullDateStr,
      channel,
      status: 'delivered',
      eventType: 'delivered'
    });
  };

  // Re-arm / reset simulation for testing
  const handleResetSimulation = (pkg: ExpressPackage) => {
    const original = INITIAL_PACKAGES.find(p => p.id === pkg.id);
    if (original) {
      setPackages(prev => prev.map(p => p.id === pkg.id ? JSON.parse(JSON.stringify(original)) : p));
    } else {
      // Revert to delivering
      setPackages(prev => prev.map(p => {
        if (p.id === pkg.id) {
          return {
            ...p,
            status: 'delivering',
            statusText: '派送中',
            pod: undefined,
            nodes: p.nodes.filter(n => n.title !== '已妥投签收')
          };
        }
        return p;
      }));
    }
  };

  // Send a test reminder
  const handleSendTestReminder = (pkg: ExpressPackage, channel: 'SMS' | 'WECHAT' | 'BROWSER') => {
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const channelName = channel === 'SMS' ? '手机短信' : channel === 'WECHAT' ? '微信模板' : '系统桌面';

    pushNotification({
      id: `notif-test-${Date.now()}`,
      packageId: pkg.id,
      trackingNumber: pkg.trackingNumber,
      title: `【测试${channelName}】签收提醒功能已开通`,
      message: `【中国邮政EMS】您已成功开通邮件（${pkg.trackingNumber}）的实时签收提醒服务。当快件派送、到达或签收时，将在此渠道第一时间收到通知。`,
      time: nowStr,
      channel,
      status: 'delivered',
      eventType: 'approaching'
    });
  };

  // Save modified reminder config
  const handleSaveReminderConfig = (pkgId: string, config: ReminderConfig) => {
    setPackages(prev => prev.map(p => p.id === pkgId ? { ...p, reminderConfig: config } : p));
  };

  // Add a newly registered package
  const handleAddPackage = (newPkg: ExpressPackage) => {
    setPackages(prev => [newPkg, ...prev]);
    setSelectedId(newPkg.id);
    pushNotification({
      id: `notif-${Date.now()}`,
      packageId: newPkg.id,
      trackingNumber: newPkg.trackingNumber,
      title: '【系统登记】新重点邮件已纳入实时监控',
      message: `重点快件（${newPkg.trackingNumber} / ${newPkg.itemName}）已成功登记，签收提醒服务已同步开启。`,
      time: new Date().toISOString().replace('T', ' ').slice(0, 19),
      channel: 'BROWSER',
      status: 'delivered',
      eventType: 'outForDelivery'
    });
  };

  // Batch query handler
  const handleBatchQuery = (numbers: string[]) => {
    if (numbers.length === 0) return;
    setSearchQuery(numbers[0]);
    // Find matching package
    const matched = packages.find(p => numbers.some(num => p.trackingNumber.includes(num)));
    if (matched) {
      setSelectedId(matched.id);
    }
  };

  // Jump from other views to package detail in tracking tab
  const handleSelectPackageFromOtherView = (pkgId: string) => {
    setSelectedId(pkgId);
    setActiveSidebarTab('tracking');
  };

  const handleLogin = (user: UserInfo, token: string) => {
    setCurrentUser(user);
    saveStoredUser(user, token);
    playNotificationChime('success');
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      console.warn('退出登录接口调用结束:', e);
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
          const target = packages.find(p => p.trackingNumber === num);
          if (target) {
            setSelectedId(target.id);
            setActiveSidebarTab('tracking');
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
          if (typeof window !== 'undefined' && window.innerWidth < 768) {
            setIsMobileSidebarOpen(prev => !prev);
          } else {
            setIsSidebarCollapsed(prev => !prev);
          }
        }}
      />

      {/* Main Body with Left Sidebar */}
      <div className="flex-1 flex w-full relative">
        {/* Left Sidebar Menu */}
        <Sidebar
          activeTab={activeSidebarTab}
          onSelectTab={(tab) => setActiveSidebarTab(tab)}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          isMobileOpen={isMobileSidebarOpen}
          setIsMobileOpen={setIsMobileSidebarOpen}
          packages={packages}
          unreadRemindersCount={notifications.length}
          onOpenNewPackage={() => setIsNewPackageModalOpen(true)}
          onOpenBatchModal={() => setIsBatchModalOpen(true)}
          currentUser={currentUser}
          onLogout={handleLogout}
        />


        {/* Content Area with dynamic margin responding to sidebar width */}
        <div className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${
          isSidebarCollapsed ? 'md:ml-16' : 'md:ml-64'
        }`}>
          <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 space-y-5">
            {/* 0. Dashboard View (今日订单状态 / 最新订阅信息 / 最新异常信息 / 当日走势) */}
            {activeSidebarTab === 'dashboard' && (
              <DashboardView
                packages={packages}
                onSelectPackage={(mailNoOrId) => {
                  const target = packages.find(p => p.trackingNumber === mailNoOrId || p.id === mailNoOrId);
                  if (target) {
                    setSelectedId(target.id);
                  } else {
                    setSearchQuery(mailNoOrId);
                  }
                  setActiveSidebarTab('tracking');
                }}
                onOpenReminderModal={(pkg) => setReminderModalPkg(pkg)}
              />
            )}

            {/* 1. Tracking View */}
            {activeSidebarTab === 'tracking' && (
              <>
                {/* Metric KPI Overview Banner */}
                <MetricStats
                  packages={packages}
                  notificationCount={notifications.length}
                  activeFilter={activeFilter}
                  onFilterChange={(filter) => setActiveFilter(filter)}
                />

                {/* Quick Query & Search Bar */}
                <SearchBar
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  phoneQuery={phoneQuery}
                  onPhoneChange={setPhoneQuery}
                  onReset={() => {
                    setSearchQuery('');
                    setPhoneQuery('');
                    setActiveFilter('all');
                  }}
                  onSelectSample={(num) => {
                    setSearchQuery(num);
                    const found = packages.find(p => p.trackingNumber === num);
                    if (found) setSelectedId(found.id);
                  }}
                  onOpenBatchModal={() => setIsBatchModalOpen(true)}
                />

                {/* 2-Column Responsive Layout: Package List + Tracking Detail */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Column: List of Key Express Parcels (5 cols on lg) */}
                  <div className="lg:col-span-5 space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <h3 className="text-sm font-bold text-stone-800 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-[#00703C]" />
                        <span>重点快递监控列表 ({filteredPackages.length} 件)</span>
                      </h3>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setPackages(getStoredPackages());
                          }}
                          className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1 transition-colors"
                          title="刷新列表"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>刷新</span>
                        </button>
                      </div>
                    </div>

                    <PackageList
                      packages={filteredPackages}
                      selectedId={selectedId}
                      onSelect={(pkg) => setSelectedId(pkg.id)}
                      onOpenReminderModal={(pkg) => setReminderModalPkg(pkg)}
                      onOpenPODModal={(pkg) => setPodModalPkg(pkg)}
                    />
                  </div>

                  {/* Right Column: Tracking Visualizer & Timeline Detail (7 cols on lg) */}
                  <div className="lg:col-span-7">
                    {selectedPackage ? (
                      <TrackingDetail
                        pkg={selectedPackage}
                        onOpenReminderModal={(pkg) => setReminderModalPkg(pkg)}
                        onOpenPODModal={(pkg) => setPodModalPkg(pkg)}
                        onSimulateNextStep={handleSimulateNextStep}
                        onSimulateSignOff={handleSimulateSignOff}
                        onResetSimulation={handleResetSimulation}
                      />
                    ) : (
                      <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-400">
                        <p>请选择左侧重点快递以查看实时跟踪轨迹与签收记录</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* 2. Reminder Center View */}
            {activeSidebarTab === 'reminders' && (
              <ReminderCenterView
                packages={packages}
                notifications={notifications}
                onSaveReminderConfig={handleSaveReminderConfig}
                onSendTestReminder={handleSendTestReminder}
                onSelectPackage={handleSelectPackageFromOtherView}
                onClearNotifications={() => setNotifications([])}
              />
            )}

            {/* 3. Electronic POD Receipts Archive View */}
            {activeSidebarTab === 'pod' && (
              <ElectronicPodView
                packages={packages}
                onOpenPODModal={(pkg) => setPodModalPkg(pkg)}
                onSelectPackage={handleSelectPackageFromOtherView}
              />
            )}

            {/* 4. VIP Guarantee Services View */}
            {activeSidebarTab === 'vip' && (
              <VipServiceView
                packages={packages}
                onSelectPackage={handleSelectPackageFromOtherView}
              />
            )}

            {/* 5. Logistics Statistics & Radar View */}
            {activeSidebarTab === 'statistics' && (
              <LogisticsStatsView
                packages={packages}
              />
            )}
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
          const found = packages.find(p => p.trackingNumber === num);
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
