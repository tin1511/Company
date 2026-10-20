import React, { useState } from 'react';
import {
  X,
  ScrollText,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Filter,
} from 'lucide-react';
import { ActivityLog } from '../types/index.ts';

interface ActivityLogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  logs: ActivityLog[];
}

export const ActivityLogDrawer: React.FC<ActivityLogDrawerProps> = ({
  isOpen,
  onClose,
  logs,
}) => {
  const [filterType, setFilterType] = useState<string>('all');

  if (!isOpen) return null;

  const filteredLogs = filterType === 'all' ? logs : logs.filter((l) => l.type === filterType);

  const typeConfig = {
    info: { icon: Info, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
    success: { icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
    warning: { icon: AlertTriangle, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
    alert: { icon: AlertTriangle, color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      {/* Backdrop for click-outside dismissal */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md h-full bg-slate-900 border-l border-slate-700/80 shadow-2xl flex flex-col text-slate-100 overscroll-contain">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2">
          <ScrollText className="w-5 h-5 text-emerald-400" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-100">Nhật Ký Hoạt Động AI</h2>
              <span className="text-[9px] font-mono-code px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                DEMO DATA
              </span>
            </div>
            <p className="text-xs text-slate-400">Ghi nhận tiến trình tác nghiệp của các AI Agent</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="p-3 border-b border-slate-800 flex items-center gap-2 bg-slate-950/40 text-xs">
        <Filter className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-400 font-medium">Lọc:</span>
        <div className="flex gap-1">
          {['all', 'info', 'success', 'warning'].map((ft) => (
            <button
              key={ft}
              onClick={() => setFilterType(ft)}
              className={`px-2.5 py-1 rounded-lg capitalize transition-colors cursor-pointer ${
                filterType === ft
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {ft === 'all' ? 'Tất cả' : ft}
            </button>
          ))}
        </div>
      </div>

      {/* Log Entries */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredLogs.map((log) => {
          const cfg = typeConfig[log.type];
          const IconComponent = cfg.icon;

          return (
            <div
              key={log.id}
              className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-3 space-y-1.5"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={`p-1 rounded-md border ${cfg.color}`}>
                    <IconComponent className="w-3.5 h-3.5" />
                  </span>
                  <span className="font-bold text-slate-200">{log.agentName}</span>
                </div>
                <span className="font-mono-code text-[10px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {log.timestamp}
                </span>
              </div>

              <div className="text-xs font-semibold text-cyan-300 pl-7">
                {log.action}
              </div>

              <p className="text-xs text-slate-400 pl-7 leading-relaxed">
                {log.details}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);
};
