import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  ScrollText,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Zap,
  Info,
  Crown,
  PlusCircle,
  Cpu,
  Compass,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  Activity,
  Layers,
} from 'lucide-react';
import { AIAgent, Task } from '../types/index.ts';

interface HeaderNavProps {
  agents: AIAgent[];
  tasks: Task[];
  isNightMode: boolean;
  onToggleNightMode: () => void;
  isLiteMode: boolean;
  onToggleLiteMode: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenDashboard: () => void;
  onOpenAgentsDrawer: () => void;
  onOpenLogsDrawer: () => void;
  onOpenInfoModal: () => void;

  // Chairman System Props
  isChairmanLoggedIn: boolean;
  onOpenChairmanLogin: () => void;
  onOpenChairmanDashboard: () => void;
  onOpenTaskDispatch: () => void;
  onOpenModelManagement: () => void;
  onFocusChairmanSkySuite: () => void;
  onChairmanLogout: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  agents,
  tasks,
  isNightMode,
  onToggleNightMode,
  isLiteMode,
  onToggleLiteMode,
  isMuted,
  onToggleMute,
  onOpenDashboard,
  onOpenAgentsDrawer,
  onOpenLogsDrawer,
  onOpenInfoModal,
  isChairmanLoggedIn,
  onOpenChairmanLogin,
  onOpenChairmanDashboard,
  onOpenTaskDispatch,
  onOpenModelManagement,
  onFocusChairmanSkySuite,
  onChairmanLogout,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const activeCount = agents.filter(
    (a) => a.status === 'working' || a.status === 'researching' || a.status === 'testing'
  ).length;
  const inProgressTasks = tasks.filter(
    (t) => t.status === 'in_progress' || t.status === 'awaiting_approval'
  ).length;

  return (
    <>
      <header className="absolute top-0 left-0 right-0 z-20 pointer-events-none p-2 sm:p-3 md:p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-3">
          {/* Left: Branding & Tagline */}
          <div className="pointer-events-auto flex items-center gap-2.5 bg-slate-900/95 border border-slate-700/60 rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 shadow-xl shadow-black/40 backdrop-blur-md">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-amber-500 via-red-600 to-indigo-600 flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
              <span className="font-extrabold text-white text-sm sm:text-base tracking-wider">HĐV</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="font-bold text-xs sm:text-sm md:text-base text-slate-100 tracking-wide whitespace-nowrap">
                  HỒN ĐẤT VIỆT <span className="text-amber-400 font-semibold hidden xs:inline">AI COMPANY</span>
                </h1>
                {isChairmanLoggedIn ? (
                  <span className="text-[9px] sm:text-[10px] font-mono-code px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold flex items-center gap-1">
                    <Crown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400" />
                    CHAIRMAN
                  </span>
                ) : (
                  <span className="text-[9px] sm:text-[10px] font-mono-code px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 whitespace-nowrap">
                    3D HQ
                  </span>
                )}
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-normal hidden sm:block">
                {isChairmanLoggedIn
                  ? 'Đang đăng nhập với quyền Quản trị Chủ tịch Tối cao'
                  : 'Văn phòng 3D Quản trị Đội ngũ AI Agent Nghiên cứu & Phát triển'}
              </p>
            </div>
          </div>

          {/* Desktop Nav Controls (hidden on mobile < md) */}
          <div className="pointer-events-auto hidden md:flex flex-wrap items-center gap-2">
            {/* Chairman Special Actions if logged in */}
            {isChairmanLoggedIn ? (
              <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/40 rounded-xl p-1">
                <button
                  onClick={onOpenChairmanDashboard}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                  title="Bảng Điều Hành Tối Cao của Chủ tịch"
                >
                  <Crown className="w-3.5 h-3.5" />
                  <span>Bảng Chủ Tịch</span>
                </button>

                <button
                  onClick={onFocusChairmanSkySuite}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-amber-300 text-xs font-medium border border-amber-500/30 transition-colors cursor-pointer"
                  title="Chuyển camera đến Văn phòng Chủ Tịch Sky Suite 3D"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">Văn Phòng 3D</span>
                </button>

                <button
                  onClick={onOpenTaskDispatch}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-xs font-medium border border-slate-700/60 transition-colors cursor-pointer"
                  title="Giao nhiệm vụ mới cho AI"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden lg:inline">Giao Việc</span>
                </button>

                <button
                  onClick={onOpenModelManagement}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-cyan-300 text-xs font-medium border border-slate-700/60 transition-colors cursor-pointer"
                  title="Quản trị Model AI Gemini"
                >
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden lg:inline">Model AI</span>
                </button>

                <button
                  onClick={onChairmanLogout}
                  className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  title="Đăng xuất Chủ tịch"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenChairmanLogin}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                title="Đăng nhập tài khoản Chủ tịch quản trị tối cao"
              >
                <Crown className="w-4 h-4" />
                <span>Đăng Nhập Chủ Tịch</span>
              </button>
            )}

