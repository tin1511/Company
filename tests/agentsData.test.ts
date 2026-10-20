import { describe, it, expect } from 'vitest';
import { INITIAL_AGENTS } from '../src/data/agentsData.ts';
import { ROOMS } from '../src/data/roomsData.ts';

describe('AI Agents Data Integrity', () => {
  it('should contain 12 distinct AI agents', () => {
    expect(INITIAL_AGENTS.length).toBe(12);
  });

  it('should have unique IDs for every agent', () => {
    const ids = INITIAL_AGENTS.map((a) => a.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(INITIAL_AGENTS.length);
  });

  it('should assign each agent to a valid existing room', () => {
    const validRoomIds = ROOMS.map((r) => r.id);
    INITIAL_AGENTS.forEach((agent) => {
      expect(validRoomIds).toContain(agent.roomId);
    });
  });

  it('should have 3D coordinates and valid initial statuses', () => {
    const validStatuses = ['idle', 'working', 'researching', 'meeting', 'testing', 'completed', 'error'];
    INITIAL_AGENTS.forEach((agent) => {
      expect(agent.position3D).toBeDefined();
      expect(agent.position3D.length).toBe(3);
      expect(validStatuses).toContain(agent.status);
      expect(agent.skills.length).toBeGreaterThan(0);
      expect(agent.modelType).toBeTruthy();
    });
  });
});
