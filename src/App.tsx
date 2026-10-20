/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { OfficeScene } from './office3d/OfficeScene.ts';
import { Office3DCanvas } from './components/Office3DCanvas.tsx';
import { HeaderNav } from './components/HeaderNav.tsx';
import { ControlOverlay } from './components/ControlOverlay.tsx';
import { StatsDashboardModal } from './components/StatsDashboardModal.tsx';
import { AgentDetailModal } from './components/AgentDetailModal.tsx';
import { TaskDetailModal } from './components/TaskDetailModal.tsx';
import { AgentsListDrawer } from './components/AgentsListDrawer.tsx';
import { ActivityLogDrawer } from './components/ActivityLogDrawer.tsx';
import { InfoModal } from './components/InfoModal.tsx';
import { ChairmanLoginModal } from './components/ChairmanLoginModal.tsx';
import { ChairmanDashboardModal } from './components/ChairmanDashboardModal.tsx';
import { ChairmanTaskDispatchModal } from './components/ChairmanTaskDispatchModal.tsx';
import { ChairmanModelManagementModal } from './components/ChairmanModelManagementModal.tsx';
import { INITIAL_AGENTS } from './data/agentsData.ts';
import { INITIAL_TASKS } from './data/tasksData.ts';
import { INITIAL_ACTIVITY_LOGS } from './data/activityLogsData.ts';
import { AIAgent, AgentStatus, Task, ActivityLog, ChairmanUser } from './types/index.ts';
import { useAudio } from './hooks/useAudio.ts';

const SESSION_STORAGE_KEY = 'hdv_chairman_token';

