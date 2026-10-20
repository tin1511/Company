import React from 'react';
import {
  X,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  Tag,
  User,
  AlertTriangle,
} from 'lucide-react';
import { Task, TaskStatus, AIAgent } from '../types/index.ts';
import { DEPARTMENTS } from '../data/roomsData.ts';

interface TaskDetailModalProps {
  task: Task | null;
  agents: AIAgent[];
  onClose: () => void;
  onFocusAgent: (agentId: string) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  agents,
  onClose,
  onFocusAgent,
}) => {
  if (!task) return null;

  const dept = DEPARTMENTS.find((d) => d.id === task.departmentId);
  const assignee = agents.find((a) => a.id === task.assignedAgentId);

  const priorityColors = {
    critical: 'text-rose-400 bg-rose-500/10 border-rose-500/40',
    high: 'text-amber-400 bg-amber-500/10 border-amber-500/40',
    medium: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/40',
    low: 'text-slate-400 bg-slate-500/10 border-slate-500/40',
  };

  const statusLabels: Record<TaskStatus, string> = {
    pending: 'Chờ xử lý',
    planned: 'Đã lập kế hoạch',
    awaiting_approval: 'Chờ Chủ tịch phê duyệt',
    in_progress: 'Đang tiến hành',
    testing: 'Đang kiểm thử',
    completed: 'Đã hoàn thành',
    failed: 'Thất bại',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full sm:max-w-xl bg-slate-900 border border-slate-700/80 rounded-t-3xl sm:rounded-2xl shadow-2xl text-slate-100 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-xs font-mono-code px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
              {task.id}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded border uppercase font-bold ${priorityColors[task.priority]}`}>
              Ưu tiên: {task.priority}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white mb-1 sm:mb-2">{task.title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{task.description}</p>
          </div>

          {/* Meta Details */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-3">
              <span className="text-slate-400 block mb-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-cyan-400" />
                Chuyên Đề Di Sản
              </span>
              <span className="font-semibold text-slate-200">{task.culturalTopic || 'Chung'}</span>
            </div>

            <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-3">
              <span className="text-slate-400 block mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                Thời Hạn Hoàn Thành
              </span>
              <span className="font-semibold text-slate-200">{task.dueDate}</span>
            </div>
          </div>

          {/* Assignee Card */}
          {assignee && (
            <div className="bg-slate-800/50 border border-slate-700/80 rounded-xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: assignee.avatarColor }}
                >
                  {assignee.name.charAt(0)}
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    AI Agent Đảm Nhiệm
                  </span>
                  <h4 className="text-xs font-bold text-white">{assignee.name}</h4>
                  <span className="text-[11px] text-slate-400">{assignee.role}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  onFocusAgent(assignee.id);
                  onClose();
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-cyan-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Xem 3D</span>
              </button>
            </div>
          )}

          {/* Progress */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Trạng thái: <strong>{statusLabels[task.status]}</strong></span>
              <span className="text-cyan-400 font-bold">{task.progress}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
              <div
                className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${task.progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
