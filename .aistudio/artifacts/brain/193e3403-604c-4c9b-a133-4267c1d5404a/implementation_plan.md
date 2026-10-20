# Kế Hoạch Nâng Cấp Hệ Thống Chủ Tịch — Hồn Đất Việt AI Company

Bản thiết kế kiến trúc toàn diện nâng cấp công ty ảo Hồn Đất Việt AI Company thành một hệ sinh thái quản trị AI chuyên nghiệp, trang bị tài khoản Chủ tịch (Chairman) tối cao, văn phòng 3D VIP riêng biệt, cơ chế phân công nhiệm vụ và kiểm soát mô hình AI chặt chẽ.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> **Các quyết định kiến trúc đã được thống nhất:**
> - **Xác thực & Bảo mật Backend**: Sử dụng Express backend với thuật toán băm mật khẩu bảo mật một chiều (PBKDF2/SHA-256 có salt), phiên làm việc mã hóa an toàn qua token/cookie HttpOnly. Tuyệt đối không lưu mật khẩu dạng plaintext. Mật khẩu khởi tạo được cung cấp qua biến môi trường phía server (`CHAIRMAN_INITIAL_PASSWORD`), bắt buộc đổi mật khẩu ngay sau lần đăng nhập đầu tiên.
> - **Cơ sở dữ liệu bền vững**: Lưu trữ dữ liệu tác vụ, lịch sử kiểm toán, cấu hình model và phê duyệt trên đĩa máy chủ (`/server/data/store.json`), đảm bảo không mất dữ liệu khi tải lại trang web.
> - **Văn phòng 3D Chủ tịch**: Thiết kế tầng cao VIP riêng biệt (Executive Penthouse Suite) sang trọng và hiện đại với đài quan sát kính 360 độ hướng về toàn bộ văn phòng công ty, trang bị bàn làm việc Chủ tịch, màn hình giám sát thời gian thực, bảng phân rã nhiệm vụ và nút chuyển đổi góc nhìn mượt mà.
> - **Tầng tích hợp AI Model**: Sử dụng SDK `@google/genai` độc quyền ở phía backend để gọi Google Gemini API (`gemini-3.8-flash`, `gemini-3.1-flash-lite`, `gemini-4-argon`), ẩn hoàn toàn API key khỏi client, hỗ trợ kiểm tra kết nối (Ping/Probe) và thiết lập model dự phòng (fallback).

---

## 1. Overview & Core Concept

### Mục Tiêu Hệ Thống
Chuyển hóa nền tảng từ giao diện mô phỏng 3D sang một hệ thống quản trị công ty AI hoàn chỉnh:
- **Tài khoản Chủ tịch duy nhất**: Nắm quyền phủ quyết, duyệt chi, phân công tác vụ và điều phối 12 AI Agent.
- **Văn phòng Chủ tịch 3D độc quyền**: Không gian làm việc cao cấp, giao thoa giữa phong cách công nghệ cao và biểu tượng văn hóa dân tộc.
- **Quy trình nhiệm vụ 6 bước**: `Chờ xử lý (Pending)` → `Đã lập kế hoạch (Planned)` → `Chờ phê duyệt (Awaiting Approval)` → `Đang thực hiện (In Progress)` → `Đang kiểm thử (Testing)` → `Hoàn thành (Completed) / Thất bại (Failed)`.
- **Trung tâm quản trị Model AI**: Giám sát cấu hình model của từng AI, chuyển đổi linh hoạt, đo lường độ trễ và quản lý model dự phòng.

---

## 2. User Experience & Visual Design

### 2.1 Luồng Tương Tác Của Chủ Tịch (Key User Flows)

```
┌─────────────────┐       ┌──────────────────────┐       ┌──────────────────────┐
│  Đăng Nhập      │ ───>  │ Đổi Mật Khẩu         │ ───>  │ Văn Phòng 3D         │
│  Chủ Tịch       │       │ Lần Đầu (Bắt buộc)   │       │ Chủ Tịch (Penthouse) │
└─────────────────┘       └──────────────────────┘       └──────────┬───────────┘
                                                                    │
         ┌──────────────────────────────────────────────────────────┴─────────────────────────┐
         ▼                                  ▼                                                 ▼
┌───────────────────┐             ┌───────────────────┐                             ┌───────────────────┐
│ Bảng Điều Khiển   │             │ Phân Công &       │                             │ Quản Trị Model    │
│ Tổng Hợp          │             │ Phê Duyệt Task    │                             │ AI (Gemini)       │
└───────────────────┘             └───────────────────┘                             └───────────────────┘
```

