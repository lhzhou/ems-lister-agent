import React, { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Menu, Clock, LogOut, ChevronDown, Shield } from "lucide-react";
import { setAudioEnabled } from "@/src/lib/storage";
import { playNotificationChime } from "@/src/lib/sound";
import { Status } from "@/src/components/Form";
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

  const headerControl =
    "inline-flex h-8 items-center gap-1.5 rounded-[6px] border border-white/15 bg-white/10 px-2.5 text-xs text-white/90 transition-colors hover:bg-white/16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70";

  return (
    <header className="sticky top-0 z-40 h-16 bg-primary text-on-primary">
      <div className="flex h-full w-full items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className={`${headerControl} px-2`}
              title="切换侧边栏菜单"
              aria-label="切换侧边栏菜单"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          )}

          <div className="flex min-w-0 items-center gap-2">
            <h1 className="truncate text-lg font-semibold tracking-wide text-white">
              邮政重点快递查询系统
            </h1>
            <span className="hidden rounded-full bg-gold-bg px-2 py-0.5 text-[11px] font-medium text-gold sm:inline">
              VIP专属版
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className={`hidden font-mono lg:flex ${headerControl}`}>
            <Clock className="h-3.5 w-3.5 text-[#ffb95f]" aria-hidden="true" />
            <span className="text-[11px] text-white/70">系统时钟</span>
            <span className="font-medium tabular-nums text-white">{currentTime}</span>
            <span className="ml-0.5 h-1.5 w-1.5 rounded-full bg-success" />
          </div>

          <button
            type="button"
            onClick={toggleAudio}
            title={audioOn ? "点击静音提醒声音" : "点击开启签收提示音"}
            className={headerControl}
          >
            {audioOn ? (
              <Volume2 className="h-4 w-4 text-[#ffb95f]" aria-hidden="true" />
            ) : (
              <VolumeX className="h-4 w-4 text-white/60" aria-hidden="true" />
            )}
            <span className="hidden md:inline">{audioOn ? "提醒音开" : "静音"}</span>
          </button>

          {currentUser && (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className={headerControl}
                title="用户信息与账户操作"
                aria-expanded={userMenuOpen}
              >
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt=""
                    className="h-6 w-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-dark text-[11px] font-bold text-white">
                    {currentUser.name.slice(0, 1)}
                  </div>
                )}
                <div className="hidden text-left sm:flex sm:flex-col">
                  <span className="text-xs leading-tight font-semibold">{currentUser.name}</span>
                  <span className="text-[10px] leading-tight text-white/70">
                    {currentUser.role}
                  </span>
                </div>
                <ChevronDown
                  className={`h-3.5 w-3.5 text-white/70 transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 z-50 mt-2 w-64 rounded-xl border border-outline bg-surface p-4 text-on-surface shadow-popover">
                  <div className="flex items-center gap-3 border-b border-outline-variant pb-3">
                    {currentUser.avatarUrl ? (
                      <img
                        src={currentUser.avatarUrl}
                        alt=""
                        className="h-10 w-10 rounded-full object-cover border border-outline"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-bold text-on-primary">
                        {currentUser.name.slice(0, 1)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-semibold text-on-surface">
                          {currentUser.name}
                        </span>
                        <Status tone="success">{currentUser.role}</Status>
                      </div>
                      <p className="mt-0.5 font-mono text-[11px] text-on-surface-variant">
                        工号: {currentUser.empId}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5 border-b border-outline-variant py-2.5 text-xs text-on-surface-variant">
                    <div className="flex justify-between gap-3">
                      <span className="text-on-surface-disabled">所属部门:</span>
                      <span
                        className="max-w-[140px] truncate text-right font-medium text-on-surface"
                        title={currentUser.department}
                      >
                        {currentUser.department}
                      </span>
                    </div>
                    {currentUser.phone && (
                      <div className="flex justify-between gap-3">
                        <span className="text-on-surface-disabled">登记电话:</span>
                        <span className="font-mono text-on-surface">{currentUser.phone}</span>
                      </div>
                    )}
                    {currentUser.lastLoginTime && (
                      <div className="flex justify-between gap-3">
                        <span className="text-on-surface-disabled">本次登录:</span>
                        <span className="font-mono text-[11px]">{currentUser.lastLoginTime}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-3 border-t border-outline-variant pt-1">
                      <span className="flex items-center gap-1 text-on-surface-disabled">
                        <Shield className="h-3 w-3 text-primary" aria-hidden="true" />
                        <span>授权凭证:</span>
                      </span>
                      <span
                        className="rounded-full border border-primary-border bg-primary-light px-1.5 py-0.5 font-mono text-[10px] font-medium text-primary"
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
                      className="flex w-full items-center justify-center gap-2 rounded-[6px] py-2 text-xs font-semibold text-error transition-colors hover:bg-alert-error-bg"
                    >
                      <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
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
