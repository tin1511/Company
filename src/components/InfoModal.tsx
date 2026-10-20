import React from 'react';
import {
  X,
  Sparkles,
  Layers,
  Compass,
  Cpu,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full sm:max-w-2xl bg-slate-900 border border-slate-700/80 rounded-t-3xl sm:rounded-2xl shadow-2xl text-slate-100 overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-white font-black text-sm shrink-0">
              HĐV
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-100">
                HỒN ĐẤT VIỆT AI COMPANY
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400">Kiến trúc Hệ thống & Hướng dẫn Sử dụng</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 text-xs text-slate-300">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 sm:p-4 text-amber-200">
            <h3 className="font-bold text-xs sm:text-sm mb-1 text-amber-300">Mục Tiêu Sản Phẩm</h3>
            <p className="leading-relaxed">
              Xây dựng công ty ảo 3D độc lập để quản lý và vận hành đội ngũ 12 AI Agent phục vụ nghiên cứu, phát triển và kiểm thử toàn diện dự án <strong>Hồn Đất Việt</strong>. Ứng dụng hoạt động độc lập, không can thiệp hay thay đổi website hiện tại.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-100 text-xs sm:text-sm mb-2 flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              Cách Thao Tác Tương Tác 3D & Di Động
            </h4>
            <ul className="space-y-1.5 list-disc list-inside text-slate-400">
              <li><strong className="text-slate-200">Kéo chuột / Vuốt 1 ngón:</strong> Xoay góc nhìn 3D đa chiều quanh văn phòng.</li>
              <li><strong className="text-slate-200">Lăn chuột / Chụm 2 ngón / Nút (+)(-):</strong> Phóng to và thu nhỏ camera tiện lợi.</li>
              <li><strong className="text-slate-200">Chạm / Nhấp nhân vật AI:</strong> Xem hồ sơ chi tiết, nhiệm vụ, kỹ năng và điều khiển trạng thái.</li>
              <li><strong className="text-slate-200">Thanh điều hướng dưới:</strong> Chọn nhanh 7 phòng ban hoặc đưa camera về toàn cảnh.</li>
              <li><strong className="text-slate-200">Đổi trạng thái AI:</strong> Thử chuyển trạng thái nhân vật (làm việc, kiểm tra, nghiên cứu) và quan sát hoạt ảnh 3D thay đổi ngay lập tức.</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-100 text-sm mb-2 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              7 Khu Vực Văn Phòng 3D Chức Năng
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <strong className="text-white">1. Sảnh Khai Sáng:</strong> Tiếp nhận nhiệm vụ & Hologram Trống đồng.
              </div>
              <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <strong className="text-white">2. Thất Điều Hành:</strong> Phòng Giám đốc AI chiến lược.
              </div>
              <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <strong className="text-white">3. Viện Hàn Lâm Di Sản:</strong> Nghiên cứu Văn hóa, Lịch sử & Du lịch.
              </div>
              <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <strong className="text-white">4. Xưởng Công Nghệ & AI:</strong> Kỹ thuật lập trình & cụm Server AI.
              </div>
              <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <strong className="text-white">5. Viện Kiểm Định:</strong> Phòng kiểm thử QA & đối chiếu sử liệu.
              </div>
              <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <strong className="text-white">6. Hội Đồng Chiến Lược:</strong> Phòng họp nhóm tròn đa giác.
              </div>
              <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 col-span-1 sm:col-span-2">
                <strong className="text-white">7. Trung Tâm Giám Sát:</strong> Tường LED Kanban theo dõi tiến độ sprint.
              </div>
            </div>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-3.5 space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Sẵn Sàng Triển Khai Giai Đoạn 2</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Kiến trúc tách rời giao diện 3D, nhân vật, animation, dashboard và data models. Không yêu cầu bất kỳ API key nào để chạy ở Giai đoạn 1. Đã sẵn sàng bổ sung Node.js server và LLM Agent orchestration thực tế trong giai đoạn tiếp theo.
            </p>
          </div>
        </div>

        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors cursor-pointer"
          >
            Đã Hiểu & Tiếp Tục Trải Nghiệm
          </button>
        </div>
      </div>
    </div>
  );
};
