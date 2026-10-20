import React, { useState } from 'react';
import {
  Compass,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Plus,
  Minus,
  Grid,
  X,
  Layers,
} from 'lucide-react';
import { ROOMS } from '../data/roomsData.ts';

interface ControlOverlayProps {
  currentRoomId: string | null;
  onSelectRoom: (roomId: string) => void;
  onResetCamera: () => void;
  hoveredAgentName: string | null;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
}

export const ControlOverlay: React.FC<ControlOverlayProps> = ({
  currentRoomId,
  onSelectRoom,
  onResetCamera,
  hoveredAgentName,
  onZoomIn,
  onZoomOut,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isRoomGridOpen, setIsRoomGridOpen] = useState(false);

  return (
    <>
      <div
        className="fixed bottom-2 sm:bottom-4 md:bottom-5 left-1/2 -translate-x-1/2 z-20 pointer-events-none transition-transform duration-300 ease-out px-2 sm:px-0"
        style={{
          maxWidth: 'min(980px, 98vw)',
          width: '100%',
          transform: isCollapsed ? 'translate(-50%, calc(100% - 30px))' : 'translate(-50%, 0)',
        }}
      >
        {/* Top Bar with Collapse Button & Feedback */}
        <div className="flex items-center justify-between px-2 pb-1">
          {/* Agent hover feedback badge */}
          <div className="pointer-events-auto">
            {hoveredAgentName ? (
              <div className="bg-slate-900/95 text-cyan-300 border border-cyan-500/50 rounded-lg px-2.5 py-1 text-[11px] sm:text-xs font-medium shadow-lg shadow-black/50 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                <span>
                  Chạm xem hồ sơ: <strong>{hoveredAgentName}</strong>
                </span>
              </div>
            ) : (
              <div className="bg-slate-900/90 text-slate-300 border border-slate-700/60 rounded-lg px-2.5 py-1 text-[10px] sm:text-[11px] flex items-center gap-1.5 shadow-md">
                <Compass className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="hidden sm:inline">
                  Kéo để xoay 3D • 2 ngón tay thu phóng • Chạm nhân viên AI để tương tác
                </span>
                <span className="sm:hidden">Vuốt 1 ngón xoay • 2 ngón thu phóng • Chạm AI xem chi tiết</span>
              </div>
            )}
          </div>

          {/* Quick collapse/expand button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="pointer-events-auto flex items-center gap-1 bg-slate-900/95 hover:bg-slate-800 text-slate-300 border border-slate-700/70 rounded-t-lg px-3 py-1 text-[11px] sm:text-xs font-medium transition-colors shadow-md cursor-pointer shrink-0"
          >
            {isCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
                <span>Mở thanh điều hướng</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden xs:inline">Thu gọn</span>
              </>
            )}
          </button>
        </div>

        {/* Main Bottom Dock Container */}
        <div className="pointer-events-auto bg-slate-900/95 border border-slate-700/80 rounded-2xl p-2 sm:p-2.5 shadow-2xl shadow-black/70 backdrop-blur-md">
          <div className="flex items-center justify-between gap-1.5 sm:gap-2">
            {/* Left: Mobile Zoom In / Zoom Out Single-Tap Buttons */}
            <div className="flex items-center gap-1 shrink-0 bg-slate-800/80 border border-slate-700/60 rounded-xl p-0.5">
              <button
                onClick={onZoomIn}
                className="p-1.5 sm:p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/70 active:scale-95 transition-transform cursor-pointer"
                title="Phóng to camera (+)"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
              </button>
              <button
                onClick={onZoomOut}
                className="p-1.5 sm:p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/70 active:scale-95 transition-transform cursor-pointer"
                title="Thu nhỏ camera (-)"
              >
                <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
              </button>
              <button
                onClick={onResetCamera}
                className="p-1.5 sm:p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/70 active:scale-95 transition-transform cursor-pointer"
                title="Góc nhìn Toàn Cảnh"
              >
                <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
              </button>
            </div>

            {/* Middle: Horizontal Swipeable Room Chips */}
            <div className="flex-1 flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none snap-x overscroll-contain">
              <button
                onClick={onResetCamera}
                className={`snap-start shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[38px] ${
                  !currentRoomId
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
                }`}
              >
                <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Toàn Cảnh</span>
              </button>

              {ROOMS.map((room) => {
                const isSelected = currentRoomId === room.id;
                return (
                  <button
                    key={room.id}
                    onClick={() => onSelectRoom(room.id)}
                    className={`snap-start shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs transition-all cursor-pointer min-h-[38px] ${
                      isSelected
                        ? 'bg-indigo-600 text-white font-semibold border border-indigo-400/80 shadow-md shadow-indigo-600/30'
                        : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/50 hover:text-white'
                    }`}
                    title={room.description}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: room.themeColor }}
                    ></span>
                    <span className="whitespace-nowrap">{room.vietnameseName}</span>
                  </button>
                );
              })}
            </div>

            {/* Right: View All Rooms Grid Button */}
            <button
              onClick={() => setIsRoomGridOpen(true)}
              className="shrink-0 flex items-center gap-1 px-2 py-1.5 sm:px-2.5 sm:py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 text-xs font-medium cursor-pointer min-h-[38px]"
              title="Xem danh sách tất cả phòng ban dạng lưới"
            >
              <Grid className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Phòng</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile / Quick Room Grid Sheet */}
      {isRoomGridOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            onClick={() => setIsRoomGridOpen(false)}
          />
          <div className="relative z-10 w-full sm:max-w-xl bg-slate-900 border border-slate-700/80 rounded-t-3xl sm:rounded-2xl shadow-2xl p-4 sm:p-5 max-h-[85vh] flex flex-col text-slate-100 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm sm:text-base text-white">
                  Danh Sách Phòng Ban 3D ({ROOMS.length})
                </h3>
              </div>
              <button
                onClick={() => setIsRoomGridOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-3 overflow-y-auto space-y-2">
              <button
                onClick={() => {
                  onResetCamera();
                  setIsRoomGridOpen(false);
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left cursor-pointer ${
                  !currentRoomId
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-200 hover:bg-slate-800'
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs sm:text-sm">Toàn Cảnh Văn Phòng</div>
                  <div className="text-[11px] text-slate-400">
                    Góc quan sát bao quát toàn bộ 7 khu vực hoạt động
                  </div>
                </div>
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {ROOMS.map((room) => {
                  const isSelected = currentRoomId === room.id;
                  return (
                    <button
                      key={room.id}
                      onClick={() => {
                        onSelectRoom(room.id);
                        setIsRoomGridOpen(false);
                      }}
                      className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600/30 border-indigo-400 text-white'
                          : 'bg-slate-800/50 border-slate-700/50 text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0 mt-0.5"
                        style={{ backgroundColor: room.themeColor }}
                      ></span>
                      <div>
                        <div className="font-bold text-xs">{room.vietnameseName}</div>
                        <div className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">
                          {room.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