            {/* Quick Metrics Bar */}
            <div className="hidden lg:flex items-center gap-3 bg-slate-900/90 border border-slate-700/60 rounded-xl px-3 py-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="font-semibold text-emerald-400">
                  {activeCount}/{agents.length}
                </span>
                <span className="text-slate-400">AI hoạt động</span>
              </div>
              <span className="text-slate-700">|</span>
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="font-semibold text-cyan-400">{inProgressTasks}</span>
                <span className="text-slate-400">Nhiệm vụ</span>
              </div>
            </div>

            {/* Action Modals */}
            {!isChairmanLoggedIn && (
              <button
                onClick={onOpenDashboard}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600/90 hover:bg-indigo-600 text-white text-xs font-medium border border-indigo-500/50 transition-colors shadow-lg shadow-indigo-600/20 cursor-pointer"
                title="Mở Bảng điều khiển tổng hợp"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Bảng Tổng Hợp</span>
              </button>
            )}

            <button
              onClick={onOpenAgentsDrawer}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-xs font-medium border border-slate-700/60 transition-colors cursor-pointer"
              title="Xem danh sách 12 AI Agent & Lọc"
            >
              <Users className="w-4 h-4 text-cyan-400" />
              <span>Nhân Viên AI ({agents.length})</span>
            </button>

            <button
              onClick={onOpenLogsDrawer}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-xs font-medium border border-slate-700/60 transition-colors cursor-pointer"
              title="Xem Nhật ký Hoạt động"
            >
              <ScrollText className="w-4 h-4 text-emerald-400" />
              <span>Nhật Ký</span>
            </button>

            {/* Utility Toggles */}
            <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-700/60 rounded-xl p-1">
              <button
                onClick={onToggleNightMode}
                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors cursor-pointer"
                title={isNightMode ? 'Chuyển sang Chế độ Ban Ngày' : 'Chuyển sang Chế độ Ban Đêm'}
              >
                {isNightMode ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
              </button>

              <button
                onClick={onToggleLiteMode}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isLiteMode
                    ? 'text-amber-400 bg-amber-400/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
                title={isLiteMode ? 'Chế độ Đồ họa: Tiết kiệm / Mobile (Lite)' : 'Chế độ Đồ họa: Chất lượng Cao (HQ)'}
              >
                <Zap className="w-4 h-4" />
              </button>

              <button
                onClick={onToggleMute}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                title={isMuted ? 'Bật âm thanh hiệu ứng' : 'Tắt âm thanh hiệu ứng'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>

              <button
                onClick={onOpenInfoModal}
                className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors cursor-pointer"
                title="Thông tin kiến trúc & Hướng dẫn sử dụng"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile Right Quick Actions (< md) */}
          <div className="pointer-events-auto flex md:hidden items-center gap-1.5">
            {/* Quick Chairman Button on Mobile */}
            {isChairmanLoggedIn ? (
              <button
                onClick={onOpenChairmanDashboard}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 active:scale-95 transition-transform cursor-pointer"
                title="Mở Bảng Chủ Tịch"
              >
                <Crown className="w-3.5 h-3.5" />
                <span className="text-[11px]">Chủ Tịch</span>
              </button>
            ) : (
              <button
                onClick={onOpenChairmanLogin}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-semibold active:scale-95 transition-transform cursor-pointer"
                title="Đăng nhập Chủ Tịch"
              >
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px]">Đăng Nhập</span>
              </button>
            )}

