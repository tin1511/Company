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
  Bot,
  Layers,
  Info,
} from 'lucide-react';
import { AgentModelConfig } from '../types/index.ts';

interface SupportedModel {
  id: string;
  name: string;
  provider: 'Google Gemini' | 'OpenAI ChatGPT';
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
  const [providerFilter, setProviderFilter] = useState<'all' | 'OpenAI ChatGPT' | 'Google Gemini'>('all');
  const [activeTab, setActiveTab] = useState<'config' | 'catalog'>('config');

  const [testingModelId, setTestingModelId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    latencyMs: number;
    message: string;
    provider?: string;
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
        setModels(data.models || {});
        setSupportedModels(data.supportedModels || []);
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

  const getModelProvider = (modelId: string): 'ChatGPT' | 'Gemini' => {
    if (modelId.startsWith('gpt-') || modelId.startsWith('o3-') || modelId.startsWith('chatgpt')) {
      return 'ChatGPT';
    }
    return 'Gemini';
  };

  const openAiModels = supportedModels.filter((m) => m.provider === 'OpenAI ChatGPT');
  const geminiModels = supportedModels.filter((m) => m.provider === 'Google Gemini');

  const filteredCatalogModels = supportedModels.filter((m) => {
    if (providerFilter === 'all') return true;
    return m.provider === providerFilter;
  });

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 bg-black/80 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full sm:max-w-5xl bg-slate-900 border border-cyan-500/50 rounded-t-3xl sm:rounded-2xl shadow-2xl text-slate-100 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-800 bg-gradient-to-r from-emerald-950/40 via-cyan-950/30 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 text-cyan-300 border border-cyan-500/40 shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white">
                  Quản Trị Model AI (Google Gemini & OpenAI ChatGPT)
                </h2>
                <span className="text-[9px] sm:text-[10px] font-mono-code px-1.5 sm:px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold">
                  CHAIRMAN CONSOLE
                </span>
                <span className="text-[9px] sm:text-[10px] font-mono-code px-1.5 sm:px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold flex items-center gap-1">
                  <Bot className="w-2.5 h-2.5" />
                  MULTI-MODEL LLM
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 hidden xs:block">
                Tùy biến mô hình chính, fallback dự phòng giữa OpenAI ChatGPT và Google Gemini cho từng AI Agent
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

        {/* Tab Switcher */}
        <div className="px-4 sm:px-6 pt-3 pb-2 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('config')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'config'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Cấu Hình Từng Agent</span>
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'catalog'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Danh Mục Model ({supportedModels.length})</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              ChatGPT: {openAiModels.length}
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1 text-cyan-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              Gemini: {geminiModels.length}
            </span>
          </div>
        </div>

        {/* Content Body */}
        {activeTab === 'config' ? (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Left Column: AI Agent Selector */}
            <div className="space-y-2 border-b md:border-b-0 md:border-r border-slate-800 pb-4 md:pb-0 pr-0 md:pr-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Đội Ngũ AI Agent ({Object.keys(models).length})
                </h3>
              </div>

              <div className="space-y-1.5 max-h-[30vh] md:max-h-[58vh] overflow-y-auto pr-1">
                {Object.values(models).map((m) => {
                  const isSelected = m.agentId === selectedAgentId;
                  const provider = getModelProvider(m.primaryModel);
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
                          ? 'bg-slate-800 border border-cyan-400 text-white font-semibold shadow-md'
                          : 'bg-slate-800/40 hover:bg-slate-800 text-slate-300 border border-slate-700/50'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-bold text-slate-200 truncate">{m.agentName}</div>
                        <div className="text-[11px] text-slate-400 truncate">{m.role}</div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-mono-code font-bold uppercase ${
                              provider === 'ChatGPT'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            }`}
                          >
                            {provider}
                          </span>
                          <span className="text-[10px] font-mono-code text-slate-400 truncate">
                            {m.primaryModel}
                          </span>
                        </div>
                      </div>
                      {m.status === 'online' ? (
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" title="Đã kiểm tra kết nối OK"></span>
                      ) : (
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-600 shrink-0" title="Chưa kiểm tra"></span>
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
                  <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{currentConfig.agentName}</h4>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-md font-mono-code font-bold uppercase ${
                            getModelProvider(currentConfig.primaryModel) === 'ChatGPT'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          }`}
                        >
                          Đang Dùng {getModelProvider(currentConfig.primaryModel)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{currentConfig.role}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Độ trễ gần nhất:</span>
                      <span className="text-xs font-mono-code font-bold text-emerald-400">
                        {currentConfig.lastLatencyMs ? `${currentConfig.lastLatencyMs} ms` : 'Chưa đo'}
                      </span>
                    </div>
                  </div>

                  {saveSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                      <span>{saveSuccess}</span>
                    </div>
                  )}

                  {/* Primary Model Selector */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Mô Hình Chính (Primary Model)</span>
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
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400 font-mono-code"
                    >
                      <optgroup label="🤖 OpenAI ChatGPT Models">
                        {openAiModels.map((sm) => (
                          <option key={sm.id} value={sm.id}>
                            {sm.name} — {sm.category} ({sm.contextWindow})
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="⚡ Google Gemini Models">
                        {geminiModels.map((sm) => (
                          <option key={sm.id} value={sm.id}>
                            {sm.name} — {sm.category} ({sm.contextWindow})
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  {/* Fallback Model Selector */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-200 block">
                        Mô Hình Dự Phòng (Fallback Model khi sự cố / quá tải)
                      </label>
                      <button
                        type="button"
                        disabled={testingModelId === currentConfig.fallbackModel}
                        onClick={() => handleTestConnection(currentConfig.fallbackModel)}
                        className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3 h-3 ${testingModelId === currentConfig.fallbackModel ? 'animate-spin' : ''}`} />
                        <span>Test Fallback</span>
                      </button>
                    </div>

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
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400 font-mono-code"
                    >
                      <optgroup label="🤖 OpenAI ChatGPT Models">
                        {openAiModels.map((sm) => (
                          <option key={sm.id} value={sm.id}>
                            {sm.name}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="⚡ Google Gemini Models">
                        {geminiModels.map((sm) => (
                          <option key={sm.id} value={sm.id}>
                            {sm.name}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                    <p className="text-[11px] text-slate-500">
                      Tự động chuyển tiếp thông minh giữa OpenAI & Google khi model chính gặp timeout (&gt;5000ms) hoặc hết quota.
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
                          <span>
                            {testResult.success ? 'Kết Nối Thành Công' : 'Lỗi Kết Nối'}
                            {testResult.provider && ` [${testResult.provider}]`}
                          </span>
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
                            <span>
                              {h.model} (Bởi: {h.changedBy})
                            </span>
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
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-600/20 transition-all cursor-pointer disabled:opacity-50"
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
        ) : (
          /* Tab 2: Full Model Catalog & Comparison */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {/* Filter buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setProviderFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  providerFilter === 'all'
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                Tất Cả ({supportedModels.length})
              </button>
              <button
                onClick={() => setProviderFilter('OpenAI ChatGPT')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  providerFilter === 'OpenAI ChatGPT'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Bot className="w-3.5 h-3.5 text-emerald-400" />
                <span>OpenAI ChatGPT ({openAiModels.length})</span>
              </button>
              <button
                onClick={() => setProviderFilter('Google Gemini')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  providerFilter === 'Google Gemini'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Google Gemini ({geminiModels.length})</span>
              </button>
            </div>

            {/* Model Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredCatalogModels.map((m) => {
                const isChatGPT = m.provider === 'OpenAI ChatGPT';
                const isTesting = testingModelId === m.id;
                return (
                  <div
                    key={m.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isChatGPT
                        ? 'bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/50'
                        : 'bg-cyan-950/20 border-cyan-500/30 hover:border-cyan-500/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded font-mono-code font-bold uppercase ${
                              isChatGPT
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                            }`}
                          >
                            {m.provider}
                          </span>
                          <span className="text-[10px] font-mono-code text-slate-400">{m.category}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white mt-1">{m.name}</h4>
                        <div className="text-[11px] font-mono-code text-slate-400">ID: {m.id}</div>
                      </div>

                      <button
                        type="button"
                        disabled={isTesting}
                        onClick={() => handleTestConnection(m.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200 flex items-center gap-1 cursor-pointer border border-slate-700 disabled:opacity-50"
                        title="Kiểm tra kết nối và độ trễ model"
                      >
                        <RefreshCw className={`w-3 h-3 ${isTesting ? 'animate-spin' : ''}`} />
                        <span>Ping</span>
                      </button>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed mb-3">{m.description}</p>

                    <div className="space-y-1.5 text-[11px] pt-2 border-t border-slate-800">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Ngữ cảnh (Context Window):</span>
                        <span className="font-mono-code font-semibold text-white">{m.contextWindow}</span>
                      </div>
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-slate-400 shrink-0">Khuyến nghị cho:</span>
                        <span className="text-right text-slate-300">{m.recommendedFor}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