1. **Đăng nhập & Xác thực**: Chủ tịch đăng nhập bằng mật khẩu khởi tạo an toàn. Nếu là lần đầu tiên, hệ thống chuyển hướng yêu cầu đổi mật khẩu mới (tối thiểu 8 ký tự, có chữ hoa, số và ký tự đặc biệt).
2. **Khám phá Văn phòng 3D Chủ tịch**:
   - Camera lướt qua sảnh chính, nâng dần độ cao và tiến vào căn phòng Penthouse kính sang trọng.
   - Bàn làm việc trung tâm bằng gỗ mun khảm viền vàng, ghế bọc da cao cấp, màn hình điều hành 3 màn hình cong 3D.
   - Bản đồ ma trận 8 phòng ban AI và vị trí làm việc của từng Agent.
3. **Giao nhiệm vụ bằng Ngôn ngữ Tự nhiên**:
   - Chủ tịch chọn nhân viên AI hoặc phòng ban phụ trách, nhập yêu cầu công việc.
   - Hệ thống tự động phân tích mục tiêu, gợi ý chia nhỏ sub-tasks, gán độ ưu tiên và thời hạn (deadline).
4. **Cơ chế Phê duyệt (Approval Gate)**:
   - Các nhiệm vụ ảnh hưởng đến dữ liệu sản xuất, bảo mật hoặc chi phí cao sẽ tự động chuyển sang trạng thái `Chờ phê duyệt`.
   - Chủ tịch có thể: **Phê duyệt**, **Từ chối (kèm lý do)**, hoặc **Yêu cầu kiểm thử lại**.
5. **Quản trị Model AI**:
   - Danh sách mô hình chính thức: `gemini-3.8-flash` (mặc định), `gemini-3.1-flash-lite` (tiết kiệm), `gemini-4-argon` (lý luận chuyên sâu).
   - Nút kiểm tra kết nối (Test Connection) đo độ trễ thực tế.

### 2.2 Bản Sắc Thiết Kế & Giao Diện
- **Màu sắc chủ đạo**: Nền tối cao cấp (`#0B0F19`), điểm nhấn Vàng Hoàng Gia (`#F59E0B`) tượng trưng cho quyền uy Chủ tịch, kết hợp Xanh Cyan Công Nghệ (`#06B6D4`) và Xanh Lục Bảo (`#10B981`) cho các trạng thái chuẩn mực.
- **Typography**: `Be Vietnam Pro` cho tiêu đề và nội dung chỉ đạo, `JetBrains Mono` kết hợp `tabular-nums` cho số liệu KPI, thời gian thực thi và mã định danh task.
- **Tiêu chuẩn Anti-AI Slop**: Không dùng các pill capsule trang trí tĩnh vô nghĩa; không dùng hiệu ứng nhấp nháy pulse gây rối mắt; hiển thị số liệu thực tế từ backend store; mọi nút bấm đều có handler xử lý hoàn chỉnh.

---

## 3. Key Product Decisions & Trade-Offs

- **Quyết định 1: Kiến trúc Full-Stack Express (`server.ts`) kết hợp Vite Middleware**:
  - *Lựa chọn*: Tích hợp backend Express trên cổng 3000, chạy cùng frontend Vite qua `server.ts`.
  - *Lý do*: Đáp ứng yêu cầu bảo mật tuyệt đối của Chủ tịch: xác thực session server-side, bảo vệ bí mật `GEMINI_API_KEY`, kiểm tra quyền hạn trước khi trả về dữ liệu.
  - *Giải pháp thay thế*: Chỉ chạy client-side SPA (Bị loại vì vi phạm yêu cầu không lưu mật khẩu và secrets ở frontend).

- **Quyết định 2: Tách biệt Văn phòng Chủ tịch 3D thành Zone VIP**:
  - *Lựa chọn*: Xây dựng khu vực Tầng Cao Chủ Tịch (Chairman Sky Suite) với tọa độ riêng biệt, liên kết mượt mà với 7 phòng ban hiện hữu thông qua cơ chế chuyển camera mượt mà (smooth damping).
  - *Lý do*: Giữ nguyên vẹn toàn bộ 7 phòng ban và 12 AI Agent đã hoàn thành ở Giai đoạn 1 mà không làm xáo trộn kết cấu cảnh quan 3D.

