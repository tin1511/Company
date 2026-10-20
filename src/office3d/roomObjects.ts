import * as THREE from 'three';
import { OfficeMaterialManager } from './materials.ts';
import {
  createDongSonDrumTexture,
  createTerminalScreenTexture,
  createServerRackTexture,
  createKanbanBoardTexture,
} from '../utils/proceduralTextures.ts';

/**
 * Creates a modern ergonomic workstation desk with dual curved monitors
 */
export function createWorkstationDesk(
  materials: OfficeMaterialManager,
  title: string,
  codeLines: string[],
  accentColor = '#38bdf8'
): THREE.Group {
  const group = new THREE.Group();

  // 1. Desk Top (Dark walnut / carbon composite)
  const topGeo = new THREE.BoxGeometry(2.4, 0.08, 1.1);
  const deskTop = new THREE.Mesh(topGeo, materials.darkWoodMat);
  deskTop.position.y = 0.76;
  group.add(deskTop);

  // 2. Sturdy Metal Frame & Legs (4 legs + horizontal crossbar)
  const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.72, 8);
  const legPositions: [number, number][] = [
    [-1.08, -0.44],
    [-1.08, 0.44],
    [1.08, -0.44],
    [1.08, 0.44],
  ];
  legPositions.forEach(([x, z]) => {
    const leg = new THREE.Mesh(legGeo, materials.metalBlackMat);
    leg.position.set(x, 0.36, z);
    group.add(leg);
  });

  // Crossbar
  const barGeo = new THREE.BoxGeometry(2.1, 0.04, 0.04);
  const bar = new THREE.Mesh(barGeo, materials.metalBlackMat);
  bar.position.set(0, 0.25, -0.44);
  group.add(bar);

  // 3. Ergonomic Office Chair
  const chair = createOfficeChair(materials);
  chair.position.set(0, 0, 0.6);
  chair.rotation.y = Math.PI;
  group.add(chair);

  // 4. Primary Screen (Terminal / Code / Data)
  const monitorStandGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.35, 8);
  const monitorStand = new THREE.Mesh(monitorStandGeo, materials.metalBlackMat);
  monitorStand.position.set(-0.35, 0.95, -0.25);
  group.add(monitorStand);

  const screenTex1 = createTerminalScreenTexture(title, codeLines, accentColor);
  const screenMat1 = new THREE.MeshBasicMaterial({ map: screenTex1 });
  const screenGeo1 = new THREE.PlaneGeometry(0.75, 0.42);
  const screen1 = new THREE.Mesh(screenGeo1, screenMat1);
  screen1.position.set(-0.35, 1.12, -0.22);
  screen1.rotation.y = 0.15;
  group.add(screen1);

  // Frame for Screen 1
  const frameGeo1 = new THREE.BoxGeometry(0.78, 0.45, 0.03);
  const frame1 = new THREE.Mesh(frameGeo1, materials.metalBlackMat);
  frame1.position.set(-0.35, 1.12, -0.235);
  frame1.rotation.y = 0.15;
  group.add(frame1);

  // 5. Secondary Screen (Telemetry / Status)
  const monitorStand2 = new THREE.Mesh(monitorStandGeo, materials.metalBlackMat);
  monitorStand2.position.set(0.38, 0.95, -0.25);
  group.add(monitorStand2);

  const screenTex2 = createTerminalScreenTexture(
    'SYSTEM TELEMETRY',
    ['# AI Agent: Active', 'Memory: 64GB HBM3', 'FPS: 60 (Rock-solid)', 'Status: OPERATIONAL', 'Latency: 1.2ms', 'Task: SYNCHRONIZED'],
    accentColor
  );
  const screenMat2 = new THREE.MeshBasicMaterial({ map: screenTex2 });
  const screen2 = new THREE.Mesh(screenGeo1, screenMat2);
  screen2.position.set(0.38, 1.12, -0.22);
  screen2.rotation.y = -0.15;
  group.add(screen2);

  const frame2 = new THREE.Mesh(frameGeo1, materials.metalBlackMat);
  frame2.position.set(0.38, 1.12, -0.235);
  frame2.rotation.y = -0.15;
  group.add(frame2);

  // 6. Keyboard & Mousepad
  const kbGeo = new THREE.BoxGeometry(0.45, 0.015, 0.16);
  const kbMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 });
  const kb = new THREE.Mesh(kbGeo, kbMat);
  kb.position.set(0, 0.81, 0.12);
  group.add(kb);

  // 7. Subtle Under-desk LED strip
  const stripGeo = new THREE.BoxGeometry(2.3, 0.02, 0.02);
  const stripMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(accentColor) });
  const strip = new THREE.Mesh(stripGeo, stripMat);
  strip.position.set(0, 0.72, 0.5);
  group.add(strip);

  return group;
}

