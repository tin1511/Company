import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { ROOMS, DEFAULT_CAMERA_POS, DEFAULT_CAMERA_TARGET } from '../data/roomsData.ts';
import { INITIAL_AGENTS } from '../data/agentsData.ts';
import { AIAgent } from '../types/index.ts';
import { OfficeMaterialManager } from './materials.ts';
import {
  createWorkstationDesk,
  createDongSonPedestalMonument,
  createExecutiveDesk,
  createServerCluster,
  createConferenceTable,
  createObservabilityWall,
  createCultureArtifactDisplay,
  createChairmanPenthouseSuite,
} from './roomObjects.ts';
import { Agent3D } from '../agents/Agent3D.ts';

// Reusable math helpers outside tick loop (Zero GC directive)
const _cameraTargetVec = new THREE.Vector3();
const _desiredPosVec = new THREE.Vector3();
const _raycaster = new THREE.Raycaster();
const _pointer = new THREE.Vector2();

export interface OfficeSceneCallbacks {
  onAgentSelect: (agent: AIAgent) => void;
  onRoomSelect: (roomId: string) => void;
  onHoverAgentChange: (agentId: string | null) => void;
}

export class OfficeScene {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public materials: OfficeMaterialManager;
  public agents: Map<string, Agent3D> = new Map();

  // Camera animation state
  private targetCameraPos: THREE.Vector3;
  private currentLookTarget: THREE.Vector3;
  private desiredLookTarget: THREE.Vector3;
  private isUserInteracting: boolean = false;
  private isOverviewMode: boolean = true;

  // Lighting
  private keyLight!: THREE.DirectionalLight;
  private hemiLight!: THREE.HemisphereLight;
  private ambientLight!: THREE.AmbientLight;
  private isNightMode: boolean = false;

  // Hologram animation
  private hologramGroup?: THREE.Group;

  // Interactivity
  private callbacks: OfficeSceneCallbacks;
  private hoveredAgentId: string | null = null;
  private selectedAgentId: string | null = null;
  private raycastTargets: THREE.Mesh[] = [];

  // Orbit / Mouse & Multi-Touch Control
  private spherical = { radius: 38, theta: 0, phi: Math.PI / 4 };
  private isMouseDown = false;
  private previousMousePosition = { x: 0, y: 0 };
  private canvasElement: HTMLCanvasElement;

  // Mobile Touch Gestures
  private touchStartTime = 0;
  private touchStartPos = { x: 0, y: 0 };
  private touchCount = 0;
  private initialPinchDist = 0;
  private initialPinchRadius = 38;
  private previousTouchMidpoint = { x: 0, y: 0 };

  // Bound event handlers for cleanup
  private boundPointerDown!: (e: MouseEvent) => void;
  private boundPointerMove!: (e: MouseEvent) => void;
  private boundPointerUp!: (e: MouseEvent) => void;
  private boundWheel!: (e: WheelEvent) => void;
  private boundResize!: () => void;
  private boundTouchStart!: (e: TouchEvent) => void;
  private boundTouchMove!: (e: TouchEvent) => void;
  private boundTouchEnd!: (e: TouchEvent) => void;

  private animationFrameId: number | null = null;
  private clock = new THREE.Clock();

  constructor(container: HTMLDivElement, callbacks: OfficeSceneCallbacks, isLiteMode = false) {
    this.callbacks = callbacks;

    // 1. Scene & Materials
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0b0f19);
    this.scene.fog = new THREE.FogExp2(0x0b0f19, 0.015);
    this.materials = new OfficeMaterialManager();

