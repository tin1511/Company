import * as THREE from 'three';

/**
 * Generates an authentic stylized Bronze Dong Son Drum texture using 2D Canvas
 */
export function createDongSonDrumTexture(size = 512): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Background bronze metal patina
  const grad = ctx.createRadialGradient(size / 2, size / 2, 10, size / 2, size / 2, size / 2);
  grad.addColorStop(0, '#d97706'); // Bright golden bronze
  grad.addColorStop(0.5, '#92400e'); // Warm bronze
  grad.addColorStop(0.85, '#78350f'); // Deep patina
  grad.addColorStop(1, '#451a03'); // Dark aged rim
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const cx = size / 2;
  const cy = size / 2;

  // Concentric geometric rings characteristic of Dong Son bronze drums
  ctx.strokeStyle = '#fef08a';
  ctx.fillStyle = '#fef08a';
  ctx.lineWidth = 2;

  // 1. Central 14-pointed sun star
  const rays = 14;
  const innerR = 12;
  const outerR = 48;
  ctx.beginPath();
  for (let i = 0; i < rays * 2; i++) {
    const angle = (i * Math.PI) / rays - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();

  // 2. Concentric patterned bands
  const radii = [60, 80, 110, 140, 175, 210, 238];
  radii.forEach((r, idx) => {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // Fill ring with motifs
    if (idx === 1) {
      // Sawtooth chevron band
      const count = 48;
      for (let j = 0; j < count; j++) {
        const a1 = (j * Math.PI * 2) / count;
        const a2 = ((j + 0.5) * Math.PI * 2) / count;
        const a3 = ((j + 1) * Math.PI * 2) / count;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a1) * 62, cy + Math.sin(a1) * 62);
        ctx.lineTo(cx + Math.cos(a2) * 78, cy + Math.sin(a2) * 78);
        ctx.lineTo(cx + Math.cos(a3) * 62, cy + Math.sin(a3) * 62);
        ctx.stroke();
      }
    } else if (idx === 3) {
      // Flying birds (Chim Lạc) silhouettes around ring
      const birds = 12;
      for (let b = 0; b < birds; b++) {
        const ang = (b * Math.PI * 2) / birds;
        const bx = cx + Math.cos(ang) * 125;
        const by = cy + Math.sin(ang) * 125;
        ctx.save();
        ctx.translate(bx, by);
        ctx.rotate(ang + Math.PI / 2);
        // Draw stylized long-beaked bird in flight
        ctx.beginPath();
        ctx.moveTo(-12, 0);
        ctx.quadraticCurveTo(0, -6, 14, 0); // body/beak
        ctx.quadraticCurveTo(0, 4, -12, 0);
        ctx.moveTo(-4, 0);
        ctx.lineTo(-8, -10); // wing
        ctx.stroke();
        ctx.restore();
      }
    } else if (idx === 5) {
      // Tangent concentric circle dots
      const dots = 36;
      for (let d = 0; d < dots; d++) {
        const da = (d * Math.PI * 2) / dots;
        const dx = cx + Math.cos(da) * 192;
        const dy = cy + Math.sin(da) * 192;
        ctx.beginPath();
        ctx.arc(dx, dy, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates modern architectural floor tile texture
 */
export function createFloorTileTexture(color1 = '#1e293b', color2 = '#0f172a', gridSize = 64): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = color1;
  ctx.fillRect(0, 0, 512, 512);

  // Grid seams
  ctx.strokeStyle = color2;
  ctx.lineWidth = 2;
  for (let x = 0; x <= 512; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }
  for (let y = 0; y <= 512; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  // Subtle cross accents at intersections
  ctx.fillStyle = '#38bdf8';
  for (let x = gridSize; x < 512; x += gridSize * 2) {
    for (let y = gridSize; y < 512; y += gridSize * 2) {
      ctx.fillRect(x - 2, y - 2, 4, 4);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates a code terminal texture for computer monitors
 */
export function createTerminalScreenTexture(title: string, lines: string[], accentColor = '#38bdf8'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 288;
  const ctx = canvas.getContext('2d')!;

  // Dark screen background
  ctx.fillStyle = '#050b14';
  ctx.fillRect(0, 0, 512, 288);

  // Top header bar
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 512, 32);

  // Window dots
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(16, 16, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#eab308';
  ctx.beginPath();
  ctx.arc(32, 16, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.arc(48, 16, 5, 0, Math.PI * 2);
  ctx.fill();

  // Title text
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 13px "JetBrains Mono", monospace';
  ctx.fillText(title, 68, 20);

  // Code lines
  ctx.font = '12px "JetBrains Mono", monospace';
  let y = 58;
  lines.forEach((line) => {
    if (line.startsWith('//') || line.startsWith('#')) {
      ctx.fillStyle = '#64748b';
    } else if (line.includes('SUCCESS') || line.includes('PASSED') || line.includes('READY')) {
      ctx.fillStyle = '#4ade80';
    } else if (line.includes('WARN') || line.includes('SYNC')) {
      ctx.fillStyle = '#facc15';
    } else if (line.includes('const') || line.includes('import') || line.includes('async')) {
      ctx.fillStyle = accentColor;
    } else {
      ctx.fillStyle = '#e2e8f0';
    }
    ctx.fillText(line, 20, y);
    y += 24;
  });

  // Scanline overlay
  ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
  for (let s = 0; s < 288; s += 4) {
    ctx.fillRect(0, s, 512, 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates Kanban dashboard screen texture for observability room
 */
export function createKanbanBoardTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Background
  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, 1024, 512);

  // Header
  ctx.fillStyle = '#1e1b4b';
  ctx.fillRect(0, 0, 1024, 60);

  ctx.fillStyle = '#c7d2fe';
  ctx.font = 'bold 22px "Be Vietnam Pro", sans-serif';
  ctx.fillText('HỒN ĐẤT VIỆT AI DASHBOARD — TIẾN ĐỘ SPRINT GIAI ĐOẠN 1', 28, 38);

  ctx.fillStyle = '#818cf8';
  ctx.font = '14px "JetBrains Mono", monospace';
  ctx.fillText('STATUS: ONLINE • 12 AI AGENTS ACTIVE • 100% HEALTHY', 680, 38);

  // Columns: [ĐANG NGHIÊN CỨU] [ĐANG LẬP TRÌNH] [KIỂM ĐỊNH QA] [HOÀN THÀNH]
  const cols = [
    { title: 'NGHIÊN CỨU DI SẢN (4)', color: '#06b6d4', x: 28, w: 226 },
    { title: 'KỸ THUẬT & 3D (3)', color: '#3b82f6', x: 274, w: 226 },
    { title: 'KIỂM ĐỊNH QA (3)', color: '#10b981', x: 520, w: 226 },
    { title: 'ĐÃ XÁC THỰC (2)', color: '#8b5cf6', x: 766, w: 226 },
  ];

  cols.forEach((col) => {
    // Column header
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(col.x, 76, col.w, 36);

    ctx.fillStyle = col.color;
    ctx.fillRect(col.x, 76, 4, 36);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 12px "Be Vietnam Pro", sans-serif';
    ctx.fillText(col.title, col.x + 14, 99);

    // Cards
    for (let c = 0; c < 3; c++) {
      const cardY = 124 + c * 116;
      ctx.fillStyle = '#111827';
      ctx.fillRect(col.x, cardY, col.w, 102);

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.strokeRect(col.x, cardY, col.w, 102);

      // Card badge
      ctx.fillStyle = col.color;
      ctx.fillRect(col.x + 10, cardY + 12, 40, 16);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.fillText(`HDV-${c + 1}`, col.x + 14, cardY + 24);

      // Card Title
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '12px "Be Vietnam Pro", sans-serif';
      const sampleTitles = [
        ['Số hóa 3D Điện Thái Hòa', 'Hoa văn 54 Dân tộc', 'Niên biểu thời Lý'],
        ['WebGL Shaders Tour', 'Thuật toán Định tuyến', 'Three.js 60FPS Optimization'],
        ['Kiểm định Đại Việt Sử Ký', 'Test phản hồi di động', 'Kiểm tra chuẩn mực'],
        ['Hệ thống CI/CD Render', 'Sảnh điều phối cổng tiếp nhận', 'Bảo mật dữ liệu'],
      ];
      ctx.fillText(sampleTitles[cols.indexOf(col)][c], col.x + 10, cardY + 48);

      // Progress bar
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(col.x + 10, cardY + 74, col.w - 20, 8);
      ctx.fillStyle = col.color;
      const progressPercent = Math.min(100, 45 + c * 25 + cols.indexOf(col) * 10);
      ctx.fillRect(col.x + 10, cardY + 74, ((col.w - 20) * progressPercent) / 100, 8);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText(`${progressPercent}%`, col.x + col.w - 38, cardY + 68);
    }
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates server rack LED blinking activity texture
 */
export function createServerRackTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0a0f1d';
  ctx.fillRect(0, 0, 256, 512);

  // Draw 8 server blades
  for (let b = 0; b < 8; b++) {
    const by = b * 64;
    ctx.fillStyle = '#11192d';
    ctx.fillRect(8, by + 4, 240, 56);
    ctx.strokeStyle = '#1e293b';
    ctx.strokeRect(8, by + 4, 240, 56);

    // Handle
    ctx.fillStyle = '#475569';
    ctx.fillRect(16, by + 22, 6, 20);
    ctx.fillRect(234, by + 22, 6, 20);

    // Vent grills
    ctx.fillStyle = '#050811';
    for (let g = 0; g < 18; g++) {
      ctx.fillRect(36 + g * 8, by + 16, 4, 32);
    }

    // LED indicators
    ctx.fillStyle = b % 2 === 0 ? '#22c55e' : '#38bdf8';
    ctx.fillRect(190, by + 20, 6, 6);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(200, by + 20, 6, 6);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(210, by + 20, 6, 6);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates a circular contact shadow texture
 */
export function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
  gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.35)');
  gradient.addColorStop(0.85, 'rgba(0, 0, 0, 0.08)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}
