import { useRef, useMemo, useState, useCallback, useEffect, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, ScrollControls, useScroll, Html, Scroll, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { AnimatePresence, motion } from "framer-motion";
import { UniformDisc } from "./disc.jsx";
import Loader from "./loader.jsx";

/* CONSTANTS */
const SECTIONS = [
  { name: "Home", icon: "🏠", tagline: "Welcome to DevlUp Labs", description: "Your command center for everything we build." },
  { name: "Timeline", icon: "📅", tagline: "Chronicle Your Journey", description: "Visualize your milestones and progress." },
  { name: "Videos", icon: "🎬", tagline: "Cinematic Storytelling", description: "Immersive video content crafted for maximum impact." },
  { name: "Podcast", icon: "🎙️", tagline: "Voices That Resonate", description: "Deep conversations and thought-provoking discussions." },
  { name: "Blogs", icon: "✍️", tagline: "Words That Inspire", description: "In-depth articles and thought leadership." },
  { name: "Team", icon: "👥", tagline: "The Minds Behind the Vision", description: "Passionate creators building the future." },
];

const BLOCK_COLORS = ["#00E5FF", "#00A1FF", "#0044FF", "#00D2FF", "#0077FF", "#00BAFF"];
const X_RADIUS = 6.5, Z_RADIUS = 6.5;
const matConfig = (color) => ({ color, metalness: 0.1, roughness: 0.8, transparent: true });

function HomeModel() {
  const { scene } = useGLTF("/mod.glb");
  return <primitive object={scene} scale={0.8} position={[0, 0.50, 0.2]} rotation={[Math.PI / 2,0,0]} />;
}

useGLTF.preload("/mod.glb");
useGLTF.preload("/stickman2f.glb");

useGLTF.preload("/youtube_button_model/scene.gltf");
useGLTF.preload("/3d_document_object_and_document_board.glb");

function VideoButtonModel() {
  const { scene } = useGLTF("/youtube_button_model/scene.gltf");
  return (
    <primitive 
      object={scene} 
      scale={0.4} 
      position={[0, 0.5, 0]} 
      rotation={[0, Math.PI / 2, 0]} 
    />
  );
}

function DocumentModel() {
  const { scene } = useGLTF("/3d_document_object_and_document_board.glb");
  const clones = useMemo(() => {
    if (!scene) return [];
    return Array.from({ length: 3 }, () => scene.clone());
  }, [scene]);

  if (!clones.length) return null;

  return (
    <group>
      <primitive object={clones[0]} scale={2.1} position={[-0.3, 0.2, -0.2]} rotation={[0, -Math.PI /1.5, 0]} />
      <primitive object={clones[1]} scale={2.1} position={[-0.2, 0.2, -0.1]} rotation={[0, -Math.PI / 1.5, 0]} />
      <primitive object={clones[2]} scale={2.1} position={[-0.1, 0.2, -0]} rotation={[0, -Math.PI / 1.5, 0]} />
    </group>
  );
}

function StickmanModel() {
  const { scene } = useGLTF("/stickman2f.glb");
  const groupRef = useRef();
  const NUM_CLONES = 10;
  const RADIUS = -0.01; // Smaller radius -> less gap between adjacent stickmen
  const HEIGHT = 0.12; // Slightly below disc surface
  const CENTER_X = 0.001;
  const CENTER_Z = 0.02;
  const clones = useMemo(() => {
    if (!scene) return [];
    return Array.from({ length: NUM_CLONES }, () => scene.clone());
  }, [scene]);

  // Create circular positions for stickmen with outward-facing rotation
  const positionsAndRotations = useMemo(() => {
    const data = [];
    for (let i = 0; i < NUM_CLONES; i++) {
      const angle = (i / NUM_CLONES) * Math.PI * 2;
      const x = CENTER_X + Math.cos(angle) * RADIUS;
      const z = CENTER_Z + Math.sin(angle) * RADIUS;
      // Face outward from center - perpendicular to circle
      const rotation = angle;
      data.push({ pos: [x, HEIGHT, z], rot: rotation });
    }
    return data;
  }, []);

  return (
    <group ref={groupRef}>
      {positionsAndRotations.map((data, idx) => (
        <group key={idx} position={data.pos} rotation={[0, data.rot, 0]}>
          <primitive object={clones[idx]} scale={0.12} />
        </group>
      ))}
    </group>
  );
}

const BLOCK_CONFIGS = [
  { render: () => <HomeModel /> },
  { render: () => { const steps = [{ w: 0.5, h: 0.08, x: -0.15, y: 0.1 }, { w: 0.4, h: 0.08, x: -0.05, y: 0.22 }, { w: 0.3, h: 0.08, x: 0.05, y: 0.34 }, { w: 0.2, h: 0.08, x: 0.15, y: 0.46 }]; return (<group position={[0, 0.15, 0]}>{steps.map((s, i) => (<mesh key={i} position={[s.x, s.y, 0]}><boxGeometry args={[s.w, s.h, 0.35]} /><meshPhysicalMaterial {...matConfig(["#BE123C", "#E11D48", "#F43F5E", "#e2e8f0"][i])} /></mesh>))}<mesh position={[0.15, 0.6, 0]}><cylinderGeometry args={[0.01, 0.01, 0.2, 8]} /><meshPhysicalMaterial {...matConfig("#e2e8f0")} /></mesh><mesh position={[0.21, 0.63, 0]}><boxGeometry args={[0.1, 0.06, 0.01]} /><meshPhysicalMaterial {...matConfig("#F43F5E")} /></mesh></group>); } },
  { render: () => <VideoButtonModel /> },
  { render: () => (<group position={[0, 0.25, 0]}><mesh position={[0, 0.35, 0]}><sphereGeometry args={[0.12, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshPhysicalMaterial {...matConfig("#F59E0B")} /></mesh><mesh position={[0, 0.28, 0]}><cylinderGeometry args={[0.12, 0.12, 0.14, 32]} /><meshPhysicalMaterial {...matConfig("#FCD34D")} /></mesh><mesh position={[0, 0.1, 0]}><cylinderGeometry args={[0.025, 0.025, 0.3, 16]} /><meshPhysicalMaterial {...matConfig("#cbd5e1")} /></mesh><mesh position={[0, -0.05, 0]}><cylinderGeometry args={[0.15, 0.15, 0.03, 32]} /><meshPhysicalMaterial {...matConfig("#B45309")} /></mesh>{[0.16, 0.22, 0.28].map((r, i) => (<mesh key={i} position={[0, 0.33, 0]}><torusGeometry args={[r, 0.008, 8, 32, Math.PI]} /><meshPhysicalMaterial {...matConfig("#FDE68A")} opacity={0.5 - i * 0.12} /></mesh>))}</group>) },
  { render: () => <DocumentModel /> },
  { render: () => <StickmanModel /> },
];

const DISC_DATA = [0, 1, 2, 3, 4, 5].map(i => {
  const angle = (i * Math.PI * 2) / 6;
  return {
    position: [Math.sin(angle) * X_RADIUS, 1.2, Math.cos(angle) * Z_RADIUS],
    color: BLOCK_COLORS[i], speed: [0.8, 1.1, 0.6, 0.9, 1.3, 0.7][i],
    rotSpeed: [1.2, 0.8, 1.5, 1.0, 0.7, 1.3][i], scale: [1.15, 1.1, 0.9, 0.9, 1.1, 1.0][i],
  };
});

/* COMPONENTS */
function AnimatedBlock({ visible, popped = false, children }) {
  const groupRef = useRef();
  const currentScale = useRef(0);
  useFrame((_, delta) => {
    const target = visible ? (popped ? 2.05 : 1.8) : 0;
    currentScale.current = THREE.MathUtils.lerp(currentScale.current, target, 1 - Math.exp(-4 * delta));
    if (groupRef.current) groupRef.current.scale.setScalar(currentScale.current);
  });
  return <group ref={groupRef} scale={0}>{children}</group>;
}

function FloatingDisc({ position, color, scale = 1, isFocused, isLightOn = true, allowHoverScale = true, onClick, softness = 2.0 }) {
  const meshRef = useRef(), caseMatRef = useRef();
  const [hovered, setHovered] = useState(false);
  const targetScale = useRef(scale);

  useFrame((_, delta) => {
    const tCaseOp = isLightOn ? 0.4 : 0;
    if (caseMatRef.current) {
      caseMatRef.current.uniforms.uGlobalOpacity.value = THREE.MathUtils.lerp(caseMatRef.current.uniforms.uGlobalOpacity.value, tCaseOp, 1 - Math.exp(-4 * delta));
      caseMatRef.current.uniforms.uTime.value += delta;
    }
    
    // Smooth scale animation
    if (meshRef.current) {
      targetScale.current = hovered && allowHoverScale ? scale * 1.05 : scale;
      const currentScale = meshRef.current.scale.x;
      const newScale = THREE.MathUtils.lerp(currentScale, targetScale.current, 1 - Math.exp(-8 * delta));
      meshRef.current.scale.setScalar(newScale);
    }
  });

  // Base dots pattern
  const dotsCount = 16;
  const dots = useMemo(() => {
    return Array.from({ length: dotsCount }).map((_, i) => {
      const angle = (i / dotsCount) * Math.PI * 2;
      return [Math.cos(angle) * 1.3, 0.21, Math.sin(angle) * 1.3];
    });
  }, []);

  return (
    <group ref={meshRef} position={position} onClick={(e) => { if (e.intersections.length > 0 && e.intersections[0].eventObject !== e.eventObject) return; onClick(e); }} onPointerOver={() => { setHovered(true); document.body.style.cursor = "pointer"; }} onPointerOut={() => { setHovered(false); document.body.style.cursor = "default"; }}>
      <pointLight color={color || "#00D2FF"} distance={10} intensity={isLightOn ? 8 : 0} position={[0, 2, 0]} />
      
      {/* Base Disc Body */}
      <mesh><cylinderGeometry args={[1.45, 1.5, 0.4, 32]} /><meshStandardMaterial color="#020408" roughness={0.6} metalness={0.4} /></mesh>

      {isLightOn && (
        <>
          {/* Image-Style Glowing Rings */}
          <mesh position={[0, 0.201, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[1.1, 1.15, 36]} /><meshBasicMaterial color="#00E5FF" transparent opacity={0.8} /></mesh>
          <mesh position={[0, 0.201, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.9, 0.92, 36]} /><meshBasicMaterial color="#0044FF" transparent opacity={0.4} /></mesh>

          {/* Image-Style Ring of Dots */}
          {dots.map((pos, i) => (
            <mesh key={i} position={pos} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.04, 16]} />
              <meshBasicMaterial color="#00E5FF" transparent opacity={0.9} blending={THREE.AdditiveBlending} />
            </mesh>
          ))}

          {/* Main Beam - Volumetric Spotlight */}
          <mesh position={[0, 4.0, 0]}>
            <cylinderGeometry args={[0.2, 1.15, 8.0, 32, 1, true]} />
            <shaderMaterial 
              ref={caseMatRef} 
              transparent 
              depthWrite={false} 
              blending={THREE.AdditiveBlending} 
              side={THREE.DoubleSide} 
              uniforms={{ 
                uTime: { value: 0 }, 
                uColorInner: { value: new THREE.Color('#ffffff') }, 
                uColorOuter: { value: new THREE.Color('#00E5FF') }, 
                uGlobalOpacity: { value: 1.2 } 
              }} 
              vertexShader={`
                varying vec2 vUv;
                varying vec3 vNormal;
                varying vec3 vViewPosition;
                void main() {
                  vUv = uv;
                  vNormal = normalize(normalMatrix * normal);
                  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                  vViewPosition = -mvPosition.xyz;
                  gl_Position = projectionMatrix * mvPosition;
                }
              `} 
              fragmentShader={`
                precision mediump float;
                varying vec2 vUv;
                varying vec3 vNormal;
                varying vec3 vViewPosition;
                uniform float uTime;
                uniform vec3 uColorInner;
                uniform vec3 uColorOuter;
                uniform float uGlobalOpacity;
                
                void main() {
                  vec3 normal = normalize(vNormal);
                  vec3 viewDir = normalize(vViewPosition);
                  
                  // Volumetric core effect: brighter where normal faces camera
                  float viewDot = abs(dot(normal, viewDir));
                  float coreGlow = pow(viewDot, 1.8); 
                  float hotCore = pow(viewDot, 2.0); 
                  
                  // Vertical falloff (bright at bottom, completely fades at top)
                  float verticalFade = pow(1.0 - vUv.y, 3.0); 
                  
                  // Fade out the hard lower edge tightly to blend with the base
                  float bottomFade = smoothstep(0.0, 0.02, vUv.y);
                  
                  float intensity = (coreGlow * 0.1 + hotCore * 0.9) * verticalFade * bottomFade * uGlobalOpacity;
                  
                  // Subtle energy pulse
                  float pulse = sin(uTime * 2.0 - vUv.y * 10.0) * 0.05 + 0.95;
                  intensity *= pulse;
                  
                  // Mix white core with cyan outer glow
                  vec3 finalColor = mix(uColorOuter, uColorInner, hotCore * 0.8);
                  
                  // Boost output intensity for additive blending
                  gl_FragColor = vec4(finalColor * intensity * 2.0, intensity);
                }
              `} 
            />
          </mesh>
        </>
      )}
    </group>
  );
}

function FloatingBlocks({ count = 30 }) {
  const meshRef = useRef();
  const scroll = useScroll();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({ 
        factor: 10 + Math.random() * 40, 
        speed: 0.05 + Math.random() * 0.3, 
        x: (Math.random() - 0.5) * 40, 
        z: (Math.random() - 0.5) * 40, 
        yStart: -10 - Math.random() * 10, 
        yEnd: 15 + Math.random() * 15, 
        scale: Math.random() * 0.6 + 0.3, 
        timeOffset: Math.random() * 100 
      });
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const r1 = scroll ? scroll.offset : 0;
    const time = state.clock.getElapsedTime();
    
    particles.forEach((p, i) => {
      const pTime = time + p.timeOffset;
      const curY = p.yStart + (p.yEnd - p.yStart) * r1 * 1.5;
      const xOff = Math.sin(pTime * p.speed) * (p.factor * 0.05) * (1 + r1);
      const zOff = Math.cos(pTime * p.speed) * (p.factor * 0.05) * (1 + r1);
      const yOff = Math.sin(pTime * p.speed * 1.5) * (p.factor * 0.05);
      const spread = 1 + r1 * 0.5;
      
      dummy.position.set(p.x * spread + xOff, curY + yOff, p.z * spread + zOff);
      dummy.rotation.set(pTime * p.speed, pTime * p.speed * 0.5, pTime * p.speed * 0.2);
      dummy.scale.setScalar(p.scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.1} transparent opacity={0.35} envMapIntensity={1.5} />
    </instancedMesh>
  );
}

function CameraAnimator({ focusedIndex, isTransitioning }) {
  const { camera, scene } = useThree();
  const targetPos = useRef(new THREE.Vector3());
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const targetLookAt = useRef(new THREE.Vector3());
  const outDir = useRef(new THREE.Vector3());
  const savedPos = useRef(new THREE.Vector3(0, 3, 10));
  const savedLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const isAnimatingBack = useRef(false);
  const prevFocused = useRef(null);
  const worldTarget = useRef(new THREE.Vector3());
  const damping = 2.5;

  useFrame((_, delta) => {
    if (isTransitioning) return;
    const previousFocused = prevFocused.current;
    const targetSet = focusedIndex !== null;
    
    if (targetSet && previousFocused === null) {
      savedPos.current.copy(camera.position);
      savedLookAt.current.copy(currentLookAt.current);
      isAnimatingBack.current = false;
    }
    
    if (!targetSet && previousFocused !== null) isAnimatingBack.current = true;
    prevFocused.current = focusedIndex;

    const lerpFactor = 1 - Math.exp(-damping * delta);
    if (targetSet) {
      const discObj = scene.getObjectByName(`disc-${focusedIndex}`);
      if (!discObj) return;
      
      discObj.getWorldPosition(worldTarget.current);
      outDir.current.set(worldTarget.current.x, 0, worldTarget.current.z).normalize();
      
      // Fallback if normalize fails (though it shouldn't for static discs)
      if (isNaN(outDir.current.x)) outDir.current.set(0, 0, 1);

      const hDist = 5, vDist = hDist * Math.tan(THREE.MathUtils.degToRad(25));
      targetPos.current.set(worldTarget.current.x + outDir.current.x * hDist, worldTarget.current.y + vDist, worldTarget.current.z + outDir.current.z * hDist);
      targetLookAt.current.set(worldTarget.current.x, worldTarget.current.y + 0.4, worldTarget.current.z);
      
      camera.position.lerp(targetPos.current, lerpFactor);
      currentLookAt.current.lerp(targetLookAt.current, lerpFactor);
      camera.lookAt(currentLookAt.current);
    } else if (isAnimatingBack.current) {
      camera.position.lerp(savedPos.current, lerpFactor);
      currentLookAt.current.lerp(savedLookAt.current, lerpFactor);
      camera.lookAt(currentLookAt.current);
      if (camera.position.distanceTo(savedPos.current) < 0.05) isAnimatingBack.current = false;
    }
  });

  return null;
}

function ParallaxRig({ children, enabled }) {
  const groupRef = useRef();
  const { pointer } = useThree();
  useFrame(() => {
    if (groupRef.current && enabled) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, pointer.x * 0.15, 0.05);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -pointer.y * 0.1, 0.05);
    }
  });
  return <group ref={groupRef}>{children}</group>;
}