- **Quyết định 3: Lưu trữ dữ liệu bền vững chuẩn ACID nhẹ (File-backed Store)**:
  - *Lựa chọn*: Triển khai `StoreManager` phía máy chủ ghi nhận tức thì vào file JSON an toàn với atomic write.
  - *Lý do*: Không phụ thuộc vào cài đặt dịch vụ ngoài phức tạp trong giai đoạn này, đảm bảo 100% dữ liệu nhiệm vụ, model và tài khoản không bị mất khi reload hoặc deploy lại.

---

## 4. Technical Architecture & Data Strategy

### 4.1 Sơ Đồ Kiến Trúc Hệ Thống

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TRÌNH DUYỆT / CLIENT                            │
│                                                                        │
│  ┌───────────────────────┐  ┌───────────────────────────────────────┐  │
│  │   Văn Phòng 3D Three  │  │        Giao Diện Quản Trị Chủ Tịch    │  │
│  │   - 7 Phòng Ban Cũ    │  │  - Dashboard KPI Thực Tế              │  │
│  │   - Sky Suite Chủ Tịch│  │  - Task Dispatcher & Sub-tasks        │  │
│  │   - Hoạt ảnh Agent 3D │  │  - Model Management (Gemini)          │  │
│  └───────────┬───────────┘  │  - Cổng Phê Duyệt Rủi Ro (Gate)       │  │
│              │              └───────────────────┬───────────────────┘  │
└──────────────┼──────────────────────────────────┼──────────────────────┘
               │                                  │
         WebGL Render              REST APIs (Bearer/Session Token)
               │                                  │
