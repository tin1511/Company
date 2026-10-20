import React, { useEffect, useState } from 'react';
import {
  X,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sliders,
  History,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { AgentModelConfig } from '../types/index.ts';

interface SupportedModel {
  id: string;
  name: string;
  description: string;
  category: string;
  contextWindow: string;
  recommendedFor: string;
}

interface ChairmanModelManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionToken: string;
}

export const ChairmanModelManagementModal: React.FC<ChairmanModelManagementModalProps> = ({
  isOpen,
  onClose,
  sessionToken,
}) => {
  const [models, setModels] = useState<Record<string, AgentModelConfig>>({});
  const [supportedModels, setSupportedModels] = useState<SupportedModel[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('agent-nguyen-hue');
  const [testingModelId, setTestingModelId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    latencyMs: number;
    message: string;
    error?: string;
  } | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const currentConfig = models[selectedAgentId];

  const fetchModelData = async () => {
    try {
      const res = await fetch('/api/chairman/models', {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setModels(data.models);
        setSupportedModels(data.supportedModels);
      }
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchModelData();
    }
  }, [isOpen]);

  const handleTestConnection = async (modelId: string) => {
    setTestingModelId(modelId);
    setTestResult(null);

    try {
      const res = await fetch('/api/chairman/models/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ modelId, agentId: selectedAgentId }),
      });
      const data = await res.json();
      setTestResult(data);
      fetchModelData();
    } catch (err: unknown) {
      setTestResult({
        success: false,
        latencyMs: 0,
        message: 'Lỗi kiểm tra kết nối mạng máy chủ.',
        error: String(err),
      });
    } finally {
      setTestingModelId(null);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentConfig) return;
    setIsSaving(true);
    setSaveSuccess(null);

    try {
      const res = await fetch(`/api/chairman/models/${selectedAgentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify(currentConfig),
      });

      if (res.ok) {
        setSaveSuccess(`Đã lưu cấu hình Model mới cho ${currentConfig.agentName}!`);
        fetchModelData();
      }
    } catch {
      // Ignore
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 bg-black/80 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full sm:max-w-4xl bg-slate-900 border border-cyan-500/50 rounded-t-3xl sm:rounded-2xl shadow-2xl text-slate-100 overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-800 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white">Quản Trị Model AI (Google Gemini)</h2>
                <span className="text-[9px] sm:text-[10px] font-mono-code px-1.5 sm:px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold">
                  CHAIRMAN CONSOLE
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 hidden xs:block">
                Cấu hình mô hình, thiết lập fallback dự phòng và đo lường độ trễ thời gian thực
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column: AI Agent Selector */}
          <div className="space-y-2 border-b md:border-b-0 md:border-r border-slate-800 pb-4 md:pb-0 pr-0 md:pr-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Danh Sách Nhân Viên AI ({Object.keys(models).length})
            </h3>
            <div className="space-y-1 max-h-[25vh] md:max-h-[55vh] overflow-y-auto">
              {Object.values(models).map((m) => {
                const isSelected = m.agentId === selectedAgentId;
                return (
                  <button
                    key={m.agentId}
                    onClick={() => {
                      setSelectedAgentId(m.agentId);
                      setTestResult(null);
                      setSaveSuccess(null);
                    }}
                    className={`w-full p-2.5 rounded-xl text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500/20 border border-cyan-500/50 text-white font-semibold'
                        : 'bg-slate-800/40 hover:bg-slate-800 text-slate-300 border border-slate-700/50'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-slate-200">{m.agentName}</div>
                      <div className="text-[11px] text-slate-400 truncate">{m.role}</div>
                      <div className="text-[10px] font-mono-code text-cyan-400 mt-0.5">
                        {m.primaryModel}
                      </div>
                    </div>
                    {m.status === 'online' ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-400" title="Đã kiểm tra kết nối OK"></span>
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-slate-500" title="Chưa kiểm tra"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Model Configurator & Testbench */}
          <div className="md:col-span-2 space-y-5">
            {currentConfig ? (
              <form onSubmit={handleSaveConfig} className="space-y-5">
                {/* Agent Header */}
                <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">{currentConfig.agentName}</h4>
                    <p className="text-xs text-slate-400">{currentConfig.role}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Độ trễ gần nhất:</span>
                    <span className="text-xs font-mono-code font-bold text-emerald-400">
                      {currentConfig.lastLatencyMs ? `${currentConfig.lastLatencyMs} ms` : 'Chưa đo'}
                    </span>
                  </div>
                </div>

                {saveSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300">
                    {saveSuccess}
                  </div>
                )}

                {/* Primary Model Selector */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-200">
                      Mô Hình Chính (Primary Model)
                    </label>
                    <button
                      type="button"
                      disabled={testingModelId === currentConfig.primaryModel}
                      onClick={() => handleTestConnection(currentConfig.primaryModel)}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3 h-3 ${testingModelId ? 'animate-spin' : ''}`} />
                      <span>Kiểm tra kết nối</span>
                    </button>
                  </div>

                  <select
                    value={currentConfig.primaryModel}
                    onChange={(e) =>
                      setModels({
                        ...models,
                        [selectedAgentId]: {
                          ...currentConfig,
                          primaryModel: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    {supportedModels.map((sm) => (
                      <option key={sm.id} value={sm.id}>
                        {sm.name} — {sm.category} ({sm.contextWindow})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Fallback Model Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200 block">
                    Mô Hình Dự Phòng (Fallback Model khi sự cố)
                  </label>
                  <select
                    value={currentConfig.fallbackModel}
                    onChange={(e) =>
                      setModels({
                        ...models,
                        [selectedAgentId]: {
                          ...currentConfig,
                          fallbackModel: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    {supportedModels.map((sm) => (
                      <option key={sm.id} value={sm.id}>
                        {sm.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500">
                    Tự động chuyển tiếp khi model chính vượt quota hoặc độ trễ &gt; 5000ms.
                  </p>
                </div>

                {/* Hyperparameters */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300">Giới hạn Tokens</span>
                      <span className="font-mono-code text-cyan-400">{currentConfig.maxOutputTokens}</span>
                    </div>
                    <input
                      type="range"
                      min={1024}
                      max={8192}
                      step={1024}
                      value={currentConfig.maxOutputTokens}
                      onChange={(e) =>
                        setModels({
                          ...models,
                          [selectedAgentId]: {
                            ...currentConfig,
                            maxOutputTokens: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full accent-cyan-500 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300">Nhiệt độ (Temperature)</span>
                      <span className="font-mono-code text-cyan-400">{currentConfig.temperature}</span>
                    </div>
                    <input
                      type="range"
                      min={0.1}
                      max={1.0}
                      step={0.1}
                      value={currentConfig.temperature}
                      onChange={(e) =>
                        setModels({
                          ...models,
                          [selectedAgentId]: {
                            ...currentConfig,
                            temperature: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full accent-cyan-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Test Result Feedback */}
                {testResult && (
                  <div
                    className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                      testResult.success
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200'
                        : 'bg-rose-500/10 border-rose-500/40 text-rose-200'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1.5">
                        {testResult.success ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-rose-400" />
                        )}
                        <span>{testResult.success ? 'Kết Nối Thành Công' : 'Lỗi Kết Nối'}</span>
                      </span>
                      <span className="font-mono-code text-[11px]">{testResult.latencyMs} ms</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">{testResult.message}</p>
                  </div>
                )}

                {/* History */}
                {currentConfig.history && currentConfig.history.length > 0 && (
                  <div className="space-y-1.5 border-t border-slate-800 pt-3">
                    <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5" />
                      Lịch Sử Thay Đổi Cấu Hình Model
                    </span>
                    <div className="space-y-1">
                      {currentConfig.history.slice(0, 3).map((h, i) => (
                        <div key={i} className="text-[11px] text-slate-400 flex justify-between">
                          <span>{h.model} (Bởi: {h.changedBy})</span>
                          <span className="font-mono-code text-slate-500">{h.timestamp.slice(0, 10)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-600/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? <span>Đang lưu...</span> : <span>Áp Dụng Cấu Hình Cho Agent</span>}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs">
                Vui lòng chọn một nhân viên AI ở danh sách bên trái.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