function FlowingGrid({ showHologram }) {
  const meshRef = useRef();
  const scroll = useScroll();
  const count = 16, size = 65 / count;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);
  const baseColor = useMemo(() => new THREE.Color("#050505"), []);
  const accentColor = useMemo(() => new THREE.Color("#00E5FF"), []);
  const hoveredIdRef = useRef(null);
  const prevHoveredIdRef = useRef(null);
  const prevActivationRef = useRef(0);
  const staticPoseAppliedRef = useRef(false);
  const holoAnim = useRef(0);

  // Precompute static grid data to save CPU cycles in useFrame
  const gridData = useMemo(() => {
    const data = [];
    for (let x = 0; x < count; x++) {
      for (let z = 0; z < count; z++) {
        const h = Math.abs(Math.sin(x * 12.9898 + z * 78.233) * 43758.5453) % 1;
        const posX = (x - count / 2) * size + size / 2;
        const posZ = (z - count / 2) * size + size / 2;
        const distFromCenter = Math.sqrt(posX * posX + posZ * posZ);
        const edgeFade = Math.max(0, 1.0 - distFromCenter / 30.0);
        data.push({ h, posX, posZ, edgeFade });
      }
    }
    return data;
  }, [count, size]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;
    const offset = scroll ? scroll.offset : 0;
    const scrollActivation = THREE.MathUtils.smoothstep(offset, 0.15, 0.5);
    
    holoAnim.current = THREE.MathUtils.lerp(holoAnim.current, showHologram ? 1 : 0, 1 - Math.exp(-3 * delta));
    const activation = scrollActivation * (1 - holoAnim.current);
    const hoveredChanged = hoveredIdRef.current !== prevHoveredIdRef.current;
    const activationChanged = Math.abs(activation - prevActivationRef.current) > 0.001;
    const isStatic = activation < 0.001;

    // Skip expensive instance updates when the grid is visually static and hover state is unchanged.
    if (isStatic && staticPoseAppliedRef.current && !hoveredChanged) return;

    let matrixChanged = false;
    let colorChanged = false;

    gridData.forEach((p, i) => {
      if (!isStatic || !staticPoseAppliedRef.current || activationChanged) {
        const heightAnim = Math.sin(time * (1.0 + p.h * 2.0) + p.h * 10.0) * 0.5 + 0.5;
        const blockHeight = 0.03 + (heightAnim * p.h * 20.0 * activation * p.edgeFade);
        dummy.position.set(p.posX, blockHeight / 2, p.posZ);
        dummy.scale.set(size * 0.9, blockHeight, size * 0.9);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
        matrixChanged = true;
      }

      if (hoveredChanged || !staticPoseAppliedRef.current) {
        if (hoveredIdRef.current === i) {
          color.lerpColors(baseColor, accentColor, 1.2);
          meshRef.current.setColorAt(i, color);
        } else {
          meshRef.current.setColorAt(i, baseColor);
        }
        colorChanged = true;
      }
    });

    if (matrixChanged) meshRef.current.instanceMatrix.needsUpdate = true;
    if (colorChanged && meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;

    prevHoveredIdRef.current = hoveredIdRef.current;
    prevActivationRef.current = activation;
    staticPoseAppliedRef.current = isStatic;
  });

  return (
    <group>
      <mesh position={[0, -0.11, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[65, 65]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.15} />
      </mesh>
      <instancedMesh 
        ref={meshRef} 
        args={[null, null, count * count]} 
        position={[0, -0.1, 0]} 
        onPointerMove={(e) => { e.stopPropagation(); if (scroll && scroll.offset > 0.15 && hoveredIdRef.current !== e.instanceId) hoveredIdRef.current = e.instanceId; }} 
        onPointerOut={() => { hoveredIdRef.current = null; }}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#000000" metalness={0} roughness={1} />
      </instancedMesh>
    </group>
  );
}
function HologramCards({ visible, scaleFactor = 1 }) {
  const groupRef = useRef();
  const card1Ref = useRef();
  const card2Ref = useRef();
  const card3Ref = useRef();
  const currentScale = useRef(0);
  const currentOpacity = useRef(0);
  
  useFrame((state, delta) => {
    // Rely strictly on 'visible' to show/hide to avoid flicker or layout bugs
    const targetScale = visible ? 1 : 0;
    const targetOpacity = visible ? 1 : 0;
    
    // Faster, more responsive lerp for snappier animations
    currentScale.current = THREE.MathUtils.lerp(currentScale.current, targetScale, 1 - Math.exp(-6 * delta));
    currentOpacity.current = THREE.MathUtils.lerp(currentOpacity.current, targetOpacity, 1 - Math.exp(-5 * delta));
    
    if (groupRef.current) {
      // Smoother floating animation with multiple frequencies
      const time = state.clock.elapsedTime;
      groupRef.current.position.y = Math.sin(time * 1.2) * 0.12 + Math.sin(time * 2.3) * 0.05 + 1.5;
      groupRef.current.scale.setScalar(currentScale.current);
      
      // Subtle group rotation for depth
      groupRef.current.rotation.y = Math.sin(time * 0.3) * 0.05;
    }
    
    // Staggered card animations with individual delays
    if (card1Ref.current) {
      const stagger1 = Math.max(0, (currentScale.current - 0.1) / 0.9);
      card1Ref.current.position.z = THREE.MathUtils.lerp(card1Ref.current.position.z, 0, 1 - Math.exp(-5 * delta));
      card1Ref.current.rotation.y = THREE.MathUtils.lerp(card1Ref.current.rotation.y, 0.35, 1 - Math.exp(-4 * delta));
    }
    
    if (card2Ref.current) {
      const stagger2 = Math.max(0, (currentScale.current - 0.05) / 0.95);
      card2Ref.current.position.z = THREE.MathUtils.lerp(card2Ref.current.position.z, -1, 1 - Math.exp(-5 * delta));
      card2Ref.current.scale.setScalar(THREE.MathUtils.lerp(card2Ref.current.scale.x, 1, 1 - Math.exp(-3 * delta)));
    }
    
    if (card3Ref.current) {
      const stagger3 = Math.max(0, (currentScale.current - 0.15) / 0.85);
      card3Ref.current.position.z = THREE.MathUtils.lerp(card3Ref.current.position.z, 0, 1 - Math.exp(-5 * delta));
      card3Ref.current.rotation.y = THREE.MathUtils.lerp(card3Ref.current.rotation.y, -0.35, 1 - Math.exp(-4 * delta));
    }
  });

  if (!visible && currentScale.current < 0.01) return null;

  return (
    <group position={[0, 4, 10]}>
      <group ref={groupRef}>
          <group ref={card1Ref} position={[-3.5, 0, -3]}>
            <HoloCard position={[0, 0, 0]} rotation={[0, 0, 0]} title="SYS_MONITOR" opacity={currentOpacity.current} />
          </group>
          <group ref={card2Ref} position={[0, 0, -4]} scale={0.8}>
            <HoloCard position={[0, 0, 0]} rotation={[0, 0, 0]} title="CORE_MATRIX" isMain opacity={currentOpacity.current} />
          </group>
          <group ref={card3Ref} position={[3.5, 0, -3]}>
            <HoloCard position={[0, 0, 0]} rotation={[0, 0, 0]} title="UPLINK_NODE" opacity={currentOpacity.current} />
          </group>
      </group>
    </group>
  );
}

