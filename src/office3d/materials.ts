import * as THREE from 'three';
import { createFloorTileTexture } from '../utils/proceduralTextures.ts';

export class OfficeMaterialManager {
  public floorTileMat: THREE.MeshStandardMaterial;
  public wallMat: THREE.MeshStandardMaterial;
  public glassMat: THREE.MeshPhysicalMaterial;
  public darkWoodMat: THREE.MeshStandardMaterial;
  public executiveWoodMat: THREE.MeshStandardMaterial;
  public metalBlackMat: THREE.MeshStandardMaterial;
  public metalChromeMat: THREE.MeshStandardMaterial;
  public bronzeMat: THREE.MeshStandardMaterial;
  public goldMat: THREE.MeshStandardMaterial;
  public glowCyanMat: THREE.MeshBasicMaterial;
  public glowAmberMat: THREE.MeshBasicMaterial;
  public glowPurpleMat: THREE.MeshBasicMaterial;

  constructor() {
    const floorTexture = createFloorTileTexture('#0f172a', '#090d16', 32);
    floorTexture.repeat.set(16, 16);

    this.floorTileMat = new THREE.MeshStandardMaterial({
      map: floorTexture,
      roughness: 0.45,
      metalness: 0.2,
    });

    this.wallMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.85,
      metalness: 0.1,
    });

    this.glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x67e8f9,
      transmission: 0.7,
      opacity: 0.35,
      transparent: true,
      roughness: 0.1,
      metalness: 0.1,
      ior: 1.5,
      depthWrite: false,
    });

    this.darkWoodMat = new THREE.MeshStandardMaterial({
      color: 0x1e1e24,
      roughness: 0.6,
      metalness: 0.15,
    });

    this.executiveWoodMat = new THREE.MeshStandardMaterial({
      color: 0x451a03, // Rich mahogany wood
      roughness: 0.3,
      metalness: 0.1,
    });

    this.metalBlackMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.35,
      metalness: 0.85,
    });

    this.metalChromeMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.15,
      metalness: 0.95,
    });

    this.bronzeMat = new THREE.MeshStandardMaterial({
      color: 0xb45309,
      roughness: 0.35,
      metalness: 0.8,
    });

    this.goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.2,
      metalness: 0.9,
    });

    this.glowCyanMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
    this.glowAmberMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    this.glowPurpleMat = new THREE.MeshBasicMaterial({ color: 0xa855f7 });
  }

  public dispose() {
    this.floorTileMat.map?.dispose();
    this.floorTileMat.dispose();
    this.wallMat.dispose();
    this.glassMat.dispose();
    this.darkWoodMat.dispose();
    this.executiveWoodMat.dispose();
    this.metalBlackMat.dispose();
    this.metalChromeMat.dispose();
    this.bronzeMat.dispose();
    this.goldMat.dispose();
    this.glowCyanMat.dispose();
    this.glowAmberMat.dispose();
    this.glowPurpleMat.dispose();
  }
}
