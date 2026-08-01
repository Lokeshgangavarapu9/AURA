import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRM, VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { AIStatusMode, AIEmotion } from '../types';

// ─── Public Interface ─────────────────────────────────────────────────────────

export interface FaceTrackData {
  x: number;
  y: number;
  isLive?: boolean;
}

export interface AvatarViewerProps {
  status?: AIStatusMode;
  emotion?: AIEmotion;
  isSpeaking?: boolean;
  isListening?: boolean;
  glowColorHex?: string;
  faceTrackPos?: FaceTrackData;
  modelUrl?: string;
  className?: string;
}

// ─── VRM 1.0 Procedural Relaxed Pose Constants ────────────────────────────────
//
// In VRM 1.0 normalized humanoid space:
//   • Avatar faces +Z, up is +Y, avatar's left is +X.
//   • In T-pose, leftUpperArm extends along +X.
//   • To lower left arm downward along body side: rotation.z MUST BE NEGATIVE (-1.28 rad ≈ -73.3°)
//   • To lower right arm downward along body side: rotation.z MUST BE POSITIVE (+1.28 rad ≈ +73.3°)
//
const ARM_LEFT_Z   = -1.28;   // Lower left arm down to torso side
const ARM_RIGHT_Z  =  1.28;   // Lower right arm down to torso side
const ARM_X        =  0.05;   // Slight forward relaxation off body
const ELBOW_LEFT_Y =  0.15;   // Natural elbow bend inward
const ELBOW_RIGHT_Y= -0.15;   // Natural elbow bend inward
const ELBOW_Z      = -0.10;   // Forearm curve
const HAND_Z       = -0.05;   // Relaxed wrist
const SHOULDER_Z   = -0.04;   // Relaxed downward shoulder drop

// ─── Component ────────────────────────────────────────────────────────────────