function WormholeTransition({ active }) {
  const randomRange = useCallback((min, max) => THREE.MathUtils.randFloat(min, max), []);
  const createRandomCurve = useCallback((startPos) => {
    const points = [
      startPos.clone(),
      new THREE.Vector3(randomRange(-3, 3), randomRange(8, 13), startPos.z - randomRange(8, 14)),
      new THREE.Vector3(randomRange(-8, 8), randomRange(14, 20), startPos.z - randomRange(24, 34)),
      new THREE.Vector3(randomRange(-11, 11), randomRange(8, 14), startPos.z - randomRange(45, 60)),
      new THREE.Vector3(randomRange(-7, 7), randomRange(1, 6), startPos.z - randomRange(72, 92)),
      new THREE.Vector3(randomRange(-3, 3), randomRange(-1, 2), startPos.z - randomRange(100, 120)),
    ];

    return new THREE.CatmullRomCurve3(points, false, "chordal", 0.25);
  }, [randomRange]);

  const [curve, setCurve] = useState(() => createRandomCurve(new THREE.Vector3(0, 6, 18)));

  const tubeRef = useRef();
  const matRef = useRef();
  const progress = useRef(0);
  const { camera } = useThree();
  const startLookAt = useRef(new THREE.Vector3(0, 4, 10));

  useEffect(() => {
    if (!active) return;

    progress.current = 0;
    startLookAt.current.set(0, 4, 10);
    setCurve(createRandomCurve(camera.position.clone()));
  }, [active, camera, createRandomCurve]);

  useEffect(() => {
    return () => {
      const overlay = document.getElementById('whiteout-overlay');
      if (overlay) overlay.remove();
    };
  }, []);

  useFrame((state, delta) => {
    if (!active || !curve) return;
    if (matRef.current) matRef.current.uniforms.time.value += delta;
    
    // Faster than before to avoid a long travel before navigation.
    progress.current += delta * 0.34;
    const rawT = Math.min(progress.current, 1);
    
    const easedT = Math.pow(rawT, 3.2);
    
    const pos = curve.getPointAt(easedT);
    
    // Smoothly blend camera onto the rail completely killing the starting snap
    camera.position.lerp(pos, 0.2); 
    
    if (easedT < 0.98) {
      const nextPos = curve.getPointAt(Math.min(easedT + 0.03, 1));
      
      // Look forward, but blend from initial camera look anchor early on
      const targetLook = new THREE.Vector3().copy(startLookAt.current).lerp(nextPos, Math.min(rawT * 4, 1));
      camera.lookAt(targetLook);
    }

    // Smooth winding barrel roll
    const rollSpeed = Math.pow(rawT, 2) * 15;
    camera.rotation.z += delta * rollSpeed;
    
    // Massive lightspeed stretch, softly interpolating
    camera.fov = THREE.MathUtils.lerp(55, 155, Math.pow(rawT, 4));
    camera.updateProjectionMatrix();

    // Smooth transition crossfade before routing kicks in
    if (rawT > 0.85 && !document.getElementById('whiteout-overlay')) {
       const div = document.createElement('div');
       div.id = 'whiteout-overlay';
       div.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:white;opacity:0;transition:opacity 0.6s ease-in-out;z-index:99999;pointer-events:none;';
       // We add an identifier so the next page can fade it out
       div.classList.add('page-transition-overlay');
       document.body.appendChild(div);
       requestAnimationFrame(() => div.style.opacity = '1');
    }
  });

  if (!active) return null;

  return (
    <mesh ref={tubeRef}>
      <tubeGeometry args={[curve, 120, 4, 32, false]} />
      <shaderMaterial
        ref={matRef}
        side={THREE.BackSide}
        transparent
        blending={THREE.AdditiveBlending}
        uniforms={{
          time: { value: 0 },
          color1: { value: new THREE.Color('#000000') },
          color2: { value: new THREE.Color('#00FFFF') },
          color3: { value: new THREE.Color('#FFFFFF') }
        }}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float time;
          uniform vec3 color1;
          uniform vec3 color2;
          uniform vec3 color3;
          varying vec2 vUv;
          
          vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
          vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
          vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
          float snoise(vec2 v) {
            const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
            vec2 i  = floor(v + dot(v, C.yy) );
            vec2 x0 = v -   i + dot(i, C.xx);
            vec2 i1; i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
            vec4 x12 = x0.xyxy + C.xxzz;
            x12.xy -= i1;
            i = mod289(i);
            vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
            vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
            m = m*m; m = m*m;
            vec3 x = 2.0 * fract(p * C.www) - 1.0;
            vec3 h = abs(x) - 0.5;
            vec3 ox = floor(x + 0.5);
            vec3 a0 = x - ox;
            m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
            vec3 g;
            g.x  = a0.x  * x0.x  + h.x  * x0.y;
            g.yz = a0.yz * x12.xz + h.yz * x12.yw;
            return 130.0 * dot(m, g);
          }

          void main() {
            // Base dark cosmic noise
            float bgNoise = snoise(vec2(vUv.x * 2.0 - time * 3.0, vUv.y * 6.0)) * 0.5 + 0.5;
            vec3 bgColor = mix(color1, vec3(0.0, 0.05, 0.2), bgNoise);

            // High frequency precise cyan streaks
            vec2 uvLayer1 = vec2(vUv.x * 3.0 - time * 25.0, vUv.y * 40.0);
            float n1 = snoise(uvLayer1);
            float streak1 = smoothstep(0.85, 0.98, n1); 

            // Extremely thin and fast overlay streaks
            vec2 uvLayer2 = vec2(vUv.x * 5.0 - time * 40.0, vUv.y * 80.0);
            float n2 = snoise(uvLayer2);
            float streak2 = smoothstep(0.92, 0.99, n2); 

            float combinedStreaks = streak1 + streak2;

            vec3 finalColor = mix(bgColor, color2, combinedStreaks);
            
            // Core white-hot intersections
            finalColor = mix(finalColor, color3, pow(streak1 * streak2, 2.0) * 2.5);
            
            // Fading geometry ends
            float fade = smoothstep(0.0, 0.1, vUv.x) * smoothstep(1.0, 0.8, vUv.x);
            
            gl_FragColor = vec4(finalColor, fade * (combinedStreaks + bgNoise * 0.6));
          }
        `}
      />
    </mesh>
  );
}

function Scene({ focusedIndex, setFocusedIndex, showHologram, setShowHologram, isTransitioning }) {
  const ringGroupRef = useRef();
  const { gl } = useThree();
  const [hoveredModelIndex, setHoveredModelIndex] = useState(null);
  const isDragging = useRef(false);
  const previousX = useRef(0);
  const targetRotationY = useRef(0);
  const scroll = useScroll();

  useEffect(() => {
    const canvas = gl.domElement;
    const onPointerDown = (e) => { if (e.button !== 2 || focusedIndex !== null) return; isDragging.current = true; previousX.current = e.clientX; };
    const onPointerMove = (e) => { if (isDragging.current && focusedIndex === null) { const deltaX = e.clientX - previousX.current; targetRotationY.current += deltaX * 0.005; previousX.current = e.clientX; } };
    const onPointerUp = (e) => { if (e.button === 2) isDragging.current = false; };
    const onContextMenu = (e) => { e.preventDefault(); };
    const onWheel = (e) => {
      if (focusedIndex !== null || Math.abs(e.deltaX) <= 0) return;
      // Horizontal scroll mapping:
      // scroll left  (deltaX < 0) => clockwise
      // scroll right (deltaX > 0) => anticlockwise
      const direction = e.deltaX < 0 ? 1 : -1;
      targetRotationY.current += direction * Math.abs(e.deltaX) * 0.01;
    };
    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('contextmenu', onContextMenu);
    window.addEventListener('wheel', onWheel, { capture: true, passive: true });
    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('contextmenu', onContextMenu);
      window.removeEventListener('wheel', onWheel, { capture: true });
    };
  }, [gl, focusedIndex]);
const lastOffset = useRef(0);
  useFrame((_, delta) => {
    const offset = scroll ? scroll.offset : 0;
    
    // Reset hologram when scrolling back up (dropping below 80% scroll)
    if (offset < 0.8 && showHologram) {
      setShowHologram(false);
    }
    
    if (ringGroupRef.current) {
      ringGroupRef.current.rotation.y = THREE.MathUtils.lerp(ringGroupRef.current.rotation.y, targetRotationY.current, 1 - Math.exp(-8 * delta));
      
      // Makes the block smoothly fly UP and out of view
      const riseHeight = offset * 30; 
      
      // Ring disappears completely by 40% scroll (offset 0.4)
      const ringVisibility = 1 - THREE.MathUtils.smoothstep(offset, 0, 0.4);
      
      ringGroupRef.current.scale.setScalar(ringVisibility);
      ringGroupRef.current.position.set(0, riseHeight, -(offset * 10)); // Push backwards slightly as it flies up
    }

    if (focusedIndex === null && !isTransitioning) {
      const targetZ = showHologram ? 18 : 15; // Set back to see cards at Z=10
      const targetY = showHologram ? 6 : 5;
      _.camera.position.lerp(new THREE.Vector3(0, targetY, targetZ), 1 - Math.exp(-3 * delta));
      if (showHologram) {
        _.camera.lookAt(0, 4, 10); // Focus onto the cards at their new position
      }
    }
  });

  // Calculate card visibility factor: 0 at 60% scroll, 1 at 80% scroll
  const cardOffsetFactor = scroll ? THREE.MathUtils.smoothstep(scroll.offset, 1, 0) : 0;
  
  return (
    <>
      <color attach="background" args={['#050814']} />
      <fog attach="fog" args={['#050814', 8, 30]} />
      <ambientLight intensity={0.8} />
      <spotLight position={[0, 15, 0]} angle={0.6} penumbra={1} intensity={1.5} castShadow={false} />
      <spotLight position={[5, 12, 5]} angle={0.4} penumbra={0.8} intensity={3.0} color="#00E5FF" castShadow={false} />
      <spotLight position={[-5, 12, -5]} angle={0.4} penumbra={0.8} intensity={3.0} color="#0044FF" castShadow={false} />
      <pointLight position={[0, 3, 0]} intensity={1.5} distance={15} castShadow={false} />
      <Environment preset="city" background={false} frames={1} />
      <CameraAnimator focusedIndex={focusedIndex} isTransitioning={isTransitioning} />
      <WormholeTransition active={isTransitioning} />
      <HologramCards visible={showHologram} scaleFactor={cardOffsetFactor} />
      <FlowingGrid showHologram={showHologram} />
      <group ref={ringGroupRef} visible={!isTransitioning}>
        <ParallaxRig enabled={focusedIndex === null}>
          {/* Central base imported from Disc.jsx; floating discs orbit above it */}
          <group position={[0, 0.55, 0]}>
            <UniformDisc />
          </group>
          {DISC_DATA.map((disc, i) => (
            <group key={i}>
              <FloatingDisc
                {...disc}
                isFocused={focusedIndex === i}
                isLightOn={true}
                allowHoverScale={focusedIndex === null}
                onClick={(e) => { e.stopPropagation(); setFocusedIndex(i); }}
              />
              <group
                position={disc.position}
                name={`disc-${i}`}
                onPointerOver={() => { setHoveredModelIndex(i); document.body.style.cursor = "pointer"; }}
                onPointerOut={() => { setHoveredModelIndex(null); document.body.style.cursor = "default"; }}
                onClick={(e) => { e.stopPropagation(); setFocusedIndex(i); }}
              >
                <AnimatedBlock visible={true} popped={hoveredModelIndex === i}>
                  {BLOCK_CONFIGS[i].render()}
                </AnimatedBlock>
              </group>
            </group>
          ))}
        </ParallaxRig>
      </group>
      <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} visible={!isTransitioning}>
        <planeGeometry args={[60, 60]} />
        <shaderMaterial
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          uniforms={{
            color: { value: new THREE.Color("#ffffff") }
          }}
          vertexShader={`
            varying vec3 vWorldPos;
            void main() {
              vec4 worldPosition = modelMatrix * vec4(position, 1.0);
              vWorldPos = worldPosition.xyz;
              gl_Position = projectionMatrix * viewMatrix * worldPosition;
            }
          `}
          fragmentShader={`
            varying vec3 vWorldPos;
            uniform vec3 color;

            void main() {
              // 1 unit spacing for the grid lines
              vec2 grid = fract(vWorldPos.xz);
              
              float lineDistX = min(grid.x, 1.0 - grid.x);
              float lineDistZ = min(grid.y, 1.0 - grid.y);
              
              // Solid core lines
              float coreX = smoothstep(0.8, 0.0, lineDistX);
              float coreZ = smoothstep(0.8, 0.0, lineDistZ);
              float core = max(coreX, coreZ);
              
              // Neon-like glow falloff
              float glowX = 0.015 / max(lineDistX, 0.005) - 0.03;
              float glowZ = 0.015 / max(lineDistZ, 0.005) - 0.03;
              float glow = max(glowX, glowZ);
              
              float alpha = max(core, glow);
              
              // Radial fade to hide the edges of the plane
              float dist = length(vWorldPos.xz);
              float fade = smoothstep(30.0, 5.0, dist);
              
              // Bluish-Red gradient mixing based on world position (Z depth)
              vec3 colorDeepBlue = vec3(0.0, 0.08, 0.32);
              vec3 colorBrightBlue = vec3(0.0, 0.52, 0.82);
              
              // Normalize Z from -15 to 15 (grid general view area) into 0.0 -> 1.0 blend
              float gradFactor = smoothstep(-15.0, 15.0, vWorldPos.z);
              vec3 gridColor = mix(colorDeepBlue, colorBrightBlue, gradFactor);
              
              // Boost intensity on the core to make it pop with the gradient
              gl_FragColor = vec4(gridColor * (1.0 + core * 1.5), clamp(alpha * fade, 0.0, 1.0));
            }
          `}
        />
      </mesh>
      <mesh position={[0, 30, -30]} visible={!isTransitioning}><planeGeometry args={[60, 60]} /><meshStandardMaterial color="#d4d7e4ff" roughness={0.8} metalness={1} /></mesh>
      <mesh position={[-30, 30, 0]} rotation={[0, Math.PI / 2, 0]} visible={!isTransitioning}><planeGeometry args={[60, 60]} /><meshStandardMaterial color="#d6dae8ff" roughness={0.8} metalness={0} /></mesh>
      <mesh position={[30, 30, 0]} rotation={[0, -Math.PI / 2, 0]} visible={!isTransitioning}><planeGeometry args={[60, 60]} /><meshStandardMaterial color="#050814" roughness={0.8} metalness={0} /></mesh>
    </>
  );
}

function DiscSidebar({ focusedIndex, setFocusedIndex, sidebarRef }) {
  return (
    <AnimatePresence>
      {focusedIndex !== null && (
        <motion.div ref={sidebarRef} initial={{ x: "100%", opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: "100%", opacity: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="absolute right-0 top-0 h-screen w-full sm:w-[400px] bg-black/60 backdrop-blur-2xl border-l border-[#00E5FF]/30 shadow-[-30px_0_80px_-20px_rgba(0,229,255,0.3)] z-50 flex flex-col pointer-events-none">
          <div className="flex-1 p-12 flex flex-col pt-28 overflow-y-auto">
            <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-[#00E5FF] mb-3 tracking-tight">{SECTIONS[focusedIndex].name}</h2>
            <h3 className="text-2xl font-bold text-cyan-300 uppercase tracking-widest mb-10">{SECTIONS[focusedIndex].tagline}</h3>
            <div className="w-16 h-1.5 bg-gradient-to-r from-[#00E5FF] to-blue-500 rounded-full mb-10" />
            <p className="text-slate-300 text-xl leading-relaxed font-light">{SECTIONS[focusedIndex].description}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const rootRef = useRef(null);
  const sidebarRef = useRef(null);
  const [focusedIndex, setFocusedIndex] = useState(null);
  const [showHologram, setShowHologram] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showLoader, setShowLoader] = useState(() => {
    if (typeof window === 'undefined') return true;
    // Check sessionStorage for current session - persists across refresh but not new tab/session
    const sessionShown = sessionStorage.getItem('loader_shown_this_session') === 'true';
    return !sessionShown;
  });

  const handleLoaderComplete = () => {
    // Mark as shown in this session (prevents showing again on back button)
    sessionStorage.setItem('loader_shown_this_session', 'true');
    setShowLoader(false);
  };

  useEffect(() => {
    if (focusedIndex === null) return;
    const rootEl = rootRef.current;
    if (!rootEl) return;

    const onPointerDown = (event) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (sidebarRef.current && sidebarRef.current.contains(target)) return;

      const canvasEl = rootEl.querySelector("canvas");
      if (canvasEl && canvasEl.contains(target)) return;

      setFocusedIndex(null);
    };

    rootEl.addEventListener("pointerdown", onPointerDown);
    return () => rootEl.removeEventListener("pointerdown", onPointerDown);
  }, [focusedIndex]);

  return (
    <>
      {showLoader && <Loader onComplete={handleLoaderComplete} />}
      <div ref={rootRef} className="relative w-screen h-screen overflow-hidden">
        <div className="absolute inset-0 z-[1]">
        <Canvas 
          dpr={[1, 1.1]} 
          camera={{ position: [0, 5, 15], fov: 55 }} 
          onPointerMissed={() => setFocusedIndex(null)}
          gl={{ 
            antialias: false, 
            alpha: false, 
            powerPreference: "high-performance",
            toneMapping: THREE.ACESFilmicToneMapping, 
            toneMappingExposure: 1.2 
          }}
          performance={{ min: 0.35 }}
        >
          <ScrollControls pages={2} damping={0.25} distance={1.5}>
            <Suspense fallback={null}>
              <Scene focusedIndex={focusedIndex} setFocusedIndex={setFocusedIndex} showHologram={showHologram} setShowHologram={setShowHologram} isTransitioning={isTransitioning} />
            </Suspense>
            <Scroll html style={{ width: '100vw' }}>
              <div className={`w-screen h-screen flex flex-col items-center justify-center transition-all duration-1000 ${isTransitioning ? 'pointer-events-none opacity-0 scale-150 duration-500' : showHologram ? 'pointer-events-none opacity-0 scale-110' : 'pointer-events-auto opacity-100 scale-100'}`} style={{ top: '100vh', position: 'absolute' }}>
                <div className="w-full h-full flex flex-col items-center justify-center p-20 text-center bg-gradient-to-t from-black/80 to-transparent">
                  <div className="inline-block px-5 py-2 rounded-full border border-cyan-400/40 bg-cyan-900/30 text-cyan-300 text-sm font-bold tracking-widest uppercase mb-6 backdrop-blur-sm">Phase II</div>
                  <h2 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-[#00E5FF] max-w-5xl drop-shadow-[0_0_30px_rgba(0,229,255,0.4)] mb-8">
                    DevlUp Labs
                  </h2>
                  <p className="text-2xl text-slate-300 max-w-3xl font-light leading-relaxed drop-shadow-md">
                    You've reached the second chapter. This is the perfect space to introduce new case studies, interactive articles, or showcase immersive 3D content.
                  </p>
                  <button onClick={() => {
                    setIsTransitioning(true);
                    // Match the shorter wormhole animation duration.
                    setTimeout(() => navigate('/explore'), 3200);
                  }} className="mt-14 px-12 py-5 rounded-full bg-white/10 text-white font-bold tracking-[0.2em] uppercase hover:bg-white/20 transition-all border border-white/30 hover:scale-[1.03] hover:shadow-[0_0_40px_rgba(0,229,255,0.3)] backdrop-blur-md">
                    Explore Further
                  </button>
                </div>
              </div>
            </Scroll>
          </ScrollControls>
        </Canvas>
      </div>
      <div className="absolute inset-0 pointer-events-none z-[10] overflow-hidden">
        <DiscSidebar focusedIndex={focusedIndex} setFocusedIndex={setFocusedIndex} sidebarRef={sidebarRef} />
      </div>
    </div>
    </>
  );
}
