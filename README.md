# HỒN ĐẤT VIỆT AI COMPANY — HỆ THỐNG QUẢN TRỊ CHỦ TỊCH

Hệ sinh thái công ty AI ảo 3D **Hồn Đất Việt AI Company**, trang bị hệ thống quản trị tối cao của Chủ tịch (Chairman), văn phòng 3D Penthouse Sky Suite riêng biệt, quy trình phân công nhiệm vụ có kiểm soát rủi ro và quản lý mô hình Google Gemini.

---

## 1. Yêu Cầu Môi Trường

- **Node.js**: Phiên bản `>= 20.x` (khuyến nghị Node.js 22 LTS).
- **Trình quản lý gói**: `npm` `>= 10.x` hoặc `pnpm` / `yarn`.
- **Trình duyệt**: Hỗ trợ WebGL 2.0 (Google Chrome, Firefox, Safari, Microsoft Edge).

---

## 2. Thông Tin Đăng Nhập & Bảo Mật Chủ Tịch

- **Vai trò**: Chairman / Chủ tịch (Quyền quản trị tối cao).
- **Mật khẩu khởi tạo**: Thiết lập qua biến môi trường server-side:
  ```env
  CHAIRMAN_INITIAL_PASSWORD="Chairman@2026Secure!"
  ```
- **Cơ chế bảo mật**:
  - Mật khẩu được băm bằng thuật toán **PBKDF2 (SHA-512)** với salt 32-byte ngẫu nhiên.
  - Tuyệt đối không lưu trữ plaintext trong frontend, log hay database.
  - Bắt buộc đổi mật khẩu mới trong lần đăng nhập đầu tiên.
  - Phiên làm việc (Session) hết hạn sau 24 giờ và có chức năng đăng xuất tức thì.
  - Toàn bộ API quản trị `/api/chairman/*` đều yêu cầu xác thực token máy chủ.

---

## 3. Hướng Dẫn Cài Đặt & Chạy Ứng Dụng

### Bước 1: Cài đặt Dependencies
```bash
npm install
```

### Bước 2: Chạy Môi Trường Phát Triển Full-Stack
```bash
npm run dev
```
Hệ thống Express backend kết hợp Vite middleware sẽ lắng nghe tại `http://localhost:3000`.

### Bước 3: Chạy Kiểm Thử Tự Động (Unit Tests)
```bash
npm run test
```
Kiểm thử 13/13 bài test bao gồm tính toàn vẹn 8 phòng ban, 12 AI Agent, quy trình phân rã nhiệm vụ và mã hóa bảo mật PBKDF2.

### Bước 4: Kiểm Tra Type-check & Linter
```bash
npm run lint
```

---

## 4. Các Tính Năng Nổi Bật Đã Nâng Cấp

1. **Hệ Thống Xác Thực Chủ Tịch**:
   - Đăng nhập an toàn, bắt buộc đổi mật khẩu lần đầu với công cụ đo độ mạnh mật khẩu.
   - Quản lý phiên làm việc, chống nâng quyền trái phép.
2. **Văn Phòng Chủ Tịch 3D (Sky Suite)**:
   - Tọa lạc trên tầng cao độc lập với sàn kính đen bóng và đường viền vàng ánh kim.
   - Bàn làm việc trung tâm bằng gỗ mun khảm vàng và cụm màn hình 3D hiển thị toàn bộ hoạt động công ty.
   - Đài quan sát kính 360 độ và khu vực họp trực tuyến với các trưởng phòng AI.
3. **Bảng Điều Hành Tối Cao (Chairman Dashboard)**:
   - Chỉ số thời gian thực từ dữ liệu bền vững máy chủ (`/server/data/store.json`).
   - Cổng phê duyệt rủi ro (Approval Gate): Phê duyệt hoặc Từ chối nhiệm vụ quan trọng chỉ với 1 thao tác.
4. **Phân Công Nhiệm Vụ Bằng Ngôn Ngữ Tự Nhiên**:
   - Giao việc trực tiếp cho từng AI Agent hoặc phòng ban.
   - Tự động chia nhỏ thành các sub-tasks.
   - Quy trình 6 trạng thái: *Chờ xử lý → Đã lập kế hoạch → Chờ phê duyệt → Đang thực hiện → Đang kiểm thử → Hoàn thành*.
5. **Quản Trị Model AI (Google Gemini)**:
   - Cấu hình model chính (`gemini-3.8-flash`, `gemini-3.1-flash-lite`, `gemini-4-argon`) và model dự phòng (fallback).
   - Công cụ kiểm tra kết nối (Probe/Ping) đo độ trễ thực tế mà không để lộ API key ra frontend.

---

## 5. Đóng Gói (Production Build) & Triển Khai Render

### Bước 1: Biên Dịch Bản Production
```bash
npm run build
```

### Bước 2: Chạy Server Production
```bash
npm start
```

### Triển Khai Trên Render:
1. Tạo dịch vụ **Web Service** trên [Render Dashboard](https://dashboard.render.com/).
2. Kết nối với GitHub Repository của bạn.
3. Cấu hình:
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Khai báo biến môi trường trong tab **Environment**:
   - `CHAIRMAN_INITIAL_PASSWORD`: Mật khẩu khởi tạo bảo mật do bạn chọn.
   - `GEMINI_API_KEY`: Khóa Gemini API của bạn (nếu có).

---

## 6. Bản Quyền

Dự án thuộc chương trình **Hồn Đất Việt**. Nghiêm cấm sao chép trái phép.
