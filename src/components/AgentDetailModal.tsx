import React from 'react';
import {
  X,
  Compass,
  Cpu,
  Award,
  CheckCircle,
  Clock,
  Layers,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { AIAgent, AgentStatus, Task } from '../types/index.ts';
import { DEPARTMENTS } from '../data/roomsData.ts';
import { STATUS_CONFIG } from '../styles/theme.ts';

interface AgentDetailModalProps {
  agent: AIAgent | null;
  onClose: () => void;
  onFocus3D: (agentId: string) => void;
  onUpdateStatus: (agentId: string, status: AgentStatus) => void;
  tasks: Task[];
  onSelectTask: (task: Task) => void;
}

export const AgentDetailModal: React.FC<AgentDetailModalProps> = ({
  agent,
  onClose,
  onFocus3D,
  onUpdateStatus,
  tasks,
  onSelectTask,
}) => {
  if (!agent) return null;

  const dept = DEPARTMENTS.find((d) => d.id === agent.departmentId);
  const statusInfo = STATUS_CONFIG[agent.status];
  const currentTask = tasks.find((t) => t.id === agent.currentTaskId);

  const statuses: AgentStatus[] = ['idle', 'working', 'researching', 'meeting', 'testing', 'completed', 'error'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 bg-black/80 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full sm:max-w-2xl bg-slate-900 border border-slate-700/80 rounded-t-3xl sm:rounded-2xl shadow-2xl text-slate-100 overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner with Department Accent Color */}
        <div
          className="relative flex items-end p-4 sm:p-6 border-b border-slate-800 min-h-[96px] sm:min-h-[112px]"
          style={{
            background: `linear-gradient(135deg, ${agent.avatarColor}33 0%, #0f172a 100%)`,
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-xl bg-slate-900/80 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 sm:gap-4 pr-8">
            <div
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-white font-extrabold text-xl sm:text-2xl shadow-xl border-2 shrink-0"
              style={{
                backgroundColor: agent.avatarColor,
                borderColor: agent.secondaryColor,
              }}
            >
              {agent.name.charAt(0)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h2 className="text-base sm:text-xl font-bold text-white">{agent.name}</h2>
                <span
                  className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 rounded-full font-semibold border whitespace-nowrap"
                  style={{
                    color: statusInfo.color,
                    backgroundColor: statusInfo.bg,
                    borderColor: statusInfo.border,
                  }}
                >
                  ● {statusInfo.label}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5">{agent.role}</p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5">
          {/* Department and Model Specification */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3">
              <span className="text-[11px] text-slate-400 block mb-1">Phòng Ban Phụ Trách</span>
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: dept?.color }}
                ></span>
                {dept?.name}
              </span>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3">
              <span className="text-[11px] text-slate-400 block mb-1">Kiến Trúc AI Model</span>
              <span className="text-xs font-mono-code font-semibold text-cyan-300">
                {agent.modelType}
              </span>
            </div>
          </div>

          {/* Bio / Persona */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-3.5">
            <h4 className="text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Sứ Mệnh & Hồ Sơ Năng Lực
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">{agent.bio}</p>
          </div>

          {/* Skills */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 mb-2">Chuyên Môn Cốt Lõi</h4>
            <div className="flex flex-wrap gap-1.5">
              {agent.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Current Task */}
          {currentTask && (
            <div className="bg-slate-800/50 border border-slate-700/80 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-indigo-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  Nhiệm Vụ Đang Đảm Nhận
                </span>
                <span className="font-mono-code text-[10px] text-slate-400">{currentTask.id}</span>
              </div>

              <h4 className="text-sm font-bold text-slate-100 mb-1">{currentTask.title}</h4>
              <p className="text-xs text-slate-400 mb-3 line-clamp-2">{currentTask.description}</p>

              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Tiến độ thực hiện</span>
                    <span className="text-cyan-400 font-semibold">{currentTask.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-cyan-500 h-1.5 rounded-full"
                      style={{ width: `${currentTask.progress}%` }}
                    ></div>
                  </div>
                </div>

                <button
                  onClick={() => onSelectTask(currentTask)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Chi tiết</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* Interactive State Control (Section 5 requirement) */}
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-3.5 space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">
              Điều Khiển Trạng Thái Nhân Vật 3D (Cập nhật Hoạt Ảnh Tức Thì):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {statuses.map((st) => {
                const conf = STATUS_CONFIG[st];
                const isActive = agent.status === st;
                return (
                  <button
                    key={st}
                    onClick={() => onUpdateStatus(agent.id, st)}
                    className={`px-2 py-1.5 rounded-lg text-[11px] font-medium border text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-slate-700 text-white border-cyan-400 shadow-sm'
                        : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <span style={{ color: conf.color }} className="mr-1">●</span>
                    {conf.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Performance Stats */}
          <div className="grid grid-cols-3 gap-3 text-center border-t border-slate-800 pt-3">
            <div>
              <span className="text-slate-500 text-[10px] block">Nhiệm vụ xong</span>
              <span className="text-base font-bold text-slate-200">{agent.stats.tasksCompleted}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Độ chuẩn xác</span>
              <span className="text-base font-bold text-emerald-400">{agent.stats.accuracyScore}%</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Thời gian hoạt động</span>
              <span className="text-base font-bold text-cyan-400">{agent.stats.uptime}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-800 bg-slate-900/90 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3">
          <button
            onClick={() => {
              onFocus3D(agent.id);
              onClose();
            }}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-transform cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>Định Vị 3D Tại Bàn Làm Việc</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer text-center"
          >
            Đóng Hồ Sơ
          </button>
        </div>
      </div>
    </div>
  );
};
