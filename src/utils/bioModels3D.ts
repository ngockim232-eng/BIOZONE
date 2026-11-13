import * as THREE from 'three';

export type BioModelId = 'dna' | 'virus' | 'cell' | 'heart' | 'respiratory';

export interface BioModelMeta {
  id: BioModelId;
  shortLabel: string;
  title: string;
  emoji: string;
  accentColor: string;
  bgTint: number;
  legend: string;
}

export const BIO_MODELS: BioModelMeta[] = [
  {
    id: 'dna',
    shortLabel: 'DNA',
    title: 'DNA Xoắn Kép',
    emoji: '🧬',
    accentColor: 'text-emerald-700',
    bgTint: 0xe6f9f2,
    legend: 'A — T  |  G — C • Chuỗi xoắn kép di truyền',
  },
  {
    id: 'virus',
    shortLabel: 'Virus',
    title: 'Cấu Trúc Virus',
    emoji: '🦠',
    accentColor: 'text-rose-700',
    bgTint: 0xfdf2f8,
    legend: 'Vỏ Capsid • Gai Glycoprotein • Lõi RNA xoắn',
  },
  {
    id: 'cell',
    shortLabel: 'Tế bào',
    title: 'Tế Bào Thực Vật',
    emoji: '🔬',
    accentColor: 'text-teal-700',
    bgTint: 0xecfdf5,
    legend: 'Nhân • Lục lạp • Ti thể • Không bào',
  },
  {
    id: 'heart',
    shortLabel: 'Tuần hoàn',
    title: 'Hệ Tuần Hoàn (Tim)',
    emoji: '🫀',
    accentColor: 'text-red-700',
    bgTint: 0xfff1f2,
    legend: 'Tim • Động mạch chủ (đỏ) • Tĩnh mạch (xanh)',
  },
  {
    id: 'respiratory',
    shortLabel: 'Hô hấp',
    title: 'Hệ Hô Hấp (Phổi)',
    emoji: '🫁',
    accentColor: 'text-sky-700',
    bgTint: 0xf0f9ff,
    legend: 'Khí quản • Phế quản • Hai lá phổi • Cơ hoành',
  },
];

export interface BuiltBioModels {
  groups: Record<BioModelId, THREE.Group>;
  animatedRefs: {
    virusSpikes: THREE.Group | null;
    virusCore: THREE.Mesh | null;
    cellOrganelles: THREE.Group | null;
    heartLobes: THREE.Group | null;
    lungsGroup: THREE.Group | null;
    diaphragm: THREE.Mesh | null;
  };
  dispose: () => void;
}

const _upVec = new THREE.Vector3(0, 1, 0);

