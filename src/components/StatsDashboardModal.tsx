import React from 'react';
import {
  X,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Briefcase,
  TrendingUp,
  Cpu,
  Layers,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { AIAgent, Task, ActivityLog } from '../types/index.ts';
import { DEPARTMENTS } from '../data/roomsData.ts';
import { STATUS_CONFIG } from '../styles/theme.ts';

interface StatsDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  agents: AIAgent[];
  tasks: Task[];
  logs: ActivityLog[];
  onSelectAgent: (agent: AIAgent) => void;
  onSelectTask: (task: Task) => void;
}

export const StatsDashboardModal: React.FC<StatsDashboardModalProps> = ({
  isOpen,
  onClose,
  agents,
  tasks,
  logs,
  onSelectAgent,
  onSelectTask,
}) => {
  if (!isOpen) return null;

  // Key metrics calculation
  const totalAgents = agents.length;
  const activeAgents = agents.filter(
    (a) => a.status === 'working' || a.status === 'researching' || a.status === 'testing'
  ).length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const reviewTasks = tasks.filter((t) => t.status === 'awaiting_approval').length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 bg-black/80 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full sm:max-w-5xl bg-slate-900 border border-slate-700/80 rounded-t-3xl sm:rounded-2xl shadow-2xl text-slate-100 max-h-[90vh] sm:max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-100">Bảng Điều Khiển Quản Trị AI</h2>
                <span className="text-[9px] sm:text-[10px] font-mono-code px-1.5 sm:px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  DEMO • GIAI ĐOẠN 1
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 hidden xs:block">
                Tổng hợp thời gian thực trạng thái đội ngũ AI Agent & Dự án Hồn Đất Việt
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6">
          {/* Notice banner */}
          <div className="bg-indigo-950/40 border border-indigo-800/40 rounded-xl p-3 flex items-start gap-2.5 text-xs text-indigo-200">
            <Cpu className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
            <div>
              <strong>Thông báo Giai đoạn 1:</strong> Toàn bộ dữ liệu hiển thị hiện tại là dữ liệu mẫu mô phỏng kiến trúc hoạt động của công ty. Lớp truy xuất dữ liệu được thiết kế chuẩn Interface độc lập, sẵn sàng kết nối API Agent thật và Node.js backend ở Giai đoạn 2.
            </div>
          </div>

          {/* 4 Metric KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
              <div className="flex items-center justify-between text-slate-400 mb-2 text-xs">
                <span>Tổng Nhân Viên AI</span>
                <Users className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-bold text-white">{totalAgents}</div>
              <div className="text-[11px] text-cyan-400 mt-1">100% Sẵn sàng vận hành</div>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
              <div className="flex items-center justify-between text-slate-400 mb-2 text-xs">
                <span>AI Đang Tác Nghiệp</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-amber-400">{activeAgents}</div>
              <div className="text-[11px] text-slate-400 mt-1">
                {Math.round((activeAgents / totalAgents) * 100)}% công suất sử dụng
              </div>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
              <div className="flex items-center justify-between text-slate-400 mb-2 text-xs">
                <span>Nhiệm Vụ Đang Thực Hiện</span>
                <Briefcase className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-bold text-indigo-300">{inProgressTasks}</div>
              <div className="text-[11px] text-slate-400 mt-1">
                {reviewTasks} nhiệm vụ đang chờ duyệt
              </div>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
              <div className="flex items-center justify-between text-slate-400 mb-2 text-xs">
                <span>Nhiệm Vụ Đã Xác Thực</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-emerald-400">{completedTasks}</div>
              <div className="text-[11px] text-emerald-400 mt-1">Đạt chuẩn di sản 100%</div>
            </div>
          </div>

          {/* Department Breakdown */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              Trạng Thái Từng Phòng Ban Nghiên Cứu & Phát Triển
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {DEPARTMENTS.map((dept) => {
                const deptAgents = agents.filter((a) => a.departmentId === dept.id);
                const deptTasks = tasks.filter((t) => t.departmentId === dept.id);
                const deptActive = deptAgents.filter(
                  (a) => a.status === 'working' || a.status === 'researching' || a.status === 'testing'
                ).length;

                return (
                  <div
                    key={dept.id}
                    className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-3.5 hover:border-slate-600 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: dept.color }}
                        ></span>
                        <h4 className="text-xs font-bold text-slate-200">{dept.name}</h4>
                      </div>
                      <span className="text-[11px] font-mono-code text-slate-400">
                        {deptAgents.length} AI
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 mb-3 line-clamp-2">
                      {dept.description}
                    </p>

                    <div className="flex items-center justify-between text-[11px] border-t border-slate-700/50 pt-2 text-slate-400">
                      <span>Đang hoạt động: <strong className="text-slate-200">{deptActive}/{deptAgents.length}</strong></span>
                      <span>Nhiệm vụ: <strong className="text-slate-200">{deptTasks.length}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pending Reviews & In-Progress Tasks List */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Nhiệm Vụ Trọng Tâm & Chờ Phê Duyệt ({tasks.length})
            </h3>
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl overflow-hidden divide-y divide-slate-800">
              {tasks.slice(0, 5).map((task) => {
                const assignee = agents.find((a) => a.id === task.assignedAgentId);
                return (
                  <div
                    key={task.id}
                    onClick={() => onSelectTask(task)}
                    className="p-3.5 hover:bg-slate-800/60 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono-code text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
                          {task.id}
                        </span>
                        <h4 className="text-xs font-semibold text-slate-100 hover:text-cyan-400 transition-colors">
                          {task.title}
                        </h4>
                        {task.status === 'awaiting_approval' && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            Chờ duyệt
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-3">
                        <span>Chuyên đề: <strong className="text-slate-300">{task.culturalTopic}</strong></span>
                        <span>•</span>
                        <span>Đảm nhiệm: <strong className="text-cyan-400">{assignee?.name || 'Chưa gán'}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:flex-shrink-0">
                      <div className="w-28 space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>Tiến độ</span>
                          <span>{task.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-indigo-500 h-1.5 rounded-full"
                            style={{ width: `${task.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-500" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs text-slate-400">
          <span>Hệ thống Giám sát & Quản trị AI Công ty Hồn Đất Việt</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
          >
            Đóng Bảng Điều Khiển
          </button>
        </div>
      </div>
    </div>
  );
};