/**
 * Creates an office chair (Base, caster hub, pneumatic stem, seat cushion, backrest)
 */
export function createOfficeChair(materials: OfficeMaterialManager): THREE.Group {
  const chair = new THREE.Group();

  // Caster star base
  const starGeo = new THREE.CylinderGeometry(0.3, 0.35, 0.05, 5);
  const star = new THREE.Mesh(starGeo, materials.metalBlackMat);
  star.position.y = 0.06;
  chair.add(star);

  // Stem
  const stemGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.35, 8);
  const stem = new THREE.Mesh(stemGeo, materials.metalChromeMat);
  stem.position.y = 0.24;
  chair.add(stem);

  // Cushion
  const seatGeo = new THREE.BoxGeometry(0.5, 0.08, 0.5);
  const seatMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
  const seat = new THREE.Mesh(seatGeo, seatMat);
  seat.position.y = 0.44;
  chair.add(seat);

  // Backrest
  const backGeo = new THREE.BoxGeometry(0.48, 0.55, 0.06);
  const back = new THREE.Mesh(backGeo, seatMat);
  back.position.set(0, 0.72, -0.22);
  back.rotation.x = -0.08;
  chair.add(back);

  return chair;
}

/**
 * Creates the central Dong Son Hologram Monument in the Lobby
 */
