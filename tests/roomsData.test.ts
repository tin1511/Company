import { describe, it, expect } from 'vitest';
import { ROOMS, DEPARTMENTS } from '../src/data/roomsData.ts';

describe('Office 3D Rooms & Chairman Suite Integrity', () => {
  it('should define all office areas including Chairman Sky Suite', () => {
    expect(ROOMS.length).toBeGreaterThanOrEqual(8);
    const roomIds = ROOMS.map((r) => r.id);
    expect(roomIds).toContain('chairman_suite');
    expect(roomIds).toContain('lobby');
    expect(roomIds).toContain('executive_office');
    expect(roomIds).toContain('culture_lab');
    expect(roomIds).toContain('engineering_lab');
    expect(roomIds).toContain('qa_center');
    expect(roomIds).toContain('meeting_room');
    expect(roomIds).toContain('observability_hub');
  });

  it('should have camera positions and targets for each room', () => {
    ROOMS.forEach((room) => {
      expect(room.cameraPosition.length).toBe(3);
      expect(room.cameraTarget.length).toBe(3);
      expect(room.name).toBeTruthy();
      expect(room.vietnameseName).toBeTruthy();
    });
  });

  it('should define the expanded departments structure', () => {
    expect(DEPARTMENTS.length).toBeGreaterThanOrEqual(8);
    const deptIds = DEPARTMENTS.map((d) => d.id);
    expect(deptIds).toContain('executive');
    expect(deptIds).toContain('culture_history');
    expect(deptIds).toContain('engineering');
    expect(deptIds).toContain('design_3d');
    expect(deptIds).toContain('data_knowledge');
    expect(deptIds).toContain('qa_testing');
    expect(deptIds).toContain('security');
    expect(deptIds).toContain('operations');
  });
});
