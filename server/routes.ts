import { Router, Request, Response, NextFunction } from 'express';
import { store } from './store.ts';
import { verifyPassword, hashPassword, generateSessionToken, validatePasswordStrength } from './auth.ts';
import { SUPPORTED_MODELS, testModelConnectivity } from './geminiService.ts';
import { Task, TaskStatus } from '../src/types/index.ts';

export const apiRouter = Router();

// Middleware: Authenticate Chairman session token
export function requireChairmanAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Yêu cầu đăng nhập tài khoản Chủ tịch.' });
    return;
  }

  const token = authHeader.substring(7);
  const chairman = store.getChairman();
  const now = Date.now();

  const validSession = chairman.activeSessions.find(
    (s) => s.token === token && s.expiresAt > now
  );

  if (!validSession) {
    res.status(401).json({ error: 'Phiên làm việc đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.' });
    return;
  }

  // Attach session info
  (req as unknown as { sessionToken: string }).sessionToken = token;
  next();
}

// --- 1. Authentication Endpoints ---

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { password } = req.body;

  if (!password || typeof password !== 'string') {
    res.status(400).json({ error: 'Vui lòng cung cấp mật khẩu Chủ tịch.' });
    return;
  }

  const chairman = store.getChairman();
  const isValid = verifyPassword(password, chairman.passwordHash, chairman.salt);

  if (!isValid) {
    store.addAuditLog('Bảo mật', 'Đăng nhập thất bại', 'Cảnh báo: Sai mật khẩu tài khoản Chủ tịch.', 'alert');
    res.status(401).json({ error: 'Mật khẩu Chủ tịch không chính xác.' });
    return;
  }

  // Clean expired sessions
  const now = Date.now();
  chairman.activeSessions = chairman.activeSessions.filter((s) => s.expiresAt > now);

  // Generate 24-hour session token
  const token = generateSessionToken();
  const expiresAt = now + 24 * 60 * 60 * 1000;
  chairman.activeSessions.push({
    token,
    createdAt: new Date().toISOString(),
    expiresAt,
  });
  chairman.lastLoginAt = new Date().toISOString();

  store.save();
  store.addAuditLog('Chủ Tịch', 'Đăng nhập thành công', 'Chủ tịch đã đăng nhập vào hệ thống điều hành.', 'info');

  res.json({
    success: true,
    token,
    username: 'chairman',
    role: 'chairman',
    mustChangePassword: chairman.mustChangePassword,
    expiresAt,
  });
});

apiRouter.post('/auth/change-password', requireChairmanAuth, (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: 'Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới.' });
    return;
  }

  const chairman = store.getChairman();
  const isCurrentValid = verifyPassword(currentPassword, chairman.passwordHash, chairman.salt);

  if (!isCurrentValid) {
    res.status(400).json({ error: 'Mật khẩu hiện tại không đúng.' });
    return;
  }

  const validation = validatePasswordStrength(newPassword);
  if (!validation.valid) {
    res.status(400).json({ error: validation.reason });
    return;
  }

  const { hash, salt } = hashPassword(newPassword);
  chairman.passwordHash = hash;
  chairman.salt = salt;
  chairman.mustChangePassword = false;

  store.save();
  store.addAuditLog('Chủ Tịch', 'Đổi mật khẩu thành công', 'Mật khẩu tài khoản Chủ tịch đã được cập nhật an toàn.', 'success');

  res.json({
    success: true,
    message: 'Mật khẩu Chủ tịch đã được thay đổi thành công!',
  });
});

apiRouter.post('/auth/logout', requireChairmanAuth, (req: Request, res: Response) => {
  const token = (req as unknown as { sessionToken: string }).sessionToken;
  const chairman = store.getChairman();

  chairman.activeSessions = chairman.activeSessions.filter((s) => s.token !== token);
  store.save();
  store.addAuditLog('Chủ Tịch', 'Đăng xuất', 'Chủ tịch đã đăng xuất khỏi phiên làm việc.', 'info');

  res.json({ success: true, message: 'Đăng xuất thành công.' });
});

apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.json({ isAuthenticated: false });
    return;
  }

  const token = authHeader.substring(7);
  const chairman = store.getChairman();
  const now = Date.now();

  const validSession = chairman.activeSessions.find(
    (s) => s.token === token && s.expiresAt > now
  );

  if (!validSession) {
    res.json({ isAuthenticated: false });
    return;
  }

  res.json({
    isAuthenticated: true,
    user: {
      username: 'chairman',
      role: 'chairman',
      mustChangePassword: chairman.mustChangePassword,
      lastLoginAt: chairman.lastLoginAt,
    },
  });
});

// --- 2. Chairman Dashboard Overview & Telemetry ---

