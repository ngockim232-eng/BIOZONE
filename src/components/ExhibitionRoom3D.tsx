import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ExhibitionProduct, GalleryRoom, SpaceStyle } from '../types';
import { SPACE_STYLES } from '../utils/constants';
import { buildRoomDecorations } from '../utils/roomDecor3D';
import {
  RotateCcw,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Info,
  Layers,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Palette,
  Check,
  Presentation,
  X
} from 'lucide-react';

type PresentationStyle = 'spotlight' | 'orbit' | 'fast' | 'detailed';

const PRESENTATION_STYLE_OPTIONS: {
  id: PresentationStyle;
  label: string;
  shortLabel: string;
  durationMs: number;
  desc: string;
}[] = [
  {
    id: 'spotlight',
    label: '🎯 Cận cảnh từng bục (6s)',
    shortLabel: 'Cận cảnh 6s',
    durationMs: 6000,
    desc: 'Camera di chuyển mượt mà đến trước từng sản phẩm trưng bày',
  },
  {
    id: 'orbit',
    label: '🌀 Bay toàn cảnh 360° (6s)',
    shortLabel: 'Toàn cảnh 360°',
    durationMs: 6000,
    desc: 'Camera xoay vòng chậm quanh phòng trưng bày trong lúc giới thiệu',
  },
  {
    id: 'fast',
    label: '⚡ Thuyết trình nhanh (3.5s)',
    shortLabel: 'Nhanh 3.5s',
    durationMs: 3500,
    desc: 'Nhịp chuyển bục nhanh, phù hợp tổng hợp cuối tiết học',
  },
  {
    id: 'detailed',
    label: '🔍 Tham quan chi tiết (10s)',
    shortLabel: 'Chi tiết 10s',
    durationMs: 10000,
    desc: 'Dừng lâu hơn tại mỗi sản phẩm để học sinh quan sát kỹ',
  },
];

interface ExhibitionRoom3DProps {
  room: GalleryRoom;
  onSelectProduct: (product: ExhibitionProduct) => void;
  selectedProductId?: string | null;
  onToggleViewMode: () => void;
  onChangeSpaceStyle?: (style: SpaceStyle) => void;
}