export const AvatarViewer: React.FC<AvatarViewerProps> = ({
  status      = 'idle',
  emotion     = 'neutral',
  isSpeaking  = false,
  isListening = false,
  glowColorHex = '#f472b6',
  faceTrackPos,
  modelUrl  = '/models/companion.vrm',
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [modelLoaded, setModelLoaded] = useState<boolean>(false);

  // Three.js scene references
  const sceneRef = useRef<{
    scene:        THREE.Scene;
    camera:       THREE.PerspectiveCamera;
    renderer:     THREE.WebGLRenderer;
    vrm?:         VRM;
    ringGroup:    THREE.Group;
    innerRingMesh: THREE.Mesh;
    placeholder:  THREE.Group;
  } | null>(null);

  // Animation state in ref (prevents React re-render churn)
  const anim = useRef({
    timer:             new THREE.Timer(),
    blinkTimer:        0,
    nextBlinkAt:       3.0 + Math.random() * 2.0,
    isBlinking:        false,
    blinkT:            0,
    speakCycle:        0,
    facePos:           { x: 0, y: 0 },
    facePosTarget:     { x: 0, y: 0 },
    faceShiftCounter:  0,
  });

  const liveTrackRef = useRef<FaceTrackData | undefined>(faceTrackPos);
  useEffect(() => { liveTrackRef.current = faceTrackPos; }, [faceTrackPos]);

  // ── Three.js Scene Setup ──────────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const w = container.clientWidth  || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;

    // 1. Scene
    const scene = new THREE.Scene();

    // 2. Camera — Flattering portrait view framing upper body elegantly
    // FOV 34° gives a high-end camera lens feel (portrait compression)
    const camera = new THREE.PerspectiveCamera(34, w / h, 0.1, 100);
    camera.position.set(0, 1.48, 1.05);
    camera.lookAt(0, 1.38, 0);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping       = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    container.appendChild(renderer.domElement);

    // 4. Lighting — Soft warm cream aesthetic
    scene.add(new THREE.AmbientLight(0xfff8f0, 1.85));

    const key = new THREE.DirectionalLight(0xffe8d0, 1.5);
    key.position.set(0.8, 2.2, 1.8);
    scene.add(key);

    const fill = new THREE.DirectionalLight(0xfffaf5, 0.85);
    fill.position.set(-0.5, 1.6, 2.0);
    scene.add(fill);

    const rim = new THREE.PointLight(new THREE.Color(glowColorHex || '#f9a8d4'), 1.25, 5);
    rim.position.set(0, 2.0, -1.2);
    scene.add(rim);

    // 5. Soft Concentric Framing Rings (Matches reference design)
    const ringGroup = new THREE.Group();
    ringGroup.position.set(0, 1.12, -0.10);
    ringGroup.rotation.x = 0.12;

    const innerRingGeo = new THREE.TorusGeometry(0.62, 0.0055, 32, 128);
    const innerRingMat = new THREE.MeshBasicMaterial({
      color:       new THREE.Color('#fce7f3'),
      transparent: true,
      opacity:     0.55,
    });
    const innerRingMesh = new THREE.Mesh(innerRingGeo, innerRingMat);
    ringGroup.add(innerRingMesh);

    const midRingGeo = new THREE.TorusGeometry(0.76, 0.003, 32, 128);
    const midRingMat = new THREE.MeshBasicMaterial({
      color:       new THREE.Color('#fdf2f8'),
      transparent: true,
      opacity:     0.35,
    });
    ringGroup.add(new THREE.Mesh(midRingGeo, midRingMat));

    const DOT_COUNT = 80;
    const dotPositions = new Float32Array(DOT_COUNT * 3);
    for (let i = 0; i < DOT_COUNT; i++) {
      const a = (i / DOT_COUNT) * Math.PI * 2;
      dotPositions[i * 3]     = Math.cos(a) * 0.90;
      dotPositions[i * 3 + 1] = Math.sin(a) * 0.90;
      dotPositions[i * 3 + 2] = 0;
    }
    const dotGeo = new THREE.BufferGeometry();
    dotGeo.setAttribute('position', new THREE.BufferAttribute(dotPositions, 3));
    const dotMat = new THREE.PointsMaterial({
      size:        0.011,
      color:       new THREE.Color('#f5c6d8'),
      transparent: true,
      opacity:     0.42,
    });
    ringGroup.add(new THREE.Points(dotGeo, dotMat));

    scene.add(ringGroup);

    // 6. Loading Standee Fallback
    const placeholder = new THREE.Group();
    placeholder.position.set(0, 1.45, 0);

    const phHead = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.12, 2),
      new THREE.MeshStandardMaterial({ color: 0xfbcfe8, wireframe: true, transparent: true, opacity: 0.35 })
    );
    placeholder.add(phHead);

    scene.add(placeholder);

    sceneRef.current = {
      scene, camera, renderer,
      ringGroup, innerRingMesh, placeholder,
    };

    // 7. Load VRM Avatar
    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));

    loader.load(
      modelUrl,
      (gltf) => {
        const vrm = gltf.userData.vrm as VRM;
        if (!vrm) return;

        VRMUtils.removeUnnecessaryVertices(gltf.scene);
        VRMUtils.removeUnnecessaryJoints(gltf.scene);
        VRMUtils.rotateVRM0(vrm);

        vrm.scene.position.set(0, 0, 0);
        scene.add(vrm.scene);

        if (sceneRef.current) {
          sceneRef.current.vrm = vrm;
          sceneRef.current.placeholder.visible = false;
        }
        setModelLoaded(true);
      },
      undefined,
      () => {
        setModelLoaded(false);
        if (sceneRef.current) sceneRef.current.placeholder.visible = true;
      }
    );

    anim.current.timer.connect(document);

    // 8. Window Resize Handler
    const onResize = () => {
      if (!containerRef.current || !sceneRef.current) return;
      const rw = containerRef.current.clientWidth;
      const rh = containerRef.current.clientHeight;
      sceneRef.current.camera.aspect = rw / rh;
      sceneRef.current.camera.updateProjectionMatrix();
      sceneRef.current.renderer.setSize(rw, rh);
    };
    window.addEventListener('resize', onResize);

    // 9. Main Render Loop with Procedural Pose & Idle Engine
    let rafId: number;

    const tick = (timestamp?: number) => {
      rafId = requestAnimationFrame(tick);
      if (!sceneRef.current) return;

      const { renderer, scene, camera, vrm, ringGroup, innerRingMesh, placeholder } = sceneRef.current;
      const st    = anim.current;
      st.timer.update(timestamp);
      const delta = st.timer.getDelta();
      const now   = Date.now();

      if (vrm) {
        // ──────────────────────────────────────────────────────────────────
        //  STEP 1: APPLY PROCEDURAL RELAXED STANDING POSE & IDLE MOTION
        //  (Must be set BEFORE vrm.update so matrix calculations use the new pose)
        // ──────────────────────────────────────────────────────────────────
        if (vrm.humanoid) {
          const hum = vrm.humanoid;

          // ── Breathing sine calculation ────────────────────────────────
          const breathT   = now * 0.0016;          // ~0.25 Hz natural breath rate
          const breathAmt = Math.sin(breathT) * 0.018;

          // ── Shoulders (relaxed downward drop) ─────────────────────────
          const lShoulder = hum.getNormalizedBoneNode('leftShoulder');
          const rShoulder = hum.getNormalizedBoneNode('rightShoulder');
          if (lShoulder) lShoulder.rotation.set(0, 0, SHOULDER_Z + breathAmt * 0.1);
          if (rShoulder) rShoulder.rotation.set(0, 0, -SHOULDER_Z - breathAmt * 0.1);

          // ── Upper Arms (Resting naturally beside body, NO T-pose) ─────
          const leftUA  = hum.getNormalizedBoneNode('leftUpperArm');
          const rightUA = hum.getNormalizedBoneNode('rightUpperArm');
          if (leftUA)  leftUA.rotation.set(ARM_X, 0, ARM_LEFT_Z + breathAmt * 0.08);
          if (rightUA) rightUA.rotation.set(ARM_X, 0, ARM_RIGHT_Z - breathAmt * 0.08);

          // ── Lower Arms / Elbows (Slight natural bend inward) ──────────
          const leftLA  = hum.getNormalizedBoneNode('leftLowerArm');
          const rightLA = hum.getNormalizedBoneNode('rightLowerArm');
          if (leftLA)  leftLA.rotation.set(0, ELBOW_LEFT_Y, ELBOW_Z);
          if (rightLA) rightLA.rotation.set(0, ELBOW_RIGHT_Y, -ELBOW_Z);

          // ── Hands / Wrists (Relaxed natural angle) ────────────────────
          const leftHnd = hum.getNormalizedBoneNode('leftHand');
          const rightHnd= hum.getNormalizedBoneNode('rightHand');
          if (leftHnd)  leftHnd.rotation.set(0, 0, HAND_Z);
          if (rightHnd) rightHnd.rotation.set(0, 0, -HAND_Z);

          // ── Spine & Chest (Gentle breathing motion) ───────────────────
          const spine = hum.getNormalizedBoneNode('spine');
          const chest = hum.getNormalizedBoneNode('chest');
          if (spine) spine.rotation.x = breathAmt * 0.55;
          if (chest) chest.rotation.x = breathAmt * 0.35;

          // ── Hips (Tiny natural body sway) ─────────────────────────────
          const hips = hum.getNormalizedBoneNode('hips');
          if (hips) hips.rotation.z = Math.sin(now * 0.00105) * 0.006;

          // ── Head & Neck (Subtle natural idle movement) ────────────────
          const live = liveTrackRef.current;
          if (live && live.isLive) {
            st.facePosTarget.x = live.x;
            st.facePosTarget.y = live.y;
          } else {
            st.faceShiftCounter += 1;
            if (st.faceShiftCounter > 220) {
              st.facePosTarget.x = (Math.random() - 0.5) * 0.16;
              st.facePosTarget.y = (Math.random() - 0.5) * 0.09;
              st.faceShiftCounter = 0;
            }
          }
          st.facePos.x += (st.facePosTarget.x - st.facePos.x) * 0.028;
          st.facePos.y += (st.facePosTarget.y - st.facePos.y) * 0.028;

          const neck = hum.getNormalizedBoneNode('neck');
          const head = hum.getNormalizedBoneNode('head');
          if (neck) {
            neck.rotation.y =  st.facePos.x * 0.12;
            neck.rotation.x = -st.facePos.y * 0.08;
          }
          if (head) {
            head.rotation.y =  st.facePos.x * 0.28;
            head.rotation.x = -st.facePos.y * 0.18;
          }

          // ── Eyes (Gaze leads head turn slightly) ──────────────────────
          const lEye = hum.getNormalizedBoneNode('leftEye');
          const rEye = hum.getNormalizedBoneNode('rightEye');
          if (lEye) { lEye.rotation.y =  st.facePos.x * 0.45; lEye.rotation.x = -st.facePos.y * 0.30; }
          if (rEye) { rEye.rotation.y =  st.facePos.x * 0.45; rEye.rotation.x = -st.facePos.y * 0.30; }
        }

        // ──────────────────────────────────────────────────────────────────
        //  STEP 2: VRM UPDATE ENGINE
        //  (Calculates world transforms & applies secondary spring bone hair physics)
        // ──────────────────────────────────────────────────────────────────
        vrm.update(delta);

        // ──────────────────────────────────────────────────────────────────
        //  STEP 3: BLINKING & FACIAL EXPRESSIONS
        // ──────────────────────────────────────────────────────────────────
        st.blinkTimer += delta;
        if (st.blinkTimer > st.nextBlinkAt) {
          st.isBlinking  = true;
          st.blinkTimer  = 0;
          st.nextBlinkAt = 2.5 + Math.random() * 3.5;
        }
        if (st.isBlinking) {
          st.blinkT += delta * 12;
          const bv = Math.sin(Math.min(st.blinkT, Math.PI));
          vrm.expressionManager?.setValue('blink', bv);
          if (st.blinkT >= Math.PI) {
            st.isBlinking = false;
            st.blinkT     = 0;
            vrm.expressionManager?.setValue('blink', 0);
          }
        }

        if (vrm.expressionManager) {
          const em = vrm.expressionManager;

          // Lip sync — compatible with TTS / Gemini Live API viseme stream
          if (isSpeaking) {
            st.speakCycle += delta * 12;
            em.setValue('aa', Math.abs(Math.sin(st.speakCycle)) * 0.65);
          } else {
            em.setValue('aa', 0);
          }

          // Expressions with a subtle warm neutral baseline
          em.setValue('happy',
            emotion === 'happy' ? 0.75 : 0
          );
          em.setValue('relaxed',
            emotion === 'soothing' ? 0.85 :
            emotion === 'thinking' ? 0.30 :
            emotion === 'neutral'  ? 0.25 :
            0
          );
          em.setValue('surprised',
            emotion === 'curious' ? 0.60 : 0
          );
          em.setValue('sad',
            emotion === 'thinking' ? 0.12 : 0
          );
        }

      } else {
        if (placeholder) {
          placeholder.position.y = 1.45 + Math.sin(now * 0.0018) * 0.018;
          placeholder.rotation.y += 0.0015;
        }
      }

      // Ring pulse
      const ringBreath = 1.0 + Math.sin(now * 0.00160) * 0.007;
      ringGroup.scale.setScalar(ringBreath);

      if (innerRingMesh?.material) {
        const targetOp = isSpeaking      ? 0.85
                       : isListening
                         || status === 'listening' ? 0.70
                       : 0.55;
        const mat = innerRingMesh.material as THREE.MeshBasicMaterial;
        mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOp, 0.04);
      }

      renderer.render(scene, camera);
    };

    tick();

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(rafId);
      anim.current.timer.dispose();
      if (sceneRef.current?.vrm) VRMUtils.deepDispose(sceneRef.current.vrm.scene);
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [modelUrl]);

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};