export function createDongSonPedestalMonument(materials: OfficeMaterialManager): {
  group: THREE.Group;
  hologramRings: THREE.Group;
  drumDisc: THREE.Mesh;
} {
  const group = new THREE.Group();

  // 1. Multi-tier Octagonal Bronze Base
  const base1Geo = new THREE.CylinderGeometry(2.6, 2.9, 0.2, 8);
  const base1 = new THREE.Mesh(base1Geo, materials.bronzeMat);
  base1.position.y = 0.1;
  group.add(base1);

  const base2Geo = new THREE.CylinderGeometry(2.1, 2.4, 0.25, 8);
  const base2 = new THREE.Mesh(base2Geo, materials.metalBlackMat);
  base2.position.y = 0.32;
  group.add(base2);

  // 2. Drum Body (stylized bronze drum waist)
  const drumWaistGeo = new THREE.CylinderGeometry(1.6, 1.4, 0.5, 32);
  const drumWaist = new THREE.Mesh(drumWaistGeo, materials.bronzeMat);
  drumWaist.position.y = 0.7;
  group.add(drumWaist);

  // 3. Dong Son Drum Face Disc (with procedural Canvas texture)
  const drumTexture = createDongSonDrumTexture(512);
  const drumMat = new THREE.MeshStandardMaterial({
    map: drumTexture,
    metalness: 0.85,
    roughness: 0.3,
  });
  const drumGeo = new THREE.CylinderGeometry(1.7, 1.7, 0.06, 32);
  const drumDisc = new THREE.Mesh(drumGeo, drumMat);
  drumDisc.position.y = 0.98;
  group.add(drumDisc);

  // 4. Floating Holographic Rings & Lotus Core
  const hologramRings = new THREE.Group();
  hologramRings.position.set(0, 1.8, 0);

  // Outer gold ring
  const ring1Geo = new THREE.TorusGeometry(1.2, 0.02, 16, 64);
  const ring1Mat = new THREE.MeshBasicMaterial({
    color: 0xf59e0b,
    transparent: true,
    opacity: 0.8,
  });
  const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
  ring1.rotation.x = Math.PI / 2;
  hologramRings.add(ring1);

  // Inner cyan ring tilted
  const ring2Geo = new THREE.TorusGeometry(0.85, 0.02, 16, 48);
  const ring2Mat = new THREE.MeshBasicMaterial({
    color: 0x06b6d4,
    transparent: true,
    opacity: 0.8,
  });
  const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
  ring2.rotation.x = Math.PI / 3;
  hologramRings.add(ring2);

  // Central floating glowing star core (representing the Dong Son 14-pointed sun)
  const coreGeo = new THREE.OctahedronGeometry(0.28, 0);
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0xfef08a,
    transparent: true,
    opacity: 0.9,
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  hologramRings.add(core);

  // Vertical holographic light column
  const beamGeo = new THREE.CylinderGeometry(0.9, 1.3, 2.5, 32, 1, true);
  const beamMat = new THREE.MeshBasicMaterial({
    color: 0xf59e0b,
    transparent: true,
    opacity: 0.15,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const beam = new THREE.Mesh(beamGeo, beamMat);
  beam.position.y = 1.3;
  group.add(beam);

  group.add(hologramRings);

  return { group, hologramRings, drumDisc };
}

/**
 * Creates executive desk for AI CEO (Phòng Giám đốc)
 */
export function createExecutiveDesk(materials: OfficeMaterialManager): THREE.Group {
  const group = new THREE.Group();

  // Curved executive desk
  const deskGeo = new THREE.CylinderGeometry(2.6, 2.6, 0.09, 32, 1, false, 0, Math.PI);
  const deskTop = new THREE.Mesh(deskGeo, materials.executiveWoodMat);
  deskTop.rotation.y = -Math.PI / 2;
  deskTop.position.set(0, 0.78, 0.4);
  group.add(deskTop);

  // Heavy wood pedestals on left and right
  const pedGeo = new THREE.BoxGeometry(0.5, 0.74, 0.8);
  const pedLeft = new THREE.Mesh(pedGeo, materials.executiveWoodMat);
  pedLeft.position.set(-1.1, 0.37, 0.2);
  const pedRight = new THREE.Mesh(pedGeo, materials.executiveWoodMat);
  pedRight.position.set(1.1, 0.37, 0.2);
  group.add(pedLeft, pedRight);

  // Executive Chair
  const chair = createOfficeChair(materials);
  chair.position.set(0, 0, -0.2);
  group.add(chair);

  // Curved Ultra-wide Monitor on desk
  const uwScreenTex = createTerminalScreenTexture(
    'EXECUTIVE KPI & STRATEGY CENTER',
    [
      '>> HỒN ĐẤT VIỆT ECOSYSTEM: STABLE',
      '>> AI Agents: 12 Active Nodes',
      '>> Mission: Bảo tồn & Phát huy Di sản',
      '>> Q4 Goal: WebVR Heritage Showcase',
      '>> Status: OK (All Systems Green)',
    ],
    '#f59e0b'
  );
  const uwScreenMat = new THREE.MeshBasicMaterial({ map: uwScreenTex });
  const uwGeo = new THREE.PlaneGeometry(1.2, 0.45);
  const uwScreen = new THREE.Mesh(uwGeo, uwScreenMat);
  uwScreen.position.set(0, 1.15, 0.55);
  uwScreen.rotation.y = Math.PI;
  group.add(uwScreen);

  // Small Vietnamese flag ornament on golden pedestal
  const flagPedGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.03, 16);
  const flagPed = new THREE.Mesh(flagPedGeo, materials.goldMat);
  flagPed.position.set(0.85, 0.84, 0.4);
  group.add(flagPed);

  const flagPoleGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.35, 8);
  const flagPole = new THREE.Mesh(flagPoleGeo, materials.goldMat);
  flagPole.position.set(0.85, 1.01, 0.4);
  group.add(flagPole);

  const flagBannerGeo = new THREE.PlaneGeometry(0.18, 0.12);
  const flagBannerMat = new THREE.MeshBasicMaterial({
    color: 0xef4444, // Red
    side: THREE.DoubleSide,
  });
  const flagBanner = new THREE.Mesh(flagBannerGeo, flagBannerMat);
  flagBanner.position.set(0.94, 1.1, 0.4);
  group.add(flagBanner);

  return group;
}

/**
 * Creates AI High-Performance Server Cluster for Engineering Lab
 */
export function createServerCluster(materials: OfficeMaterialManager): THREE.Group {
  const group = new THREE.Group();
  const rackTex = createServerRackTexture();
  const rackFrontMat = new THREE.MeshBasicMaterial({ map: rackTex });

  for (let r = 0; r < 4; r++) {
    const rackGroup = new THREE.Group();
    rackGroup.position.set(r * 1.0 - 1.5, 0, 0);

    // Frame
    const bodyGeo = new THREE.BoxGeometry(0.85, 2.4, 0.95);
    const body = new THREE.Mesh(bodyGeo, materials.metalBlackMat);
    body.position.y = 1.2;
    rackGroup.add(body);

    // Front blinking panel
    const frontGeo = new THREE.PlaneGeometry(0.78, 2.3);
    const front = new THREE.Mesh(frontGeo, rackFrontMat);
    front.position.set(0, 1.2, 0.48);
    rackGroup.add(front);

    // Top exhaust vent
    const ventGeo = new THREE.BoxGeometry(0.7, 0.08, 0.8);
    const vent = new THREE.Mesh(ventGeo, materials.darkWoodMat);
    vent.position.set(0, 2.44, 0);
    rackGroup.add(vent);

    // Cable conduit connecting on top
    const cableGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.0, 8);
    const cable = new THREE.Mesh(cableGeo, materials.metalChromeMat);
    cable.rotation.z = Math.PI / 2;
    cable.position.set(0, 2.48, 0);
    rackGroup.add(cable);

    group.add(rackGroup);
  }

  return group;
}