export default function App() {
  const [agents, setAgents] = useState<AIAgent[]>(INITIAL_AGENTS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [logs, setLogs] = useState<ActivityLog[]>(INITIAL_ACTIVITY_LOGS);

  // Chairman Authentication state
  const [chairmanUser, setChairmanUser] = useState<ChairmanUser | null>(null);
  const [sessionToken, setSessionToken] = useState<string>('');
  const isChairmanLoggedIn = Boolean(chairmanUser && sessionToken);

  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [hoveredAgentId, setHoveredAgentId] = useState<string | null>(null);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);

  // Standard modals
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isAgentsDrawerOpen, setIsAgentsDrawerOpen] = useState(false);
  const [isLogsDrawerOpen, setIsLogsDrawerOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  // Chairman exclusive modals
  const [isChairmanLoginOpen, setIsChairmanLoginOpen] = useState(false);
  const [isChairmanDashboardOpen, setIsChairmanDashboardOpen] = useState(false);
  const [isTaskDispatchOpen, setIsTaskDispatchOpen] = useState(false);
  const [isModelManagementOpen, setIsModelManagementOpen] = useState(false);

  const [isNightMode, setIsNightMode] = useState(false);
  const [isLiteMode, setIsLiteMode] = useState(false);

  const sceneRef = useRef<OfficeScene | null>(null);
  const { isMuted, toggleMute, playClick, playFocusChime, playCameraReset } = useAudio();

  // Load session from storage and verify on mount
  useEffect(() => {
    const savedToken = localStorage.getItem(SESSION_STORAGE_KEY);
    if (savedToken) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${savedToken}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.isAuthenticated && data.user) {
            setChairmanUser(data.user);
            setSessionToken(savedToken);
          } else {
            localStorage.removeItem(SESSION_STORAGE_KEY);
          }
        })
        .catch(() => {
          // Fallback
        });
    }
  }, []);

  // Fetch updated tasks whenever Chairman logs in or performs updates
  const refreshTasksFromServer = useCallback(() => {
    if (!sessionToken) return;
    fetch('/api/chairman/tasks', {
      headers: { Authorization: `Bearer ${sessionToken}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data)) {
          setTasks(data);
        }
      })
      .catch(() => {});
  }, [sessionToken]);

  useEffect(() => {
    if (sessionToken) {
      refreshTasksFromServer();
    }
  }, [sessionToken, refreshTasksFromServer]);

  // Agent hover feedback
  const hoveredAgent = agents.find((a) => a.id === hoveredAgentId);

  // Camera Room Navigation
  const handleSelectRoom = useCallback(
    (roomId: string) => {
      setCurrentRoomId(roomId);
      sceneRef.current?.focusRoom(roomId);
      playFocusChime();
    },
    [playFocusChime]
  );

  // Camera Reset Overview
  const handleResetCamera = useCallback(() => {
    setCurrentRoomId(null);
    sceneRef.current?.resetCameraOverview();
    playCameraReset();
  }, [playCameraReset]);

  // Camera Zoom Controls (mobile single-tap)
  const handleZoomIn = useCallback(() => {
    sceneRef.current?.zoomIn();
    playClick();
  }, [playClick]);

  const handleZoomOut = useCallback(() => {
    sceneRef.current?.zoomOut();
    playClick();
  }, [playClick]);

  // Focus Chairman Sky Suite 3D
  const handleFocusChairmanSkySuite = useCallback(() => {
    handleSelectRoom('chairman_suite');
  }, [handleSelectRoom]);

  // Agent Selection
  const handleAgentSelect = useCallback(
    (agent: AIAgent) => {
      setSelectedAgent(agent);
      playClick();
    },
    [playClick]
  );

  // 3D Focus directly on an Agent
  const handleFocusAgent3D = useCallback(
    (agentId: string) => {
      sceneRef.current?.focusAgent(agentId);
      playFocusChime();
    },
    [playFocusChime]
  );

  // Update Agent Status (syncs React state, 3D animation, and backend)
  const handleUpdateStatus = useCallback(
    (agentId: string, status: AgentStatus) => {
      setAgents((prev) =>
        prev.map((a) => (a.id === agentId ? { ...a, status } : a))
      );
      if (selectedAgent && selectedAgent.id === agentId) {
        setSelectedAgent((prev) => (prev ? { ...prev, status } : null));
      }
      sceneRef.current?.updateAgentStatus(agentId, status);
      playClick();

      // Sync with server if logged in
      if (sessionToken) {
        fetch(`/api/chairman/agents/${agentId}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionToken}`,
          },
          body: JSON.stringify({ status }),
        }).catch(() => {});
      }

      // Add activity log
      const targetAgent = agents.find((a) => a.id === agentId);
      if (targetAgent) {
        const newLog: ActivityLog = {
          id: `LOG-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
          agentId,
          agentName: targetAgent.name,
          departmentId: targetAgent.departmentId,
          action: `Chuyển trạng thái: ${status}`,
          details: `Nhân viên AI ${targetAgent.name} đã được cập nhật chế độ làm việc.`,
          type: status === 'error' ? 'alert' : 'info',
        };
        setLogs((prev) => [newLog, ...prev]);
      }
    },
    [agents, selectedAgent, playClick, sessionToken]
  );

  // Chairman Authentication callbacks
  const handleLoginSuccess = (user: ChairmanUser, token: string) => {
    setChairmanUser(user);
    setSessionToken(token);
    localStorage.setItem(SESSION_STORAGE_KEY, token);
    playFocusChime();
  };

  const handleChairmanLogout = async () => {
    if (sessionToken) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${sessionToken}` },
        });
      } catch {
        // Ignore
      }
    }
    setChairmanUser(null);
    setSessionToken('');
    localStorage.removeItem(SESSION_STORAGE_KEY);
    playClick();
  };

  // Lighting Mode toggle
  const handleToggleNightMode = useCallback(() => {
    setIsNightMode((prev) => {
      const next = !prev;
      sceneRef.current?.setNightMode(next);
      return next;
    });
    playClick();
  }, [playClick]);

  // Performance Quality toggle
  const handleToggleLiteMode = useCallback(() => {
    setIsLiteMode((prev) => !prev);
    playClick();
  }, [playClick]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 3D WebGL Canvas Layer */}
      <Office3DCanvas
        onAgentSelect={handleAgentSelect}
        onRoomSelect={handleSelectRoom}
        onHoverAgentChange={setHoveredAgentId}
        sceneRef={sceneRef}
        isLiteMode={isLiteMode}
      />

      {/* Top Header Navigation */}
      <HeaderNav
        agents={agents}
        tasks={tasks}
        isNightMode={isNightMode}
        onToggleNightMode={handleToggleNightMode}
        isLiteMode={isLiteMode}
        onToggleLiteMode={handleToggleLiteMode}
        isMuted={isMuted}
        onToggleMute={toggleMute}
        onOpenDashboard={() => {
          setIsDashboardOpen(true);
          playClick();
        }}
        onOpenAgentsDrawer={() => {
          setIsAgentsDrawerOpen(true);
          playClick();
        }}
        onOpenLogsDrawer={() => {
          setIsLogsDrawerOpen(true);
          playClick();
        }}
        onOpenInfoModal={() => {
          setIsInfoModalOpen(true);
          playClick();
        }}
        isChairmanLoggedIn={isChairmanLoggedIn}
        onOpenChairmanLogin={() => {
          setIsChairmanLoginOpen(true);
          playClick();
        }}
        onOpenChairmanDashboard={() => {
          setIsChairmanDashboardOpen(true);
          playClick();
        }}
        onOpenTaskDispatch={() => {
          setIsTaskDispatchOpen(true);
          playClick();
        }}
        onOpenModelManagement={() => {
          setIsModelManagementOpen(true);
          playClick();
        }}
        onFocusChairmanSkySuite={handleFocusChairmanSkySuite}
        onChairmanLogout={handleChairmanLogout}
      />

      {/* Collapsible Ergonomic Bottom Dock (Three.js Skill standard) */}
      <ControlOverlay
        currentRoomId={currentRoomId}
        onSelectRoom={handleSelectRoom}
        onResetCamera={handleResetCamera}
        hoveredAgentName={hoveredAgent?.name || null}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
      />

      {/* Standard Modals and Drawers */}
      <StatsDashboardModal
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        agents={agents}
        tasks={tasks}
        logs={logs}
        onSelectAgent={(agent) => {
          setSelectedAgent(agent);
          setIsDashboardOpen(false);
          playClick();
        }}
        onSelectTask={(task) => {
          setSelectedTask(task);
          setIsDashboardOpen(false);
          playClick();
        }}
      />

      <AgentDetailModal
        agent={selectedAgent}
        onClose={() => setSelectedAgent(null)}
        onFocus3D={handleFocusAgent3D}
        onUpdateStatus={handleUpdateStatus}
        tasks={tasks}
        onSelectTask={(task) => {
          setSelectedTask(task);
          playClick();
        }}
      />

      <TaskDetailModal
        task={selectedTask}
        agents={agents}
        onClose={() => setSelectedTask(null)}
        onFocusAgent={handleFocusAgent3D}
      />

      <AgentsListDrawer
        isOpen={isAgentsDrawerOpen}
        onClose={() => setIsAgentsDrawerOpen(false)}
        agents={agents}
        onSelectAgent={(agent) => {
          setSelectedAgent(agent);
          playClick();
        }}
        onFocusAgent3D={handleFocusAgent3D}
      />

      <ActivityLogDrawer
        isOpen={isLogsDrawerOpen}
        onClose={() => setIsLogsDrawerOpen(false)}
        logs={logs}
      />

      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
      />

      {/* Chairman Exclusive Modals */}
      <ChairmanLoginModal
        isOpen={isChairmanLoginOpen}
        onClose={() => setIsChairmanLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <ChairmanDashboardModal
        isOpen={isChairmanDashboardOpen}
        onClose={() => setIsChairmanDashboardOpen(false)}
        sessionToken={sessionToken}
        onOpenTaskDispatch={() => setIsTaskDispatchOpen(true)}
        onOpenModelManagement={() => setIsModelManagementOpen(true)}
        onFocusChairmanSkySuite={handleFocusChairmanSkySuite}
        onLogout={handleChairmanLogout}
        onSelectTask={(task) => {
          setSelectedTask(task);
          setIsChairmanDashboardOpen(false);
          playClick();
        }}
      />

      <ChairmanTaskDispatchModal
        isOpen={isTaskDispatchOpen}
        onClose={() => setIsTaskDispatchOpen(false)}
        sessionToken={sessionToken}
        agents={agents}
        onTaskCreated={() => {
          refreshTasksFromServer();
          playFocusChime();
        }}
      />

      <ChairmanModelManagementModal
        isOpen={isModelManagementOpen}
        onClose={() => setIsModelManagementOpen(false)}
        sessionToken={sessionToken}
      />
    </div>
  );
}
