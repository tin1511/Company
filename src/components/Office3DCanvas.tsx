import React, { useEffect, useRef } from 'react';
import { OfficeScene, OfficeSceneCallbacks } from '../office3d/OfficeScene.ts';
import { AIAgent } from '../types/index.ts';

interface Office3DCanvasProps {
  onAgentSelect: (agent: AIAgent) => void;
  onRoomSelect: (roomId: string) => void;
  onHoverAgentChange: (agentId: string | null) => void;
  sceneRef: React.MutableRefObject<OfficeScene | null>;
  isLiteMode: boolean;
}

export const Office3DCanvas: React.FC<Office3DCanvasProps> = ({
  onAgentSelect,
  onRoomSelect,
  onHoverAgentChange,
  sceneRef,
  isLiteMode,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const callbacks: OfficeSceneCallbacks = {
      onAgentSelect,
      onRoomSelect,
      onHoverAgentChange,
    };

    const scene = new OfficeScene(mountRef.current, callbacks, isLiteMode);
    sceneRef.current = scene;

    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
  }, [isLiteMode]); // recreate only if quality mode changes

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full overflow-hidden select-none bg-slate-950"
      style={{ touchAction: 'none' }}
    />
  );
};
