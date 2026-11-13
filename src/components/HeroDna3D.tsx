import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Dna, RotateCcw, Pause, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { BIO_MODELS, BioModelId, buildAllBioModels } from '../utils/bioModels3D';

interface HeroDna3DProps {
  className?: string;
}

const _targetBgColor = new THREE.Color(0xe6f9f2);

export const HeroDna3D: React.FC<HeroDna3DProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglReady, setWebglReady] = useState(true);
  const [activeModel, setActiveModel] = useState<BioModelId>('dna');
  const [autoCycle, setAutoCycle] = useState(true);

  const activeModelRef = useRef<BioModelId>('dna');
  const modelScaleRef = useRef(1);
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const targetRotRef = useRef({ x: 0.14, y: 0 });
  const currentRotRef = useRef({ x: 0.14, y: 0 });
  const autoSpinRef = useRef(true);

  const modelGroupsRef = useRef<Record<BioModelId, THREE.Group> | null>(null);

  // Sync active model visibility & entrance spring without recreating WebGLRenderer
  useEffect(() => {
    activeModelRef.current = activeModel;
    modelScaleRef.current = 0.72;
    const meta = BIO_MODELS.find((m) => m.id === activeModel);
    if (meta) {
      _targetBgColor.setHex(meta.bgTint);
    }
    const groups = modelGroupsRef.current;
    if (groups) {
      (Object.keys(groups) as BioModelId[]).forEach((key) => {
        groups[key].visible = key === activeModel;
      });
    }
  }, [activeModel]);

  // Auto-cycle between biological models every 6.5 seconds
  useEffect(() => {
    if (!autoCycle) return;
    const timer = window.setInterval(() => {
      if (isDraggingRef.current) return;
      setActiveModel((prev) => {
        const idx = BIO_MODELS.findIndex((m) => m.id === prev);
        return BIO_MODELS[(idx + 1) % BIO_MODELS.length].id;
      });
    }, 6500);
    return () => window.clearInterval(timer);
  }, [autoCycle]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Probe WebGL & detect software renderer
    let isSoftwareGl = false;
    try {
      const probeCanvas = document.createElement('canvas');
      const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
      if (!gl) {
        setWebglReady(false);
        return;
      }
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param) || '');
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    } catch {
      setWebglReady(false);
      return;
    }

    const width = container.clientWidth || 360;
    const height = container.clientHeight || 360;

    // Scene - bright cheerful pastel studio backdrop
    const bgColor = new THREE.Color(0xe6f9f2);
    const scene = new THREE.Scene();
    scene.background = bgColor;
    const fog = new THREE.FogExp2(0xe6f9f2, 0.022);
    scene.fog = fog;

    // Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0.15, 11.2);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Studio Environment Map
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envRT = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envRT.texture;
    pmremGenerator.dispose();

    // Cheerful Sunlit 3-Point Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xa7f3d0, 1.15);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfffbeb, 1.7);
    keyLight.position.set(6, 9, 8);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0x10b981, 1.7, 22);
    rimLight.position.set(-5, -3, 4);
    scene.add(rimLight);

    const accentLight = new THREE.PointLight(0x0ea5e9, 1.4, 20);
    accentLight.position.set(5, 4, -4);
    scene.add(accentLight);

    // Master Pivot Group holding all 5 composite biological models
    const masterPivot = new THREE.Group();
    masterPivot.position.y = 0.28; // Slight upward offset to leave bottom dock completely unobstructed
    scene.add(masterPivot);

    const built = buildAllBioModels();
    modelGroupsRef.current = built.groups;

    (Object.keys(built.groups) as BioModelId[]).forEach((key) => {
      const grp = built.groups[key];
      grp.visible = key === activeModelRef.current;
      masterPivot.add(grp);
    });

    // Floating microscopic bio-particles using InstancedMesh
    const particleCount = 30;
    const particleGeo = new THREE.SphereGeometry(0.052, 8, 8);
    const particleMat = new THREE.MeshStandardMaterial({
      color: 0x34d399,
      emissive: 0x059669,
      emissiveIntensity: 0.35,
      roughness: 0.25,
    });

    const particlesMesh = new THREE.InstancedMesh(particleGeo, particleMat, particleCount);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const r = 2.6 + (i % 5) * 0.42;
      const yBase = ((i % 9) - 4) * 0.78;
      dummy.position.set(Math.cos(angle) * r, yBase, Math.sin(angle) * r);
      dummy.scale.setScalar(0.65 + (i % 4) * 0.22);
      dummy.updateMatrix();
      particlesMesh.setMatrixAt(i, dummy.matrix);
    }
    particlesMesh.instanceMatrix.needsUpdate = true;
    particlesMesh.frustumCulled = false;
    scene.add(particlesMesh);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Pointer Interaction
    const dom = renderer.domElement;
    const onPointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      autoSpinRef.current = false;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - prevMouseRef.current.x;
      const dy = e.clientY - prevMouseRef.current.y;
      targetRotRef.current.y += dx * 0.012;
      targetRotRef.current.x = Math.max(-0.65, Math.min(0.65, targetRotRef.current.x + dy * 0.008));
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const onPointerUp = () => {
      isDraggingRef.current = false;
      autoSpinRef.current = true;
    };

    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 360;
      const h = container.clientHeight || 360;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation loop with software WebGL pacing
    let frameId = 0;
    let disposed = false;
    const clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (gl && typeof gl.fenceSync === 'function') {
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          if (disposed) return;
          const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 5);
          } else {
            if (sync) gl.deleteSync(sync);
            frameId = window.setTimeout(cb, 80);
          }
        };
        frameId = window.setTimeout(poll, 5);
      } else {
        frameId = window.setTimeout(cb, 80);
      }
    }

    function tick() {
      if (disposed) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.elapsedTime;

      if (autoSpinRef.current && !isDraggingRef.current) {
        targetRotRef.current.y += dt * 0.58;
      }

      currentRotRef.current.y = THREE.MathUtils.damp(currentRotRef.current.y, targetRotRef.current.y, 6, dt);
      currentRotRef.current.x = THREE.MathUtils.damp(currentRotRef.current.x, targetRotRef.current.x, 6, dt);
      modelScaleRef.current = THREE.MathUtils.damp(modelScaleRef.current, 1, 7, dt);

      masterPivot.rotation.y = currentRotRef.current.y;
      masterPivot.rotation.x = currentRotRef.current.x;
      masterPivot.position.y = 0.28 + Math.sin(elapsed * 1.4) * 0.12;
      masterPivot.scale.setScalar(modelScaleRef.current);

      // Smoothly tint scene background & fog to match current biological model
      bgColor.lerp(_targetBgColor, Math.min(1, dt * 4.5));
      fog.color.copy(bgColor);

      // Model-specific biological motion
      const current = activeModelRef.current;
      if (current === 'virus' && built.animatedRefs.virusCore) {
        built.animatedRefs.virusCore.rotation.y = elapsed * 0.9;
        if (built.animatedRefs.virusSpikes) {
          const pulse = 1 + Math.sin(elapsed * 3.0) * 0.028;
          built.animatedRefs.virusSpikes.scale.setScalar(pulse);
        }
      } else if (current === 'cell' && built.animatedRefs.cellOrganelles) {
        built.animatedRefs.cellOrganelles.position.y = Math.sin(elapsed * 1.8) * 0.04;
      } else if (current === 'heart' && built.animatedRefs.heartLobes) {
        // Double lub-dub cardiac contraction curve
        const phase = (elapsed * 1.15) % 1;
        const lub = Math.exp(-Math.pow((phase - 0.14) / 0.055, 2)) * 0.085;
        const dub = Math.exp(-Math.pow((phase - 0.30) / 0.045, 2)) * 0.055;
        built.animatedRefs.heartLobes.scale.setScalar(1 + lub + dub);
      } else if (current === 'respiratory' && built.animatedRefs.lungsGroup) {
        // Rhythmic inhale / exhale expansion
        const breath = (Math.sin(elapsed * 1.7) + 1) * 0.5;
        built.animatedRefs.lungsGroup.scale.set(
          1 + breath * 0.075,
          1 + breath * 0.045,
          1 + breath * 0.07
        );
        if (built.animatedRefs.diaphragm) {
          built.animatedRefs.diaphragm.position.y = -1.82 - breath * 0.14;
        }
      }

      particlesMesh.rotation.y = elapsed * 0.14;

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      modelGroupsRef.current = null;
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', handleResize);
      built.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      envRT.dispose();
      renderer.dispose();
    };
  }, []);

  const activeMeta = BIO_MODELS.find((m) => m.id === activeModel) || BIO_MODELS[0];

  const handleCyclePrev = () => {
    const idx = BIO_MODELS.findIndex((m) => m.id === activeModel);
    setActiveModel(BIO_MODELS[(idx - 1 + BIO_MODELS.length) % BIO_MODELS.length].id);
  };

  const handleCycleNext = () => {
    const idx = BIO_MODELS.findIndex((m) => m.id === activeModel);
    setActiveModel(BIO_MODELS[(idx + 1) % BIO_MODELS.length].id);
  };

  if (!webglReady) {
    return (
      <div className={`flex flex-col items-center justify-center rounded-3xl bg-emerald-50 border-2 border-emerald-200 p-6 ${className}`}>
        <Dna className="w-16 h-16 text-emerald-600 mb-3" />
        <p className="text-sm font-bold text-emerald-800">Mô hình Sinh học 3D Biozone</p>
      </div>
    );
  }

  return (
    <div className={`relative rounded-3xl overflow-hidden border-2 border-emerald-300 bg-[#e6f9f2] shadow-xl shadow-emerald-900/10 select-none ${className}`}>
      {/* Dedicated empty WebGL mount container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top HUD Bar (Solid surfaces over WebGL - zero backdrop-blur) */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
        <div className="px-3 py-1.5 rounded-xl bg-white/95 border border-emerald-200 text-xs font-extrabold flex items-center gap-1.5 shadow-sm">
          <span className="text-sm">{activeMeta.emoji}</span>
          <span className={activeMeta.accentColor}>{activeMeta.title.toUpperCase()}</span>
        </div>

        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            type="button"
            onClick={() => setAutoCycle((prev) => !prev)}
            className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1 shadow-sm transition-colors ${
              autoCycle
                ? 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-500'
                : 'bg-white/95 text-slate-700 border-emerald-200 hover:bg-emerald-50'
            }`}
            title={autoCycle ? 'Tạm dừng tự đổi mô hình' : 'Bật tự đổi mô hình luân phiên'}
          >
            {autoCycle ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>{autoCycle ? 'Luân phiên' : 'Tạm dừng'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              targetRotRef.current = { x: 0.14, y: 0 };
              autoSpinRef.current = true;
            }}
            className="p-1.5 rounded-xl bg-white/95 hover:bg-emerald-50 border border-emerald-200 text-slate-600 hover:text-emerald-700 transition-colors shadow-sm"
            title="Đặt lại góc xoay"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Unified Compact Bottom Model Dock (Center 3D Viewport Unobstructed) */}
      <div className="absolute bottom-3 left-3 right-3 flex flex-col gap-1.5 pointer-events-auto">
        <div className="flex items-center justify-between gap-1 bg-white/95 border border-emerald-200 rounded-2xl p-1 shadow-md">
          <button
            type="button"
            onClick={handleCyclePrev}
            className="p-1.5 rounded-xl text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors shrink-0"
            title="Mô hình trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-center gap-1 flex-1 overflow-x-auto no-scrollbar">
            {BIO_MODELS.map((model) => {
              const isSelected = model.id === activeModel;
              return (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => setActiveModel(model.id)}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 whitespace-nowrap transition-all shrink-0 ${
                    isSelected
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-emerald-50'
                  }`}
                >
                  <span>{model.emoji}</span>
                  <span>{model.shortLabel}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleCycleNext}
            className="p-1.5 rounded-xl text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors shrink-0"
            title="Mô hình tiếp theo"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="px-3 py-1 rounded-xl bg-white/92 border border-emerald-200/80 flex items-center justify-between text-[11px] text-slate-700 pointer-events-none shadow-sm">
          <span className="font-bold truncate">{activeMeta.legend}</span>
          <span className="text-slate-500 font-medium hidden sm:inline shrink-0 ml-2">Kéo để xoay</span>
        </div>
      </div>
    </div>
  );
};