apiRouter.get('/chairman/overview', requireChairmanAuth, (req: Request, res: Response) => {
  const agents = store.getAgents();
  const tasks = store.getTasks();

  const totalAgents = agents.length;
  const activeAgents = agents.filter(
    (a) => a.status === 'working' || a.status === 'researching' || a.status === 'testing'
  ).length;
  const idleAgents = agents.filter((a) => a.status === 'idle').length;
  const errorAgents = agents.filter((a) => a.status === 'error').length;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const pendingApprovalTasks = tasks.filter(
    (t) => t.status === 'awaiting_approval' || (t.requiresApproval && t.approvalStatus === 'pending')
  );

  // Overall project progress percentage
  const totalProgressSum = tasks.reduce((acc, t) => acc + (t.progress || 0), 0);
  const overallProgressPercent = totalTasks > 0 ? Math.round(totalProgressSum / totalTasks) : 0;

  // Overdue check
  const today = new Date().toISOString().split('T')[0];
  const overdueTasks = tasks.filter((t) => t.status !== 'completed' && t.dueDate < today).length;

  res.json({
    totalAgents,
    activeAgents,
    idleAgents,
    errorAgents,
    totalTasks,
    completedTasks,
    inProgressTasks,
    overdueTasks,
    overallProgressPercent,
    pendingApprovalsCount: pendingApprovalTasks.length,
    pendingApprovals: pendingApprovalTasks,
  });
});

// --- 3. Tasks Management & Sub-tasks ---

apiRouter.get('/chairman/tasks', requireChairmanAuth, (req: Request, res: Response) => {
  res.json(store.getTasks());
});

apiRouter.post('/chairman/tasks', requireChairmanAuth, (req: Request, res: Response) => {
  const {
    title,
    description,
    departmentId,
    assignedAgentId,
    priority,
    dueDate,
    culturalTopic,
    subTasks,
    requiresApproval,
  } = req.body;

  if (!title || !departmentId || !assignedAgentId) {
    res.status(400).json({ error: 'Vui lòng cung cấp tiêu đề, phòng ban và nhân viên phụ trách.' });
    return;
  }

  const taskId = `TASK-HDV-${Date.now().toString().slice(-4)}`;
  const needsApproval = Boolean(requiresApproval || priority === 'critical');

  const newTask: Task = {
    id: taskId,
    title,
    description: description || 'Nhiệm vụ được giao từ Chủ tịch.',
    departmentId,
    assignedAgentId,
    status: needsApproval ? 'awaiting_approval' : 'in_progress',
    priority: priority || 'medium',
    progress: 0,
    dueDate: dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    culturalTopic: culturalTopic || 'Chung',
    subTasks: Array.isArray(subTasks)
      ? subTasks.map((st: { title: string }, i: number) => ({
          id: `st-${taskId}-${i + 1}`,
          title: st.title,
          completed: false,
        }))
      : [
          { id: `st-${taskId}-1`, title: 'Nghiên cứu & phân tích yêu cầu', completed: false },
          { id: `st-${taskId}-2`, title: 'Thực thi nội dung chuyên môn', completed: false },
          { id: `st-${taskId}-3`, title: 'Kiểm định & đánh giá kết quả', completed: false },
        ],
    requiresApproval: needsApproval,
    approvalStatus: needsApproval ? 'pending' : 'none',
    auditTrail: [
      {
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        actor: 'Chủ Tịch',
        action: 'Giao nhiệm vụ',
        details: `Chủ tịch đã khởi tạo nhiệm vụ và phân bổ cho Agent ${assignedAgentId}.`,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.addTask(newTask);

  // Update assigned agent status to working
  store.updateAgentStatus(assignedAgentId, 'working');

  res.status(201).json({
    success: true,
    task: newTask,
  });
});

apiRouter.patch('/chairman/tasks/:id', requireChairmanAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  const task = store.getTask(id);
  if (!task) {
    res.status(404).json({ error: 'Không tìm thấy nhiệm vụ.' });
    return;
  }

  // Add audit record
  const audit = task.auditTrail || [];
  if (updates.status && updates.status !== task.status) {
    audit.unshift({
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      actor: 'Chủ Tịch',
      action: 'Chuyển trạng thái',
      details: `Chuyển trạng thái từ ${task.status} sang ${updates.status}`,
    });
  }

  updates.auditTrail = audit;
  const updated = store.updateTask(id, updates);
  res.json({ success: true, task: updated });
});

// --- 4. Chairman Approval Gate ---

apiRouter.post('/chairman/tasks/:id/approve', requireChairmanAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { feedback } = req.body;

  const task = store.getTask(id);
  if (!task) {
    res.status(404).json({ error: 'Không tìm thấy nhiệm vụ.' });
    return;
  }

  const audit = task.auditTrail || [];
  audit.unshift({
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    actor: 'Chủ Tịch',
    action: 'Phê duyệt nhiệm vụ',
    details: feedback ? `Chủ tịch đã phê duyệt: "${feedback}"` : 'Chủ tịch đã phê duyệt kế hoạch.',
  });

  const updated = store.updateTask(id, {
    status: 'in_progress',
    approvalStatus: 'approved',
    approvalFeedback: feedback || 'Đã phê duyệt',
    auditTrail: audit,
  });

  store.addAuditLog('Chủ Tịch', 'Phê duyệt nhiệm vụ', `Đã phê duyệt nhiệm vụ ${task.title} (${task.id})`, 'success');
  res.json({ success: true, task: updated });
});

apiRouter.post('/chairman/tasks/:id/reject', requireChairmanAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;

  const task = store.getTask(id);
  if (!task) {
    res.status(404).json({ error: 'Không tìm thấy nhiệm vụ.' });
    return;
  }

  const audit = task.auditTrail || [];
  audit.unshift({
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    actor: 'Chủ Tịch',
    action: 'Từ chối nhiệm vụ',
    details: reason ? `Lý do từ chối: "${reason}"` : 'Chủ tịch từ chối và yêu cầu điều chỉnh.',
  });

  const updated = store.updateTask(id, {
    status: 'planned',
    approvalStatus: 'rejected',
    approvalFeedback: reason || 'Chủ tịch yêu cầu sửa đổi kế hoạch trước khi thực hiện.',
    auditTrail: audit,
  });

  store.addAuditLog('Chủ Tịch', 'Từ chối nhiệm vụ', `Từ chối nhiệm vụ ${task.title}. Lý do: ${reason || 'Yêu cầu sửa đổi'}`, 'warning');
  res.json({ success: true, task: updated });
});

