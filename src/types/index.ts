export type AgentStatus =
  | 'idle' // Đang chờ nhiệm vụ
  | 'working' // Đang làm việc
  | 'researching' // Đang nghiên cứu
  | 'meeting' // Đang họp
  | 'testing' // Đang kiểm tra
  | 'completed' // Đã hoàn thành
  | 'error'; // Gặp lỗi

export type TaskStatus =
  | 'pending' // Chờ xử lý
  | 'planned' // Đã lập kế hoạch
  | 'awaiting_approval' // Chờ phê duyệt của Chủ tịch
  | 'in_progress' // Đang thực hiện
  | 'testing' // Đang kiểm thử
  | 'completed' // Hoàn thành
  | 'failed'; // Thất bại

export type DepartmentId =
  | 'executive' // Ban Chiến lược & Điều hành
  | 'culture_history' // Phòng Nghiên cứu Văn hóa, Lịch sử & Du lịch
  | 'engineering' // Phòng Phát triển Phần mềm & Hệ thống
  | 'design_3d' // Phòng Thiết kế 3D & Giao diện
  | 'data_knowledge' // Phòng Dữ liệu & Tri thức Di sản
  | 'qa_testing' // Phòng Kiểm thử & Đảm bảo Chất lượng
  | 'security' // Phòng An toàn Thông tin & Bảo mật
  | 'operations'; // Sảnh Tiếp nhận & Điều phối

export interface DepartmentInfo {
  id: DepartmentId;
  name: string;
  shortName: string;
  description: string;
  color: string;
  accentColor: string;
  icon: string;
  roomIndex: number;
}

export interface AIAgent {
  id: string;
  name: string;
  role: string;
  departmentId: DepartmentId;
  status: AgentStatus;
  currentTaskId?: string;
  avatarColor: string;
  secondaryColor: string;
  modelType: string;
  skills: string[];
  bio: string;
  position3D: [number, number, number];
  rotationY: number;
  chairPosition?: [number, number, number];
  roomId: string;
  stats: {
    tasksCompleted: number;
    accuracyScore: number;
    uptime: string;
  };
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface AuditTrailItem {
  timestamp: string;
  actor: string;
  action: string;
  details: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  departmentId: DepartmentId;
  assignedAgentId: string;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number; // 0 - 100
  dueDate: string;
  culturalTopic?: string;
  subTasks?: SubTask[];
  requiresApproval?: boolean;
  approvalStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  approvalFeedback?: string;
  testResults?: string;
  auditTrail?: AuditTrailItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  agentId: string;
  agentName: string;
  departmentId: DepartmentId;
  action: string;
  details: string;
  type: 'info' | 'success' | 'warning' | 'alert';
}

export interface RoomDefinition {
  id: string;
  name: string;
  code: string;
  vietnameseName: string;
  departmentId?: DepartmentId;
  description: string;
  center: [number, number, number];
  size: [number, number, number];
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  themeColor: string;
  features: string[];
}

export interface AgentModelConfig {
  agentId: string;
  agentName: string;
  role: string;
  departmentId: DepartmentId;
  primaryModel: string;
  fallbackModel: string;
  maxOutputTokens: number;
  temperature: number;
  status: 'online' | 'untested' | 'error';
  lastLatencyMs?: number;
  lastTestedAt?: string;
  history?: Array<{
    timestamp: string;
    model: string;
    changedBy: string;
  }>;
}

export interface ChairmanUser {
  username: string;
  role: 'chairman';
  mustChangePassword: boolean;
  lastLoginAt?: string;
}
