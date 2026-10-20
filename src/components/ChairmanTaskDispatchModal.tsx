import React, { useState } from 'react';
import {
  X,
  PlusCircle,
  Trash2,
  Calendar,
  AlertCircle,
  ShieldCheck,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import { AIAgent, DepartmentId } from '../types/index.ts';
import { DEPARTMENTS } from '../data/roomsData.ts';

interface ChairmanTaskDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionToken: string;
  agents: AIAgent[];
  onTaskCreated: () => void;
}

export const ChairmanTaskDispatchModal: React.FC<ChairmanTaskDispatchModalProps> = ({
  isOpen,
  onClose,
  sessionToken,
  agents,
  onTaskCreated,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [departmentId, setDepartmentId] = useState<DepartmentId>('culture_history');
  const [assignedAgentId, setAssignedAgentId] = useState(agents[0]?.id || 'agent-au-co');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('high');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );
  const [culturalTopic, setCulturalTopic] = useState('Di sản & Kiến trúc Văn hóa');
  const [requiresApproval, setRequiresApproval] = useState(true);

  // Subtasks list
  const [subTasks, setSubTasks] = useState<Array<{ title: string }>>([
    { title: 'Khảo sát và thu thập tư liệu nền tảng' },
    { title: 'Xây dựng thuật toán và mô hình số hóa' },
    { title: 'Kiểm thử thực địa và báo cáo Chủ tịch' },
  ]);
  const [newSubTaskTitle, setNewSubTaskTitle] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddSubTask = () => {
    if (!newSubTaskTitle.trim()) return;
    setSubTasks([...subTasks, { title: newSubTaskTitle.trim() }]);
    setNewSubTaskTitle('');
  };

  const handleRemoveSubTask = (idx: number) => {
    setSubTasks(subTasks.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chairman/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          title,
          description,
          departmentId,
          assignedAgentId,
          priority,
          dueDate,
          culturalTopic,
          subTasks,
          requiresApproval,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Không thể tạo nhiệm vụ.');
      }

      onTaskCreated();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi khi giao nhiệm vụ.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 bg-black/80 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full sm:max-w-2xl bg-slate-900 border border-amber-500/50 rounded-t-3xl sm:rounded-2xl shadow-2xl text-slate-100 overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-800 bg-gradient-to-r from-amber-500/20 via-slate-900 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">Chủ Tịch Giao Nhiệm Vụ Cho AI Agent</h2>
              <p className="text-[11px] sm:text-xs text-amber-300/80">Phân công trực tiếp từ Trung tâm Chỉ huy Tối cao</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
              {error}
            </div>
          )}

          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 block">
              Tên / Mục Tiêu Nhiệm Vụ (Bằng Ngôn Ngữ Tự Nhiên)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Phục dựng kỹ thuật số 3D sa bàn phòng thủ Vạn Kiếp..."
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-base sm:text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 block">
              Yêu Cầu Chi Tiết & Bằng Chứng Cần Kiểm Tra
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả chi tiết các tiêu chuẩn chất lượng, tư liệu cần đối chiếu và kết quả đầu ra..."
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-base sm:text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Department & Agent Assignment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 block">Phòng Ban Phụ Trách</label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value as DepartmentId)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-base sm:text-xs text-white focus:outline-none focus:border-amber-400"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 block">Chỉ Định AI Agent Đảm Nhiệm</label>
              <select
                value={assignedAgentId}
                onChange={(e) => setAssignedAgentId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-base sm:text-xs text-white focus:outline-none focus:border-amber-400"
              >
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} — {agent.role}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Priority & Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 block">Mức Độ Ưu Tiên</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as typeof priority)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-base sm:text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="low">Thấp (Low)</option>
                <option value="medium">Trung bình (Medium)</option>
                <option value="high">Cao (High)</option>
                <option value="critical">Tối khẩn (Critical)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 block">Thời Hạn (Deadline)</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-base sm:text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 block">Chuyên Đề Di Sản</label>
              <input
                type="text"
                value={culturalTopic}
                onChange={(e) => setCulturalTopic(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-base sm:text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Subtasks Splitter */}
          <div className="space-y-2 border-t border-slate-800 pt-3">
            <label className="text-xs font-semibold text-slate-300 block">
              Phân Rã Nhiệm Vụ Thành Các Đầu Việc Nhỏ (Sub-tasks)
            </label>
            <div className="space-y-1.5">
              {subTasks.map((st, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 border border-slate-700 text-xs"
                >
                  <span className="text-slate-300 font-medium">
                    {idx + 1}. {st.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubTask(idx)}
                    className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={newSubTaskTitle}
                onChange={(e) => setNewSubTaskTitle(e.target.value)}
                placeholder="Thêm đầu việc nhỏ..."
                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-base sm:text-xs text-white focus:outline-none focus:border-amber-400"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubTask();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddSubTask}
                className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs text-slate-200 cursor-pointer"
              >
                Thêm
              </button>
            </div>
          </div>

          {/* Risk & Approval Gate Toggle */}
          <div className="p-3 rounded-xl bg-slate-800/40 border border-amber-500/30 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Cơ Chế Phê Duyệt Của Chủ Tịch (Approval Gate)
              </span>
              <p className="text-[11px] text-slate-400">
                Nhiệm vụ này sẽ dừng tại bước chờ phê duyệt trước khi nhân viên AI được thực thi.
              </p>
            </div>
            <input
              type="checkbox"
              checked={requiresApproval}
              onChange={(e) => setRequiresApproval(e.target.checked)}
              className="w-4 h-4 text-amber-500 accent-amber-500 rounded cursor-pointer"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? <span>Đang phát lệnh...</span> : <span>Phát Lệnh Giao Nhiệm Vụ</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
