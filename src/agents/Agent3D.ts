import * as THREE from 'three';
import { AIAgent } from '../types/index.ts';
import { STATUS_CONFIG } from '../styles/theme.ts';

// Pre-allocate vectors outside tick loop (Zero GC directive)
const _v1 = new THREE.Vector3();

export class Agent3D {
  public group: THREE.Group;
  public agentData: AIAgent;
  public clickMesh: THREE.Mesh; // Simplified invisible proxy collision box for raycasting

  // Animated parts
  private headGroup: THREE.Group;
  private leftArmGroup: THREE.Group;
  private rightArmGroup: THREE.Group;
  private statusRing: THREE.Mesh;
  private nameplateMesh: THREE.Mesh;
  private accessoryGroup: THREE.Group;
  private isHovered: boolean = false;
  private isSelected: boolean = false;
  private hoverHaloMesh: THREE.Mesh;

  private timeOffset: number;

  constructor(agent: AIAgent) {
    this.agentData = agent;
    this.timeOffset = Math.random() * Math.PI * 2;
    this.group = new THREE.Group();
    this.group.position.set(...agent.position3D);
    this.group.rotation.y = agent.rotationY;
    this.group.name = `Agent_${agent.id}`;

    // Tag the group with agent id for raycaster retrieval
    this.group.userData = { agentId: agent.id, type: 'agent' };

    // --- 1. Soft Contact Shadow ---
    const shadowGeo = new THREE.PlaneGeometry(0.8, 0.8);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.4,
      depthWrite: false,
    });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.015; // Flush without z-fighting
    this.group.add(shadow);

    // --- 2. Hover / Selection Halo Ground Ring ---
    const haloGeo = new THREE.RingGeometry(0.5, 0.65, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(agent.avatarColor),
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.hoverHaloMesh = new THREE.Mesh(haloGeo, haloMat);
    this.hoverHaloMesh.rotation.x = -Math.PI / 2;
    this.hoverHaloMesh.position.y = 0.02;
    this.group.add(this.hoverHaloMesh);

    // --- 3. Body / Legs / Torso ---
    // Legs
    const legGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.6, 12);
    const legMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.7,
      metalness: 0.1,
    });
    const leftLeg = new THREE.Mesh(legGeo, legMat);
    leftLeg.position.set(-0.14, 0.3, 0);
    const rightLeg = new THREE.Mesh(legGeo, legMat);
    rightLeg.position.set(0.14, 0.3, 0);
    this.group.add(leftLeg, rightLeg);

    // Torso / High-Tech Robe/Jacket with Vietnamese flair
    const torsoGeo = new THREE.CylinderGeometry(0.24, 0.2, 0.7, 16);
    const torsoMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(agent.avatarColor),
      roughness: 0.35,
      metalness: 0.25,
    });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.y = 0.88;
    this.group.add(torso);

    // Tech Badge / Core Insignia on Chest
    const coreGeo = new THREE.BoxGeometry(0.12, 0.16, 0.05);
    const coreMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(agent.secondaryColor),
      emissive: new THREE.Color(agent.avatarColor),
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.8,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.position.set(0, 0.95, 0.2);
    this.group.add(core);

    // --- 4. Articulated Head & Visor ---
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 1.4, 0);

    // Stylized Head
    const headGeo = new THREE.SphereGeometry(0.19, 16, 16);
    const headMat = new THREE.MeshStandardMaterial({
      color: 0xfde047, // Golden amber skin tone
      roughness: 0.5,
      metalness: 0.1,
    });
    const head = new THREE.Mesh(headGeo, headMat);
    this.headGroup.add(head);

    // Sleek Holographic Visor
    const visorGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 16, 1, false, 0, Math.PI);
    const visorMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(agent.avatarColor),
      emissive: new THREE.Color(agent.avatarColor),
      emissiveIntensity: 0.5,
      roughness: 0.1,
      metalness: 0.9,
      transmission: 0.5,
      transparent: true,
      opacity: 0.9,
    });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 0.02, 0.08);
    visor.rotation.y = -Math.PI / 2;
    this.headGroup.add(visor);

    // Traditional Topknot / Hair bun stylized ornament
    const bunGeo = new THREE.CylinderGeometry(0.06, 0.09, 0.12, 12);
    const bunMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.8,
      metalness: 0.1,
    });
    const bun = new THREE.Mesh(bunGeo, bunMat);
    bun.position.set(0, 0.22, -0.04);
    this.headGroup.add(bun);

    this.group.add(this.headGroup);

    // --- 5. Articulated Arms ---
    const armGeo = new THREE.CylinderGeometry(0.06, 0.05, 0.45, 12);
    const armMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(agent.avatarColor),
      roughness: 0.4,
      metalness: 0.2,
    });

    // Left Arm
    this.leftArmGroup = new THREE.Group();
    this.leftArmGroup.position.set(-0.3, 1.15, 0);
    const leftArm = new THREE.Mesh(armGeo, armMat);
    leftArm.position.y = -0.2;
    this.leftArmGroup.add(leftArm);
    this.group.add(this.leftArmGroup);

    // Right Arm
    this.rightArmGroup = new THREE.Group();
    this.rightArmGroup.position.set(0.3, 1.15, 0);
    const rightArm = new THREE.Mesh(armGeo, armMat);
    rightArm.position.y = -0.2;
    this.rightArmGroup.add(rightArm);
    this.group.add(this.rightArmGroup);

    // --- 6. Accessory: Holographic Tablet / Laptop ---
    this.accessoryGroup = new THREE.Group();
    this.accessoryGroup.position.set(0, 0.85, 0.38);

    const padGeo = new THREE.BoxGeometry(0.4, 0.015, 0.26);
    const padMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.2,
    });
    const pad = new THREE.Mesh(padGeo, padMat);
    this.accessoryGroup.add(pad);

    const padScreenGeo = new THREE.PlaneGeometry(0.36, 0.22);
    const padScreenMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(agent.avatarColor),
      transparent: true,
      opacity: 0.85,
    });
    const padScreen = new THREE.Mesh(padScreenGeo, padScreenMat);
    padScreen.rotation.x = -Math.PI / 2.3;
    padScreen.position.set(0, 0.08, -0.02);
    this.accessoryGroup.add(padScreen);
    this.group.add(this.accessoryGroup);

    // Initial arm pose holding/working on tablet
    this.leftArmGroup.rotation.x = Math.PI / 3.5;
    this.leftArmGroup.rotation.z = -Math.PI / 10;
    this.rightArmGroup.rotation.x = Math.PI / 3.2;
    this.rightArmGroup.rotation.z = Math.PI / 10;

    // --- 7. Floating Status Ring ---
    const statusInfo = STATUS_CONFIG[agent.status];
    const ringGeo = new THREE.TorusGeometry(0.18, 0.025, 12, 32);
    const ringMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(statusInfo.color),
      emissive: new THREE.Color(statusInfo.color),
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.8,
    });
    this.statusRing = new THREE.Mesh(ringGeo, ringMat);
    this.statusRing.rotation.x = Math.PI / 2;
    this.statusRing.position.set(0, 1.82, 0);
    this.group.add(this.statusRing);

    // --- 8. Billboard Floating Nameplate ---
    this.nameplateMesh = this.createNameplateMesh(agent.name, statusInfo.label, agent.avatarColor);
    this.nameplateMesh.position.set(0, 2.05, 0);
    this.group.add(this.nameplateMesh);

    // --- 9. Raycasting Proxy Collision Box ---
    const hitGeo = new THREE.CylinderGeometry(0.45, 0.45, 2.2, 8);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    this.clickMesh = new THREE.Mesh(hitGeo, hitMat);
    this.clickMesh.position.y = 1.1;
    this.clickMesh.userData = { agentId: agent.id, type: 'agent' };
    this.group.add(this.clickMesh);
  }

  private createNameplateMesh(name: string, status: string, color: string): THREE.Mesh {
    const canvas = document.createElement('canvas');
    canvas.width = 384;
    canvas.height = 112;
    const ctx = canvas.getContext('2d')!;

    // Rounded rectangle background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    const r = 16;
    ctx.beginPath();
    ctx.roundRect(4, 4, 376, 104, r);
    ctx.fill();

    // Border with agent color
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Agent Name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(name, 192, 44);

    // Status pill text
    ctx.fillStyle = color;
    ctx.font = '16px "Be Vietnam Pro", sans-serif';
    ctx.fillText(`● ${status}`, 192, 80);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;

    const geo = new THREE.PlaneGeometry(1.4, 0.42);
    const mat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.renderOrder = 999;
    return mesh;
  }

  public updateStatus(status: AIAgent['status']) {
    this.agentData.status = status;
    const statusInfo = STATUS_CONFIG[status];
    (this.statusRing.material as THREE.MeshStandardMaterial).color.set(statusInfo.color);
    (this.statusRing.material as THREE.MeshStandardMaterial).emissive.set(statusInfo.color);

    // Rebuild nameplate with updated status text
    const newNameplate = this.createNameplateMesh(this.agentData.name, statusInfo.label, this.agentData.avatarColor);
    this.nameplateMesh.geometry.dispose();
    (this.nameplateMesh.material as THREE.Material).dispose();
    this.group.remove(this.nameplateMesh);
    this.nameplateMesh = newNameplate;
    this.nameplateMesh.position.set(0, 2.05, 0);
    this.group.add(this.nameplateMesh);
  }

  public setHovered(hovered: boolean) {
    if (this.isHovered === hovered) return;
    this.isHovered = hovered;
    (this.hoverHaloMesh.material as THREE.MeshBasicMaterial).opacity = hovered || this.isSelected ? 0.75 : 0.0;
  }

  public setSelected(selected: boolean) {
    this.isSelected = selected;
    (this.hoverHaloMesh.material as THREE.MeshBasicMaterial).opacity = selected ? 0.95 : this.isHovered ? 0.75 : 0.0;
  }

  public tick(time: number, cameraPosition: THREE.Vector3) {
    const t = time + this.timeOffset;

    // Billboard nameplate: always orient directly towards the camera
    this.nameplateMesh.lookAt(cameraPosition);

    // Smooth status ring spinning
    this.statusRing.rotation.z = t * 1.5;

    // Status-driven behavior animation:
    switch (this.agentData.status) {
      case 'working':
      case 'testing': {
        // Typing motion: rapid small arm oscillations
        this.leftArmGroup.rotation.x = Math.PI / 3.4 + Math.sin(t * 7) * 0.06;
        this.rightArmGroup.rotation.x = Math.PI / 3.4 + Math.cos(t * 7.5) * 0.06;
        // Head subtle focus bobbing
        this.headGroup.rotation.x = 0.15 + Math.sin(t * 2) * 0.04;
        break;
      }
      case 'researching': {
        // Head tilted down examining tablet
        this.headGroup.rotation.x = 0.22 + Math.sin(t * 1.5) * 0.03;
        this.headGroup.rotation.y = Math.sin(t * 0.8) * 0.15;
        this.leftArmGroup.rotation.x = Math.PI / 3.2;
        this.rightArmGroup.rotation.x = Math.PI / 3.0 + Math.sin(t * 3) * 0.04;
        break;
      }
      case 'meeting': {
        // Nodding and gesturing
        this.headGroup.rotation.y = Math.sin(t * 1.2) * 0.25;
        this.headGroup.rotation.x = Math.sin(t * 2.5) * 0.06;
        this.rightArmGroup.rotation.x = Math.PI / 4 + Math.sin(t * 2) * 0.12;
        break;
      }
      case 'idle':
      default: {
        // Calm resting breath
        this.headGroup.rotation.x = Math.sin(t * 1.2) * 0.03;
        this.headGroup.rotation.y = Math.sin(t * 0.6) * 0.06;
        this.leftArmGroup.rotation.x = Math.PI / 3.5;
        this.rightArmGroup.rotation.x = Math.PI / 3.5;
        break;
      }
    }

    // Breathing chest motion
    this.headGroup.position.y = 1.4 + Math.sin(t * 2) * 0.015;
  }

  public dispose() {
    this.group.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.geometry?.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => m.dispose());
        } else {
          mesh.material?.dispose();
        }
      }
    });
  }
}