export const ExhibitionRoom3D: React.FC<ExhibitionRoom3DProps> = ({
  room,
  onSelectProduct,
  selectedProductId,
  onToggleViewMode,
  onChangeSpaceStyle,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredProduct, setHoveredProduct] = useState<ExhibitionProduct | null>(null);
  const [isTourActive, setIsTourActive] = useState<boolean>(false);
  const [isPresentationSetupOpen, setIsPresentationSetupOpen] = useState<boolean>(false);
  const [presentationStyle, setPresentationStyle] = useState<PresentationStyle>('spotlight');
  const [tourIndex, setTourIndex] = useState<number>(0);
  const [isTourPaused, setIsTourPaused] = useState<boolean>(false);
  const [mobileControlsOpen, setMobileControlsOpen] = useState<boolean>(false);
  const [webglSupported, setWebglSupported] = useState<boolean>(true);
  const [activeStyle, setActiveStyle] = useState<SpaceStyle>(room.spaceStyle || 'eco');
  const [isStylePickerOpen, setIsStylePickerOpen] = useState<boolean>(false);

  // Sync activeStyle when room prop updates externally
  useEffect(() => {
    if (room.spaceStyle) {
      setActiveStyle(room.spaceStyle);
    }
  }, [room.spaceStyle]);

  // Refs to avoid stale closures inside Three.js animation & event listeners
  const isTourActiveRef = useRef<boolean>(false);
  useEffect(() => {
    isTourActiveRef.current = isTourActive;
  }, [isTourActive]);

  const presentationStyleRef = useRef<PresentationStyle>('spotlight');
  useEffect(() => {
    presentationStyleRef.current = presentationStyle;
  }, [presentationStyle]);

  const onSelectProductRef = useRef(onSelectProduct);
  useEffect(() => {
    onSelectProductRef.current = onSelectProduct;
  }, [onSelectProduct]);

  // References to three objects for interaction & animation
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const productMeshesRef = useRef<{ mesh: THREE.Group; product: ExhibitionProduct }[]>([]);
  const targetCameraPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 4, 18));
  const targetLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 1.5, 0));
  const currentLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 1.5, 0));

  // Mouse interaction state
  const isDragging = useRef<boolean>(false);
  const previousMousePosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cameraSpherical = useRef<{ radius: number; theta: number; phi: number }>({
    radius: 20,
    theta: Math.PI / 2,
    phi: Math.PI / 3,
  });

  const styleConfig = SPACE_STYLES[activeStyle] || SPACE_STYLES.eco;

  const handleSelectSpaceStyle = (styleId: SpaceStyle) => {
    setActiveStyle(styleId);
    setIsStylePickerOpen(false);
    if (onChangeSpaceStyle) {
      onChangeSpaceStyle(styleId);
    }
  };

  // Initialize Three.js scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setWebglSupported(false);
        return;
      }
    } catch {
      setWebglSupported(false);
      return;
    }

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 600;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(styleConfig.wallColor);
    scene.fog = new THREE.FogExp2(styleConfig.wallColor, 0.025);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 100);
    camera.position.set(0, 5, 20);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(styleConfig.lightColor, 0.85);
    scene.add(ambientLight);

    const mainCenterLight = new THREE.PointLight(styleConfig.accentColor, 1.5, 30);
    mainCenterLight.position.set(0, 8, 0);
    mainCenterLight.castShadow = true;
    scene.add(mainCenterLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(10, 15, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // 5. Room Geometry: Floor
    const floorSize = 40;
    const floorGeo = new THREE.PlaneGeometry(floorSize, floorSize, 32, 32);

    // Generate procedural grid texture for high aesthetic feel
    const floorCanvas = document.createElement('canvas');
    floorCanvas.width = 512;
    floorCanvas.height = 512;
    const ctx = floorCanvas.getContext('2d')!;
    ctx.fillStyle = `#${styleConfig.floorColor.toString(16).padStart(6, '0')}`;
    ctx.fillRect(0, 0, 512, 512);

    // Add subtle grid lines & marble accent
    ctx.strokeStyle = `#${styleConfig.accentColor.toString(16).padStart(6, '0')}33`;
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, 504, 504);
    ctx.lineWidth = 1;
    for (let i = 64; i < 512; i += 64) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 512);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(512, i);
      ctx.stroke();
    }

    const floorTexture = new THREE.CanvasTexture(floorCanvas);
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(8, 8);

    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTexture,
      roughness: 0.35,
      metalness: 0.15,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // Center circular carpet / emblem
    const centerGeo = new THREE.CircleGeometry(6, 64);
    const centerMat = new THREE.MeshStandardMaterial({
      color: styleConfig.accentColor,
      roughness: 0.5,
      transparent: true,
      opacity: 0.15,
    });
    const centerMesh = new THREE.Mesh(centerGeo, centerMat);
    centerMesh.rotation.x = -Math.PI / 2;
    centerMesh.position.y = 0.02;
    scene.add(centerMesh);

    // Center Exhibition Logo / Emblem Stand
    const centerStandGeo = new THREE.CylinderGeometry(1.2, 1.4, 0.4, 32);
    const centerStandMat = new THREE.MeshStandardMaterial({
      color: styleConfig.pedestalColor,
      metalness: 0.6,
      roughness: 0.2,
    });
    const centerStand = new THREE.Mesh(centerStandGeo, centerStandMat);
    centerStand.position.set(0, 0.2, 0);
    scene.add(centerStand);

    // Style-specific architectural decorations, centerpiece & per-room wall plaques
    const roomDecor = buildRoomDecorations(scene, activeStyle, styleConfig, room);

    // Walls
    const wallHeight = 10;
    const wallMat = new THREE.MeshStandardMaterial({
      color: styleConfig.wallColor,
      roughness: 0.8,
    });

    // Back Wall Banner
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(floorSize, wallHeight), wallMat);
    backWall.position.set(0, wallHeight / 2, -floorSize / 2);
    scene.add(backWall);

    // Front banner text above back wall
    const bannerCanvas = document.createElement('canvas');
    bannerCanvas.width = 1024;
    bannerCanvas.height = 256;
    const bCtx = bannerCanvas.getContext('2d')!;
    bCtx.fillStyle = '#0f172a';
    bCtx.fillRect(0, 0, 1024, 256);
    bCtx.strokeStyle = styleConfig.accentHex;
    bCtx.lineWidth = 8;
    bCtx.strokeRect(10, 10, 1004, 236);

    bCtx.fillStyle = '#f8fafc';
    bCtx.font = 'bold 44px sans-serif';
    bCtx.textAlign = 'center';
    bCtx.fillText(room.title.toUpperCase(), 512, 80);

    bCtx.fillStyle = styleConfig.accentHex;
    bCtx.font = 'bold 30px sans-serif';
    bCtx.fillText(`${room.theme} • GV: ${room.teacherName} • ${room.className}`, 512, 140);

    bCtx.fillStyle = '#94a3b8';
    bCtx.font = '22px sans-serif';
    bCtx.fillText(`MÃ PHÒNG: ${room.code} • ${room.schoolName}`, 512, 195);

    const bannerTexture = new THREE.CanvasTexture(bannerCanvas);
    const bannerGeo = new THREE.PlaneGeometry(16, 4);
    const bannerMat = new THREE.MeshBasicMaterial({ map: bannerTexture });
    const bannerMesh = new THREE.Mesh(bannerGeo, bannerMat);
    bannerMesh.position.set(0, 6.5, -floorSize / 2 + 0.1);
    scene.add(bannerMesh);

    // 6. Build Exhibition Podiums & Panels for each product
    const products = room.products || [];
    const count = products.length;
    const radius = Math.max(9, Math.min(14, count * 2));
    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin('anonymous');

    const meshItems: { mesh: THREE.Group; product: ExhibitionProduct }[] = [];

    products.forEach((product, idx) => {
      const angle = (idx / count) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      const group = new THREE.Group();
      group.position.set(x, 0, z);

      // Face toward center
      group.lookAt(0, 0, 0);

      // Podia / Pedestal
      const pedestalGeo = new THREE.CylinderGeometry(1.4, 1.6, 1.2, 24);
      const pedestalMat = new THREE.MeshStandardMaterial({
        color: styleConfig.pedestalColor,
        roughness: 0.3,
        metalness: 0.4,
      });
      const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
      pedestal.position.y = 0.6;
      pedestal.castShadow = true;
      pedestal.receiveShadow = true;
      group.add(pedestal);

      // Glowing Base Ring
      const ringGeo = new THREE.TorusGeometry(1.65, 0.06, 16, 48);
      const ringMat = new THREE.MeshBasicMaterial({
        color: styleConfig.accentColor,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.05;
      group.add(ring);

      // Dedicated Spotlight above each station
      const spot = new THREE.SpotLight(styleConfig.lightColor, 2.5);
      spot.position.set(x * 0.8, 6, z * 0.8);
      spot.target = group;
      spot.angle = Math.PI / 5;
      spot.penumbra = 0.4;
      scene.add(spot);

      // Frame / Display Canvas
      const frameWidth = 2.4;
      const frameHeight = 1.8;
      const frameGeo = new THREE.BoxGeometry(frameWidth + 0.15, frameHeight + 0.15, 0.12);
      const frameBorderMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        metalness: 0.8,
        roughness: 0.2,
      });
      const frameBorder = new THREE.Mesh(frameGeo, frameBorderMat);
      frameBorder.position.y = 2.4;
      frameBorder.castShadow = true;
      group.add(frameBorder);

      // Picture plane
      const picGeo = new THREE.PlaneGeometry(frameWidth, frameHeight);

      // Default canvas placeholder while loading
      const defaultPicCanvas = document.createElement('canvas');
      defaultPicCanvas.width = 512;
      defaultPicCanvas.height = 384;
      const pCtx = defaultPicCanvas.getContext('2d')!;
      pCtx.fillStyle = '#1e293b';
      pCtx.fillRect(0, 0, 512, 384);
      pCtx.fillStyle = '#e2e8f0';
      pCtx.font = 'bold 32px sans-serif';
      pCtx.textAlign = 'center';
      pCtx.fillText(product.title.substring(0, 20) + '...', 256, 180);
      pCtx.fillStyle = styleConfig.accentHex;
      pCtx.font = '24px sans-serif';
      pCtx.fillText(`Tác giả: ${product.author}`, 256, 230);

      const placeholderTex = new THREE.CanvasTexture(defaultPicCanvas);
      const picMat = new THREE.MeshBasicMaterial({ map: placeholderTex });
      const picMesh = new THREE.Mesh(picGeo, picMat);
      picMesh.position.set(0, 2.4, 0.07);
      group.add(picMesh);

      // Load actual image
      if (product.primaryImage) {
        textureLoader.load(
          product.primaryImage,
          (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            picMat.map = tex;
            picMat.needsUpdate = true;
          },
          undefined,
          () => {
            // keep fallback canvas
          }
        );
      }

      // Title & Author Plate on Pedestal
      const plateCanvas = document.createElement('canvas');
      plateCanvas.width = 512;
      plateCanvas.height = 160;
      const plCtx = plateCanvas.getContext('2d')!;
      plCtx.fillStyle = '#090d16';
      plCtx.fillRect(0, 0, 512, 160);
      plCtx.strokeStyle = styleConfig.accentHex;
      plCtx.lineWidth = 4;
      plCtx.strokeRect(4, 4, 504, 152);

      plCtx.fillStyle = '#38bdf8';
      plCtx.font = 'bold 36px sans-serif';
      plCtx.textAlign = 'center';
      plCtx.fillText(`SẢN PHẨM #${idx + 1}`, 256, 50);

      plCtx.fillStyle = '#f8fafc';
      plCtx.font = 'bold 30px sans-serif';
      const shortTitle = product.title.length > 25 ? product.title.substring(0, 24) + '…' : product.title;
      plCtx.fillText(shortTitle, 256, 95);

      plCtx.fillStyle = '#94a3b8';
      plCtx.font = '22px sans-serif';
      plCtx.fillText(`${product.author} (${product.className || room.className})`, 256, 135);

      const plateTex = new THREE.CanvasTexture(plateCanvas);
      const plateMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1.6, 0.5),
        new THREE.MeshBasicMaterial({ map: plateTex })
      );
      plateMesh.position.set(0, 0.8, 1.45);
      plateMesh.rotation.x = -Math.PI / 8;
      group.add(plateMesh);

      // Top Interactive Marker / Floating Beacon
      const beaconGeo = new THREE.ConeGeometry(0.2, 0.4, 8);
      const beaconMat = new THREE.MeshBasicMaterial({ color: styleConfig.accentColor });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.rotation.x = Math.PI;
      beacon.position.set(0, 3.7, 0);
      group.add(beacon);

      // Store in references and scene
      (group as any).userData = { product, index: idx };
      scene.add(group);
      meshItems.push({ mesh: group, product });
    });

    productMeshesRef.current = meshItems;

    // Raycaster for click & hover
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging.current = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      previousMousePosition.current = { x: clientX, y: clientY };
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      if (isDragging.current) {
        const deltaX = clientX - previousMousePosition.current.x;
        const deltaY = clientY - previousMousePosition.current.y;

        cameraSpherical.current.theta -= deltaX * 0.006;
        cameraSpherical.current.phi -= deltaY * 0.006;

        // Clamp vertical angle
        cameraSpherical.current.phi = Math.max(0.15, Math.min(Math.PI / 2.1, cameraSpherical.current.phi));

        previousMousePosition.current = { x: clientX, y: clientY };
      } else if (!('touches' in e)) {
        // Hover detection on desktop
        const rect = container.getBoundingClientRect();
        mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);

        let found: ExhibitionProduct | null = null;
        for (const hit of intersects) {
          let curr: THREE.Object3D | null = hit.object;
          while (curr && curr !== scene) {
            if (curr.userData && curr.userData.product) {
              found = curr.userData.product;
              break;
            }
            curr = curr.parent;
          }
          if (found) break;
        }
        setHoveredProduct(found);
      }
    };

    const handlePointerUp = (e: MouseEvent | TouchEvent) => {
      isDragging.current = false;
    };

    // Click / Tap detection for selecting an exhibit
    const handleClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      for (const hit of intersects) {
        let curr: THREE.Object3D | null = hit.object;
        while (curr && curr !== scene) {
          if (curr.userData && curr.userData.product) {
            const prod: ExhibitionProduct = curr.userData.product;
            focusOnProduct(prod);
            onSelectProductRef.current(prod);
            return;
          }
          curr = curr.parent;
        }
      }
    };

    // Wheel zoom
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraSpherical.current.radius += e.deltaY * 0.015;
      cameraSpherical.current.radius = Math.max(6, Math.min(28, cameraSpherical.current.radius));
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', handlePointerDown);
    domElement.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    domElement.addEventListener('click', handleClick);
    domElement.addEventListener('wheel', handleWheel, { passive: false });

    // Touch events for mobile
    domElement.addEventListener('touchstart', handlePointerDown, { passive: true });
    domElement.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchend', handlePointerUp);

    // Resize handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight || 600;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    // 7. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Gentle animation for style-specific centerpiece & room decor
      roomDecor.animatedItems.forEach((item) => {
        if (item.mode === 'spin') {
          item.obj.rotation.y = elapsedTime * item.speed;
        } else if (item.mode === 'bob') {
          item.obj.position.y = item.baseY + Math.sin(elapsedTime * item.speed + item.phase) * 0.16;
        } else if (item.mode === 'spin-bob') {
          item.obj.rotation.y = elapsedTime * item.speed;
          item.obj.position.y = item.baseY + Math.sin(elapsedTime * 1.8 + item.phase) * 0.14;
        } else if (item.mode === 'tilt-spin') {
          item.obj.rotation.y = elapsedTime * item.speed;
          item.obj.rotation.x = Math.sin(elapsedTime * 0.7) * 0.25;
        }
      });

      if (roomDecor.particleSystem) {
        roomDecor.particleSystem.rotation.y = elapsedTime * 0.03;
      }

      // Animate beacons
      meshItems.forEach((item, i) => {
        const beaconObj = item.mesh.children.find(c => c instanceof THREE.Mesh && c.geometry instanceof THREE.ConeGeometry);
        if (beaconObj) {
          beaconObj.position.y = 3.7 + Math.sin(elapsedTime * 2.5 + i) * 0.15;
          beaconObj.rotation.y = elapsedTime * 1.5;
        }
      });

      // Smooth camera interpolation towards spherical target or focus target
      if (!isTourActiveRef.current) {
        const { radius, theta, phi } = cameraSpherical.current;
        const targetX = targetLookAt.current.x + radius * Math.sin(phi) * Math.cos(theta);
        const targetY = targetLookAt.current.y + radius * Math.cos(phi);
        const targetZ = targetLookAt.current.z + radius * Math.sin(phi) * Math.sin(theta);

        camera.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), 0.08);
      } else if (presentationStyleRef.current === 'orbit') {
        const orbitAngle = elapsedTime * 0.28;
        const orbitRadius = 15.5;
        targetLookAt.current.set(0, 1.8, 0);
        const orbitPos = new THREE.Vector3(
          Math.cos(orbitAngle) * orbitRadius,
          5.2 + Math.sin(elapsedTime * 0.4) * 0.6,
          Math.sin(orbitAngle) * orbitRadius
        );
        camera.position.lerp(orbitPos, 0.04);
      } else {
        camera.position.lerp(targetCameraPos.current, 0.05);
      }

      currentLookAt.current.lerp(targetLookAt.current, 0.08);
      camera.lookAt(currentLookAt.current);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchend', handlePointerUp);
      domElement.removeEventListener('mousedown', handlePointerDown);
      domElement.removeEventListener('mousemove', handlePointerMove);
      domElement.removeEventListener('click', handleClick);
      domElement.removeEventListener('wheel', handleWheel);
      domElement.removeEventListener('touchstart', handlePointerDown);
      domElement.removeEventListener('touchmove', handlePointerMove);

      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          mesh.geometry?.dispose();
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          materials.forEach((mat) => {
            if (!mat) return;
            const stdMat = mat as THREE.MeshStandardMaterial;
            stdMat.map?.dispose();
            mat.dispose();
          });
        } else if ((obj as THREE.Points).isPoints) {
          const pts = obj as THREE.Points;
          pts.geometry?.dispose();
          const mats = Array.isArray(pts.material) ? pts.material : [pts.material];
          mats.forEach((m) => m?.dispose());
        }
      });

      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.dispose();
      }
    };
  }, [room.id, room.title, room.code, room.theme, room.teacherName, room.schoolName, room.className, room.hallOfFame, room.products, styleConfig, activeStyle]);

  // Focus camera smoothly on a specific product
  const focusOnProduct = (product: ExhibitionProduct) => {
    const item = productMeshesRef.current.find(m => m.product.id === product.id);
    if (!item) return;

    const pPos = item.mesh.position;
    // Look at center of exhibit frame
    targetLookAt.current.set(pPos.x, 2.3, pPos.z);

    // Place camera in front of the exhibit, slightly elevated
    const dir = new THREE.Vector3().subVectors(new THREE.Vector3(0, 0, 0), pPos).normalize();
    // In front: vector from podium towards gallery center
    const camX = pPos.x + dir.x * 4.2;
    const camZ = pPos.z + dir.z * 4.2;
    targetCameraPos.current.set(camX, 2.6, camZ);

    // Update spherical angles matching this viewpoint
    const dx = camX - pPos.x;
    const dz = camZ - pPos.z;
    cameraSpherical.current.radius = 4.8;
    cameraSpherical.current.theta = Math.atan2(dz, dx);
    cameraSpherical.current.phi = Math.PI / 2.3;
  };

  // Reset to bird's eye / overview position
  const handleResetView = () => {
    setIsTourActive(false);
    targetLookAt.current.set(0, 1.5, 0);
    cameraSpherical.current = {
      radius: 20,
      theta: Math.PI / 2,
      phi: Math.PI / 3,
    };
  };

  // Tour mode timer / step
  useEffect(() => {
    if (!isTourActive || isTourPaused || !room.products.length) return;

    const currentProd = room.products[tourIndex];
    if (currentProd && presentationStyle !== 'orbit') {
      focusOnProduct(currentProd);
    }

    const activeOpt =
      PRESENTATION_STYLE_OPTIONS.find((o) => o.id === presentationStyle) || PRESENTATION_STYLE_OPTIONS[0];

    const timer = setTimeout(() => {
      setTourIndex((prev) => (prev + 1) % room.products.length);
    }, activeOpt.durationMs);

    return () => clearTimeout(timer);
  }, [isTourActive, isTourPaused, tourIndex, room.products, presentationStyle]);

  const handleOpenPresentationSetup = () => {
    setIsStylePickerOpen(false);
    setIsPresentationSetupOpen(true);
  };

  const handleConfirmStartTour = () => {
    setIsPresentationSetupOpen(false);
    setIsTourActive(true);
    setIsTourPaused(false);
    setTourIndex(0);
    if (room.products.length > 0 && presentationStyle !== 'orbit') {
      focusOnProduct(room.products[0]);
    }
  };

  const handleStopTour = () => {
    setIsTourActive(false);
    handleResetView();
  };

  const handleTourNext = () => {
    if (!room.products.length) return;
    const nextIdx = (tourIndex + 1) % room.products.length;
    setTourIndex(nextIdx);
    if (presentationStyle !== 'orbit') {
      focusOnProduct(room.products[nextIdx]);
    }
  };

  const handleTourPrev = () => {
    if (!room.products.length) return;
    const prevIdx = (tourIndex - 1 + room.products.length) % room.products.length;
    setTourIndex(prevIdx);
    if (presentationStyle !== 'orbit') {
      focusOnProduct(room.products[prevIdx]);
    }
  };

  // Mobile virtual directional helper
  const handleVirtualMove = (dx: number, dy: number) => {
    cameraSpherical.current.theta += dx * 0.15;
    cameraSpherical.current.phi = Math.max(0.15, Math.min(Math.PI / 2.1, cameraSpherical.current.phi + dy * 0.1));
  };

  if (!webglSupported) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[480px] p-8 text-center bg-white border-2 border-emerald-200 rounded-3xl shadow-sm">
        <Layers className="w-16 h-16 text-emerald-600 mb-4 animate-bounce" />
        <h3 className="text-xl font-extrabold text-slate-900 mb-2">Chế độ 3D không khả dụng trên trình duyệt này</h3>
        <p className="text-slate-600 max-w-md mb-6">
          Thiết bị hoặc trình duyệt của bạn đang tắt tăng tốc phần cứng WebGL. Bạn có thể xem toàn bộ triển lãm với chất lượng đầy đủ ở chế độ 2D Gallery.
        </p>
        <button
          onClick={onToggleViewMode}
          className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-sky-500 hover:brightness-105 text-white font-bold rounded-xl shadow-md transition-all"
        >
          Chuyển sang Chế độ 2D Gallery
        </button>
      </div>
    );
  }

  const currentTourProduct = room.products[tourIndex];

  return (
    <div className="relative w-full h-[620px] md:h-[720px] bg-[#dff7ef] rounded-3xl overflow-hidden border-2 border-emerald-200 shadow-xl select-none group">
      {/* 3D Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Bar: Room Title & Mode Toggles */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none gap-2">
        <div className="pointer-events-auto flex items-center gap-3 bg-white/95 px-4 py-2 rounded-2xl border border-emerald-200 shadow-md">
          <span className="text-xl">{styleConfig.icon}</span>
          <div>
            <h2 className="text-sm md:text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span>{room.title}</span>
              <span className="text-xs px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold font-mono">
                {room.code}
              </span>
            </h2>
            <p className="text-xs text-slate-500 flex items-center gap-2 font-medium">
              <span>{styleConfig.badge}</span>
              <span>•</span>
              <span>{room.products.length} sản phẩm</span>
            </p>
          </div>
        </div>

        {/* View Mode Toggle + Live 3D Style Picker + Chiếu 3D */}
        <div className="pointer-events-auto flex items-center gap-2 relative">
          {room.products.length > 0 && !isTourActive && (
            <button
              onClick={handleOpenPresentationSetup}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:brightness-105 text-xs md:text-sm text-white font-bold shadow-md transition-all active:scale-95"
              title="Bắt đầu chiếu 3D và chọn phong cách trình chiếu"
            >
              <Presentation className="w-4 h-4" />
              <span className="hidden sm:inline">Chiếu 3D</span>
            </button>
          )}

          <button
            onClick={() => setIsStylePickerOpen((prev) => !prev)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/95 hover:bg-emerald-50 border border-emerald-200 text-xs md:text-sm text-emerald-700 transition-all shadow-md active:scale-95"
            title="Chọn phong cách không gian phòng trưng bày 3D"
          >
            <Palette className="w-4 h-4 text-emerald-600" />
            <span className="font-bold">Phong cách 3D</span>
          </button>

          {isStylePickerOpen && (
            <div className="absolute top-12 right-0 w-72 bg-white border border-emerald-200 rounded-2xl p-2 shadow-2xl z-30 space-y-1">
              <div className="px-2.5 py-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                Chọn không gian phòng 3D
              </div>
              {Object.values(SPACE_STYLES).map((st) => {
                const isSelected = st.id === activeStyle;
                return (
                  <button
                    key={st.id}
                    onClick={() => handleSelectSpaceStyle(st.id)}
                    className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-left text-xs transition-all ${
                      isSelected
                        ? 'bg-emerald-50 border border-emerald-300 text-emerald-900'
                        : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base shrink-0">{st.icon}</span>
                      <div className="min-w-0">
                        <div className="font-bold truncate">{st.name}</div>
                        <div className="text-[10px] text-slate-500 truncate">{st.badge}</div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}

          <button
            onClick={onToggleViewMode}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/95 hover:bg-slate-50 border border-slate-200 text-xs md:text-sm text-slate-700 transition-all shadow-md active:scale-95"
            title="Chuyển sang xem dạng lưới 2D"
          >
            <Layers className="w-4 h-4 text-sky-600" />
            <span className="hidden sm:inline font-bold">Chế độ 2D Gallery</span>
          </button>

          <button
            onClick={handleResetView}
            className="p-2.5 rounded-xl bg-white/95 hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-emerald-700 transition-all shadow-md active:scale-95"
            title="Góc nhìn toàn cảnh"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Presentation Style Setup Dialog (Opens when choosing Chiếu 3D) */}
      {isPresentationSetupOpen && (
        <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-slate-900/55">
          <div className="w-full max-w-2xl max-h-[90%] overflow-y-auto bg-white border-2 border-emerald-200 rounded-3xl p-5 md:p-6 shadow-2xl space-y-5 text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-600 border border-sky-200 flex items-center justify-center">
                  <Presentation className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Chọn phong cách trình chiếu 3D</h3>
                  <p className="text-xs text-slate-500">
                    Tùy chọn không gian phòng trưng bày và nhịp chuyển cảnh trước khi bắt đầu chiếu
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPresentationSetupOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 1. Space Style Selection */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" />
                <span>1. Phong cách không gian phòng 3D</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.values(SPACE_STYLES).map((st) => {
                  const isSelected = st.id === activeStyle;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => {
                        setActiveStyle(st.id);
                        if (onChangeSpaceStyle) onChangeSpaceStyle(st.id);
                      }}
                      className={`p-3 rounded-2xl border-2 text-left transition-all flex items-start gap-2.5 ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-sm'
                          : 'bg-slate-50 border-slate-200 hover:border-emerald-300 text-slate-700'
                      }`}
                    >
                      <span className="text-lg shrink-0 mt-0.5">{st.icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-extrabold truncate">{st.badge}</span>
                          <span
                            className="w-3 h-3 rounded-full shrink-0 border border-black/10"
                            style={{ backgroundColor: st.accentHex }}
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{st.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Presentation / Camera Mode */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-sky-700 flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5" />
                <span>2. Kiểu chuyển cảnh khi trình chiếu</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PRESENTATION_STYLE_OPTIONS.map((opt) => {
                  const selected = presentationStyle === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPresentationStyle(opt.id)}
                      className={`p-3 rounded-2xl border-2 text-left transition-all ${
                        selected
                          ? 'bg-sky-50 border-sky-500 text-sky-950 shadow-sm'
                          : 'bg-slate-50 border-slate-200 hover:border-sky-300 text-slate-700'
                      }`}
                    >
                      <div className="text-xs font-extrabold">{opt.label}</div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{opt.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsPresentationSetupOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={handleConfirmStartTour}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-600 hover:brightness-105 text-white text-xs font-bold flex items-center gap-2 shadow-md active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Bắt đầu chiếu 3D</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Hover Product Tooltip */}
      {hoveredProduct && !isTourActive && !isPresentationSetupOpen && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 pointer-events-none transition-all duration-200 animate-fadeIn">
          <div className="bg-white/95 border-2 border-emerald-300 rounded-2xl px-5 py-3 shadow-xl flex items-center gap-4 text-left max-w-sm">
            <img
              src={hoveredProduct.primaryImage}
              alt={hoveredProduct.title}
              className="w-12 h-12 object-cover rounded-xl border border-emerald-200"
            />
            <div>
              <p className="text-xs text-emerald-700 font-bold uppercase tracking-wider">
                Nhấn để xem chi tiết
              </p>
              <h4 className="text-sm font-extrabold text-slate-900 line-clamp-1">{hoveredProduct.title}</h4>
              <p className="text-xs text-slate-500">
                {hoveredProduct.author} • {hoveredProduct.className || room.className}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tour / Presentation Mode Overlay */}
      {isTourActive && currentTourProduct && (
        <div className="absolute bottom-6 left-4 right-4 md:left-12 md:right-12 pointer-events-auto transition-all animate-fadeIn">
          <div className="bg-white/95 border-2 border-emerald-200 rounded-3xl p-4 md:p-5 shadow-2xl space-y-3 text-slate-800">
            {/* Quick 3D Space Style & Presentation Mode Switchers during Presentation */}
            <div className="flex flex-col gap-2 pb-2.5 border-b border-slate-100">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Phong cách phòng 3D:</span>
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {Object.values(SPACE_STYLES).map((st) => (
                    <button
                      key={st.id}
                      onClick={() => handleSelectSpaceStyle(st.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                        activeStyle === st.id
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-emerald-50'
                      }`}
                    >
                      <span>{st.icon}</span>
                      <span className="hidden sm:inline">{st.badge}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                  <Presentation className="w-3.5 h-3.5 text-sky-600" />
                  <span>Kiểu trình chiếu:</span>
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {PRESENTATION_STYLE_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setPresentationStyle(opt.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                        presentationStyle === opt.id
                          ? 'bg-sky-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-sky-50'
                      }`}
                    >
                      {opt.shortLabel}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <img
                  src={currentTourProduct.primaryImage}
                  alt={currentTourProduct.title}
                  className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-2xl border-2 border-emerald-200 shadow-sm shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-700">
                      Sản phẩm {tourIndex + 1}/{room.products.length}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">{currentTourProduct.subject}</span>
                  </div>
                  <h3 className="text-base md:text-lg font-extrabold text-slate-900 truncate">
                    {currentTourProduct.title}
                  </h3>
                  <p className="text-xs text-slate-600">
                    Tác giả: <strong className="text-emerald-700">{currentTourProduct.author}</strong> • {currentTourProduct.className}
                  </p>
                </div>
              </div>

              {/* Tour Controls */}
              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <button
                  onClick={handleTourPrev}
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all active:scale-95"
                  title="Sản phẩm trước"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsTourPaused(!isTourPaused)}
                  className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold flex items-center gap-2 transition-all active:scale-95 shadow-sm text-sm"
                >
                  {isTourPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  <span>{isTourPaused ? 'Tiếp tục' : 'Tạm dừng'}</span>
                </button>

                <button
                  onClick={handleTourNext}
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all active:scale-95"
                  title="Sản phẩm tiếp"
                >
                  <SkipForward className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onSelectProduct(currentTourProduct)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-sm active:scale-95"
                >
                  Xem chi tiết
                </button>

                <button
                  onClick={handleStopTour}
                  className="px-3 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-all"
                >
                  Kết thúc
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Floating Control Bar (When not in tour mode) */}
      {!isTourActive && (
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
          {/* Instructions */}
          <div className="hidden sm:flex items-center gap-2 bg-white/95 px-3.5 py-1.5 rounded-xl border border-emerald-200 text-xs text-slate-600 font-medium shadow-md">
            <Info className="w-3.5 h-3.5 text-emerald-600" />
            <span>Kéo chuột để xoay phòng • Cuộn để zoom • Nhấp vào bục để xem</span>
          </div>

          <div className="flex items-center gap-2 ml-auto pointer-events-auto">
            {/* Auto presentation mode with style selection */}
            {room.products.length > 0 && (
              <button
                onClick={handleOpenPresentationSetup}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:brightness-105 text-white font-bold text-xs md:text-sm shadow-md transition-all active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>🎬 Chiếu 3D & Chọn phong cách</span>
              </button>
            )}

            {/* Mobile virtual joystick toggle */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileControlsOpen(!mobileControlsOpen)}
                className="p-2.5 rounded-xl bg-white/95 text-slate-700 font-bold border border-emerald-200 shadow-md text-xs"
              >
                🎮 Phím xoay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Virtual D-Pad (Optional touch overlay) */}
      {mobileControlsOpen && !isTourActive && (
        <div className="absolute top-20 right-4 pointer-events-auto bg-white/95 border border-emerald-200 p-2 rounded-2xl shadow-xl flex flex-col items-center gap-1">
          <button
            onClick={() => handleVirtualMove(0, -1)}
            className="p-2 rounded-lg bg-slate-100 active:bg-emerald-600 active:text-white text-slate-700"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => handleVirtualMove(-1, 0)}
              className="p-2 rounded-lg bg-slate-100 active:bg-emerald-600 active:text-white text-slate-700"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleVirtualMove(1, 0)}
              className="p-2 rounded-lg bg-slate-100 active:bg-emerald-600 active:text-white text-slate-700"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => handleVirtualMove(0, 1)}
            className="p-2 rounded-lg bg-slate-100 active:bg-emerald-600 active:text-white text-slate-700"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