    // 2. Camera with portrait mobile adaptation
    const aspect = container.clientWidth / container.clientHeight;
    // On vertical/portrait phones, dynamically expand FOV so the office doesn't get clipped
    const baseFov = 45;
    const fov = aspect < 1.0 ? Math.min(65, Math.round(baseFov / Math.max(0.65, aspect))) : baseFov;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, 0.5, 140);
    this.camera.position.set(...DEFAULT_CAMERA_POS);
    this.targetCameraPos = new THREE.Vector3(...DEFAULT_CAMERA_POS);
    this.currentLookTarget = new THREE.Vector3(...DEFAULT_CAMERA_TARGET);
    this.desiredLookTarget = new THREE.Vector3(...DEFAULT_CAMERA_TARGET);
    this.camera.lookAt(this.currentLookTarget);

    // 3. Renderer with mobile performance optimization
    const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    const maxDpr = isTouchDevice || (typeof window !== 'undefined' && window.innerWidth < 768) ? 1.5 : 1.75;
    this.renderer = new THREE.WebGLRenderer({
      antialias: !isLiteMode,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isLiteMode ? 1.0 : maxDpr));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = !isLiteMode;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.canvasElement = this.renderer.domElement;
    this.canvasElement.style.width = '100%';
    this.canvasElement.style.height = '100%';
    this.canvasElement.style.display = 'block';
    container.appendChild(this.canvasElement);

    // 4. Studio Environment Reflection (RoomEnvironment)
    try {
      const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
      this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
      pmremGenerator.dispose();
    } catch {
      // Fallback
    }

    // 5. Lighting Rig
    this.setupLighting();

    // 6. Build 3D Office Environment & Rooms
    this.buildArchitecture();

    // 7. Spawn 3D AI Agents
    this.spawnAgents();

    // 8. Event Listeners
    this.bindEvents();

    // 9. Pre-warm shaders
    this.renderer.compile(this.scene, this.camera);

    // 10. Start Render Loop
    this.tick = this.tick.bind(this);
    this.tick();
  }

  private setupLighting() {
    // Warm key light
    this.keyLight = new THREE.DirectionalLight(0xfff7ed, 1.6);
    this.keyLight.position.set(20, 30, 20);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width = 1024;
    this.keyLight.shadow.mapSize.height = 1024;
    this.keyLight.shadow.camera.near = 10;
    this.keyLight.shadow.camera.far = 70;
    this.keyLight.shadow.camera.left = -30;
    this.keyLight.shadow.camera.right = 30;
    this.keyLight.shadow.camera.top = 30;
    this.keyLight.shadow.camera.bottom = -30;
    this.keyLight.shadow.bias = -0.0005;
    this.keyLight.shadow.normalBias = 0.02;
    this.scene.add(this.keyLight);

    // Cool sky / ground fill
    this.hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x0f172a, 0.85);
    this.scene.add(this.hemiLight);

    // Soft ambient
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    this.scene.add(this.ambientLight);

    // Soft accent lights for distinct room atmospheres
    const cyanAccent = new THREE.PointLight(0x06b6d4, 1.2, 18);
    cyanAccent.position.set(-16, 4, -4);
    this.scene.add(cyanAccent);

    const blueAccent = new THREE.PointLight(0x3b82f6, 1.2, 18);
    blueAccent.position.set(16, 4, -4);
    this.scene.add(blueAccent);

    const amberAccent = new THREE.PointLight(0xf59e0b, 1.2, 18);
    amberAccent.position.set(-16, 4, 10);
    this.scene.add(amberAccent);

    const greenAccent = new THREE.PointLight(0x10b981, 1.2, 18);
    greenAccent.position.set(16, 4, 10);
    this.scene.add(greenAccent);

    // Supreme Gold Sky Light for Chairman Penthouse Suite
    const goldAccent = new THREE.PointLight(0xfacc15, 1.6, 24);
    goldAccent.position.set(0, 13, -6);
    this.scene.add(goldAccent);
  }

  public setNightMode(night: boolean) {
    this.isNightMode = night;
    if (night) {
      this.keyLight.intensity = 0.4;
      this.keyLight.color.set(0x818cf8);
      this.hemiLight.intensity = 0.45;
      this.ambientLight.intensity = 0.2;
      this.scene.background = new THREE.Color(0x05070f);
      this.scene.fog = new THREE.FogExp2(0x05070f, 0.018);
    } else {
      this.keyLight.intensity = 1.6;
      this.keyLight.color.set(0xfff7ed);
      this.hemiLight.intensity = 0.85;
      this.ambientLight.intensity = 0.35;
      this.scene.background = new THREE.Color(0x0b0f19);
      this.scene.fog = new THREE.FogExp2(0x0b0f19, 0.015);
    }
  }

  public getNightMode(): boolean {
    return this.isNightMode;
  }

  private buildArchitecture() {
    // 1. Master Ground Floor with procedural tiles
    const floorGeo = new THREE.PlaneGeometry(62, 52);
    const floorMesh = new THREE.Mesh(floorGeo, this.materials.floorTileMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    this.scene.add(floorMesh);

    // 2. High-Tech Perimeter Edge Glow
    const edgeBorderGeo = new THREE.RingGeometry(29, 30, 4);
    const edgeBorderMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
    });
    const edgeBorder = new THREE.Mesh(edgeBorderGeo, edgeBorderMat);
    edgeBorder.rotation.x = -Math.PI / 2;
    edgeBorder.position.y = 0.02;
    this.scene.add(edgeBorder);

    // 3. Construct Room Boundaries & Partitions
    ROOMS.forEach((room) => {
      this.buildRoomStructure(room);
    });

    // 4. Central Dong Son Monument in Lobby
    const { group: monumentGroup, hologramRings } = createDongSonPedestalMonument(this.materials);
    monumentGroup.position.set(0, 0, 10);
    this.hologramGroup = hologramRings;
    this.scene.add(monumentGroup);

    // 5. Observability LED Wall (North end)
    const ledWall = createObservabilityWall();
    ledWall.position.set(0, 0, -22);
    this.scene.add(ledWall);

    // 6. Conference Table in Meeting Room (Center)
    const confTable = createConferenceTable(this.materials);
    confTable.position.set(0, 0, -5);
    this.scene.add(confTable);

    // 7. Executive Desk in Executive Office (West-South)
    const execDesk = createExecutiveDesk(this.materials);
    execDesk.position.set(-16, 0, 10);
    this.scene.add(execDesk);

    // 8. Server Cluster in Engineering Lab (East-North)
    const serverCluster = createServerCluster(this.materials);
    serverCluster.position.set(16, 0, -8.5);
    this.scene.add(serverCluster);

    // 9. Engineering Workstations
    const devDesk1 = createWorkstationDesk(
      this.materials,
      'THREE.JS PIPELINE OPTIMIZER',
      ['import * as THREE from "three";', 'const scene = new THREE.Scene();', 'renderQueue.dispatch();', 'FPS: 60 | DrawCalls: 42'],
      '#3b82f6'
    );
    devDesk1.position.set(18, 0, -3.8);
    this.scene.add(devDesk1);

    const devDesk2 = createWorkstationDesk(
      this.materials,
      'VIETNAMESE EMBEDDING ENGINE',
      ['const query = "Địa chí Thăng Long";', 'const vector = model.embed(query);', 'similarity: 0.984 - MATCH', 'Status: RUNNING'],
      '#06b6d4'
    );
    devDesk2.position.set(14, 0, -3.8);
    this.scene.add(devDesk2);

    // 10. Culture Lab Artifact Displays & Workstations
    const artifactDisplay = createCultureArtifactDisplay(this.materials);
    artifactDisplay.position.set(-16, 0, -4);
    this.scene.add(artifactDisplay);

    const cultDesk1 = createWorkstationDesk(
      this.materials,
      'SỐ HÓA KIẾN TRÚC HOÀNG THÀNH',
      ['// Model: Đại Nội Huế 3D', 'PolyCount: 45,200', 'Texture: PBR Gold Sơn Son', 'Export: WebGL Ready'],
      '#06b6d4'
    );
    cultDesk1.position.set(-18, 0, -5.8);
    this.scene.add(cultDesk1);

    const cultDesk2 = createWorkstationDesk(
      this.materials,
      'TỔNG HỢP SỬ LIỆU BẠCH ĐẰNG',
      ['Trận Bạch Đằng (1288)', 'Thủy triều rút: 08:30 sáng', 'Bãi cọc vát nhọn bịt sắt', 'Chiến lược: Toàn thắng'],
      '#f59e0b'
    );
    cultDesk2.position.set(-14, 0, -5.8);
    this.scene.add(cultDesk2);

    // 11. QA Testing Lab Testbenches
    const qaDesk1 = createWorkstationDesk(
      this.materials,
      'LỊCH SỬ FACT-CHECK BENCH',
      ['CHECK: Niên biểu Triều Trần', 'PASSED: 128/128 Events', 'ERROR_RATE: 0.00%', 'VALIDATION: VERIFIED'],
      '#10b981'
    );
    qaDesk1.position.set(16, 0, 8.2);
    this.scene.add(qaDesk1);

    const qaDesk2 = createWorkstationDesk(
      this.materials,
      'UI/UX RESPONSIVE AUTOMATION',
      ['DEVICE: Mobile Portrait (20:9)', 'TOUCH_TARGETS: >= 48px', 'LOAD_TIME: 420ms', 'SCORE: 99/100'],
      '#10b981'
    );
    qaDesk2.position.set(18, 0, 12);
    this.scene.add(qaDesk2);

    // 12. Supreme Chairman Sky Suite (Penthouse elevated at Y = 8.5)
    const chairmanSuite = createChairmanPenthouseSuite(this.materials);
    chairmanSuite.position.set(0, 8.5, -6);
    this.scene.add(chairmanSuite);
  }

  private buildRoomStructure(room: (typeof ROOMS)[0]) {
    const [cx, cy, cz] = room.center;
    const [w, h, d] = room.size;

    // Room Floor Zone Indicator (Subtle tinted floor outline)
    const outlineGeo = new THREE.BoxGeometry(w, 0.02, d);
    const outlineMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(room.themeColor),
      transparent: true,
      opacity: 0.12,
    });
    const outlineMesh = new THREE.Mesh(outlineGeo, outlineMat);
    outlineMesh.position.set(cx, 0.015, cz);
    this.scene.add(outlineMesh);

    // Room Label Marker on floor
    const signTex = this.createRoomFloorSign(room.name, room.code, room.themeColor);
    const signGeo = new THREE.PlaneGeometry(3.6, 0.9);
    const signMat = new THREE.MeshBasicMaterial({
      map: signTex,
      transparent: true,
      depthWrite: false,
    });
    const signMesh = new THREE.Mesh(signGeo, signMat);
    signMesh.rotation.x = -Math.PI / 2;
    signMesh.position.set(cx, 0.03, cz + d / 2 - 0.7);
    this.scene.add(signMesh);

    // Sleek architectural glass partitions with doorway cutouts
    const wallH = 2.4;
    const glassThickness = 0.06;

    // Front low glass balustrade with doorway opening
    const halfW = (w - 3.2) / 2;
    if (halfW > 0.5) {
      const balustradeGeo = new THREE.BoxGeometry(halfW, wallH * 0.45, glassThickness);

      const balustradeLeft = new THREE.Mesh(balustradeGeo, this.materials.glassMat);
      balustradeLeft.position.set(cx - w / 2 + halfW / 2, wallH * 0.225, cz + d / 2);
      this.scene.add(balustradeLeft);

      const balustradeRight = new THREE.Mesh(balustradeGeo, this.materials.glassMat);
      balustradeRight.position.set(cx + w / 2 - halfW / 2, wallH * 0.225, cz + d / 2);
      this.scene.add(balustradeRight);
    }
  }

  private createRoomFloorSign(title: string, code: string, color: string): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.fillRect(0, 0, 512, 128);

    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, 504, 120);

    ctx.fillStyle = color;
    ctx.font = 'bold 24px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`[ ${code} ]`, 256, 42);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 20px "Be Vietnam Pro", sans-serif';
    ctx.fillText(title, 256, 88);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  private spawnAgents() {
    INITIAL_AGENTS.forEach((agent) => {
      const agent3D = new Agent3D(agent);
      this.agents.set(agent.id, agent3D);
      this.scene.add(agent3D.group);
      this.raycastTargets.push(agent3D.clickMesh);
    });
  }

  public focusRoom(roomId: string) {
    const room = ROOMS.find((r) => r.id === roomId);
    if (!room) return;

    this.isOverviewMode = false;
    this.targetCameraPos.set(...room.cameraPosition);
    this.desiredLookTarget.set(...room.cameraTarget);
  }

  public focusAgent(agentId: string) {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    this.selectedAgentId = agentId;
    this.agents.forEach((a, id) => a.setSelected(id === agentId));

    this.isOverviewMode = false;
    const [ax, ay, az] = agent.agentData.position3D;
    this.targetCameraPos.set(ax + 2.5, ay + 2.8, az + 3.8);
    this.desiredLookTarget.set(ax, ay + 1.1, az);
  }

  public resetCameraOverview() {
    this.isOverviewMode = true;
    this.selectedAgentId = null;
    this.agents.forEach((a) => a.setSelected(false));
    this.targetCameraPos.set(...DEFAULT_CAMERA_POS);
    this.desiredLookTarget.set(...DEFAULT_CAMERA_TARGET);
  }

  public updateAgentStatus(agentId: string, status: AIAgent['status']) {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.updateStatus(status);
    }
  }

  // --- Zoom In / Zoom Out Controls for Mobile / UI ---
  public zoomIn(amount = 5) {
    this.spherical.radius = Math.max(8, this.spherical.radius - amount);
    this.updateTargetPosFromSpherical();
  }

  public zoomOut(amount = 5) {
    this.spherical.radius = Math.min(65, this.spherical.radius + amount);
    this.updateTargetPosFromSpherical();
  }

  private updateTargetPosFromSpherical() {
    this.targetCameraPos.x =
      this.desiredLookTarget.x +
      this.spherical.radius * Math.sin(this.spherical.phi) * Math.sin(this.spherical.theta);
    this.targetCameraPos.y =
      this.desiredLookTarget.y + this.spherical.radius * Math.cos(this.spherical.phi);
    this.targetCameraPos.z =
      this.desiredLookTarget.z +
      this.spherical.radius * Math.sin(this.spherical.phi) * Math.cos(this.spherical.theta);
  }

  // --- Interaction & Event Handling ---
  private bindEvents() {
    this.boundPointerDown = this.onPointerDown.bind(this);
    this.boundPointerMove = this.onPointerMove.bind(this);
    this.boundPointerUp = this.onPointerUp.bind(this);
    this.boundWheel = this.onWheel.bind(this);
    this.boundResize = this.onResize.bind(this);

    this.boundTouchStart = this.onTouchStart.bind(this);
    this.boundTouchMove = this.onTouchMove.bind(this);
    this.boundTouchEnd = this.onTouchEnd.bind(this);

    // Mouse / Pointer
    this.canvasElement.addEventListener('pointerdown', this.boundPointerDown);
    window.addEventListener('pointermove', this.boundPointerMove);
    window.addEventListener('pointerup', this.boundPointerUp);
    this.canvasElement.addEventListener('wheel', this.boundWheel, { passive: true });
    window.addEventListener('resize', this.boundResize);

    // Mobile Native Touch (with passive: false to prevent scrolling)
    this.canvasElement.addEventListener('touchstart', this.boundTouchStart, { passive: false });
    this.canvasElement.addEventListener('touchmove', this.boundTouchMove, { passive: false });
    this.canvasElement.addEventListener('touchend', this.boundTouchEnd, { passive: false });
    this.canvasElement.addEventListener('touchcancel', this.boundTouchEnd, { passive: false });
  }

  private onPointerDown(e: MouseEvent) {
    this.isMouseDown = true;
    this.previousMousePosition = { x: e.clientX, y: e.clientY };
  }

  private onPointerMove(e: MouseEvent) {
    // 1. Orbit Dragging
    if (this.isMouseDown) {
      const deltaX = e.clientX - this.previousMousePosition.x;
      const deltaY = e.clientY - this.previousMousePosition.y;

      if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
        this.isUserInteracting = true;
      }

      this.spherical.theta -= deltaX * 0.005;
      this.spherical.phi = Math.max(0.15, Math.min(Math.PI / 2.1, this.spherical.phi - deltaY * 0.005));
      this.updateTargetPosFromSpherical();

      this.previousMousePosition = { x: e.clientX, y: e.clientY };
      return;
    }

    // 2. Raycasting for hover state
    const rect = this.canvasElement.getBoundingClientRect();
    _pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    _pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    _raycaster.setFromCamera(_pointer, this.camera);
    const intersects = _raycaster.intersectObjects(this.raycastTargets);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const hitAgentId = hit.userData.agentId as string;
      if (hitAgentId !== this.hoveredAgentId) {
        if (this.hoveredAgentId) {
          this.agents.get(this.hoveredAgentId)?.setHovered(false);
        }
        this.hoveredAgentId = hitAgentId;
        this.agents.get(hitAgentId)?.setHovered(true);
        this.callbacks.onHoverAgentChange(hitAgentId);
        this.canvasElement.style.cursor = 'pointer';
      }
    } else {
      if (this.hoveredAgentId) {
        this.agents.get(this.hoveredAgentId)?.setHovered(false);
        this.hoveredAgentId = null;
        this.callbacks.onHoverAgentChange(null);
        this.canvasElement.style.cursor = 'default';
      }
    }
  }

  private onPointerUp(e: MouseEvent) {
    const wasDragging = this.isUserInteracting;
    this.isMouseDown = false;
    this.isUserInteracting = false;

    if (!wasDragging) {
      const rect = this.canvasElement.getBoundingClientRect();
      _pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      _pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      _raycaster.setFromCamera(_pointer, this.camera);
      const intersects = _raycaster.intersectObjects(this.raycastTargets);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const agentId = hit.userData.agentId as string;
        const agent = this.agents.get(agentId);
        if (agent) {
          this.focusAgent(agentId);
          this.callbacks.onAgentSelect(agent.agentData);
        }
      }
    }
  }

  // Mobile Touch Event Listeners
  private onTouchStart(e: TouchEvent) {
    if (e.target !== this.canvasElement) return;
    this.touchCount = e.touches.length;

    if (e.touches.length === 1) {
      const t = e.touches[0];
      this.isMouseDown = true;
      this.touchStartTime = performance.now();
      this.touchStartPos = { x: t.clientX, y: t.clientY };
      this.previousMousePosition = { x: t.clientX, y: t.clientY };
    } else if (e.touches.length === 2) {
      this.isMouseDown = false;
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      this.initialPinchDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      this.initialPinchRadius = this.spherical.radius;
      this.previousTouchMidpoint = {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2,
      };
    }
  }

  private onTouchMove(e: TouchEvent) {
    if (e.target !== this.canvasElement) return;
    // Single-finger: Orbit rotation
    if (e.touches.length === 1 && this.isMouseDown) {
      const t = e.touches[0];
      const deltaX = t.clientX - this.previousMousePosition.x;
      const deltaY = t.clientY - this.previousMousePosition.y;

      if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
        this.isUserInteracting = true;
      }

      this.spherical.theta -= deltaX * 0.007;
      this.spherical.phi = Math.max(0.15, Math.min(Math.PI / 2.05, this.spherical.phi - deltaY * 0.007));
      this.updateTargetPosFromSpherical();

      this.previousMousePosition = { x: t.clientX, y: t.clientY };
    } else if (e.touches.length === 2) {
      // Two-finger: Pinch-to-zoom + 2-finger pan
      this.isUserInteracting = true;
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const currentDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);

      if (this.initialPinchDist > 5) {
        const pinchRatio = this.initialPinchDist / Math.max(10, currentDist);
        this.spherical.radius = Math.max(8, Math.min(65, this.initialPinchRadius * pinchRatio));
        this.updateTargetPosFromSpherical();
      }

      // Two-finger Pan
      const currentMid = {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2,
      };
      const midDeltaX = currentMid.x - this.previousTouchMidpoint.x;
      const midDeltaY = currentMid.y - this.previousTouchMidpoint.y;

      const factor = 0.035;
      const forwardX = -Math.sin(this.spherical.theta);
      const forwardZ = -Math.cos(this.spherical.theta);
      const sideX = Math.cos(this.spherical.theta);
      const sideZ = -Math.sin(this.spherical.theta);

      this.desiredLookTarget.x += (-midDeltaX * sideX + midDeltaY * forwardX) * factor;
      this.desiredLookTarget.z += (-midDeltaX * sideZ + midDeltaY * forwardZ) * factor;
      this.updateTargetPosFromSpherical();

      this.previousTouchMidpoint = currentMid;
    }
  }

  private onTouchEnd(e: TouchEvent) {
    if (this.touchCount === 1) {
      const touchDuration = performance.now() - this.touchStartTime;
      const lastX = this.previousMousePosition.x;
      const lastY = this.previousMousePosition.y;
      const dist = Math.hypot(lastX - this.touchStartPos.x, lastY - this.touchStartPos.y);

      // Tap threshold: fast and minimal displacement
      if (touchDuration < 320 && dist < 12) {
        const rect = this.canvasElement.getBoundingClientRect();
        _pointer.x = ((lastX - rect.left) / rect.width) * 2 - 1;
        _pointer.y = -((lastY - rect.top) / rect.height) * 2 + 1;

        _raycaster.setFromCamera(_pointer, this.camera);
        const intersects = _raycaster.intersectObjects(this.raycastTargets);

        if (intersects.length > 0) {
          const hit = intersects[0].object;
          const agentId = hit.userData.agentId as string;
          const agent = this.agents.get(agentId);
          if (agent) {
            this.focusAgent(agentId);
            this.callbacks.onAgentSelect(agent.agentData);
          }
        }
      }
    }

    this.isMouseDown = false;
    this.isUserInteracting = false;
    this.touchCount = e.touches.length;
    this.initialPinchDist = 0;
  }

  private onWheel(e: WheelEvent) {
    const zoomDelta = e.deltaY * 0.03;
    this.spherical.radius = Math.max(8, Math.min(65, this.spherical.radius + zoomDelta));
    this.updateTargetPosFromSpherical();
  }

  public onResize() {
    const parent = this.canvasElement.parentElement;
    if (!parent) return;
    const width = parent.clientWidth;
    const height = parent.clientHeight;
    const aspect = width / height;

    this.camera.aspect = aspect;
    // Adapt FOV for vertical smartphone screens
    const baseFov = 45;
    this.camera.fov = aspect < 1.0 ? Math.min(65, Math.round(baseFov / Math.max(0.65, aspect))) : baseFov;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  private tick() {
    this.animationFrameId = requestAnimationFrame(this.tick);
    const delta = Math.min(this.clock.getDelta(), 0.1);
    const elapsedTime = this.clock.getElapsedTime();

    // 1. Exponential Damping for Camera
    this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, this.targetCameraPos.x, 3.5, delta);
    this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, this.targetCameraPos.y, 3.5, delta);
    this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, this.targetCameraPos.z, 3.5, delta);

    this.currentLookTarget.x = THREE.MathUtils.damp(this.currentLookTarget.x, this.desiredLookTarget.x, 3.8, delta);
    this.currentLookTarget.y = THREE.MathUtils.damp(this.currentLookTarget.y, this.desiredLookTarget.y, 3.8, delta);
    this.currentLookTarget.z = THREE.MathUtils.damp(this.currentLookTarget.z, this.desiredLookTarget.z, 3.8, delta);

    this.camera.lookAt(this.currentLookTarget);

    // 2. Hologram ring rotation in Lobby
    if (this.hologramGroup) {
      this.hologramGroup.rotation.y = elapsedTime * 0.45;
      this.hologramGroup.position.y = 1.8 + Math.sin(elapsedTime * 2.0) * 0.08;
    }

    // 3. Tick All AI Agents
    this.agents.forEach((agent) => {
      agent.tick(elapsedTime, this.camera.position);
    });

    // 4. Render
    this.renderer.render(this.scene, this.camera);
  }

  public dispose() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.boundPointerDown) {
      this.canvasElement.removeEventListener('pointerdown', this.boundPointerDown);
    }
    if (this.boundPointerMove) {
      window.removeEventListener('pointermove', this.boundPointerMove);
    }
    if (this.boundPointerUp) {
      window.removeEventListener('pointerup', this.boundPointerUp);
    }
    if (this.boundWheel) {
      this.canvasElement.removeEventListener('wheel', this.boundWheel);
    }
    if (this.boundResize) {
      window.removeEventListener('resize', this.boundResize);
    }
    if (this.boundTouchStart) {
      this.canvasElement.removeEventListener('touchstart', this.boundTouchStart);
      this.canvasElement.removeEventListener('touchmove', this.boundTouchMove);
      this.canvasElement.removeEventListener('touchend', this.boundTouchEnd);
      this.canvasElement.removeEventListener('touchcancel', this.boundTouchEnd);
    }

    this.agents.forEach((agent) => agent.dispose());
    this.materials.dispose();
    this.renderer.dispose();

    if (this.canvasElement.parentElement) {
      this.canvasElement.parentElement.removeChild(this.canvasElement);
    }
  }
}