┌──────────────▼──────────────────────────────────▼──────────────────────┐
│                    NODE.JS EXPRESS BACKEND (server.ts)                 │
│                                                                        │
│  ┌─────────────────────────┐      ┌─────────────────────────────────┐  │
│  │   Auth & Security       │      │   Chairman Task Engine          │  │
│  │   - PBKDF2 Password Hash│      │   - 6-State Workflow Machine    │  │
│  │   - Session Token Verif │      │   - Approval Gate Controller    │  │
│  │   - Role Guard (Chairman│      │   - Sub-task Splitter           │  │
│  └───────────┬─────────────┘      └────────────────┬────────────────┘  │
│              │                                     │                   │
│  ┌───────────▼─────────────┐      ┌────────────────▼────────────────┐  │
│  │   Gemini Model Manager  │      │   Persistent Storage Engine     │  │
│  │   - @google/genai SDK   │      │   - JSON File-Backed Store      │  │
│  │   - Model Probe & Ping  │      │   - Audit Logs & History        │  │
│  │   - Auto Fallback System│      │   - Atomic File Write           │  │
│  └───────────┬─────────────┘      └────────────────┬────────────────┘  │
└──────────────┼─────────────────────────────────────┼───────────────────┘
               │                                     │
      HTTPS (Server-only)                     Đĩa Lưu Trữ Máy Chủ
               │                                     │
┌──────────────▼─────────────┐             ┌─────────▼────────┐
│ Google Gemini AI APIs      │             │ /server/data/    │
│ (GEMINI_API_KEY ẩn an toàn)│             │ - store.json     │
└────────────────────────────┘             │ - audit.log      │
                                           └──────────────────┘
```

### 4.2 Cấu Trúc Dữ Liệu Thực Tế (Persistent Schemas)

1. **Tài Khoản Chủ Tịch (`ChairmanAccount`)**:
   - `username`: `"chairman"`
   - `passwordHash`: Chuỗi băm mật khẩu bằng PBKDF2 kèm salt ngẫu nhiên.
   - `salt`: Chuỗi salt bảo mật 32-byte.
   - `isInitialPassword`: Boolean (buộc đổi mật khẩu nếu `true`).
   - `lastLoginAt`: Thời điểm đăng nhập gần nhất.
   - `sessionTokens`: Danh sách token đang hoạt động kèm thời gian hết hạn (expiration).

2. **Cấu Hình Model AI Từng Nhân Viên (`AgentModelConfig`)**:
   - `agentId`: Mã nhân viên (ví dụ: `agent-nguyen-hue`).
   - `primaryModel`: Model chính (ví dụ: `gemini-3.8-flash`).
   - `fallbackModel`: Model dự phòng khi gặp sự cố (ví dụ: `gemini-3.1-flash-lite`).
   - `maxOutputTokens`: Giới hạn token đầu ra.
   - `temperature`: Độ sáng tạo mô hình.
   - `lastTestedStatus`: `online` | `error` | `untested`.
   - `lastLatencyMs`: Độ trễ kiểm tra kết nối thực tế.

3. **Nhiệm Vụ Có Phê Duyệt (`EnhancedTask`)**:
   - `id`: Mã định danh nhiệm vụ (`TASK-HDV-xxx`).
   - `title`: Tên nhiệm vụ.
   - `description`: Yêu cầu chi tiết từ Chủ tịch.
   - `assignedAgentId`: AI Agent phụ trách.
   - `departmentId`: Phòng ban phụ trách.
   - `priority`: `critical` | `high` | `medium` | `low`.
   - `status`: `pending` → `planned` → `awaiting_approval` → `in_progress` → `testing` → `completed` | `failed`.
   - `subTasks`: Danh sách các đầu việc nhỏ đã chia.
   - `requiresApproval`: Boolean (nhiệm vụ có yếu tố rủi ro cao).
   - `approvalStatus`: `none` | `pending` | `approved` | `rejected`.
   - `approvalFeedback`: Lý do từ chối hoặc chỉ đạo sửa đổi của Chủ tịch.
   - `progress`: 0 - 100%.
   - `auditTrail`: Lịch sử thay đổi từng mốc thời gian.

---

## 5. Các Giai Đoạn Triển Khai Chi Tiết

### Giai đoạn 1: Thiết lập Backend Server & Xác thực Chủ Tịch
- Khởi tạo `server.ts` tích hợp Express, cấu hình middleware xác thực Chủ tịch, băm mật khẩu PBKDF2 và quản lý phiên an toàn.
- Cấu hình biến môi trường `CHAIRMAN_INITIAL_PASSWORD` trong `.env.example` và thiết lập quy trình bắt buộc đổi mật khẩu.
- Xây dựng tầng lưu trữ bền vững `/server/data/store.json`.

### Giai đoạn 2: Xây dựng Văn Phòng Chủ Tịch 3D (Sky Suite)
- Mở rộng Three.js Scene: Thêm khu vực Tầng Cao VIP trên cao với sàn kính phản chiếu, bàn làm việc gỗ mun sang trọng của Chủ tịch, ghế bọc da và cụm màn hình hiển thị toàn bộ chỉ số công ty.
- Hoạt ảnh chuyển cảnh camera mượt mà giữa các phòng ban phía dưới và phòng Chủ tịch.
- Đảm bảo tương thích hoàn hảo trên điện thoại di động và máy tính qua chế độ Lite mode.

### Giai đoạn 3: Bảng Điều Khiển Chủ Tịch & Hệ Thống Phê Duyệt
- Dashboard thời gian thực: Hiển thị các tác vụ cần phê duyệt gấp, tiến độ dự án tổng thể, tỷ lệ phân bổ công việc.
- Modal giao việc bằng ngôn ngữ tự nhiên: Tự động phân rã sub-tasks, thiết lập deadline và gắn cờ phê duyệt.
- Cơ chế phê duyệt một chạm: Phê duyệt, Từ chối kèm ghi chú, hoặc Yêu cầu kiểm định lại.

### Giai đoạn 4: Trang Quản Lý & Kiểm Tra Model AI (Gemini)
- Giao diện cấu hình Model Management: Xem và thay đổi model cho từng AI Agent.
- API backend kiểm tra kết nối (Probe/Ping) model Gemini với `@google/genai`, bảo vệ API key tuyệt đối.
- Cơ chế fallback dự phòng tự động.

### Giai đoạn 5: Kiểm Thử Toàn Diện & Đóng Gói
- Kiểm thử unit test cho quy trình xác thực, đổi mật khẩu và phân quyền backend.
- Kiểm thử luồng phê duyệt nhiệm vụ và thay đổi trạng thái AI Agent.
- Chạy TypeScript type-check, linter và production build đảm bảo không có lỗi.
