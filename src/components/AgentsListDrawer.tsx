import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Filter,
  Compass,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { AIAgent, DepartmentId, AgentStatus } from '../types/index.ts';
import { DEPARTMENTS } from '../data/roomsData.ts';
import { STATUS_CONFIG } from '../styles/theme.ts';

interface AgentsListDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  agents: AIAgent[];
  onSelectAgent: (agent: AIAgent) => void;
  onFocusAgent3D: (agentId: string) => void;
}

export const AgentsListDrawer: React.FC<AgentsListDrawerProps> = ({
  isOpen,
  onClose,
  agents,
  onSelectAgent,
  onFocusAgent3D,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredAgents = useMemo(() => {
    return agents.filter((agent) => {
      const matchQuery =
        searchQuery === '' ||
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchDept = selectedDept === 'all' || agent.departmentId === selectedDept;
      const matchStatus = selectedStatus === 'all' || agent.status === selectedStatus;

      return matchQuery && matchDept && matchStatus;
    });
  }, [agents, searchQuery, selectedDept, selectedStatus]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      {/* Backdrop for mobile and desktop click-to-dismiss */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md h-full bg-slate-900 border-l border-slate-700/80 shadow-2xl flex flex-col text-slate-100 overscroll-contain">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div>
            <h2 className="text-base font-bold text-slate-100">Đội Ngũ AI Agent</h2>
            <p className="text-xs text-slate-400">
              {filteredAgents.length}/{agents.length} nhân sự AI phù hợp bộ lọc
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter and Search Controls */}
        <div className="p-4 border-b border-slate-800 space-y-3 bg-slate-950/40">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên, chức vụ hoặc kỹ năng..."
              className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-base sm:text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-400"
            />
          </div>

        {/* Department Filter Pills */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-400">Phòng Ban:</label>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setSelectedDept('all')}
              className={`px-2 py-1 rounded-lg text-[11px] transition-colors cursor-pointer ${
                selectedDept === 'all'
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Tất cả
            </button>
            {DEPARTMENTS.map((dept) => (
              <button
                key={dept.id}
                onClick={() => setSelectedDept(dept.id)}
                className={`px-2 py-1 rounded-lg text-[11px] transition-colors cursor-pointer ${
                  selectedDept === dept.id
                    ? 'bg-indigo-600 text-white font-medium'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {dept.shortName}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-400">Trạng Thái Làm Việc:</label>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-2 py-1 rounded-lg text-[11px] transition-colors cursor-pointer ${
                selectedStatus === 'all'
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Tất cả
            </button>
            {Object.entries(STATUS_CONFIG).map(([st, conf]) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-2 py-1 rounded-lg text-[11px] transition-colors cursor-pointer ${
                  selectedStatus === st
                    ? 'bg-indigo-600 text-white font-medium'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {conf.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Agents Scrollable List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {filteredAgents.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            Không tìm thấy nhân viên AI nào phù hợp với bộ lọc hiện tại.
          </div>
        ) : (
          filteredAgents.map((agent) => {
            const statusInfo = STATUS_CONFIG[agent.status];
            const dept = DEPARTMENTS.find((d) => d.id === agent.departmentId);

            return (
              <div
                key={agent.id}
                className="bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/60 hover:border-slate-600 rounded-xl p-3 transition-colors flex items-center justify-between gap-3 group"
              >
                <div
                  onClick={() => onSelectAgent(agent)}
                  className="flex items-center gap-3 flex-1 cursor-pointer"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0"
                    style={{ backgroundColor: agent.avatarColor }}
                  >
                    {agent.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors truncate">
                        {agent.name}
                      </h4>
                      <span
                        className="text-[9px] px-1.5 py-0.2 rounded font-semibold border"
                        style={{
                          color: statusInfo.color,
                          backgroundColor: statusInfo.bg,
                          borderColor: statusInfo.border,
                        }}
                      >
                        {statusInfo.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">{agent.role}</p>
                    <span className="text-[10px] text-slate-500">{dept?.shortName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onFocusAgent3D(agent.id)}
                    className="p-2 rounded-lg bg-slate-700/60 hover:bg-amber-500 hover:text-slate-950 text-amber-400 transition-colors cursor-pointer"
                    title="Định vị camera 3D đến bàn làm việc"
                  >
                    <Compass className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onSelectAgent(agent)}
                    className="p-2 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                    title="Xem chi tiết hồ sơ"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  </div>
);
};
