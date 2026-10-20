import { describe, it, expect } from 'vitest';
import { INITIAL_TASKS } from '../src/data/tasksData.ts';
import { INITIAL_AGENTS } from '../src/data/agentsData.ts';
import { DEPARTMENTS } from '../src/data/roomsData.ts';
import { DepartmentInfo } from '../src/types/index.ts';

describe('Tasks Data Integrity', () => {
  it('should have non-empty tasks list', () => {
    expect(INITIAL_TASKS.length).toBeGreaterThanOrEqual(10);
  });

  it('should assign each task to a valid agent and department', () => {
    const agentIds = INITIAL_AGENTS.map((a) => a.id);
    const deptIds = DEPARTMENTS.map((d: DepartmentInfo) => d.id);

    INITIAL_TASKS.forEach((task) => {
      expect(agentIds).toContain(task.assignedAgentId);
      expect(deptIds).toContain(task.departmentId);
      expect(task.progress).toBeGreaterThanOrEqual(0);
      expect(task.progress).toBeLessThanOrEqual(100);
    });
  });
});
