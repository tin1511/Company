import fs from 'node:fs';
import path from 'node:path';
import { hashPassword } from './auth.ts';
import { INITIAL_AGENTS } from '../src/data/agentsData.ts';
import { INITIAL_TASKS } from '../src/data/tasksData.ts';
import { INITIAL_ACTIVITY_LOGS } from '../src/data/activityLogsData.ts';
import { AIAgent, Task, AgentModelConfig, ActivityLog } from '../src/types/index.ts';

export interface ChairmanRecord {
  username: string;
  passwordHash: string;
  salt: string;
  mustChangePassword: boolean;
  lastLoginAt?: string;
  activeSessions: Array<{
    token: string;
    createdAt: string;
    expiresAt: number;
  }>;
}

export interface SystemStoreData {
  chairman: ChairmanRecord;
  agents: AIAgent[];
  tasks: Task[];
  models: Record<string, AgentModelConfig>;
  auditLogs: ActivityLog[];
  updatedAt: string;
}

const DATA_DIR = path.resolve(process.cwd(), 'server/data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

class StoreManager {
  private data: SystemStoreData;

  constructor() {
    this.ensureDirectoryExists();
    this.data = this.loadOrInitializeStore();
  }

  private ensureDirectoryExists() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadOrInitializeStore(): SystemStoreData {
    if (fs.existsSync(STORE_FILE)) {
      try {
        const raw = fs.readFileSync(STORE_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.chairman && parsed.tasks && parsed.agents) {
          return parsed;
        }
      } catch (err) {
        console.error('Error reading store.json, re-initializing...', err);
      }
    }

    // Initialize fresh store
    const initialPassword = process.env.CHAIRMAN_INITIAL_PASSWORD || 'tin1511';
    const { hash, salt } = hashPassword(initialPassword);

    const chairman: ChairmanRecord = {
      username: 'chairman',
      passwordHash: hash,
      salt: salt,
      mustChangePassword: false, // Ready for direct login
      activeSessions: [],
    };

    // Enhance initial tasks with subtasks and approval workflow
    const tasks: Task[] = INITIAL_TASKS.map((t, idx) => ({
      ...t,
      status: t.status,
      requiresApproval: t.priority === 'critical' || t.status === 'awaiting_approval' || idx % 3 === 0,
      approvalStatus: t.status === 'awaiting_approval' ? 'pending' : 'none',
      subTasks: [
        { id: `st-${t.id}-1`, title: 'Thu thập & đối chiếu dữ liệu', completed: t.progress > 30 },
        { id: `st-${t.id}-2`, title: 'Xây dựng mô phỏng & thuật toán', completed: t.progress > 70 },
        { id: `st-${t.id}-3`, title: 'Kiểm thử chuẩn mực & báo cáo', completed: t.progress === 100 },
      ],
      auditTrail: [
        {
          timestamp: '2026-10-19 17:25:00',
          actor: 'Hệ Thống',
          action: 'Khởi tạo nhiệm vụ',
          details: 'Nhiệm vụ được tạo và phân bổ cho nhân viên AI đảm nhiệm.',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    // Initialize Model Configurations for all 12 agents
    const models: Record<string, AgentModelConfig> = {};
    INITIAL_AGENTS.forEach((agent) => {
      models[agent.id] = {
        agentId: agent.id,
        agentName: agent.name,
        role: agent.role,
        departmentId: agent.departmentId,
        primaryModel: 'gemini-3.8-flash',
        fallbackModel: 'gemini-3.1-flash-lite',
        maxOutputTokens: 4096,
        temperature: 0.7,
        status: 'untested',
        history: [
          {
            timestamp: new Date().toISOString(),
            model: 'gemini-3.8-flash',
            changedBy: 'Hệ thống Khởi tạo',
          },
        ],
      };
    });

    const store: SystemStoreData = {
      chairman,
      agents: INITIAL_AGENTS,
      tasks,
      models,
      auditLogs: INITIAL_ACTIVITY_LOGS,
      updatedAt: new Date().toISOString(),
    };

    this.saveDataDirect(store);
    return store;
  }

  private saveDataDirect(data: SystemStoreData) {
    data.updatedAt = new Date().toISOString();
    const tempFile = `${STORE_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, STORE_FILE);
  }

  public save() {
    this.saveDataDirect(this.data);
  }

  public getChairman(): ChairmanRecord {
    return this.data.chairman;
  }

  public getAgents(): AIAgent[] {
    return this.data.agents;
  }

  public getAgent(id: string): AIAgent | undefined {
    return this.data.agents.find((a) => a.id === id);
  }

  public updateAgentStatus(agentId: string, status: AIAgent['status']): boolean {
    const agent = this.data.agents.find((a) => a.id === agentId);
    if (!agent) return false;
    agent.status = status;
    this.addAuditLog('Hệ thống AI', `Cập nhật trạng thái AI: ${agent.name}`, `Trạng thái mới: ${status}`, 'info');
    this.save();
    return true;
  }

  public getTasks(): Task[] {
    return this.data.tasks;
  }

  public getTask(id: string): Task | undefined {
    return this.data.tasks.find((t) => t.id === id);
  }

  public addTask(task: Task) {
    this.data.tasks.unshift(task);
    this.addAuditLog('Chủ Tịch', 'Tạo nhiệm vụ mới', `Nhiệm vụ: ${task.title} (${task.id})`, 'info');
    this.save();
  }

  public updateTask(id: string, updates: Partial<Task>): Task | null {
    const idx = this.data.tasks.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    const task = this.data.tasks[idx];
    const updated: Task = {
      ...task,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.data.tasks[idx] = updated;
    this.save();
    return updated;
  }

  public getModels(): Record<string, AgentModelConfig> {
    return this.data.models;
  }

  public updateModelConfig(agentId: string, configUpdates: Partial<AgentModelConfig>): AgentModelConfig | null {
    if (!this.data.models[agentId]) return null;
    const current = this.data.models[agentId];
    const history = current.history || [];

    if (configUpdates.primaryModel && configUpdates.primaryModel !== current.primaryModel) {
      history.unshift({
        timestamp: new Date().toISOString(),
        model: configUpdates.primaryModel,
        changedBy: 'Chủ Tịch',
      });
    }

    this.data.models[agentId] = {
      ...current,
      ...configUpdates,
      history,
    };
    this.addAuditLog('Chủ Tịch', `Cập nhật cấu hình Model cho ${current.agentName}`, `Model chính: ${configUpdates.primaryModel || current.primaryModel}`, 'success');
    this.save();
    return this.data.models[agentId];
  }

  public getAuditLogs(): ActivityLog[] {
    return this.data.auditLogs;
  }

  public addAuditLog(actor: string, action: string, details: string, type: ActivityLog['type'] = 'info') {
    const log: ActivityLog = {
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      agentId: 'system',
      agentName: actor,
      departmentId: 'executive',
      action,
      details,
      type,
    };
    this.data.auditLogs.unshift(log);
    if (this.data.auditLogs.length > 200) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 200);
    }
  }
}

export const store = new StoreManager();
