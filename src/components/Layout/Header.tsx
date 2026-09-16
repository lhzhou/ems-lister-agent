import React, { useState, useEffect, useRef } from "react";
import {
  Volume2,
  VolumeX,
  Menu,
  Clock,
  User,
  LogOut,
  ChevronDown,
  Shield,
} from "lucide-react";
import { setAudioEnabled } from "@/src/lib/storage";
import { playNotificationChime } from "@/src/lib/sound";
import { UserInfo } from "@/src/types/express";

interface HeaderProps {
  audioOn: boolean;
  setAudioOn: (val: boolean) => void;
  onToggleSidebar?: () => void;
  currentUser?: UserInfo | null;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  audioOn,
  setAudioOn,
  onToggleSidebar,
  currentUser,
  onLogout,
}) => {
  const [currentTime, setCurrentTime] = useState<string>("");
  const [userMenuOpen, setUserMenuOpen] = useState<boolean>(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const str = now.toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      setCurrentTime(str);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleAudio = () => {
    const next = !audioOn;
    setAudioOn(next);
    setAudioEnabled(next);
    if (next) {
      playNotificationChime("info");
    }
  };

  return (
    <header className="bg-gradient-to-r from-[#005f32] via-[#00703C] to-[#004f2b] text-white shadow-md sticky top-0 z-40">
      {/* Main Navigation Bar */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Logo and Brand Title */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Menu button to toggle sidebar */}
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="p-2 -ml-1 rounded-lg bg-emerald-800/60 border border-emerald-600/40 text-emerald-100 hover:text-white hover:bg-emerald-700/60 transition-colors"
              title="切换侧边栏菜单"
              aria-label="切换侧边栏菜单"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-wide text-white flex items-center gap-1.5">
                邮政重点快递查询系统
              </h1>
              <span className="bg-[#F9B200]/20 text-[#ffc634] border border-[#F9B200]/40 text-[11px] px-2 py-0.5 rounded-full font-medium">
                VIP专属版
              </span>
            </div>
            <p className="text-xs text-emerald-200/80 hidden sm:block">
              全流程动态节点追踪 · 毫米级温控遥测 · 毫秒级多渠道签收提醒
            </p>
          </div>
        </div>

        {/* Right utility actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* System Clock moved into header */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-800/60 border border-emerald-600/40 text-emerald-100 font-mono text-xs shadow-inner">
            <Clock className="w-3.5 h-3.5 text-[#F9B200]" />
            <span className="text-[11px]">系统时钟:</span>
            <span className="font-semibold text-white">{currentTime}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5"></span>
          </div>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={toggleAudio}
            title={audioOn ? "点击静音提醒声音" : "点击开启签收提示音"}
            className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition-colors ${
              audioOn
                ? "bg-emerald-800/60 border-emerald-600/50 text-white hover:bg-emerald-700/60"
                : "bg-stone-800/40 border-stone-600/40 text-stone-300 hover:bg-stone-800/70"
            }`}
          >
            {audioOn ? (
              <Volume2 className="w-4 h-4 text-[#F9B200]" />
            ) : (
              <VolumeX className="w-4 h-4 text-stone-400" />
            )}
            <span className="hidden md:inline text-xs">{audioOn ? "提醒音开" : "静音"}</span>
          </button>

          {/* User Profile & Logout Dropdown */}
          {currentUser && (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-lg bg-emerald-800/60 border border-emerald-600/50 hover:bg-emerald-700/60 text-white transition-all text-xs"
                title="用户信息与账户操作"
              >
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-6 h-6 rounded-full object-cover border border-emerald-300/50"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-[11px] font-bold text-white">
                    {currentUser.name.slice(0, 1)}
                  </div>
                )}
                <div className="hidden sm:flex flex-col text-left">
                  <span className="font-bold text-xs leading-tight">{currentUser.name}</span>
                  <span className="text-[10px] text-emerald-200/90 leading-tight">
                    {currentUser.role}
                  </span>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-emerald-200 transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Popover Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-stone-200 text-stone-800 py-3 px-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
                    {currentUser.avatarUrl ? (
                      <img
                        src={currentUser.avatarUrl}
                        alt={currentUser.name}
                        className="w-10 h-10 rounded-full object-cover border border-stone-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold">
                        {currentUser.name.slice(0, 1)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-stone-900 truncate">
                          {currentUser.name}
                        </span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                          {currentUser.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 font-mono mt-0.5">
                        工号: {currentUser.empId}
                      </p>
                    </div>
                  </div>

                  <div className="py-2.5 space-y-1.5 text-xs text-stone-600 border-b border-stone-100">
                    <div className="flex justify-between">
                      <span className="text-stone-400">所属部门:</span>
                      <span
                        className="font-medium text-stone-800 text-right truncate max-w-[140px]"
                        title={currentUser.department}
                      >
                        {currentUser.department}
                      </span>
                    </div>
                    {currentUser.phone && (
                      <div className="flex justify-between">
                        <span className="text-stone-400">登记电话:</span>
                        <span className="font-mono text-stone-700">{currentUser.phone}</span>
                      </div>
                    )}
                    {currentUser.lastLoginTime && (
                      <div className="flex justify-between">
                        <span className="text-stone-400">本次登录:</span>
                        <span className="font-mono text-[11px] text-stone-500">
                          {currentUser.lastLoginTime}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-1 border-t border-stone-100/70">
                      <span className="text-stone-400 flex items-center gap-1">
                        <Shield className="w-3 h-3 text-[#00703C]" />
                        <span>授权凭证:</span>
                      </span>
                      <span
                        className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.2 rounded font-mono font-medium"
                        title={currentUser.token || "已颁发长期令牌"}
                      >
                        {currentUser.token
                          ? `${currentUser.token.slice(0, 10)}...${currentUser.token.slice(-4)}`
                          : "长期有效"}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        if (onLogout) onLogout();
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>退出登录 / 切换账号</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