/**
 * Creates Conference Round Table for AI Meeting Room
 */
export function createConferenceTable(materials: OfficeMaterialManager): THREE.Group {
  const group = new THREE.Group();

  // Large Oval/Round Conference Table
  const tableGeo = new THREE.CylinderGeometry(2.4, 2.4, 0.08, 32);
  const table = new THREE.Mesh(tableGeo, materials.darkWoodMat);
  table.position.y = 0.76;
  group.add(table);

  // Chrome pedestal column
  const colGeo = new THREE.CylinderGeometry(0.4, 0.6, 0.72, 24);
  const col = new THREE.Mesh(colGeo, materials.metalChromeMat);
  col.position.y = 0.36;
  group.add(col);

  // Center glass inlay with subtle cyan glow ring
  const inlayGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.09, 32);
  const inlay = new THREE.Mesh(inlayGeo, materials.glassMat);
  inlay.position.y = 0.77;
  group.add(inlay);

  // 6 Conference Chairs placed radially
  const chairsCount = 6;
  for (let c = 0; c < chairsCount; c++) {
    const angle = (c * Math.PI * 2) / chairsCount;
    const chair = createOfficeChair(materials);
    chair.position.set(Math.cos(angle) * 3.1, 0, Math.sin(angle) * 3.1);
    chair.rotation.y = -angle + Math.PI / 2;
    group.add(chair);
  }

  return group;
}

/**
 * Creates Large Observability LED Wall
 */
export function createObservabilityWall(): THREE.Group {
  const group = new THREE.Group();

  // Wall housing frame
  const frameGeo = new THREE.BoxGeometry(9.6, 4.2, 0.2);
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
  const frame = new THREE.Mesh(frameGeo, frameMat);
  frame.position.y = 2.4;
  group.add(frame);

  // LED Screen Plane with Kanban procedural texture
  const kanbanTex = createKanbanBoardTexture();
  const screenMat = new THREE.MeshBasicMaterial({ map: kanbanTex });
  const screenGeo = new THREE.PlaneGeometry(9.2, 3.8);
  const screen = new THREE.Mesh(screenGeo, screenMat);
  screen.position.set(0, 2.4, 0.11);
  group.add(screen);

  return group;
}

/**
 * Creates Culture Lab Display Pedestal with an Ancient Vietnamese Bronze Artifact
 */
export function createCultureArtifactDisplay(materials: OfficeMaterialManager): THREE.Group {
  const group = new THREE.Group();

  // Glass Pedestal stand
  const standGeo = new THREE.BoxGeometry(0.9, 1.0, 0.9);
  const stand = new THREE.Mesh(standGeo, materials.metalBlackMat);
  stand.position.y = 0.5;
  group.add(stand);

  // Glass showcase cover
  const caseGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
  const showcase = new THREE.Mesh(caseGeo, materials.glassMat);
  showcase.position.y = 1.4;
  group.add(showcase);

  // Stylized ancient bronze ritual jar/urn
  const jarGeo = new THREE.CylinderGeometry(0.18, 0.26, 0.35, 16);
  const jar = new THREE.Mesh(jarGeo, materials.bronzeMat);
  jar.position.y = 1.25;
  group.add(jar);

  const jarLidGeo = new THREE.CylinderGeometry(0.19, 0.08, 0.1, 16);
  const jarLid = new THREE.Mesh(jarLidGeo, materials.goldMat);
  jarLid.position.y = 1.45;
  group.add(jarLid);

  // Small spotlight on artifact
  const spot = new THREE.PointLight(0xfef08a, 0.8, 3.5);
  spot.position.set(0, 1.7, 0);
  group.add(spot);

  return group;
}

/**
 * Creates the Supreme Chairman Penthouse Suite (Sky Suite) on elevated mezzanine
 */
