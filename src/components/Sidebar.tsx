import React from 'react';
import { 
  Package, 
  BellRing, 
  FileCheck, 
  ShieldCheck, 
  BarChart3, 
  ChevronLeft, 
  ChevronRight, 
  PlusCircle, 
  Layers, 
  PhoneCall, 
  Sparkles, 
  Truck, 
  X,
  Radio,
  LayoutDashboard
} from 'lucide-react';
import { ExpressPackage, UserInfo } from '../types/express';
import { LogOut } from 'lucide-react';

export type SidebarTab = 'dashboard' | 'tracking' | 'reminders' | 'pod' | 'vip' | 'statistics';

interface SidebarProps {
  activeTab: SidebarTab;
  onSelectTab: (tab: SidebarTab) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  packages: ExpressPackage[];
  unreadRemindersCount: number;
  onOpenNewPackage: () => void;
  onOpenBatchModal: () => void;
  currentUser?: UserInfo | null;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  packages,
  unreadRemindersCount,
  onOpenNewPackage,
  onOpenBatchModal,
  currentUser,
  onLogout
}) => {

  // Counts calculation
  const inTransitCount = packages.filter(p => p.status === 'in_transit' || p.status === 'delivering').length;
  const deliveredCount = packages.filter(p => p.status === 'delivered').length;
  const exceptionCount = packages.filter(p => p.status === 'exception').length;

  const menuItems: {
    id: SidebarTab;
    label: string;
    subLabel: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    badgeColor?: string;
  }[] = [
    {
      id: 'dashboard',
      label: '监控数据看板',
      subLabel: '走势·订单·订阅·预警',
      icon: LayoutDashboard,
      badge: '实时',
      badgeColor: 'bg-emerald-100 text-emerald-800'
    },
    {
      id: 'tracking',
      label: '重点快递查询',
      subLabel: '实时轨迹·节点跟踪',
      icon: Package,
      badge: `${packages.length}件`,
      badgeColor: 'bg-emerald-100 text-emerald-800'
    },
    {
      id: 'reminders',
      label: '签收提醒中心',
      subLabel: '短信/微信/语音推送',
      icon: BellRing,
      badge: unreadRemindersCount > 0 ? `${unreadRemindersCount}条` : undefined,
      badgeColor: 'bg-amber-100 text-amber-900 font-semibold'
    },
    {
      id: 'pod',
      label: '电子签收单存根',
      subLabel: 'ePOD电子笔迹·回执',
      icon: FileCheck,
      badge: `${deliveredCount}单`,
      badgeColor: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'vip',
      label: 'VIP保障专区',
      subLabel: '政务/通知书/冷链',
      icon: ShieldCheck,
      badge: '特级',
      badgeColor: 'bg-[#F9B200]/30 text-[#946200] font-bold'
    },
    {
      id: 'statistics',
      label: '时效监控大屏',
      subLabel: '航空枢纽·准时率',
      icon: BarChart3,
      badge: '99.98%',
      badgeColor: 'bg-stone-100 text-stone-700'
    }
  ];

  const handleItemClick = (id: SidebarTab) => {
    onSelectTab(id);
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-stone-200 select-none">
      {/* Sidebar Header Brand / Status */}
      <div className={`p-3.5 border-b border-stone-200 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed ? (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-[#00703C] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <Truck className="w-4 h-4 text-emerald-100" />
            </div>
            <div className="overflow-hidden">
              <h2 className="text-xs font-bold text-stone-900 truncate flex items-center gap-1.5">
                <span>业务导航目录</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-normal px-1.5 py-0.2 rounded border border-emerald-200/60">
                  专网
                </span>
              </h2>
              <p className="text-[10px] text-stone-400 truncate">重点邮件智慧监控调度</p>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-lg bg-[#00703C] text-white flex items-center justify-center shadow-sm" title="邮政重点快递管理">
            <Truck className="w-4 h-4 text-emerald-100" />
          </div>
        )}

        {/* Mobile close button */}
        <button
          type="button"
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          aria-label="关闭侧边栏"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Desktop Collapse Toggle */}
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          title={isCollapsed ? '展开菜单' : '收起菜单'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Quick Action Shortcut */}
      <div className="p-3 border-b border-stone-100 space-y-1.5">
        <button
          type="button"
          onClick={onOpenNewPackage}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'gap-2 px-3 py-2'} rounded-xl bg-gradient-to-r from-[#00703C] to-[#005f32] text-white font-medium text-xs hover:brightness-105 shadow-sm transition-all active:scale-[0.98]`}
          title="登记重点邮件"
        >
          <PlusCircle className="w-4 h-4 text-[#F9B200] flex-shrink-0" />
          {!isCollapsed && <span className="truncate">登记重点邮件</span>}
        </button>

        {!isCollapsed && (
          <button
            type="button"
            onClick={onOpenBatchModal}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs font-medium transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-stone-500" />
            <span>批量单号查询</span>
          </button>
        )}
      </div>

      {/* Main Navigation List */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {!isCollapsed && (
          <div className="px-2 pt-2 pb-1 text-[10px] font-semibold text-stone-400 tracking-wider">
            核心功能业务
          </div>
        )}

        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleItemClick(item.id)}
              title={isCollapsed ? `${item.label} (${item.subLabel})` : undefined}
              className={`w-full group flex items-center ${isCollapsed ? 'justify-center px-2 py-3' : 'justify-between px-3 py-2.5'} rounded-xl text-left transition-all ${
                isActive 
                  ? 'bg-emerald-50/90 text-[#00703C] font-semibold shadow-xs border border-emerald-200/70' 
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/80 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`p-1.5 rounded-lg flex-shrink-0 transition-colors ${
                  isActive 
                    ? 'bg-[#00703C] text-white shadow-xs' 
                    : 'bg-stone-100 text-stone-500 group-hover:bg-white group-hover:text-stone-800'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                {!isCollapsed && (
                  <div className="truncate">
                    <div className="text-xs leading-snug">{item.label}</div>
                    <div className="text-[10px] text-stone-400 font-normal leading-tight truncate">
                      {item.subLabel}
                    </div>
                  </div>
                )}
              </div>

              {!isCollapsed && item.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Status summary banner inside sidebar */}
        {!isCollapsed && (
          <div className="mt-4 pt-3 border-t border-stone-100 px-2 space-y-2">
            <div className="text-[10px] font-semibold text-stone-400">重点邮件实时动态</div>
            <div className="bg-stone-50 rounded-xl p-2.5 border border-stone-200/70 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-stone-600">
                <span className="flex items-center gap-1.5 text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  正在运输 / 派送
                </span>
                <span className="font-semibold text-stone-800">{inTransitCount} 件</span>
              </div>
              <div className="flex items-center justify-between text-stone-600">
                <span className="flex items-center gap-1.5 text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  已妥投签收
                </span>
                <span className="font-semibold text-emerald-700">{deliveredCount} 件</span>
              </div>
              {exceptionCount > 0 && (
                <div className="flex items-center justify-between text-amber-700 bg-amber-50/80 px-1.5 py-1 rounded">
                  <span className="flex items-center gap-1 text-[11px] font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                    航路异常预警
                  </span>
                  <span className="font-bold">{exceptionCount} 件</span>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* User Profile Card & Logout */}
      {currentUser && (
        <div className="p-2.5 border-t border-stone-200 bg-white">
          {!isCollapsed ? (
            <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl hover:bg-stone-50 transition-colors">
              <div className="flex items-center gap-2.5 min-w-0">
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover border border-stone-200 flex-shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {currentUser.name.slice(0, 1)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-stone-800 truncate">{currentUser.name}</span>
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 font-semibold px-1 py-0.2 rounded flex-shrink-0">
                      在线
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-500 truncate">{currentUser.role}</p>
                </div>
              </div>
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                  title="退出登录"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center">
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover border border-stone-200"
                  title={`${currentUser.name} (${currentUser.role})`}
                />
              ) : (
                <div 
                  className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs"
                  title={`${currentUser.name} (${currentUser.role})`}
                >
                  {currentUser.name.slice(0, 1)}
                </div>
              )}
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="mt-2 p-1 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="退出登录"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Sidebar Footer Support & Network status */}
      <div className="p-3 border-t border-stone-200 bg-stone-50/50">
        {!isCollapsed ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-stone-500">
              <div className="flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                <span className="font-medium text-stone-700">EMS专网通信</span>
              </div>
              <span className="text-[10px] text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded font-mono">
                NORMAL
              </span>
            </div>
            <div className="bg-white rounded-lg p-2 border border-stone-200 text-[11px] text-stone-600 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-[#00703C]" />
                <span>专线客服</span>
              </div>
              <span className="font-mono font-bold text-[#00703C]">11183</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="EMS专网正常" />
            <PhoneCall className="w-3.5 h-3.5 text-stone-400" title="客服热线：11183" />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className={`hidden md:block transition-all duration-200 ease-in-out flex-shrink-0 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}>
        <div className={`fixed top-[64px] bottom-0 ${isCollapsed ? 'w-16' : 'w-64'} transition-all duration-200 z-30`}>
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Drawer Backdrop and Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div 
            className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl z-10 flex flex-col">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