export function buildAllBioModels(): BuiltBioModels {
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];

  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    geometries.push(g);
    return g;
  };
  const trackMat = <T extends THREE.Material>(m: T): T => {
    materials.push(m);
    return m;
  };

  // =========================================================================
  // 1. DNA DOUBLE HELIX
  // =========================================================================
  const dnaGroup = new THREE.Group();
  dnaGroup.rotation.z = 0.26;
  {
    const numPairs = 14;
    const heightSpan = 6.6;
    const radius = 1.25;
    const turns = 1.45;

    const strandAPoints: THREE.Vector3[] = [];
    const strandBPoints: THREE.Vector3[] = [];
    for (let i = 0; i <= 60; i++) {
      const t = i / 60;
      const angle = t * Math.PI * 2 * turns;
      const y = (t - 0.5) * heightSpan;
      strandAPoints.push(new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius));
      strandBPoints.push(
        new THREE.Vector3(Math.cos(angle + Math.PI) * radius, y, Math.sin(angle + Math.PI) * radius)
      );
    }

    const tubeGeoA = trackGeo(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(strandAPoints), 72, 0.105, 12, false));
    const tubeGeoB = trackGeo(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(strandBPoints), 72, 0.105, 12, false));

    const strandMatA = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0x10b981,
        emissive: 0x065f46,
        emissiveIntensity: 0.35,
        roughness: 0.22,
        metalness: 0.35,
        clearcoat: 0.9,
        clearcoatRoughness: 0.15,
      })
    );
    const strandMatB = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0x06b6d4,
        emissive: 0x0e7490,
        emissiveIntensity: 0.35,
        roughness: 0.22,
        metalness: 0.35,
        clearcoat: 0.9,
        clearcoatRoughness: 0.15,
      })
    );

    dnaGroup.add(new THREE.Mesh(tubeGeoA, strandMatA));
    dnaGroup.add(new THREE.Mesh(tubeGeoB, strandMatB));

    const baseMats = [
      trackMat(new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.35, metalness: 0.15, emissive: 0x78350f, emissiveIntensity: 0.2 })),
      trackMat(new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.35, metalness: 0.15, emissive: 0x881337, emissiveIntensity: 0.2 })),
      trackMat(new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.35, metalness: 0.15, emissive: 0x14532d, emissiveIntensity: 0.2 })),
      trackMat(new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.35, metalness: 0.15, emissive: 0x0c4a6e, emissiveIntensity: 0.2 })),
    ];
    const phosphateMat = trackMat(new THREE.MeshStandardMaterial({ color: 0xecfdf5, roughness: 0.18, metalness: 0.65 }));
    const bondNodeMat = trackMat(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.2, emissive: 0x34d399, emissiveIntensity: 0.4 }));

    const sphereGeo = trackGeo(new THREE.SphereGeometry(0.15, 14, 14));
    const bondGeo = trackGeo(new THREE.SphereGeometry(0.08, 10, 10));
    const rungHalfGeo = trackGeo(new THREE.CylinderGeometry(0.052, 0.052, radius * 0.88, 10));

    const posA = new THREE.Vector3();
    const posB = new THREE.Vector3();
    const mid = new THREE.Vector3();
    const dirAB = new THREE.Vector3();
    const quat = new THREE.Quaternion();

    for (let i = 0; i < numPairs; i++) {
      const t = (i + 0.5) / numPairs;
      const angle = t * Math.PI * 2 * turns;
      const y = (t - 0.5) * heightSpan;

      posA.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
      posB.set(Math.cos(angle + Math.PI) * radius, y, Math.sin(angle + Math.PI) * radius);
      mid.addVectors(posA, posB).multiplyScalar(0.5);

      const beadA = new THREE.Mesh(sphereGeo, phosphateMat);
      beadA.position.copy(posA);
      dnaGroup.add(beadA);

      const beadB = new THREE.Mesh(sphereGeo, phosphateMat);
      beadB.position.copy(posB);
      dnaGroup.add(beadB);

      const isAT = i % 2 === 0;
      const matLeft = isAT ? baseMats[0] : baseMats[2];
      const matRight = isAT ? baseMats[1] : baseMats[3];

      dirAB.subVectors(posB, posA).normalize();
      quat.setFromUnitVectors(_upVec, dirAB);

      const halfA = new THREE.Mesh(rungHalfGeo, matLeft);
      halfA.position.lerpVectors(posA, mid, 0.5);
      halfA.quaternion.copy(quat);
      dnaGroup.add(halfA);

      const halfB = new THREE.Mesh(rungHalfGeo, matRight);
      halfB.position.lerpVectors(mid, posB, 0.5);
      halfB.quaternion.copy(quat);
      dnaGroup.add(halfB);

      const bondBead = new THREE.Mesh(bondGeo, bondNodeMat);
      bondBead.position.copy(mid);
      dnaGroup.add(bondBead);
    }
  }

  // =========================================================================
  // 2. CORONAVIRUS / CAPSID VIRUS MODEL
  // =========================================================================
  const virusGroup = new THREE.Group();
  let virusSpikes: THREE.Group | null = null;
  let virusCore: THREE.Mesh | null = null;
  {
    const envelopeGeo = trackGeo(new THREE.IcosahedronGeometry(1.72, 2));
    const envelopeMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xa855f7,
        emissive: 0x581c87,
        emissiveIntensity: 0.25,
        roughness: 0.28,
        metalness: 0.12,
        clearcoat: 0.85,
        clearcoatRoughness: 0.2,
        transparent: true,
        opacity: 0.78,
        depthWrite: false,
      })
    );
    const envelopeMesh = new THREE.Mesh(envelopeGeo, envelopeMat);
    envelopeMesh.renderOrder = 2;
    virusGroup.add(envelopeMesh);

    // Inner coiled RNA genetic strand
    const rnaPts: THREE.Vector3[] = [];
    for (let i = 0; i <= 90; i++) {
      const u = (i / 90) * Math.PI * 6;
      const r = 0.65 + Math.sin(u * 0.5) * 0.25;
      rnaPts.push(new THREE.Vector3(Math.cos(u) * r, (i / 90 - 0.5) * 1.9, Math.sin(u) * r));
    }
    const rnaGeo = trackGeo(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rnaPts), 96, 0.11, 10, false));
    const rnaMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        emissive: 0xd97706,
        emissiveIntensity: 0.5,
        roughness: 0.25,
        metalness: 0.35,
      })
    );
    virusCore = new THREE.Mesh(rnaGeo, rnaMat);
    virusGroup.add(virusCore);

    // Spike glycoproteins distributed via Fibonacci sphere
    virusSpikes = new THREE.Group();
    const spikeStemGeo = trackGeo(new THREE.CylinderGeometry(0.08, 0.055, 0.72, 10));
    const spikeCrownGeo = trackGeo(new THREE.SphereGeometry(0.18, 12, 12));
    const membraneStudGeo = trackGeo(new THREE.SphereGeometry(0.11, 10, 10));

    const spikeStemMat = trackMat(
      new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.4, metalness: 0.15, emissive: 0x881337, emissiveIntensity: 0.2 })
    );
    const spikeCrownMat = trackMat(
      new THREE.MeshPhysicalMaterial({ color: 0xfb7185, roughness: 0.2, metalness: 0.1, clearcoat: 0.8, emissive: 0xe11d48, emissiveIntensity: 0.22 })
    );
    const studMat = trackMat(
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.3, metalness: 0.5, emissive: 0x0369a1, emissiveIntensity: 0.25 })
    );

    const numSpikes = 26;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const normalDir = new THREE.Vector3();
    const q = new THREE.Quaternion();

    for (let i = 0; i < numSpikes; i++) {
      const y = 1 - (i / (numSpikes - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = goldenAngle * i;
      normalDir.set(Math.cos(theta) * r, y, Math.sin(theta) * r).normalize();

      const spikeNode = new THREE.Group();
      spikeNode.position.copy(normalDir).multiplyScalar(1.66);
      q.setFromUnitVectors(_upVec, normalDir);
      spikeNode.quaternion.copy(q);

      const stem = new THREE.Mesh(spikeStemGeo, spikeStemMat);
      stem.position.y = 0.34;
      spikeNode.add(stem);

      // 3-lobed glycoprotein head
      for (let k = 0; k < 3; k++) {
        const a = (k / 3) * Math.PI * 2;
        const lobe = new THREE.Mesh(spikeCrownGeo, spikeCrownMat);
        lobe.position.set(Math.cos(a) * 0.12, 0.72, Math.sin(a) * 0.12);
        spikeNode.add(lobe);
      }

      virusSpikes.add(spikeNode);
    }

    // Membrane protein studs between spikes
    for (let i = 0; i < 20; i++) {
      const y = 1 - ((i + 0.5) / 20) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = goldenAngle * (i + 13);
      normalDir.set(Math.cos(theta) * r, y, Math.sin(theta) * r).normalize();
      const stud = new THREE.Mesh(membraneStudGeo, studMat);
      stud.position.copy(normalDir).multiplyScalar(1.74);
      virusSpikes.add(stud);
    }

    virusGroup.add(virusSpikes);
  }

  // =========================================================================
  // 3. EUKARYOTIC PLANT CELL (Cutaway Organelles)
  // =========================================================================
  const cellGroup = new THREE.Group();
  let cellOrganelles: THREE.Group | null = null;
  {
    // Outer translucent cell wall bowl (lower hemisphere + cutaway rim)
    const wallGeo = trackGeo(new THREE.SphereGeometry(2.35, 36, 24, 0, Math.PI * 2, Math.PI * 0.36, Math.PI * 0.64));
    const wallMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0x10b981,
        emissive: 0x064e3b,
        emissiveIntensity: 0.2,
        roughness: 0.35,
        metalness: 0.1,
        clearcoat: 0.75,
        side: THREE.DoubleSide,
      })
    );
    const cellWall = new THREE.Mesh(wallGeo, wallMat);
    cellGroup.add(cellWall);

    // Cytoplasm cutaway flat disc inside
    const cytoRadius = Math.sin(Math.PI * 0.36) * 2.28;
    const cytoY = Math.cos(Math.PI * 0.36) * 2.28;
    const cytoGeo = trackGeo(new THREE.CircleGeometry(cytoRadius, 36));
    const cytoMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xa7f3d0,
        roughness: 0.55,
        metalness: 0.05,
        side: THREE.DoubleSide,
      })
    );
    const cytoDisc = new THREE.Mesh(cytoGeo, cytoMat);
    cytoDisc.rotation.x = -Math.PI / 2;
    cytoDisc.position.y = cytoY - 0.03;
    cellGroup.add(cytoDisc);

    // Thick plasma membrane rim ring
    const rimGeo = trackGeo(new THREE.TorusGeometry(cytoRadius + 0.04, 0.11, 14, 48));
    const rimMat = trackMat(
      new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.25, metalness: 0.25 })
    );
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    rimMesh.rotation.x = Math.PI / 2;
    rimMesh.position.y = cytoY;
    cellGroup.add(rimMesh);

    cellOrganelles = new THREE.Group();

    // Nucleus + Nucleolus
    const nucleusGeo = trackGeo(new THREE.SphereGeometry(0.72, 24, 24));
    const nucleusMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0x8b5cf6,
        emissive: 0x4c1d95,
        emissiveIntensity: 0.25,
        roughness: 0.28,
        clearcoat: 0.65,
        transparent: true,
        opacity: 0.85,
      })
    );
    const nucleus = new THREE.Mesh(nucleusGeo, nucleusMat);
    nucleus.position.set(-0.58, cytoY + 0.36, -0.35);
    cellOrganelles.add(nucleus);

    const nucleolusGeo = trackGeo(new THREE.SphereGeometry(0.28, 16, 16));
    const nucleolusMat = trackMat(
      new THREE.MeshStandardMaterial({ color: 0x4c1d95, emissive: 0x3b0764, emissiveIntensity: 0.4, roughness: 0.4 })
    );
    const nucleolus = new THREE.Mesh(nucleolusGeo, nucleolusMat);
    nucleolus.position.set(-0.58, cytoY + 0.42, -0.35);
    cellOrganelles.add(nucleolus);

    // Central Vacuole (large sky-blue translucent sac)
    const vacGeo = trackGeo(new THREE.SphereGeometry(0.86, 24, 20));
    const vacMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.2,
        roughness: 0.15,
        clearcoat: 1.0,
        transparent: true,
        opacity: 0.72,
      })
    );
    const vacuole = new THREE.Mesh(vacGeo, vacMat);
    vacuole.scale.set(1.15, 0.68, 0.95);
    vacuole.position.set(0.68, cytoY + 0.24, 0.22);
    cellOrganelles.add(vacuole);

    // Endoplasmic Reticulum curved folds wrapping nucleus
    const erMat = trackMat(new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.45, metalness: 0.1 }));
    for (let r = 0; r < 2; r++) {
      const erGeo = trackGeo(new THREE.TorusGeometry(0.92 + r * 0.22, 0.065, 10, 28, Math.PI * 1.15));
      const erMesh = new THREE.Mesh(erGeo, erMat);
      erMesh.rotation.x = Math.PI / 2;
      erMesh.rotation.z = 1.9 + r * 0.25;
      erMesh.position.set(-0.58, cytoY + 0.15 + r * 0.08, -0.35);
      cellOrganelles.add(erMesh);
    }

    // Chloroplasts (bright green capsules with stacked thylakoids)
    const chloroGeo = trackGeo(new THREE.CapsuleGeometry(0.22, 0.36, 8, 16));
    const chloroMat = trackMat(
      new THREE.MeshStandardMaterial({ color: 0x16a34a, emissive: 0x14532d, emissiveIntensity: 0.25, roughness: 0.3 })
    );
    const chloroPositions: [number, number, number, number][] = [
      [0.2, cytoY + 0.18, -1.25, 0.4],
      [-1.35, cytoY + 0.16, 0.65, -0.7],
      [0.95, cytoY + 0.18, -0.82, 1.1],
      [-0.25, cytoY + 0.17, 1.35, 0.2],
    ];
    chloroPositions.forEach(([x, y, z, rot]) => {
      const c = new THREE.Mesh(chloroGeo, chloroMat);
      c.position.set(x, y, z);
      c.rotation.set(Math.PI / 2, 0, rot);
      cellOrganelles!.add(c);
    });

    // Mitochondria (warm orange capsules)
    const mitoGeo = trackGeo(new THREE.CapsuleGeometry(0.16, 0.32, 8, 14));
    const mitoMat = trackMat(
      new THREE.MeshStandardMaterial({ color: 0xf97316, emissive: 0x9a3412, emissiveIntensity: 0.25, roughness: 0.35 })
    );
    const mitoPositions: [number, number, number, number][] = [
      [-1.1, cytoY + 0.18, -1.05, 0.8],
      [0.55, cytoY + 0.18, 1.25, -0.5],
      [1.45, cytoY + 0.18, 0.2, 1.3],
    ];
    mitoPositions.forEach(([x, y, z, rot]) => {
      const m = new THREE.Mesh(mitoGeo, mitoMat);
      m.position.set(x, y, z);
      m.rotation.set(Math.PI / 2, 0, rot);
      cellOrganelles!.add(m);
    });

    cellGroup.add(cellOrganelles);
    cellGroup.rotation.x = 0.42; // Tilt toward viewer so organelles are vividly visible
    cellGroup.position.y = -0.35;
  }

  // =========================================================================
  // 4. CIRCULATORY SYSTEM (HEART & MAJOR VESSELS)
  // =========================================================================
  const heartGroup = new THREE.Group();
  let heartLobes: THREE.Group | null = null;
  {
    heartLobes = new THREE.Group();

    const myocardiumMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xe11d48,
        emissive: 0x881337,
        emissiveIntensity: 0.28,
        roughness: 0.32,
        metalness: 0.08,
        clearcoat: 0.65,
        clearcoatRoughness: 0.25,
      })
    );
    const arteryMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xef4444,
        emissive: 0x991b1b,
        emissiveIntensity: 0.25,
        roughness: 0.28,
        clearcoat: 0.55,
      })
    );
    const veinMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0x2563eb,
        emissive: 0x1e3a8a,
        emissiveIntensity: 0.28,
        roughness: 0.28,
        clearcoat: 0.55,
      })
    );

    // Sculpted asymmetric ventricles + atria
    const leftVentricleGeo = trackGeo(new THREE.SphereGeometry(1.18, 28, 24));
    const leftVentricle = new THREE.Mesh(leftVentricleGeo, myocardiumMat);
    leftVentricle.scale.set(0.92, 1.38, 0.88);
    leftVentricle.position.set(0.26, -0.35, 0);
    leftVentricle.rotation.z = 0.26;
    heartLobes.add(leftVentricle);

    const rightVentricleGeo = trackGeo(new THREE.SphereGeometry(0.95, 24, 20));
    const rightVentricle = new THREE.Mesh(rightVentricleGeo, myocardiumMat);
    rightVentricle.scale.set(0.95, 1.15, 0.85);
    rightVentricle.position.set(-0.46, -0.15, 0.14);
    rightVentricle.rotation.z = -0.18;
    heartLobes.add(rightVentricle);

    // Left & Right Atria
    const atriumGeo = trackGeo(new THREE.SphereGeometry(0.62, 20, 18));
    const rightAtrium = new THREE.Mesh(atriumGeo, veinMat);
    rightAtrium.position.set(-0.72, 0.72, 0.05);
    heartLobes.add(rightAtrium);

    const leftAtrium = new THREE.Mesh(atriumGeo, arteryMat);
    leftAtrium.position.set(0.7, 0.72, -0.05);
    heartLobes.add(leftAtrium);

    // Aortic Arch (thick red curving vessel arching overhead with 3 branches)
    const aortaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.15, 0.75, 0.12),
      new THREE.Vector3(0.05, 1.85, 0.08),
      new THREE.Vector3(0.55, 2.25, -0.1),
      new THREE.Vector3(0.92, 1.75, -0.35),
      new THREE.Vector3(0.65, -0.9, -0.55),
    ]);
    const aortaGeo = trackGeo(new THREE.TubeGeometry(aortaCurve, 44, 0.25, 14, false));
    heartLobes.add(new THREE.Mesh(aortaGeo, arteryMat));

    // 3 Carotid / Subclavian branches atop Aortic Arch
    const branchGeo = trackGeo(new THREE.CylinderGeometry(0.09, 0.11, 0.65, 10));
    [-0.12, 0.22, 0.56].forEach((bx, idx) => {
      const b = new THREE.Mesh(branchGeo, arteryMat);
      b.position.set(bx, 2.38 + (idx === 1 ? 0.1 : 0), -0.05);
      b.rotation.z = (idx - 1) * -0.18;
      heartLobes!.add(b);
    });

    // Superior Vena Cava (blue vessel)
    const venaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.75, 0.8, 0.05),
      new THREE.Vector3(-0.88, 1.65, 0.06),
      new THREE.Vector3(-0.92, 2.35, 0.02),
    ]);
    const venaGeo = trackGeo(new THREE.TubeGeometry(venaCurve, 24, 0.2, 12, false));
    heartLobes.add(new THREE.Mesh(venaGeo, veinMat));

    // Pulmonary Trunk (blue vessel bifurcating left/right)
    const pulmCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.22, 0.58, 0.42),
      new THREE.Vector3(-0.15, 1.38, 0.38),
      new THREE.Vector3(-0.95, 1.55, 0.18),
    ]);
    const pulmGeo = trackGeo(new THREE.TubeGeometry(pulmCurve, 24, 0.18, 12, false));
    heartLobes.add(new THREE.Mesh(pulmGeo, veinMat));

    // Surface Coronary Vessels
    const corCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.05, 0.45, 0.85),
      new THREE.Vector3(-0.12, -0.25, 0.96),
      new THREE.Vector3(0.18, -1.15, 0.72),
    ]);
    const corGeo = trackGeo(new THREE.TubeGeometry(corCurve, 24, 0.045, 8, false));
    heartLobes.add(new THREE.Mesh(corGeo, arteryMat));

    heartGroup.add(heartLobes);
    heartGroup.position.y = -0.25;
  }

  // =========================================================================
  // 5. RESPIRATORY SYSTEM (TRACHEA, BRONCHI, LUNGS & DIAPHRAGM)
  // =========================================================================
  const respGroup = new THREE.Group();
  let lungsGroup: THREE.Group | null = null;
  let diaphragm: THREE.Mesh | null = null;
  {
    const cartilageMat = trackMat(
      new THREE.MeshStandardMaterial({ color: 0xe0f2fe, roughness: 0.3, metalness: 0.15 })
    );
    const tracheaMat = trackMat(
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.4, metalness: 0.1 })
    );
    const lungMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xfb7185,
        emissive: 0xbe123c,
        emissiveIntensity: 0.2,
        roughness: 0.42,
        metalness: 0.05,
        clearcoat: 0.5,
        transparent: true,
        opacity: 0.88,
      })
    );
    const bronchusMat = trackMat(
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.35 })
    );
    const diaphragmMat = trackMat(
      new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.45, side: THREE.DoubleSide })
    );

    // Trachea tube + cartilaginous rings
    const tracheaGeo = trackGeo(new THREE.CylinderGeometry(0.24, 0.24, 2.25, 18));
    const trachea = new THREE.Mesh(tracheaGeo, tracheaMat);
    trachea.position.set(0, 1.5, 0);
    respGroup.add(trachea);

    const ringGeo = trackGeo(new THREE.TorusGeometry(0.26, 0.045, 10, 24));
    for (let i = 0; i < 9; i++) {
      const ring = new THREE.Mesh(ringGeo, cartilageMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(0, 0.65 + i * 0.21, 0);
      respGroup.add(ring);
    }

    // Left & Right Main Bronchi
    const leftBronchusCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.5, 0),
      new THREE.Vector3(-0.6, 0.15, 0),
      new THREE.Vector3(-1.15, -0.35, 0.05),
    ]);
    const rightBronchusCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.5, 0),
      new THREE.Vector3(0.6, 0.15, 0),
      new THREE.Vector3(1.15, -0.35, 0.05),
    ]);
    respGroup.add(new THREE.Mesh(trackGeo(new THREE.TubeGeometry(leftBronchusCurve, 20, 0.15, 10, false)), bronchusMat));
    respGroup.add(new THREE.Mesh(trackGeo(new THREE.TubeGeometry(rightBronchusCurve, 20, 0.15, 10, false)), bronchusMat));

    // Lungs (Multi-lobed composite)
    lungsGroup = new THREE.Group();
    const upperLobeGeo = trackGeo(new THREE.SphereGeometry(0.88, 24, 20));
    const lowerLobeGeo = trackGeo(new THREE.SphereGeometry(1.06, 24, 20));

    // Right lung (viewer's left) - 3-lobe silhouette
    const rUpper = new THREE.Mesh(upperLobeGeo, lungMat);
    rUpper.scale.set(0.85, 1.2, 0.8);
    rUpper.position.set(-1.18, 0.18, 0);
    rUpper.rotation.z = -0.22;
    lungsGroup.add(rUpper);

    const rLower = new THREE.Mesh(lowerLobeGeo, lungMat);
    rLower.scale.set(0.95, 1.15, 0.88);
    rLower.position.set(-1.32, -0.78, 0);
    lungsGroup.add(rLower);

    // Left lung (viewer's right) - 2-lobe silhouette with cardiac notch
    const lUpper = new THREE.Mesh(upperLobeGeo, lungMat);
    lUpper.scale.set(0.82, 1.18, 0.8);
    lUpper.position.set(1.18, 0.18, 0);
    lUpper.rotation.z = 0.22;
    lungsGroup.add(lUpper);

    const lLower = new THREE.Mesh(lowerLobeGeo, lungMat);
    lLower.scale.set(0.9, 1.1, 0.86);
    lLower.position.set(1.32, -0.78, 0);
    lungsGroup.add(lLower);

    respGroup.add(lungsGroup);

    // Curved Diaphragm dome below the lungs
    const diaphGeo = trackGeo(
      new THREE.SphereGeometry(2.3, 28, 14, 0, Math.PI * 2, 0, Math.PI * 0.28)
    );
    diaphragm = new THREE.Mesh(diaphGeo, diaphragmMat);
    diaphragm.scale.set(1.08, 0.42, 0.58);
    diaphragm.position.set(0, -1.85, 0);
    respGroup.add(diaphragm);
  }

  return {
    groups: {
      dna: dnaGroup,
      virus: virusGroup,
      cell: cellGroup,
      heart: heartGroup,
      respiratory: respGroup,
    },
    animatedRefs: {
      virusSpikes,
      virusCore,
      cellOrganelles,
      heartLobes,
      lungsGroup,
      diaphragm,
    },
    dispose: () => {
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
    },
  };
}
