import React, { useEffect, useState } from 'react';
import {
  X,
  Crown,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Briefcase,
  TrendingUp,
  Cpu,
  Layers,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  PlusCircle,
  Settings2,
  LogOut,
  Compass,
} from 'lucide-react';
import { Task } from '../types/index.ts';

interface ChairmanOverviewData {
  totalAgents: number;
  activeAgents: number;
  idleAgents: number;
  errorAgents: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  overallProgressPercent: number;
  pendingApprovalsCount: number;
  pendingApprovals: Task[];
}

interface ChairmanDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionToken: string;
  onOpenTaskDispatch: () => void;
  onOpenModelManagement: () => void;
  onFocusChairmanSkySuite: () => void;
  onLogout: () => void;
  onSelectTask: (task: Task) => void;
}

export const ChairmanDashboardModal: React.FC<ChairmanDashboardModalProps> = ({
  isOpen,
  onClose,
  sessionToken,
  onOpenTaskDispatch,
  onOpenModelManagement,
  onFocusChairmanSkySuite,
  onLogout,
  onSelectTask,
}) => {
  const [data, setData] = useState<ChairmanOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const fetchOverview = async () => {
    try {
      const res = await fetch('/api/chairman/overview', {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchOverview();
    }
  }, [isOpen]);

  const handleApprove = async (taskId: string) => {
    try {
      const res = await fetch(`/api/chairman/tasks/${taskId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ feedback: 'Chủ tịch đã phê duyệt kế hoạch.' }),
      });
      if (res.ok) {
        setActionFeedback(`Đã phê duyệt nhiệm vụ ${taskId}!`);
        fetchOverview();
      }
    } catch {
      // Ignore
    }
  };

  const handleReject = async (taskId: string) => {
    const reason = 'Chủ tịch yêu cầu điều chỉnh kế hoạch để tối ưu chất lượng di sản.';
    try {
      const res = await fetch(`/api/chairman/tasks/${taskId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) {
        setActionFeedback(`Đã từ chối và chuyển yêu cầu điều chỉnh cho nhiệm vụ ${taskId}!`);
        fetchOverview();
      }
    } catch {
      // Ignore
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 bg-black/80 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full sm:max-w-5xl bg-slate-900 border border-amber-500/50 rounded-t-3xl sm:rounded-2xl shadow-2xl text-slate-100 max-h-[90vh] sm:max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-800 bg-gradient-to-r from-amber-500/20 via-slate-900 to-slate-900">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">Bảng Điều Hành Tối Cao — Chủ Tịch</h2>
                <span className="text-[9px] sm:text-[10px] font-mono-code px-1.5 sm:px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold">
                  CHAIRMAN AUTHORITY
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 hidden xs:block">
                Toàn quyền giám sát 12 AI Agent, phê duyệt rủi ro và quản trị mô hình Gemini
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Action Navigation Bar */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-950/40 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onOpenTaskDispatch();
                onClose();
              }}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Giao Nhiệm Vụ Mới</span>
            </button>

            <button
              onClick={() => {
                onOpenModelManagement();
                onClose();
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>Quản Lý Model AI (Gemini)</span>
            </button>

            <button
              onClick={() => {
                onFocusChairmanSkySuite();
                onClose();
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>Vào Văn Phòng 3D Sky Suite</span>
            </button>
          </div>

          <button
            onClick={onLogout}
            className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Đăng Xuất Chủ Tịch</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {actionFeedback && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between">
              <span>{actionFeedback}</span>
              <button onClick={() => setActionFeedback(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
          )}

          {/* 4 Metric KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
              <div className="flex items-center justify-between text-slate-400 mb-2 text-xs">
                <span>Nhân Viên AI</span>
                <Users className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-bold text-white">{data?.totalAgents ?? 12}</div>
              <div className="text-[11px] text-cyan-400 mt-1">
                {data?.activeAgents ?? 10} đang hoạt động • {data?.idleAgents ?? 2} đang chờ
              </div>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
              <div className="flex items-center justify-between text-slate-400 mb-2 text-xs">
                <span>Tiến Độ Dự Án Tổng Thể</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-emerald-400">{data?.overallProgressPercent ?? 74}%</div>
              <div className="text-[11px] text-slate-400 mt-1">
                {data?.completedTasks ?? 0} nhiệm vụ đã hoàn thành
              </div>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
              <div className="flex items-center justify-between text-slate-400 mb-2 text-xs">
                <span>Nhiệm Vụ Đang Chạy</span>
                <Briefcase className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-bold text-indigo-300">{data?.inProgressTasks ?? 0}</div>
              <div className="text-[11px] text-slate-400 mt-1">
                {data?.overdueTasks ?? 0} nhiệm vụ quá hạn
              </div>
            </div>

            <div className="bg-slate-800/60 border border-amber-500/40 rounded-xl p-4 bg-amber-500/5">
              <div className="flex items-center justify-between text-amber-300 mb-2 text-xs">
                <span>Chờ Chủ Tịch Phê Duyệt</span>
                <ShieldAlert className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-amber-400">{data?.pendingApprovalsCount ?? 0}</div>
              <div className="text-[11px] text-amber-300 mt-1">Cần xem xét rủi ro</div>
            </div>
          </div>

          {/* Real Pending Approvals Queue (Chairman Approval Gate) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                Cổng Phê Duyệt Quyết Định Của Chủ Tịch (Approval Gate)
              </h3>
              <span className="text-xs text-slate-400">
                {data?.pendingApprovals?.length ?? 0} mục cần quyết định
              </span>
            </div>

            {data?.pendingApprovals && data.pendingApprovals.length > 0 ? (
              <div className="space-y-2.5">
                {data.pendingApprovals.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-xl bg-slate-800/80 border border-amber-500/40 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 max-w-xl">
                      <div className="flex items-center gap-2">
                        <span className="font-mono-code text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                          {task.id}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-rose-400">
                          Ưu tiên: {task.priority}
                        </span>
                        <span className="text-xs text-slate-400">
                          Chuyên đề: <strong className="text-slate-200">{task.culturalTopic}</strong>
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white hover:text-amber-300 transition-colors cursor-pointer" onClick={() => onSelectTask(task)}>
                        {task.title}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-2">{task.description}</p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleApprove(task.id)}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                      >
                        Phê Duyệt
                      </button>
                      <button
                        onClick={() => handleReject(task.id)}
                        className="px-3.5 py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white font-semibold text-xs transition-colors cursor-pointer"
                      >
                        Từ Chối
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-slate-800/30 border border-slate-700/50 text-center text-xs text-slate-400">
                Hiện không có quyết định nào đang chờ phê duyệt. Toàn bộ các quy trình AI đang vận hành đúng thẩm quyền.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs text-slate-400">
          <span>Hệ thống Quản trị Bền vững — Dữ liệu lưu trữ máy chủ an toàn</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
