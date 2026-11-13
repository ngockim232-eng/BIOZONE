import * as THREE from 'three';
import { GalleryRoom, SpaceStyle } from '../types';
import { SpaceStyleConfig } from './constants';

export interface AnimatedDecorItem {
  obj: THREE.Object3D;
  mode: 'spin' | 'bob' | 'spin-bob' | 'tilt-spin';
  speed: number;
  baseY: number;
  phase: number;
}

export interface RoomDecorResult {
  animatedItems: AnimatedDecorItem[];
  particleSystem?: THREE.Points;
}

function createTextPlaqueTexture(
  bgHex: string,
  borderHex: string,
  heading: string,
  line1: string,
  line2: string,
  accentHex: string
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 384;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = bgHex;
  ctx.fillRect(0, 0, 768, 384);

  ctx.strokeStyle = borderHex;
  ctx.lineWidth = 10;
  ctx.strokeRect(12, 12, 744, 360);

  ctx.strokeStyle = `${accentHex}55`;
  ctx.lineWidth = 3;
  ctx.strokeRect(26, 26, 716, 332);

  ctx.fillStyle = accentHex;
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(heading.toUpperCase(), 384, 96);

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 34px sans-serif';
  const safeLine1 = line1.length > 34 ? line1.slice(0, 33) + '…' : line1;
  ctx.fillText(safeLine1, 384, 185);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '26px sans-serif';
  const safeLine2 = line2.length > 42 ? line2.slice(0, 41) + '…' : line2;
  ctx.fillText(safeLine2, 384, 255);

  ctx.fillStyle = accentHex;
  ctx.fillRect(264, 300, 240, 5);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createChalkboardTexture(room: GalleryRoom): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 384;
  const ctx = canvas.getContext('2d')!;

  // Chalkboard green
  ctx.fillStyle = '#143828';
  ctx.fillRect(0, 0, 768, 384);

  // Wooden frame
  ctx.strokeStyle = '#7c4a24';
  ctx.lineWidth = 16;
  ctx.strokeRect(8, 8, 752, 368);

  // Chalk title
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 32px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`KHTN - SINH HỌC • LỚP ${room.className || 'THCS'}`, 44, 72);

  ctx.fillStyle = '#fde047';
  ctx.font = '24px sans-serif';
  ctx.fillText(`Phòng: ${room.code} | GV: ${room.teacherName}`, 44, 118);

  // Simple chalk plant cell diagram on right
  ctx.strokeStyle = '#86efac';
  ctx.lineWidth = 4;
  ctx.strokeRect(520, 120, 180, 190);
  ctx.strokeStyle = '#4ade80';
  ctx.beginPath();
  ctx.arc(610, 200, 34, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = '#93c5fd';
  ctx.beginPath();
  ctx.ellipse(585, 258, 42, 26, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#e2e8f0';
  ctx.font = '22px sans-serif';
  ctx.fillText('1. Thành tế bào & Lục lạp', 44, 185);
  ctx.fillText('2. Quang hợp: CO₂ + H₂O → O₂', 44, 232);
  ctx.fillText(`3. Tổng dự án trưng bày: ${room.products?.length || 0}`, 44, 279);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function buildRoomDecorations(
  scene: THREE.Scene,
  styleId: SpaceStyle,
  styleConfig: SpaceStyleConfig,
  room: GalleryRoom
): RoomDecorResult {
  const animatedItems: AnimatedDecorItem[] = [];
  const floorSize = 40;
  const wallHeight = 10;

  // 1. Side Walls (Left & Right) + Baseboard trim for immersive enclosed hall
  const sideWallMat = new THREE.MeshStandardMaterial({
    color: styleConfig.wallColor,
    roughness: 0.85,
  });

  const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(floorSize, wallHeight), sideWallMat);
  leftWall.position.set(-floorSize / 2, wallHeight / 2, 0);
  leftWall.rotation.y = Math.PI / 2;
  scene.add(leftWall);

  const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(floorSize, wallHeight), sideWallMat);
  rightWall.position.set(floorSize / 2, wallHeight / 2, 0);
  rightWall.rotation.y = -Math.PI / 2;
  scene.add(rightWall);

  // Glowing baseboard trim along Back, Left, Right walls
  const trimMat = new THREE.MeshBasicMaterial({ color: styleConfig.accentColor });
  const backTrim = new THREE.Mesh(new THREE.BoxGeometry(floorSize, 0.16, 0.14), trimMat);
  backTrim.position.set(0, 0.08, -floorSize / 2 + 0.07);
  scene.add(backTrim);

  const leftTrim = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.16, floorSize), trimMat);
  leftTrim.position.set(-floorSize / 2 + 0.07, 0.08, 0);
  scene.add(leftTrim);

  const rightTrim = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.16, floorSize), trimMat);
  rightTrim.position.set(floorSize / 2 - 0.07, 0.08, 0);
  scene.add(rightTrim);

  // 2. Per-Room Personalization Wall Plaques (Left & Right walls)
  const leftPlaqueTex = createTextPlaqueTexture(
    '#0b1320',
    styleConfig.accentHex,
    `KHÔNG GIAN ${styleConfig.badge}`,
    room.theme || 'SINH HỌC & KHTN',
    `Lớp ${room.className || 'THCS'} • ${room.products?.length || 0} sản phẩm sáng tạo`,
    styleConfig.accentHex
  );
  const leftPlaque = new THREE.Mesh(
    new THREE.PlaneGeometry(9.5, 4.75),
    new THREE.MeshBasicMaterial({ map: leftPlaqueTex })
  );
  leftPlaque.position.set(-floorSize / 2 + 0.15, 5.2, -3);
  leftPlaque.rotation.y = Math.PI / 2;
  scene.add(leftPlaque);

  const honorTeam = room.hallOfFame?.topTeamName || room.teacherName;
  const rightPlaqueTex =
    styleId === 'classroom'
      ? createChalkboardTexture(room)
      : createTextPlaqueTexture(
          '#0b1320',
          styleConfig.accentHex,
          'DẤU ẤN & GÓC VINH DANH',
          honorTeam,
          `${room.schoolName || 'THCS'} • GV: ${room.teacherName}`,
          styleConfig.accentHex
        );
  const rightPlaque = new THREE.Mesh(
    new THREE.PlaneGeometry(9.5, 4.75),
    new THREE.MeshBasicMaterial({ map: rightPlaqueTex })
  );
  rightPlaque.position.set(floorSize / 2 - 0.15, 5.2, -3);
  rightPlaque.rotation.y = -Math.PI / 2;
  scene.add(rightPlaque);

  // 3. Architectural Perimeter Ring & Overhead Beams (placed outside product podium ring at r = 16.8)
  const decorRadius = 16.8;
  const decorCount = 8;

  if (styleId === 'eco') {
    // Centerpiece: Glass Biosphere Terrarium with miniature tree & floating chlorophyll spheres
    const domeGroup = new THREE.Group();
    domeGroup.position.set(0, 1.3, 0);

    const glassDome = new THREE.Mesh(
      new THREE.SphereGeometry(1.15, 28, 20, 0, Math.PI * 2, 0, Math.PI * 0.68),
      new THREE.MeshStandardMaterial({
        color: 0xa7f3d0,
        transparent: true,
        opacity: 0.25,
        roughness: 0.1,
        metalness: 0.1,
      })
    );
    glassDome.position.y = 0.2;
    domeGroup.add(glassDome);

    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.16, 0.9, 10),
      new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 })
    );
    trunk.position.y = 0.35;
    domeGroup.add(trunk);

    const canopy = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.58, 1),
      new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.5 })
    );
    canopy.position.y = 0.95;
    domeGroup.add(canopy);

    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(1.3, 0.04, 12, 48),
      new THREE.MeshBasicMaterial({ color: 0x4ade80 })
    );
    halo.rotation.x = Math.PI / 2;
    halo.position.y = 0.15;
    domeGroup.add(halo);

    scene.add(domeGroup);
    animatedItems.push({ obj: domeGroup, mode: 'spin', speed: 0.35, baseY: 1.3, phase: 0 });

    // Wooden ceiling pergola beams
    const beamMat = new THREE.MeshStandardMaterial({ color: 0x3f2e1e, roughness: 0.85 });
    for (let z = -12; z <= 12; z += 6) {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(floorSize * 0.9, 0.28, 0.35), beamMat);
      beam.position.set(0, 9.6, z);
      scene.add(beam);
    }

    // Perimeter potted trees
    for (let i = 0; i < decorCount; i++) {
      const ang = (i / decorCount) * Math.PI * 2 + Math.PI / 8;
      const px = Math.cos(ang) * decorRadius;
      const pz = Math.sin(ang) * decorRadius;

      const treeGroup = new THREE.Group();
      treeGroup.position.set(px, 0, pz);

      const pot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.58, 0.45, 0.9, 16),
        new THREE.MeshStandardMaterial({ color: 0x7c4a2d, roughness: 0.7 })
      );
      pot.position.y = 0.45;
      treeGroup.add(pot);

      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.16, 1.8, 10),
        new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.9 })
      );
      stem.position.y = 1.6;
      treeGroup.add(stem);

      const leaves1 = new THREE.Mesh(
        new THREE.ConeGeometry(1.05, 1.6, 10),
        new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.6 })
      );
      leaves1.position.y = 2.6;
      treeGroup.add(leaves1);

      const leaves2 = new THREE.Mesh(
        new THREE.ConeGeometry(0.75, 1.3, 10),
        new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.55 })
      );
      leaves2.position.y = 3.45;
      treeGroup.add(leaves2);

      scene.add(treeGroup);
    }
  } else if (styleId === 'science') {
    // Centerpiece: Spinning 3D DNA Double Helix Sculpture
    const dnaGroup = new THREE.Group();
    dnaGroup.position.set(0, 0.85, 0);

    const turns = 12;
    const heightStep = 0.24;
    const dnaRadius = 0.62;
    const strandMatA = new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x0891b2, emissiveIntensity: 0.4, metalness: 0.5, roughness: 0.2 });
    const strandMatB = new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x059669, emissiveIntensity: 0.4, metalness: 0.5, roughness: 0.2 });
    const rungMat = new THREE.MeshStandardMaterial({ color: 0xfde047, emissive: 0xca8a04, emissiveIntensity: 0.3, roughness: 0.3 });

    for (let i = 0; i < turns; i++) {
      const a = i * 0.55;
      const y = i * heightStep;
      const x1 = Math.cos(a) * dnaRadius;
      const z1 = Math.sin(a) * dnaRadius;
      const x2 = -x1;
      const z2 = -z1;

      const n1 = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 14), strandMatA);
      n1.position.set(x1, y, z1);
      dnaGroup.add(n1);

      const n2 = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 14), strandMatB);
      n2.position.set(x2, y, z2);
      dnaGroup.add(n2);

      const rung = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, dnaRadius * 2, 8), rungMat);
      rung.position.set(0, y, 0);
      rung.rotation.z = Math.PI / 2;
      rung.rotation.y = -a;
      dnaGroup.add(rung);
    }

    scene.add(dnaGroup);
    animatedItems.push({ obj: dnaGroup, mode: 'spin', speed: 0.7, baseY: 0.85, phase: 0 });

    // Overhead Cleanroom Light Ring
    const labRing = new THREE.Mesh(
      new THREE.TorusGeometry(6.5, 0.14, 16, 64),
      new THREE.MeshBasicMaterial({ color: 0x22d3ee })
    );
    labRing.rotation.x = Math.PI / 2;
    labRing.position.set(0, 8.8, 0);
    scene.add(labRing);

    // Perimeter Lab Beaker & Flask Pedestals
    for (let i = 0; i < decorCount; i++) {
      const ang = (i / decorCount) * Math.PI * 2 + Math.PI / 8;
      const px = Math.cos(ang) * decorRadius;
      const pz = Math.sin(ang) * decorRadius;

      const labStand = new THREE.Group();
      labStand.position.set(px, 0, pz);

      const col = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 2.0, 0.9),
        new THREE.MeshStandardMaterial({ color: 0x0f2936, metalness: 0.6, roughness: 0.3 })
      );
      col.position.y = 1.0;
      labStand.add(col);

      const flask = new THREE.Mesh(
        new THREE.ConeGeometry(0.36, 0.85, 16),
        new THREE.MeshStandardMaterial({
          color: i % 2 === 0 ? 0x22d3ee : 0x34d399,
          emissive: i % 2 === 0 ? 0x0891b2 : 0x059669,
          emissiveIntensity: 0.55,
          transparent: true,
          opacity: 0.85,
        })
      );
      flask.position.y = 2.45;
      labStand.add(flask);

      scene.add(labStand);
    }
  } else if (styleId === 'classroom') {
    // Centerpiece: Science Globe & Knowledge Halo
    const globeGroup = new THREE.Group();
    globeGroup.position.set(0, 1.5, 0);

    const globe = new THREE.Mesh(
      new THREE.SphereGeometry(0.75, 24, 24),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4, metalness: 0.2 })
    );
    globeGroup.add(globe);

    const continentRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.92, 0.045, 12, 48),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.7, roughness: 0.25 })
    );
    continentRing.rotation.x = Math.PI / 5;
    globeGroup.add(continentRing);

    scene.add(globeGroup);
    animatedItems.push({ obj: globeGroup, mode: 'spin-bob', speed: 0.55, baseY: 1.5, phase: 0 });

    // Wooden classroom bookshelves around perimeter
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x6b4226, roughness: 0.75 });
    const bookColors = [0xef4444, 0x3b82f6, 0x22c55e, 0xf59e0b, 0xa855f7];
    for (let i = 0; i < decorCount; i++) {
      const ang = (i / decorCount) * Math.PI * 2 + Math.PI / 8;
      const px = Math.cos(ang) * decorRadius;
      const pz = Math.sin(ang) * decorRadius;

      const shelf = new THREE.Group();
      shelf.position.set(px, 0, pz);
      shelf.lookAt(0, 0, 0);

      const cabinet = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.8, 0.55), woodMat);
      cabinet.position.y = 1.4;
      shelf.add(cabinet);

      for (let b = 0; b < 4; b++) {
        const book = new THREE.Mesh(
          new THREE.BoxGeometry(0.2, 0.55, 0.42),
          new THREE.MeshStandardMaterial({ color: bookColors[(i + b) % bookColors.length], roughness: 0.6 })
        );
        book.position.set(-0.42 + b * 0.28, 3.08, 0);
        shelf.add(book);
      }

      scene.add(shelf);
    }
  } else if (styleId === 'future') {
    // Centerpiece: Holographic Gyroscopic Bio-Core (3 rotating rings + pulsing core)
    const coreGroup = new THREE.Group();
    coreGroup.position.set(0, 1.85, 0);

    const coreSphere = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.5, 1),
      new THREE.MeshStandardMaterial({ color: 0x2dd4bf, emissive: 0x14b8a6, emissiveIntensity: 0.9, roughness: 0.1 })
    );
    coreGroup.add(coreSphere);

    const ring1 = new THREE.Mesh(
      new THREE.TorusGeometry(0.95, 0.04, 12, 48),
      new THREE.MeshBasicMaterial({ color: 0x2dd4bf })
    );
    ring1.rotation.x = Math.PI / 3;
    coreGroup.add(ring1);

    const ring2 = new THREE.Mesh(
      new THREE.TorusGeometry(1.2, 0.04, 12, 48),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    ring2.rotation.y = Math.PI / 3;
    coreGroup.add(ring2);

    scene.add(coreGroup);
    animatedItems.push({ obj: coreGroup, mode: 'tilt-spin', speed: 0.85, baseY: 1.85, phase: 0 });
    animatedItems.push({ obj: ring1, mode: 'spin', speed: 1.4, baseY: 0, phase: 1 });

    // Glowing Futuristic Light Monolith Pillars
    for (let i = 0; i < decorCount; i++) {
      const ang = (i / decorCount) * Math.PI * 2 + Math.PI / 8;
      const px = Math.cos(ang) * decorRadius;
      const pz = Math.sin(ang) * decorRadius;

      const pillarGroup = new THREE.Group();
      pillarGroup.position.set(px, 0, pz);
      pillarGroup.lookAt(0, 0, 0);

      const monolith = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 5.2, 0.7),
        new THREE.MeshStandardMaterial({ color: 0x0c242b, metalness: 0.85, roughness: 0.15 })
      );
      monolith.position.y = 2.6;
      pillarGroup.add(monolith);

      const neonStrip = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 4.8, 0.74),
        new THREE.MeshBasicMaterial({ color: 0x14b8a6 })
      );
      neonStrip.position.y = 2.6;
      pillarGroup.add(neonStrip);

      const floatDiamond = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.32, 0),
        new THREE.MeshBasicMaterial({ color: 0x5eead4, wireframe: true })
      );
      floatDiamond.position.y = 5.85;
      pillarGroup.add(floatDiamond);
      animatedItems.push({ obj: floatDiamond, mode: 'spin-bob', speed: 1.2, baseY: 5.85, phase: i });

      scene.add(pillarGroup);
    }
  } else if (styleId === 'classic') {
    // Centerpiece: Golden Museum Astrolabe / Brass Orrery
    const brassGroup = new THREE.Group();
    brassGroup.position.set(0, 1.7, 0);

    const brassMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.85, roughness: 0.2 });
    const outerRing = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.06, 16, 48), brassMat);
    const innerRing = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.05, 16, 48), brassMat);
    innerRing.rotation.y = Math.PI / 2;
    const sunOrb = new THREE.Mesh(new THREE.SphereGeometry(0.28, 20, 20), brassMat);
    brassGroup.add(outerRing, innerRing, sunOrb);

    scene.add(brassGroup);
    animatedItems.push({ obj: brassGroup, mode: 'spin', speed: 0.5, baseY: 1.7, phase: 0 });

    // Classical Fluted Museum Marble Columns
    const marbleMat = new THREE.MeshStandardMaterial({ color: 0xe7dcc8, roughness: 0.35, metalness: 0.1 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8, roughness: 0.25 });
    for (let i = 0; i < decorCount; i++) {
      const ang = (i / decorCount) * Math.PI * 2 + Math.PI / 8;
      const px = Math.cos(ang) * decorRadius;
      const pz = Math.sin(ang) * decorRadius;

      const colGroup = new THREE.Group();
      colGroup.position.set(px, 0, pz);

      const plinth = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.5, 1.2), marbleMat);
      plinth.position.y = 0.25;
      colGroup.add(plinth);

      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.48, 6.2, 16), marbleMat);
      shaft.position.y = 3.6;
      colGroup.add(shaft);

      const capital = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.45, 1.25), goldMat);
      capital.position.y = 6.9;
      colGroup.add(capital);

      scene.add(colGroup);
    }
  } else if (styleId === 'cultural') {
    // Centerpiece: Traditional Ceramic Vase & Golden Lotus
    const lotusGroup = new THREE.Group();
    lotusGroup.position.set(0, 1.0, 0);

    const vase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.45, 0.65, 1.15, 20),
      new THREE.MeshStandardMaterial({ color: 0xc2410c, roughness: 0.4, metalness: 0.25 })
    );
    vase.position.y = 0.45;
    lotusGroup.add(vase);

    const lotusCore = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.45, 1),
      new THREE.MeshStandardMaterial({ color: 0xfb923c, emissive: 0x9a3412, emissiveIntensity: 0.45, roughness: 0.3 })
    );
    lotusCore.position.y = 1.4;
    lotusGroup.add(lotusCore);

    scene.add(lotusGroup);
    animatedItems.push({ obj: lotusGroup, mode: 'spin', speed: 0.4, baseY: 1.0, phase: 0 });

    // Bamboo pillars & Hanging Warm Amber Paper Lanterns
    const bambooMat = new THREE.MeshStandardMaterial({ color: 0x926239, roughness: 0.7 });
    const lanternMat = new THREE.MeshStandardMaterial({
      color: 0xfdba74,
      emissive: 0xf97316,
      emissiveIntensity: 0.7,
      roughness: 0.4,
    });
    for (let i = 0; i < decorCount; i++) {
      const ang = (i / decorCount) * Math.PI * 2 + Math.PI / 8;
      const px = Math.cos(ang) * decorRadius;
      const pz = Math.sin(ang) * decorRadius;

      const pavilionPillar = new THREE.Group();
      pavilionPillar.position.set(px, 0, pz);

      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 7.2, 12), bambooMat);
      post.position.y = 3.6;
      pavilionPillar.add(post);

      const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.48, 16, 16), lanternMat);
      lantern.scale.y = 1.25;
      lantern.position.set(0, 5.4, 0);
      pavilionPillar.add(lantern);
      animatedItems.push({ obj: lantern, mode: 'bob', speed: 1.3, baseY: 5.4, phase: i * 0.7 });

      scene.add(pavilionPillar);
    }
  } else {
    // 'custom': Bioluminescent Bio-Glow Sanctuary
    const bioGlowGroup = new THREE.Group();
    bioGlowGroup.position.set(0, 1.75, 0);

    const glowMat = new THREE.MeshStandardMaterial({
      color: 0x34d399,
      emissive: 0x10b981,
      emissiveIntensity: 0.85,
      roughness: 0.15,
    });
    const jellyCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.85, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      glowMat
    );
    bioGlowGroup.add(jellyCap);

    const haloRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.15, 0.04, 12, 48),
      new THREE.MeshBasicMaterial({ color: 0x6ee7b7 })
    );
    haloRing.rotation.x = Math.PI / 2;
    bioGlowGroup.add(haloRing);

    scene.add(bioGlowGroup);
    animatedItems.push({ obj: bioGlowGroup, mode: 'spin-bob', speed: 0.7, baseY: 1.75, phase: 0 });

    // Bioluminescent crystal spires around perimeter
    for (let i = 0; i < decorCount; i++) {
      const ang = (i / decorCount) * Math.PI * 2 + Math.PI / 8;
      const px = Math.cos(ang) * decorRadius;
      const pz = Math.sin(ang) * decorRadius;

      const crystalSpire = new THREE.Mesh(
        new THREE.ConeGeometry(0.55, 3.8 + (i % 3) * 0.8, 6),
        new THREE.MeshStandardMaterial({
          color: i % 2 === 0 ? 0x10b981 : 0x06b6d4,
          emissive: i % 2 === 0 ? 0x059669 : 0x0891b2,
          emissiveIntensity: 0.65,
          roughness: 0.2,
          metalness: 0.3,
        })
      );
      crystalSpire.position.set(px, 1.9, pz);
      scene.add(crystalSpire);
    }
  }

  // 4. Subtle Ambient Floating Bio-Particles tuned to style accent color
  const particleCount = 120;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 34;
    positions[i * 3 + 1] = 0.8 + Math.random() * 7.5;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 34;
  }
  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: styleConfig.accentColor,
    size: 0.14,
    transparent: true,
    opacity: 0.65,
  });
  const particleSystem = new THREE.Points(particleGeo, particleMat);
  scene.add(particleSystem);

  return { animatedItems, particleSystem };
}
