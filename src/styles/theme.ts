import { AgentStatus } from '../types/index.ts';

export const STATUS_CONFIG: Record<
  AgentStatus,
  { label: string; color: string; bg: string; border: string; icon: string }
> = {
  idle: {
    label: 'Đang chờ nhiệm vụ',
    color: '#94a3b8',
    bg: 'rgba(148, 163, 184, 0.15)',
    border: 'rgba(148, 163, 184, 0.3)',
    icon: 'Clock',
  },
  working: {
    label: 'Đang làm việc',
    color: '#38bdf8',
    bg: 'rgba(56, 189, 248, 0.15)',
    border: 'rgba(56, 189, 248, 0.4)',
    icon: 'Briefcase',
  },
  researching: {
    label: 'Đang nghiên cứu',
    color: '#a855f7',
    bg: 'rgba(168, 85, 247, 0.15)',
    border: 'rgba(168, 85, 247, 0.4)',
    icon: 'Search',
  },
  meeting: {
    label: 'Đang họp',
    color: '#f43f5e',
    bg: 'rgba(244, 63, 94, 0.15)',
    border: 'rgba(244, 63, 94, 0.4)',
    icon: 'Users',
  },
  testing: {
    label: 'Đang kiểm tra',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.15)',
    border: 'rgba(16, 185, 129, 0.4)',
    icon: 'CheckCircle2',
  },
  completed: {
    label: 'Đã hoàn thành',
    color: '#22c55e',
    bg: 'rgba(34, 197, 94, 0.15)',
    border: 'rgba(34, 197, 94, 0.4)',
    icon: 'Award',
  },
  error: {
    label: 'Gặp lỗi',
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.15)',
    border: 'rgba(239, 68, 68, 0.4)',
    icon: 'AlertTriangle',
  },
};