apiRouter.post('/chairman/tasks/:id/retest', requireChairmanAuth, (req: Request, res: Response) => {
  const { id } = req.params;

  const task = store.getTask(id);
  if (!task) {
    res.status(404).json({ error: 'Không tìm thấy nhiệm vụ.' });
    return;
  }

  const audit = task.auditTrail || [];
  audit.unshift({
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    actor: 'Chủ Tịch',
    action: 'Yêu cầu kiểm thử lại',
    details: 'Chủ tịch yêu cầu phòng QA kiểm thử lại toàn bộ đầu ra.',
  });

  const updated = store.updateTask(id, {
    status: 'testing',
    auditTrail: audit,
  });

  res.json({ success: true, task: updated });
});

// --- 5. Model Management (Gemini API) ---

apiRouter.get('/chairman/models', requireChairmanAuth, (req: Request, res: Response) => {
  res.json({
    models: store.getModels(),
    supportedModels: SUPPORTED_MODELS,
  });
});

apiRouter.put('/chairman/models/:agentId', requireChairmanAuth, (req: Request, res: Response) => {
  const { agentId } = req.params;
  const { primaryModel, fallbackModel, maxOutputTokens, temperature } = req.body;

  const updated = store.updateModelConfig(agentId, {
    primaryModel,
    fallbackModel,
    maxOutputTokens: Number(maxOutputTokens) || 4096,
    temperature: Number(temperature) || 0.7,
  });

  if (!updated) {
    res.status(404).json({ error: 'Không tìm thấy cấu hình Model của Agent.' });
    return;
  }

  res.json({ success: true, config: updated });
});

apiRouter.post('/chairman/models/test-connection', requireChairmanAuth, async (req: Request, res: Response) => {
  const { modelId } = req.body;

  if (!modelId || typeof modelId !== 'string') {
    res.status(400).json({ error: 'Vui lòng cung cấp mã model.' });
    return;
  }

  const result = await testModelConnectivity(modelId);

  // If this test was for an agent, update their test status
  const { agentId } = req.body;
  if (agentId) {
    store.updateModelConfig(agentId, {
      status: result.success ? 'online' : 'error',
      lastLatencyMs: result.latencyMs,
      lastTestedAt: new Date().toISOString(),
    });
  }

  res.json(result);
});

// --- 6. Agents & Audit Logs ---

apiRouter.get('/chairman/agents', requireChairmanAuth, (req: Request, res: Response) => {
  res.json(store.getAgents());
});

apiRouter.patch('/chairman/agents/:id/status', requireChairmanAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const ok = store.updateAgentStatus(id, status);
  if (!ok) {
    res.status(404).json({ error: 'Không tìm thấy nhân viên AI.' });
    return;
  }

  res.json({ success: true });
});

apiRouter.get('/chairman/audit-logs', requireChairmanAuth, (req: Request, res: Response) => {
  res.json(store.getAuditLogs());
});