export function createChairmanPenthouseSuite(materials: OfficeMaterialManager): THREE.Group {
  const group = new THREE.Group();

  // 1. Elevated Floor Platform (Glass & Polished Gold/Black Marble)
  const floorGeo = new THREE.BoxGeometry(18, 0.4, 14);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x0a0f1d,
    metalness: 0.85,
    roughness: 0.15,
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.position.y = -0.2;
  group.add(floor);

  // 2. Glowing Gold Perimeter Ribbon along floor
  const rimGeo = new THREE.RingGeometry(8.5, 9.0, 4);
  const rimMat = new THREE.MeshBasicMaterial({
    color: 0xeab308,
    transparent: true,
    opacity: 0.8,
    side: THREE.DoubleSide,
  });
  const rim = new THREE.Mesh(rimGeo, rimMat);
  rim.rotation.x = -Math.PI / 2;
  rim.position.y = 0.02;
  group.add(rim);

  // 3. Panoramic Glass Balustrade Overlooking Main Floor Below
  const glassRailGeo = new THREE.BoxGeometry(17.6, 1.2, 0.08);
  const glassRail = new THREE.Mesh(glassRailGeo, materials.glassMat);
  glassRail.position.set(0, 0.6, 6.8);
  group.add(glassRail);

  // Gold handrail cap
  const capGeo = new THREE.BoxGeometry(17.8, 0.06, 0.12);
  const cap = new THREE.Mesh(capGeo, materials.goldMat);
  cap.position.set(0, 1.22, 6.8);
  group.add(cap);

  // 4. Central Chairman Executive Master Desk
  const deskCenter = new THREE.Group();
  deskCenter.position.set(0, 0, -2);

  // Desk Top: Curved Ebony & Gold Inlay
  const topGeo = new THREE.CylinderGeometry(3.2, 3.2, 0.12, 32, 1, false, 0, Math.PI);
  const top = new THREE.Mesh(topGeo, materials.executiveWoodMat);
  top.rotation.y = -Math.PI / 2;
  top.position.set(0, 0.82, 0.3);
  deskCenter.add(top);

  // Brushed Gold Fascia Band
  const bandGeo = new THREE.CylinderGeometry(3.22, 3.22, 0.03, 32, 1, false, 0, Math.PI);
  const band = new THREE.Mesh(bandGeo, materials.goldMat);
  band.rotation.y = -Math.PI / 2;
  band.position.set(0, 0.87, 0.3);
  deskCenter.add(band);

  // Desk Pedestals (Left & Right)
  const pedGeo = new THREE.BoxGeometry(0.7, 0.76, 0.9);
  const pedL = new THREE.Mesh(pedGeo, materials.metalBlackMat);
  pedL.position.set(-1.4, 0.38, 0.2);
  const pedR = new THREE.Mesh(pedGeo, materials.metalBlackMat);
  pedR.position.set(1.4, 0.38, 0.2);
  deskCenter.add(pedL, pedR);

  // Chairman High-Back Executive Armchair
  const chair = createOfficeChair(materials);
  chair.position.set(0, 0, -0.4);
  chair.scale.set(1.2, 1.2, 1.2);
  deskCenter.add(chair);

  // 5. Triple 3D Panoramic Command Screens
  // Screen 1: Company Operations & AI Matrix (Center)
  const screenTex1 = createTerminalScreenTexture(
    'CHAIRMAN COMMAND CENTER — REAL-TIME MATRIX',
    [
      '>> SUPREME AUTHORITY: ACTIVE (Chairman Session Valid)',
      '>> AI Agents: 12 Nodes Online | Status: Synchronized',
      '>> Approval Gate: Monitoring Critical High-Risk Changes',
      '>> Gemini AI Pipeline: Connected via Backend Gateway',
      '>> System Health: 100% Operational',
    ],
    '#eab308'
  );
  const screenMat1 = new THREE.MeshBasicMaterial({ map: screenTex1 });
  const screenGeo1 = new THREE.PlaneGeometry(1.6, 0.7);
  const screen1 = new THREE.Mesh(screenGeo1, screenMat1);
  screen1.position.set(0, 1.35, 0.65);
  screen1.rotation.y = Math.PI;
  deskCenter.add(screen1);

  // Screen 2: Gemini AI Model Health & Latency (Left)
  const screenTex2 = createTerminalScreenTexture(
    'GEMINI MODEL REGISTRY & TELEMETRY',
    [
      'Primary: gemini-3.8-flash (Active)',
      'Fallback: gemini-3.1-flash-lite (Standby)',
      'Reasoning: gemini-4-argon (Ready)',
      'API Key: Encrypted in Server Secrets',
      'Latency: Real-time Health Probing OK',
    ],
    '#06b6d4'
  );
  const screenMat2 = new THREE.MeshBasicMaterial({ map: screenTex2 });
  const screenGeo2 = new THREE.PlaneGeometry(1.2, 0.6);
  const screen2 = new THREE.Mesh(screenGeo2, screenMat2);
  screen2.position.set(-1.5, 1.35, 0.45);
  screen2.rotation.y = Math.PI - 0.35;
  deskCenter.add(screen2);

  // Screen 3: Sprint Progress & Approval Gate (Right)
  const screenTex3 = createTerminalScreenTexture(
    'CHAIRMAN APPROVAL GATE & SPRINT AUDIT',
    [
      'Pending Approvals: Real-time Queue',
      'Code Modification: Requires Approval',
      'Production Data: Requires Approval',
      'Security Access: Requires Approval',
      'Audit Trail: Immutable Server Log',
    ],
    '#10b981'
  );
  const screenMat3 = new THREE.MeshBasicMaterial({ map: screenTex3 });
  const screen3 = new THREE.Mesh(screenGeo2, screenMat3);
  screen3.position.set(1.5, 1.35, 0.45);
  screen3.rotation.y = Math.PI + 0.35;
  deskCenter.add(screen3);

  group.add(deskCenter);

  // 6. Virtual Summit Meeting Area with AI Team Leads (Left Wing)
  const summitArea = new THREE.Group();
  summitArea.position.set(-5.5, 0, 1);

  const summitTableGeo = new THREE.CylinderGeometry(1.8, 1.8, 0.08, 24);
  const summitTable = new THREE.Mesh(summitTableGeo, materials.darkWoodMat);
  summitTable.position.y = 0.74;
  summitArea.add(summitTable);

  const summitColGeo = new THREE.CylinderGeometry(0.3, 0.4, 0.7, 16);
  const summitCol = new THREE.Mesh(summitColGeo, materials.metalChromeMat);
  summitCol.position.y = 0.35;
  summitArea.add(summitCol);

  // Center glowing holographic emitter for meetings
  const emitterGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.02, 16);
  const emitterMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
  const emitter = new THREE.Mesh(emitterGeo, emitterMat);
  emitter.position.y = 0.79;
  summitArea.add(emitter);

  // 4 Chairs for AI Leads
  for (let c = 0; c < 4; c++) {
    const angle = (c * Math.PI * 2) / 4;
    const leadChair = createOfficeChair(materials);
    leadChair.position.set(Math.cos(angle) * 2.3, 0, Math.sin(angle) * 2.3);
    leadChair.rotation.y = -angle + Math.PI / 2;
    summitArea.add(leadChair);
  }

  group.add(summitArea);

  // 7. National Heritage Honor Wall & Digital Map (Right Wing)
  const honorWall = new THREE.Group();
  honorWall.position.set(5.5, 0, -3);

  const wallFrameGeo = new THREE.BoxGeometry(4.2, 2.6, 0.15);
  const wallFrame = new THREE.Mesh(wallFrameGeo, materials.metalBlackMat);
  wallFrame.position.y = 1.6;
  honorWall.add(wallFrame);

  const mapTex = createTerminalScreenTexture(
    'HỒN ĐẤT VIỆT — BẢN ĐỒ DI SẢN QUỐC GIA',
    [
      '>> 54 DÂN TỘC ANH EM: HOÀN TẤT PHÂN LOẠI',
      '>> CỐ ĐÔ HUẾ: SỐ HÓA 3D ĐIỆN THÁI HÒA',
      '>> THÀNH CỔ LOA: KHẢO CỔ KỸ THUẬT SỐ',
      '>> SA BÀN CHIẾN THẮNG BẠCH ĐẰNG: SẴN SÀNG',
      '>> BẢO TỒN & PHÁT HUY GIÁ TRỊ VĂN HÓA SỐ',
    ],
    '#f59e0b'
  );
  const mapMat = new THREE.MeshBasicMaterial({ map: mapTex });
  const mapPlaneGeo = new THREE.PlaneGeometry(4.0, 2.4);
  const mapPlane = new THREE.Mesh(mapPlaneGeo, mapMat);
  mapPlane.position.set(0, 1.6, 0.08);
  honorWall.add(mapPlane);

  group.add(honorWall);

  return group;
}