            {/* Quick Sound Toggle on Mobile */}
            <button
              onClick={onToggleMute}
              className="p-2 rounded-lg bg-slate-900/90 border border-slate-700/60 text-slate-300 active:scale-95 transition-transform cursor-pointer"
              title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            {/* Mobile Menu Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="relative p-2 rounded-lg bg-slate-900/90 border border-slate-700/60 text-slate-200 active:scale-95 transition-transform cursor-pointer"
              title="Mở bảng điều khiển di động"
            >
              <Menu className="w-4 h-4 text-amber-400" />
              {activeCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-slate-900"></span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-Up Command Sheet Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Bottom Sheet Modal Container */}
          <div className="relative z-10 w-full bg-slate-900 border-t border-slate-700/80 rounded-t-3xl shadow-2xl max-h-[88vh] flex flex-col overflow-hidden text-slate-100 overscroll-contain">
            {/* Drag Handle Bar & Close */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-indigo-600 flex items-center justify-center">
                  <span className="font-extrabold text-white text-xs">HĐV</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Trung Tâm Quản Trị Di Động</h3>
                  <p className="text-[11px] text-slate-400">Hồn Đất Việt AI Company</p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-4 overflow-y-auto space-y-4">
              {/* Quick Status Pill */}
              <div className="grid grid-cols-2 gap-2 bg-slate-800/60 border border-slate-700/50 rounded-xl p-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0"></div>
                  <div>
                    <div className="text-xs font-bold text-emerald-400">
                      {activeCount}/{agents.length} AI
                    </div>
                    <div className="text-[10px] text-slate-400">Đang hoạt động</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 border-l border-slate-700/60 pl-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shrink-0"></div>
                  <div>
                    <div className="text-xs font-bold text-cyan-400">{inProgressTasks} Nhiệm vụ</div>
                    <div className="text-[10px] text-slate-400">Đang thực hiện</div>
                  </div>
                </div>
              </div>

              {/* Chairman Command Station (Mobile) */}
              {isChairmanLoggedIn ? (
                <div className="bg-amber-500/10 border border-amber-500/40 rounded-2xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <Crown className="w-4 h-4 text-amber-400" />
                      QUYỀN CHỦ TỊCH TỐI CAO
                    </span>
                    <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                      ACTIVE
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onOpenChairmanDashboard();
                      }}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-transform"
                    >
                      <Crown className="w-4 h-4 shrink-0" />
                      <span>Bảng Điều Hành</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onFocusChairmanSkySuite();
                      }}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800 text-amber-300 font-semibold text-xs border border-amber-500/30 active:scale-95 transition-transform"
                    >
                      <Compass className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Văn Phòng 3D</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onOpenTaskDispatch();
                      }}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800 text-slate-100 font-semibold text-xs border border-slate-700 active:scale-95 transition-transform"
                    >
                      <PlusCircle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Giao Việc Mới</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onOpenModelManagement();
                      }}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800 text-cyan-300 font-semibold text-xs border border-slate-700 active:scale-95 transition-transform"
                    >
                      <Cpu className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>Model AI Gemini</span>
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onChairmanLogout();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-rose-500/10 text-rose-400 text-xs font-semibold border border-rose-500/30 active:scale-95 transition-transform cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Đăng Xuất Quyền Chủ Tịch</span>
                  </button>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-amber-500/15 to-slate-800/80 border border-amber-500/30 rounded-2xl p-3.5 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <Crown className="w-4 h-4 text-amber-400" />
                      Tài Khoản Chủ Tịch
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Đăng nhập để điều hành, giao việc và duyệt dự án
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenChairmanLogin();
                    }}
                    className="shrink-0 px-3 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 active:scale-95 transition-transform cursor-pointer"
                  >
                    Đăng Nhập
                  </button>
                </div>
              )}

              {/* Navigation Grid Buttons */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
                  Chức Năng Chính
                </span>

                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenDashboard();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 active:scale-[0.98] transition-transform text-xs font-semibold cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                        <LayoutDashboard className="w-4 h-4" />
                      </div>
                      <span>Bảng Điều Khiển Tổng Hợp</span>
                    </div>
                    <span className="text-[11px] text-indigo-400 font-bold">Xem KPI &rarr;</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenAgentsDrawer();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 active:scale-[0.98] transition-transform text-xs font-semibold cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                        <Users className="w-4 h-4" />
                      </div>
                      <span>Danh Sách 12 AI Agent</span>
                    </div>
                    <span className="text-[11px] text-cyan-400 font-bold">{agents.length} Nhân sự &rarr;</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenLogsDrawer();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 active:scale-[0.98] transition-transform text-xs font-semibold cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                        <ScrollText className="w-4 h-4" />
                      </div>
                      <span>Nhật Ký Hoạt Động Thời Gian Thực</span>
                    </div>
                    <span className="text-[11px] text-emerald-400 font-bold">Xem logs &rarr;</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenInfoModal();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 active:scale-[0.98] transition-transform text-xs font-semibold cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                        <Info className="w-4 h-4" />
                      </div>
                      <span>Hướng Dẫn 3D & Giới Thiệu Dự Án</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">Chi tiết &rarr;</span>
                  </button>
                </div>
              </div>

              {/* Utility Toggles Grid */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
                  Tuỳ Chỉnh Hệ Thống
                </span>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={onToggleNightMode}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                      isNightMode
                        ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-300'
                        : 'bg-slate-800/60 border-slate-700 text-amber-300'
                    }`}
                  >
                    {isNightMode ? <Moon className="w-4 h-4 mb-1 text-indigo-400" /> : <Sun className="w-4 h-4 mb-1 text-amber-400" />}
                    <span className="text-[11px]">{isNightMode ? 'Ban Đêm' : 'Ban Ngày'}</span>
                  </button>

                  <button
                    onClick={onToggleLiteMode}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                      isLiteMode
                        ? 'bg-amber-950/60 border-amber-500/50 text-amber-300'
                        : 'bg-slate-800/60 border-slate-700 text-slate-300'
                    }`}
                  >
                    <Zap className="w-4 h-4 mb-1 text-amber-400" />
                    <span className="text-[11px]">{isLiteMode ? 'Tiết Kiệm Lite' : 'Chất Lượng HQ'}</span>
                  </button>

                  <button
                    onClick={onToggleMute}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                      isMuted
                        ? 'bg-rose-950/60 border-rose-500/50 text-rose-300'
                        : 'bg-slate-800/60 border-slate-700 text-emerald-300'
                    }`}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 mb-1 text-rose-400" /> : <Volume2 className="w-4 h-4 mb-1 text-emerald-400" />}
                    <span className="text-[11px]">{isMuted ? 'Tắt Tiếng' : 'Bật Âm'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

