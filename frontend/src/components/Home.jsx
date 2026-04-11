import React, { useRef, useMemo, useState, useCallback, useEffect, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, ScrollControls, Scroll, useScroll, OrbitControls, Html, PerspectiveCamera, useGLTF } from "@react-three/drei";
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from "three";
import { AnimatePresence, motion } from "framer-motion";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";

/* ==================== DISC COMPONENTS ==================== */

function UniformDisc() {
	// Create a 2D shape with a hole, then we will extrude it into 3D
	const shape = useMemo(() => {
		const s = new THREE.Shape();
		s.absarc(0, 0,8, 0, Math.PI * 2, false); // Outer radius
		const hole = new THREE.Path();
		hole.absarc(0, 0, 5.1, 0, Math.PI * 2, true); // Inner radius (hole)
		s.holes.push(hole);
		return s;
	}, []);

	return (
		// Positioned slightly down so the extrusion (which goes "up") centers around Y=0
		<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.3, 0]}>
			{/* ExtrudeGeometry gives the flat shape thickness (depth) along what becomes the Y axis */}
			<extrudeGeometry args={[shape, { depth: 0.05, bevelEnabled: false, curveSegments: 48 }]} />
			<meshStandardMaterial color="#1565C0" emissive="#0D47A1" emissiveIntensity={0.08} metalness={0} roughness={1} />
		</mesh>
	);
}

export function Disc() {
	return (
		<div className="w-screen h-screen bg-[#070b16]">
			<Canvas camera={{ position: [0, 4, 8], fov: 50 }} dpr={[1, 1.2]}>
				<color attach="background" args={["#070b16"]} />
				<ambientLight intensity={0.45} />
				<directionalLight position={[6, 8, 4]} intensity={1.1} />
				<pointLight position={[-5, 3, -4]} intensity={0.6} color="#2ea8ff" />
				<UniformDisc />
				<OrbitControls enablePan={false} />
			</Canvas>
		</div>
	);
}

/* ==================== EFFECTS COMPONENTS ==================== */

export function AnimatedBlock({ visible, popped = false, children }) {
  const groupRef = useRef();
  const currentScale = useRef(0);
  useFrame((_, delta) => {
    const target = visible ? (popped ? 2.05 : 1.8) : 0;
    currentScale.current = THREE.MathUtils.lerp(currentScale.current, target, 1 - Math.exp(-4 * delta));
    if (groupRef.current) groupRef.current.scale.setScalar(currentScale.current);
  });
  return <group ref={groupRef} scale={0}>{children}</group>;
}

export function FloatingDisc({ position, color, scale = 1, isFocused, isLightOn = true, allowHoverScale = true, onClick, softness = 2.0 }) {
  const meshRef = useRef(), caseMatRef = useRef();
  const [hovered, setHovered] = useState(false);
  const targetScale = useRef(scale);

  useFrame((_, delta) => {
    const tCaseOp = isLightOn ? 0.4 : 0;
    if (caseMatRef.current) {
      caseMatRef.current.uniforms.uGlobalOpacity.value = THREE.MathUtils.lerp(caseMatRef.current.uniforms.uGlobalOpacity.value, tCaseOp, 1 - Math.exp(-4 * delta));
      caseMatRef.current.uniforms.uTime.value += delta;
    }
    
    if (meshRef.current) {
      targetScale.current = hovered && allowHoverScale ? scale * 1.05 : scale;
      const currentScale = meshRef.current.scale.x;
      const newScale = THREE.MathUtils.lerp(currentScale, targetScale.current, 1 - Math.exp(-8 * delta));
      meshRef.current.scale.setScalar(newScale);
    }
  });

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
      
      <mesh><cylinderGeometry args={[1.45, 1.5, 0.4, 32]} /><meshStandardMaterial color="#020408" roughness={0.6} metalness={0.4} /></mesh>

      {isLightOn && (
        <>
          <mesh position={[0, 0.201, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[1.1, 1.15, 36]} /><meshBasicMaterial color="#00E5FF" transparent opacity={0.8} /></mesh>
          <mesh position={[0, 0.201, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.9, 0.92, 36]} /><meshBasicMaterial color="#0044FF" transparent opacity={0.4} /></mesh>

          {dots.map((pos, i) => (
            <mesh key={i} position={pos} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.04, 16]} />
              <meshBasicMaterial color="#00E5FF" transparent opacity={0.9} blending={THREE.AdditiveBlending} />
            </mesh>
          ))}

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
                  float viewDot = abs(dot(normal, viewDir));
                  float coreGlow = pow(viewDot, 1.8); 
                  float hotCore = pow(viewDot, 2.0); 
                  float verticalFade = pow(1.0 - vUv.y, 3.0); 
                  float bottomFade = smoothstep(0.0, 0.02, vUv.y);
                  float intensity = (coreGlow * 0.1 + hotCore * 0.9) * verticalFade * bottomFade * uGlobalOpacity;
                  float pulse = sin(uTime * 2.0 - vUv.y * 10.0) * 0.05 + 0.95;
                  intensity *= pulse;
                  vec3 finalColor = mix(uColorOuter, uColorInner, hotCore * 0.8);
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

export function FloatingBlocks({ count = 30 }) {
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
      
      if (curY > 35 || curY < -20) {
         dummy.position.set(0, -999, 0);
      } else {
         const xOff = Math.sin(pTime * p.speed) * (p.factor * 0.05) * (1 + r1);
         const zOff = Math.cos(pTime * p.speed) * (p.factor * 0.05) * (1 + r1);
         const yOff = Math.sin(pTime * p.speed * 1.5) * (p.factor * 0.05);
         const spread = 1 + r1 * 0.5;
         
         dummy.position.set(p.x * spread + xOff, curY + yOff, p.z * spread + zOff);
         dummy.rotation.set(pTime * p.speed, pTime * p.speed * 0.5, pTime * p.speed * 0.2);
         dummy.scale.setScalar(p.scale);
      }
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

export function CameraAnimator({ focusedIndex, isTransitioning }) {
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
    
    if (targetSet && previousFocused !== null && focusedIndex !== previousFocused) {
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

export function ParallaxRig({ children, enabled }) {
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

export function FlowingGrid({ showHologram }) {
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

    if (offset > 0.8) return;

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

const HoloCard = ({ position, rotation, title, opacity, isMain }) => {
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[isMain ? 4 : 3, isMain ? 6 : 4.5]} />
      <meshBasicMaterial color={isMain ? "#00E5FF" : "#0044FF"} transparent opacity={opacity * 0.5} wireframe />
    </mesh>
  );
};

export function HologramCards({ visible, scaleFactor = 1 }) {
  const groupRef = useRef();
  const card1Ref = useRef();
  const card2Ref = useRef();
  const card3Ref = useRef();
  const currentScale = useRef(0);
  const currentOpacity = useRef(0);
  
  useFrame((state, delta) => {
    const targetScale = visible ? 1 : 0;
    const targetOpacity = visible ? 1 : 0;
    
    currentScale.current = THREE.MathUtils.lerp(currentScale.current, targetScale, 1 - Math.exp(-6 * delta));
    currentOpacity.current = THREE.MathUtils.lerp(currentOpacity.current, targetOpacity, 1 - Math.exp(-5 * delta));
    
    if (groupRef.current) {
      const time = state.clock.elapsedTime;
      groupRef.current.position.y = Math.sin(time * 1.2) * 0.12 + Math.sin(time * 2.3) * 0.05 + 1.5;
      groupRef.current.scale.setScalar(currentScale.current);
      groupRef.current.rotation.y = Math.sin(time * 0.3) * 0.05;
    }
    
    if (card1Ref.current) {
      card1Ref.current.position.z = THREE.MathUtils.lerp(card1Ref.current.position.z, 0, 1 - Math.exp(-5 * delta));
      card1Ref.current.rotation.y = THREE.MathUtils.lerp(card1Ref.current.rotation.y, 0.35, 1 - Math.exp(-4 * delta));
    }
    
    if (card2Ref.current) {
      card2Ref.current.position.z = THREE.MathUtils.lerp(card2Ref.current.position.z, -1, 1 - Math.exp(-5 * delta));
      card2Ref.current.scale.setScalar(THREE.MathUtils.lerp(card2Ref.current.scale.x, 1, 1 - Math.exp(-3 * delta)));
    }
    
    if (card3Ref.current) {
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

export function WormholeTransition({ active }) {
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
    
    progress.current += delta * 0.34;
    const rawT = Math.min(progress.current, 1);
    const easedT = Math.pow(rawT, 3.2);
    const pos = curve.getPointAt(easedT);
    
    camera.position.lerp(pos, 0.2); 
    
    if (easedT < 0.98) {
      const nextPos = curve.getPointAt(Math.min(easedT + 0.03, 1));
      const targetLook = new THREE.Vector3().copy(startLookAt.current).lerp(nextPos, Math.min(rawT * 4, 1));
      camera.lookAt(targetLook);
    }

    const rollSpeed = Math.pow(rawT, 2) * 15;
    camera.rotation.z += delta * rollSpeed;
    
    camera.fov = THREE.MathUtils.lerp(55, 155, Math.pow(rawT, 4));
    camera.updateProjectionMatrix();

    if (rawT > 0.85 && !document.getElementById('whiteout-overlay')) {
       const div = document.createElement('div');
       div.id = 'whiteout-overlay';
       div.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:white;opacity:0;transition:opacity 0.6s ease-in-out;z-index:99999;pointer-events:none;';
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
            float bgNoise = snoise(vec2(vUv.x * 2.0 - time * 3.0, vUv.y * 6.0)) * 0.5 + 0.5;
            vec3 bgColor = mix(color1, vec3(0.0, 0.05, 0.2), bgNoise);
            vec2 uvLayer1 = vec2(vUv.x * 3.0 - time * 25.0, vUv.y * 40.0);
            float n1 = snoise(uvLayer1);
            float streak1 = smoothstep(0.85, 0.98, n1); 
            vec2 uvLayer2 = vec2(vUv.x * 5.0 - time * 40.0, vUv.y * 80.0);
            float n2 = snoise(uvLayer2);
            float streak2 = smoothstep(0.92, 0.99, n2); 
            float combinedStreaks = streak1 + streak2;
            vec3 finalColor = mix(bgColor, color2, combinedStreaks);
            finalColor = mix(finalColor, color3, pow(streak1 * streak2, 2.0) * 2.5);
            float fade = smoothstep(0.0, 0.1, vUv.x) * smoothstep(1.0, 0.8, vUv.x);
            gl_FragColor = vec4(finalColor, fade * (combinedStreaks + bgNoise * 0.6));
          }
        `}
      />
    </mesh>
  );
}

/* ==================== MODELS COMPONENTS ==================== */

export function HomeModel() {
  const { scene } = useGLTF("/mod.glb");
  return <primitive object={scene} scale={0.8} position={[0, 0.50, 0.2]} rotation={[Math.PI / 2, 0, 0]} />;
}

export function MicModel() {
  const { scene } = useGLTF("/mic.glb");
  if (!scene) return null;
  return (
    <primitive
      object={scene}
      scale={0.001}
      position={[0.05, 0.2, -0.1]}
      rotation={[0, -Math.PI / 3, 0]}
    />
  );
}

export function VideoButtonModel() {
  const { scene } = useGLTF("/MOVIE%20-%20Copy.glb");
  const clone = useMemo(() => (scene ? scene.clone(true) : null), [scene]);

  useEffect(() => {
    if (!clone) return;
    clone.traverse((n) => {
      if (n.isMesh) {
        n.castShadow = true;
        n.receiveShadow = true;
        n.frustumCulled = false;
        if (n.material) {
          n.material.side = THREE.DoubleSide;
        }
      }
    });
  }, [clone]);

  if (!clone) return null;

  return (
    <group position={[-0.05, -0.55, -0.85]} rotation={[Math.PI / 2, 0, Math.PI / 3]} scale={0.009}>
      <primitive object={clone} />
    </group>
  );
}

export function TimelineModel() {
  const { scene } = useGLTF("/timeline.glb");
  const clone = useMemo(() => (scene ? scene.clone(true) : null), [scene]);

  useEffect(() => {
    if (!clone) return;
    clone.traverse((n) => {
      if (n.isMesh) {
        n.castShadow = true;
        n.receiveShadow = true;
        n.frustumCulled = false;
        if (n.material) n.material.side = THREE.DoubleSide;
      }
    });
  }, [clone]);

  if (!clone) return null;

  return (
    <group position={[0, 0.2, 0]} rotation={[0, Math.PI / 2, 0]} scale={0.1}>
      <primitive object={clone} />
    </group>
  );
}

export function DocumentModel() {
  const { scene } = useGLTF("/3d_document_object_and_document_board.glb");
  const clones = useMemo(() => {
    if (!scene) return [];
    return Array.from({ length: 3 }, () => scene.clone());
  }, [scene]);

  if (!clones.length) return null;

  return (
    <group>
      <primitive object={clones[0]} scale={2.1} position={[-0.3, 0.2, -0.2]} rotation={[0, -Math.PI / 1.5, 0]} />
      <primitive object={clones[1]} scale={2.1} position={[-0.2, 0.2, -0.1]} rotation={[0, -Math.PI / 1.5, 0]} />
      <primitive object={clones[2]} scale={2.1} position={[-0.1, 0.2, -0]} rotation={[0, -Math.PI / 1.5, 0]} />
    </group>
  );
}

export function StickmanModel() {
  const { scene } = useGLTF("/stickman2f.glb");
  const groupRef = useRef();
  const NUM_CLONES = 10;
  const RADIUS = -0.01;
  const HEIGHT = 0.12;
  const CENTER_X = 0.001;
  const CENTER_Z = 0.02;
  const clones = useMemo(() => {
    if (!scene) return [];
    return Array.from({ length: NUM_CLONES }, () => scene.clone());
  }, [scene]);

  const positionsAndRotations = useMemo(() => {
    const data = [];
    for (let i = 0; i < NUM_CLONES; i++) {
      const angle = (i / NUM_CLONES) * Math.PI * 2;
      const x = CENTER_X + Math.cos(angle) * RADIUS;
      const z = CENTER_Z + Math.sin(angle) * RADIUS;
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

export const BLOCK_CONFIGS = [
  { render: () => <HomeModel /> },
  { render: () => <TimelineModel /> },
  { render: () => <VideoButtonModel /> },
  { render: () => <MicModel /> },
  { render: () => <DocumentModel /> },
  { render: () => <StickmanModel /> },
];

useGLTF.preload("/mod.glb");
useGLTF.preload("/stickman2f.glb");
useGLTF.preload("/mic.glb");
useGLTF.preload("/MOVIE%20-%20Copy.glb");
useGLTF.preload("/timeline.glb");
useGLTF.preload("/3d_document_object_and_document_board.glb");

/* ==================== LOADER COMPONENTS ==================== */

function LoaderModel() {
  const { scene } = useGLTF('/logocolour1.glb');
  const coloredScene = useMemo(() => {
    const dotColor = new THREE.Color('#5CB8D6');
    const slashColor = new THREE.Color('#E85D5D');
    const clonedScene = scene.clone(true);
    const meshEntries = [];

    clonedScene.traverse((obj) => {
      if (!obj.isMesh || !obj.material) return;

      const meshBox = new THREE.Box3().setFromObject(obj);
      const meshCenter = new THREE.Vector3();
      meshBox.getCenter(meshCenter);
      meshEntries.push({ mesh: obj, centerX: meshCenter.x });
    });

    // Assign left-most mesh as dot and right-side mesh(es) as slash.
    const orderedEntries = [...meshEntries].sort((a, b) => a.centerX - b.centerX);
    const meshColorMap = new Map();
    orderedEntries.forEach((entry, idx) => {
      meshColorMap.set(entry.mesh, idx === 0 ? dotColor : slashColor);
    });

    clonedScene.traverse((obj) => {
      if (!obj.isMesh || !obj.material) return;
      const partColor = meshColorMap.get(obj) || slashColor;

      const paintMaterial = (material) => {
        const nextMaterial = material.clone();

        if (nextMaterial.color) nextMaterial.color.copy(partColor);
        if ('emissive' in nextMaterial) {
          nextMaterial.emissive.set('#000000');
          nextMaterial.emissiveIntensity = 0;
        }
        if ('metalness' in nextMaterial) nextMaterial.metalness = 0.28;
        if ('roughness' in nextMaterial) nextMaterial.roughness = 0.62;

        return nextMaterial;
      };

      if (Array.isArray(obj.material)) {
        obj.material = obj.material.map((material) => paintMaterial(material));
      } else {
        obj.material = paintMaterial(obj.material);
      }

      const edgeColor = partColor.clone();
      const edgeGeometry = new THREE.EdgesGeometry(obj.geometry, 15);

      const edgeCore = new THREE.LineSegments(
        edgeGeometry,
        new THREE.LineBasicMaterial({ color: edgeColor, transparent: true, opacity: 0.95, toneMapped: false })
      );
      edgeCore.renderOrder = 10;

      const edgeGlow = new THREE.LineSegments(
        edgeGeometry.clone(),
        new THREE.LineBasicMaterial({ color: edgeColor, transparent: true, opacity: 0.34, toneMapped: false })
      );
      edgeGlow.scale.setScalar(1.012);
      edgeGlow.renderOrder = 9;

      obj.add(edgeGlow);
      obj.add(edgeCore);
    });

    // Center the logo so text and model share the same visual anchor.
    const box = new THREE.Box3().setFromObject(clonedScene);
    const center = new THREE.Vector3();
    box.getCenter(center);
    clonedScene.position.sub(center);

    return clonedScene;
  }, [scene]);

  return (
    <group position={[0, 0, 0]}>
      <primitive object={coloredScene} scale={1.05} position={[0, -0.8, 0]} rotation={[Math.PI / 2, 0, 0]} />
    </group>
  );
}

function LoaderScene() {
  return (
    <>
      <directionalLight position={[3, 4, 3]} intensity={1.25} color="#ffffff" />
      <pointLight position={[-2, 1.5, 3]} intensity={0.7} color="#82ddff" />
      <pointLight position={[2, 1.5, 3]} intensity={0.75} color="#ff7d85" />
      <LoaderModel />
      <mesh position={[0, -1.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.4, 64]} />
        <meshBasicMaterial color="#f4f7ff" transparent opacity={0.14} />
      </mesh>
    </>
  );
}

useGLTF.preload('/logocolour1.glb');

export const Loader = ({ onComplete }) => {
  const [text, setText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [cursorFading, setCursorFading] = useState(false);
  const [fading, setFading] = useState(false);
  const [showModel, setShowModel] = useState(false);
  const [morphPath, setMorphPath] = useState(false);

  useEffect(() => {
    const pathPrefix = './';
    let typedIndex = 0;
    let typingTimer;
    let modelPauseTimer;

    const blinkCycleMs = 650;
    const blinkCycles = 3;
    const blinkDuration = blinkCycleMs * blinkCycles;
    const cursorFadeMs = 200;
    const pathPauseAfterSlash = 1000;
    const typeCharDelayMs = 320;
    const morphDurationMs = 1200;
    const modelShowDuration = 2600;

    // Keep cursor visible while CSS handles 3 smooth blink cycles.
    setText('');
    setShowModel(false);
    setMorphPath(false);
    setFading(false);
    setShowCursor(true);

    const startCursorFadeTimer = setTimeout(() => {
      setCursorFading(true);
    }, blinkDuration);

    const hideCursorAndTypeTimer = setTimeout(() => {
      setShowCursor(false);

      // Start typing "./" after cursor has faded out.
      const typeNext = () => {
        typedIndex += 1;
        setText(pathPrefix.slice(0, typedIndex));

        if (typedIndex < pathPrefix.length) {
          // Keep a deliberate pace so '.' appears first, then '/'.
          typingTimer = setTimeout(typeNext, typeCharDelayMs);
        } else {
          // Morph path into model: path scales/fades out while model fades/scales in.
          typingTimer = setTimeout(() => {
            setMorphPath(true);
            setShowModel(true);
            modelPauseTimer = setTimeout(() => {
              setFading(true);
            }, morphDurationMs + modelShowDuration);
          }, pathPauseAfterSlash);
        }
      };

      typeNext();
    }, blinkDuration + cursorFadeMs);

    // Fire onComplete after the fade-out animation fully finishes
    const fadeOutMs = 1500;
    const completeTimer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 7600 + fadeOutMs + 200);

    return () => {
      clearTimeout(startCursorFadeTimer);
      clearTimeout(hideCursorAndTypeTimer);
      clearTimeout(typingTimer);
      clearTimeout(modelPauseTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center cursor-text loader-bg-bluish-red ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        transition: 'opacity 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      }}
    >
      <div className="relative w-[600px] h-[480px] sm:w-[860px] sm:h-[580px]">
        <div className={`absolute inset-0 ${showModel ? 'loader-model-enter loader-model-rotate' : 'opacity-0 scale-75'}`} style={{ perspective: '1000px' }}>
          <Canvas camera={{ position: [0, 0, 4], fov: 25 }}>
            <LoaderScene />
          </Canvas>
        </div>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className={`text-blacktext-[9rem] sm:text-[19rem] flex items-center loader-path-base ${morphPath ? 'loader-path-morph' : ''}`}>
            <span className="loader-brand-text loader-path-symbols">
              {text.includes('.') && (
                <span className={`loader-path-dot ${morphPath && text === './' ? 'loader-dot-orbit' : ''}`}>Â·</span>
              )}
              {text.includes('/') && <span className={`loader-path-slash ${morphPath && text === './' ? 'loader-slash-orbit' : ''}`}>/</span>}
            </span>
            {showCursor && (
              <span className={`loader-text-cursor ml-1 ${cursorFading ? 'loader-cursor-fade' : 'loader-cursor-blink'}`}>
                |
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ==================== SCIFI HUD COMPONENTS ==================== */

const HUDStyles = () => (
  <>
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet" />
  <style>{`
    .whiteout-fade {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: white;
      z-index: 99999;
      pointer-events: none;
      animation: clear-whiteout 1.5s ease-out forwards;
    }

    @keyframes clear-whiteout {
      0% { opacity: 1; }
      100% { opacity: 0; }
    }

    .holo-card-shell {
      width: min(92vw, 1500px);
      height: min(88vh, 720px);
      position: relative;
      overflow: hidden;
      border: 1px solid rgba(182, 213, 255, 0.48);
      border-radius: 34px;
      background:
        radial-gradient(120% 120% at 80% 20%, rgba(110, 158, 255, 0.32) 0%, rgba(98, 123, 255, 0.05) 42%, rgba(7, 14, 36, 0.14) 100%),
        linear-gradient(165deg, rgba(164, 202, 255, 0.15) 0%, rgba(82, 105, 217, 0.09) 38%, rgba(17, 26, 56, 0.15) 100%);
      backdrop-filter: blur(10px);
      box-shadow:
        0 0 40px rgba(157, 194, 255, 0.22),
        0 18px 50px rgba(3, 9, 26, 0.45),
        inset 0 0 0 1px rgba(208, 227, 255, 0.22);
      color: #eef3ff;
      font-family: 'Trebuchet MS', 'Segoe UI', sans-serif;
    }
    .holo-border-glow {
      position: absolute;
      inset: 2px;
      border-radius: 36px;
      border: 2px solid rgba(223, 240, 255, 0.35);
      box-shadow: inset 0 0 24px rgba(147, 194, 255, 0.28);
      pointer-events: none;
    }
    .holo-corner {
      position: absolute;
      width: 64px;
      height: 64px;
      border: 3px solid rgba(224, 237, 255, 0.75);
      border-bottom: none;
      border-right: none;
      border-radius: 10px 0 0 0;
      opacity: 0.9;
    }
    .holo-avatar-ring {
      position: absolute;
      left: 50%;
      top: 4.2%;
      width: 44%;
      aspect-ratio: 1;
      border-radius: 999px;
      opacity: 0.2;
      transform: translateX(-50%);
      border: 3px solid rgba(219, 239, 255, 0.9);
      box-shadow: 0 0 28px rgba(155, 198, 255, 0.6), inset 0 0 30px rgba(127, 176, 255, 0.25);
    }
    
    @keyframes typing {
      from { width: 0 }
      to { width: 100% }
    }
    
    @keyframes blink-caret {
      from, to { border-right-color: transparent }
      50% { border-right-color: rgba(223, 240, 255, 0.75); }
    }

    @keyframes fade-in-text {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .typewriter-title-container {
      position: absolute;
      top: 6%;
      left: 0;
      right: 0;
      display: flex;
      justify-content: center;
      z-index: 10;
    }

    .typewriter-title {
      font-family: 'Orbitron', sans-serif;
      font-size: 1.8rem;
      letter-spacing: 6px;
      font-weight: 700;
      text-transform: uppercase;
      color: rgba(223, 240, 255, 0.95);
      text-shadow: 0 0 24px rgba(147, 194, 255, 0.7);
      overflow: hidden;
      border-right: .15em solid transparent;
      white-space: nowrap;
      display: inline-block;
      text-align: center;
      animation: 
        typing 3s steps(40) forwards,
        blink-caret .5s step-end 1;
    }

    .devlup-labs-watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: min(4vw, 4rem);
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 16px;
      opacity: 0.2;
      white-space: nowrap;
      color: rgba(219, 239, 255, 1);
      text-shadow: 0 0 40px rgba(155, 198, 255, 0.8);
      pointer-events: none;
      z-index: 2;
    }

    .about-us-content {
      position: absolute;
      top: 22%;
      left: 8%;
      right: 8%;
      bottom: 8%;
      color: rgba(238, 243, 255, 0.8);
      font-size: 1.15rem;
      line-height: 1.9;
      text-shadow: 0 0 12px rgba(157, 194, 255, 0.25);
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
      z-index: 5;
      opacity: 0;
      animation: fade-in-text 1.2s ease-out 2.6s forwards;
    }

    .about-us-content p {
      margin: 0;
      text-align: justify-center;
    }

    .hud-back-button {
      position: fixed;
      top: 22px;
      left: 22px;
      z-index: 100000;
      border: 1px solid rgba(198, 223, 255, 0.55);
      border-radius: 999px;
      background: linear-gradient(160deg, rgba(14, 24, 49, 0.78), rgba(33, 60, 118, 0.42));
      color: rgba(233, 244, 255, 0.95);
      font-family: 'Trebuchet MS', 'Segoe UI', sans-serif;
      font-size: 0.95rem;
      letter-spacing: 0.04em;
      padding: 0.55rem 0.95rem;
      cursor: pointer;
      box-shadow: 0 0 18px rgba(133, 184, 255, 0.32), inset 0 0 0 1px rgba(220, 237, 255, 0.15);
      transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
    }

    .hud-back-button:hover {
      transform: translateY(-1px);
      border-color: rgba(214, 233, 255, 0.78);
      box-shadow: 0 0 22px rgba(139, 189, 255, 0.45), inset 0 0 0 1px rgba(230, 242, 255, 0.25);
    }

    .hud-back-button:active {
      transform: translateY(0);
    }
    
  `}</style>
  </>
);

const ProfileCard = () => {
  return (
    <group>
      <Html transform distanceFactor={9} position={[0, 0, 0]} zIndexRange={[100, 0]}>
        <div className="holo-card-shell">
          <div className="holo-border-glow" />
          <div className="holo-corner tl" />
          <div className="holo-corner tr" />
          <div className="holo-corner bl" />
          <div className="holo-corner br" />

          <div className="typewriter-title-container">
            <h2 className="typewriter-title">About Us</h2>
          </div>

          <div className="holo-avatar-ring">
            <div className="devlup-labs-watermark">DevlUp Labs</div>
          </div>
          <div className="holo-avatar" />

          <div className="about-us-content">
            <p>
              We are DevlUp Labs, a visionary collective pioneering the bleeding edge of holographic and cybernetic design. Built from the ground up by forward-thinking engineers and architects, our fundamental goal is to reshape the very nature of human-computer interaction in three-dimensional space, delivering seamless and immersive experiences that defy classical computing limits.
            </p>
            <p>
              Founded on the principles of open-source collaboration and unyielding innovation, our team merges low-latency WebGL architectures with hyper-futuristic UI aesthetics. We believe that technology should not just be a tool, but a synthetic extension of our digital identities-one that reacts, illuminates, and adapts to the contours of virtual environments.
            </p>
            <p>
              Join us as we chart the unknown territories of the metaverse, translating abstract ideas into tangible glowing realities. We don't just build software; we fabricate digital dreams coded in neon and starlight, establishing a new baseline for what is possible on the web canvas. Stay tuned for the future.
            </p>
          </div>

          <div className="holo-chip" />
          <div className="holo-noise" />
        </div>
      </Html>
    </group>
  );
};



/* ==================== LANDING PAGE / HOME COMPONENTS ==================== */

const SECTIONS = [
  { name: "Home", icon: "ðŸ ", tagline: "Welcome to DevlUp Labs", description: "Your command center for everything we build." },
  { name: "Timeline", icon: "ðŸ“…", tagline: "Chronicle Your Journey", description: "Visualize your milestones and progress." },
  { name: "Videos", icon: "ðŸŽ¬", tagline: "Cinematic Storytelling", description: "Immersive video content crafted for maximum impact." },
  { name: "Podcast", icon: "ðŸŽ™ï¸", tagline: "Voices That Resonate", description: "Deep conversations and thought-provoking discussions." },
  { name: "Blogs", icon: "âœï¸", tagline: "Words That Inspire", description: "In-depth articles and thought leadership." },
  { name: "Team", icon: "ðŸ‘¥", tagline: "The Minds Behind the Vision", description: "Passionate creators building the future." },
];

const BLOCK_COLORS = ["#00E5FF", "#00A1FF", "#0044FF", "#00D2FF", "#0077FF", "#00BAFF"];
const X_RADIUS = 6.5, Z_RADIUS = 6.5;

const DISC_DATA = [0, 1, 2, 3, 4, 5].map(i => {
  const angle = (i * Math.PI * 2) / 6;
  return {
    position: [Math.sin(angle) * X_RADIUS, 1.2, Math.cos(angle) * Z_RADIUS],
    color: BLOCK_COLORS[i], 
    speed: [0.8, 1.1, 0.6, 0.9, 1.3, 0.7][i],
    rotSpeed: [1.2, 0.8, 1.5, 1.0, 0.7, 1.3][i], 
    scale: [1.15, 1.1, 0.9, 0.9, 1.1, 1.0][i],
  };
});

function Scene({ focusedIndex, setFocusedIndex, showHologram, setShowHologram, isTransitioning, discClickedRef }) {
  const ringGroupRef = useRef();
  const { gl } = useThree();
  const [hoveredModelIndex, setHoveredModelIndex] = useState(null);
  const isDragging = useRef(false);
  const previousX = useRef(0);
  const targetRotationY = useRef(0);
  const scroll = useScroll();
  const lastOffset = useRef(0);

  useFrame((_, delta) => {
    const offset = scroll ? scroll.offset : 0;
    
    if (offset < 0.8 && showHologram) {
      setShowHologram(false);
    }
    
    if (ringGroupRef.current) {
      ringGroupRef.current.rotation.y = THREE.MathUtils.lerp(ringGroupRef.current.rotation.y, targetRotationY.current, 1 - Math.exp(-8 * delta));
      const riseHeight = offset * 30; 
      const ringVisibility = 1 - THREE.MathUtils.smoothstep(offset, 0, 0.4);
      ringGroupRef.current.scale.setScalar(ringVisibility);
      ringGroupRef.current.position.set(0, riseHeight, -(offset * 10));
    }

    if (focusedIndex === null && !isTransitioning) {
      const targetZ = showHologram ? 18 : 15;
      const targetY = showHologram ? 6 : 5;
      _.camera.position.lerp(new THREE.Vector3(0, targetY, targetZ), 1 - Math.exp(-3 * delta));
      if (showHologram) _.camera.lookAt(0, 4, 10);
    }
  });

  const cardOffsetFactor = scroll ? THREE.MathUtils.smoothstep(scroll.offset, 1, 0) : 0;

  useEffect(() => {
    const canvas = gl.domElement;
    const onPointerDown = (e) => { if (e.button !== 2 || focusedIndex !== null) return; isDragging.current = true; previousX.current = e.clientX; };
    const onPointerMove = (e) => { if (isDragging.current && focusedIndex === null) { const deltaX = e.clientX - previousX.current; targetRotationY.current += deltaX * 0.005; previousX.current = e.clientX; } };
    const onPointerUp = (e) => { if (e.button === 2) isDragging.current = false; };
    const onContextMenu = (e) => { e.preventDefault(); };
    const onWheel = (e) => {
      if (focusedIndex !== null || Math.abs(e.deltaX) <= 0) return;
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
                onClick={(e) => { 
                  e.stopPropagation(); 
                  if (discClickedRef) discClickedRef.current = true; 
                  if (focusedIndex === i && i !== 0) {
                    // Second click - navigate
                    const routeMap = ["", "/timeline", "/video", "/podcast", "/blog", "/team"];
                    navigate(routeMap[i]);
                    setFocusedIndex(null);
                  } else {
                    // First click - open panel
                    setFocusedIndex(i);
                  }
                }}
              />
              <group
                position={disc.position}
                name={`disc-${i}`}
                onPointerOver={() => { setHoveredModelIndex(i); document.body.style.cursor = "pointer"; }}
                onPointerOut={() => { setHoveredModelIndex(null); document.body.style.cursor = "default"; }}
                onClick={(e) => { 
                  e.stopPropagation(); 
                  if (discClickedRef) discClickedRef.current = true; 
                  if (focusedIndex === i && i !== 0) {
                    // Second click - navigate
                    const routeMap = ["", "/timeline", "/video", "/podcast", "/blog", "/team"];
                    navigate(routeMap[i]);
                    setFocusedIndex(null);
                  } else {
                    // First click - open panel
                    setFocusedIndex(i);
                  }
                }}
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
          uniforms={{ color: { value: new THREE.Color("#ffffff") } }}
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
              vec2 grid = fract(vWorldPos.xz);
              float lineDistX = min(grid.x, 1.0 - grid.x);
              float lineDistZ = min(grid.y, 1.0 - grid.y);
              float coreX = smoothstep(0.8, 0.0, lineDistX);
              float coreZ = smoothstep(0.8, 0.0, lineDistZ);
              float core = max(coreX, coreZ);
              float glowX = 0.015 / max(lineDistX, 0.005) - 0.03;
              float glowZ = 0.015 / max(lineDistZ, 0.005) - 0.03;
              float glow = max(glowX, glowZ);
              float alpha = max(core, glow);
              float dist = length(vWorldPos.xz);
              float fade = smoothstep(30.0, 5.0, dist);
              vec3 colorDeepBlue = vec3(0.0, 0.08, 0.32);
              vec3 colorBrightBlue = vec3(0.0, 0.52, 0.82);
              float gradFactor = smoothstep(-15.0, 15.0, vWorldPos.z);
              vec3 gridColor = mix(colorDeepBlue, colorBrightBlue, gradFactor);
              gl_FragColor = vec4(gridColor * (1.0 + core * 1.5), clamp(alpha * fade, 0.0, 1.0));
            }
          `}
        />
      </mesh>
      <mesh position={[0, 30, -30]} visible={!isTransitioning}><planeGeometry args={[60, 60]} /><meshStandardMaterial color="#d4d7e4" roughness={0.8} metalness={1} /></mesh>
      <mesh position={[-30, 30, 0]} rotation={[0, Math.PI / 2, 0]} visible={!isTransitioning}><planeGeometry args={[60, 60]} /><meshStandardMaterial color="#d6dae8" roughness={0.8} metalness={0} /></mesh>
      <mesh position={[30, 30, 0]} rotation={[0, -Math.PI / 2, 0]} visible={!isTransitioning}><planeGeometry args={[60, 60]} /><meshStandardMaterial color="#050814" roughness={0.8} metalness={0} /></mesh>
    </>
  );
}

function DiscSidebar({ focusedIndex, setFocusedIndex, sidebarRef }) {
  const navigate = useNavigate();
  
  // Map section index to routes
  const routeMap = ["", "/timeline", "/video", "/podcast", "/blog", "/team"];
  
  const handleNavigate = () => {
    if (focusedIndex !== null && focusedIndex !== 0) {
      navigate(routeMap[focusedIndex]);
      setFocusedIndex(null);
    }
  };

  return (
    <AnimatePresence>
      {focusedIndex !== null && (
        <motion.div 
          ref={sidebarRef} 
          initial={{ x: "100%", opacity: 0 }} 
          animate={{ x: 0, opacity: 1 }} 
          exit={{ x: "100%", opacity: 0 }} 
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} 
          onClick={handleNavigate}
          className="absolute right-0 top-0 h-screen w-full sm:w-[400px] bg-black/60 backdrop-blur-2xl border-l border-[#00E5FF]/30 shadow-[-30px_0_80px_-20px_rgba(0,229,255,0.3)] z-50 flex flex-col pointer-events-auto cursor-pointer hover:bg-black/70 transition-all"
        >
          <div className="flex-1 p-12 flex flex-col pt-28 overflow-y-auto">
            <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-[#00E5FF] mb-3 tracking-tight">{SECTIONS[focusedIndex].name}</h2>
            <h3 className="text-2xl font-bold text-cyan-300 uppercase tracking-widest mb-10">{SECTIONS[focusedIndex].tagline}</h3>
            <div className="w-16 h-1.5 bg-gradient-to-r from-[#00E5FF] to-blue-500 rounded-full mb-10" />
            <p className="text-slate-300 text-xl leading-relaxed font-light">{SECTIONS[focusedIndex].description}</p>
            {focusedIndex !== 0 && (
              <button className="mt-auto px-6 py-2 bg-cyan-500/20 hover:bg-cyan-500/40 border border-cyan-400 text-cyan-300 rounded-lg transition-all">
                Go to {SECTIONS[focusedIndex].name}
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Home() {
  const rootRef = useRef(null);
  const sidebarRef = useRef(null);
  const aboutUsRef = useRef(null);
  const [focusedIndex, setFocusedIndex] = useState(null);
  const [showHologram, setShowHologram] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showSciFiHUD, setShowSciFiHUD] = useState(false);
  const discClickedRef = useRef(false);
  const [showLoader, setShowLoader] = useState(() => {
    if (typeof window === 'undefined') return true;
    return !(sessionStorage.getItem('loader_shown_this_session') === 'true');
  });

  const handleLoaderComplete = () => {
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
      {showSciFiHUD ? (
        <SciFiHUD onClose={() => setShowSciFiHUD(false)} />
      ) : (
        <>
          {showLoader && <Loader onComplete={handleLoaderComplete} />}
          <div
            ref={rootRef}
            className="relative w-screen h-screen overflow-hidden"
            style={{
              opacity: showLoader ? 0 : 1,
              transform: showLoader ? 'scale(1.03)' : 'scale(1)',
              transition: 'opacity 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            }}
          >
        <div className="absolute inset-0 z-[1]">
        <Canvas 
          dpr={[1, 1.1]} 
          camera={{ position: [0, 5, 15], fov: 55 }} 
          onPointerMissed={() => {
            if (discClickedRef.current) {
              discClickedRef.current = false;
              return;
            }
            setFocusedIndex(null);
          }}
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
              <Scene focusedIndex={focusedIndex} setFocusedIndex={setFocusedIndex} showHologram={showHologram} setShowHologram={setShowHologram} isTransitioning={isTransitioning} discClickedRef={discClickedRef} />
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
                    setTimeout(() => {
                      setShowSciFiHUD(true);
                      setIsTransitioning(false);
                    }, 3200);
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
      )}
    </>
  );
}



const CSS_STYLES = `
/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   MUSEUM LANDING PAGE â€” about2.css
   Scroll-driven cinematic layout Â· Louvre-inspired design
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

/* â”€â”€â”€ Hide Scrollbar Globally â”€â”€â”€ */
::-webkit-scrollbar {
  display: none;
}
* {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

/* â”€â”€â”€ Page Container â”€â”€â”€ */
.museum-page {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #000000;
}

/* â”€â”€â”€ Canvas â”€â”€â”€ */
.museum-canvas {
  position: absolute !important;
  top: 0;
  left: 0;
  width: 100% !important;
  height: 100% !important;
  z-index: 1;
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   FIXED OVERLAY  (always above canvas + scroll)
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
.museum-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  pointer-events: none;
}

.museum-overlay a,
.museum-overlay button {
  pointer-events: auto;
}

/* â”€â”€â”€ Faint Grid Lines â”€â”€â”€ */
.museum-grid-lines {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: space-evenly;
  pointer-events: none;
}

.museum-grid-line {
  width: 1px;
  height: 100%;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(255, 255, 255, 0.04) 20%,
    rgba(255, 255, 255, 0.04) 80%,
    transparent 100%
  );
}

/* â”€â”€â”€ Header â”€â”€â”€ */
.museum-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28px 48px;
  z-index: 110;
  animation: fadeIn 1.2s ease 0.3s both;
}

.museum-logo {
  font-family: 'Cormorant Garamond', 'Georgia', serif;
  font-size: 1.3rem;
  font-weight: 400;
  letter-spacing: 0.35em;
  color: rgba(255, 255, 255, 0.85);
  text-transform: uppercase;
}

/* â”€â”€â”€ Navigation â”€â”€â”€ */
.museum-nav {
  display: flex;
  gap: 36px;
  align-items: center;
}

.museum-nav-link {
  position: relative;
  font-family: 'Inter', sans-serif;
  font-size: 0.68rem;
  font-weight: 400;
  letter-spacing: 0.18em;
  color: rgba(255, 255, 255, 0.45);
  text-decoration: none;
  text-transform: uppercase;
  transition: color 0.3s ease;
  padding-bottom: 6px;
  cursor: pointer;
}

.museum-nav-link:hover {
  color: rgba(255, 255, 255, 0.85);
}

.museum-nav-link.active {
  color: rgba(255, 255, 255, 0.9);
}

.museum-nav-link.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 18px;
  height: 2px;
  background: #4a7dff;
  border-radius: 2px;
}

/* â”€â”€â”€ Menu Button (3Ã—3 dots) â”€â”€â”€ */
.museum-menu-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  opacity: 0.5;
  transition: opacity 0.3s ease;
}

.museum-menu-btn:hover {
  opacity: 0.9;
}

.museum-dots-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3.5px;
}

.museum-dot {
  width: 3px;
  height: 3px;
  background: #ffffff;
  border-radius: 50%;
}

/* â”€â”€â”€ Side Pagination â”€â”€â”€ */
.museum-pagination {
  position: absolute;
  left: 48px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  animation: fadeIn 1.5s ease 1.2s both;
}

.museum-page-active {
  width: 2px;
  height: 32px;
  background: #4a7dff;
  border-radius: 2px;
  box-shadow: 0 0 8px rgba(74, 125, 255, 0.4);
}

.museum-page-dot {
  width: 4px;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  transition: background 0.3s ease;
}

/* â”€â”€â”€ Bottom Accent Line â”€â”€â”€ */
.museum-bottom-line {
  position: absolute;
  bottom: 24px;
  left: 48px;
  right: 48px;
  height: 1px;
  background: linear-gradient(
    to right,
    transparent,
    rgba(255, 255, 255, 0.08) 20%,
    rgba(255, 255, 255, 0.08) 80%,
    transparent
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   SCROLL SECTIONS  (inside <Scroll html>)
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
.scroll-section {
  position: absolute;
  left: 0;
  width: 100%;
  height: 100vh;
  pointer-events: none;
}

/* â”€â”€ Section 1 â€” Hero â”€â”€ */
.hero-section {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 0 48px 10% 48px;
}

.hero-text-group {
  max-width: 600px;
}

.hero-title {
  font-family: 'Cormorant Garamond', 'Georgia', serif;
  font-weight: 300;
  font-size: clamp(3rem, 7vw, 6.5rem);
  line-height: 1.05;
  margin: 0;
  background: linear-gradient(135deg, #4488ff 0%, #ff4466 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
  filter: drop-shadow(0px 2px 20px rgba(0,0,0,0.8));
}

.hero-line {
  display: block;
}

.hero-indent {
  padding-left: 0.6em;
}

.hero-indent-2 {
  padding-left: 1.6em;
}

.hero-description-wrap {
  max-width: 240px;
  align-self: flex-end;
  margin-bottom: 2%;
}

.hero-description {
  font-family: 'Inter', sans-serif;
  font-size: 0.68rem;
  font-weight: 300;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.35);
  margin: 0;
}

/* â”€â”€ Section 2 â€” Detail Cards â”€â”€ */
.detail-section {
  display: flex;
  align-items: center;
  padding: 0 0 0 80px;
}

.detail-content {
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.detail-block {
  padding: 24px 0;
  will-change: transform, opacity;
}

.detail-heading {
  font-family: 'Cormorant Garamond', 'Georgia', serif;
  font-weight: 300;
  font-size: clamp(1.8rem, 3.5vw, 2.8rem);
  line-height: 1.15;
  color: #ffffff;
  margin: 0 0 12px 0;
  text-shadow: 0 1px 20px rgba(0, 0, 0, 0.4);
}

.detail-heading-large {
  font-size: clamp(2rem, 4vw, 3.2rem);
  font-weight: 400;
}

.detail-text {
  font-family: 'Inter', sans-serif;
  font-size: 0.7rem;
  font-weight: 300;
  line-height: 1.75;
  color: rgba(255, 255, 255, 0.35);
  margin: 0;
  max-width: 360px;
}

.detail-separator {
  width: 100%;
  height: 1px;
  background: linear-gradient(
    to right,
    rgba(255, 255, 255, 0.12),
    rgba(255, 255, 255, 0.04) 80%,
    transparent
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   KEYFRAME ANIMATIONS
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   RESPONSIVE
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
@media (max-width: 768px) {
  .museum-header {
    padding: 20px 24px;
  }

  .museum-nav {
    display: none;
  }

  .museum-logo {
    font-size: 1rem;
  }

  .hero-section {
    flex-direction: column;
    align-items: flex-start;
    padding: 0 24px 15% 24px;
    gap: 24px;
  }

  .hero-title {
    font-size: clamp(2.2rem, 10vw, 3.5rem);
  }

  .hero-description-wrap {
    max-width: 200px;
    align-self: flex-start;
  }

  .hero-description {
    font-size: 0.6rem;
  }

  .detail-section {
    padding: 0 0 0 24px;
  }

  .detail-content {
    max-width: 260px;
  }

  .detail-heading {
    font-size: clamp(1.4rem, 6vw, 2rem);
  }

  .detail-heading-large {
    font-size: clamp(1.6rem, 7vw, 2.4rem);
  }

  .detail-text {
    font-size: 0.6rem;
  }

  .museum-pagination {
    left: 20px;
  }

  .museum-bottom-line {
    left: 24px;
    right: 24px;
  }
}
`

useGLTF.preload('/penguin3l.glb')

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   UTILITY FUNCTIONS
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

/** Map a scroll offset range [start, end] â†’ [0, 1] */
function scrollRange(offset, start, end) {
  return THREE.MathUtils.clamp((offset - start) / (end - start), 0, 1)
}

/** Smooth cubic ease-in-out */
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   3D COMPONENTS
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

/* â”€â”€â”€ Glowing Ring (Torus) â”€â”€â”€ */
function GlowRing({ scrollRef }) {
  const ringRef = useRef()

  useFrame((state) => {
    if (!ringRef.current) return
    const t = state.clock.getElapsedTime()
    const offset = scrollRef.current

    // Breathing pulse
    ringRef.current.material.emissiveIntensity = 1.5 + Math.sin(t * 0.8) * 0.3

    // Match text hinge direction (negative Y)
    const hinge = easeInOutCubic(scrollRange(offset, 0.05, 0.35))

    // Move left
    // Using the same translation amount as the penguin
    ringRef.current.position.x = THREE.MathUtils.lerp(-1.25, -1.25 - 2, hinge)
  })

  return (
    <mesh ref={ringRef} position={[-1.25, -0.2, -1]} scale={[1,1,1]}>
      <torusGeometry args={[3.2, 0.06, 32, 128]} />
      <meshStandardMaterial
        color="#ffffff"
        emissive="#ffffff"
        emissiveIntensity={1.8}
        toneMapped={false}
        transparent
      />
    </mesh>
  )
}

/* â”€â”€â”€ Scene Lighting â”€â”€â”€ */
function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.15} color="#b0c4de" />
      <directionalLight
        position={[5, 8, 3]}
        intensity={1.2}
        color="#ffeedd"
        castShadow
      />
      <directionalLight
        position={[-4, 3, -5]}
        intensity={0.8}
        color="#4488ff"
      />
      <directionalLight
        position={[0, -3, 2]}
        intensity={0.3}
        color="#aabbcc"
      />
      <spotLight
        position={[0, 10, 2]}
        angle={0.35}
        penumbra={0.8}
        intensity={1.5}
        color="#ffffff"
        castShadow
      />
    </>
  )
}

/* â”€â”€â”€ Penguin Model â”€â”€â”€ */
function PenguinModel({ scrollRef }) {
  const { scene } = useGLTF('/penguin3l.glb')
  const groupRef = useRef()

  useFrame(() => {
    if (!groupRef.current) return
    const offset = scrollRef.current

    const move = easeInOutCubic(scrollRange(offset, 0.05, 0.35))

    groupRef.current.position.x = THREE.MathUtils.lerp(
      -10.8,
      -12.8,
      move
    )

    const s = 0.2
    groupRef.current.scale.set(s, s, s)
  })

  return (
    <group
      ref={groupRef}
      position={[-10.8, 0, -3]}
      scale={[0.50, 0.5, 0.5]}
      rotation={[0, -Math.PI / 2, 0]}
    >
      <primitive object={scene} />
    </group>
  )
}

/* â”€â”€â”€ Floating Particles â”€â”€â”€ */
function FloatingParticles() {
  const particlesRef = useRef()
  const count = 60

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2
    }
    return pos
  }, [])

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.getElapsedTime() * 0.015
    }
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#ffffff"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  )
}

/* â”€â”€â”€ Cinematic Camera Rig â”€â”€â”€ */
function CameraRig({ scrollRef }) {
  const { camera } = useThree()
  const lookTarget = useMemo(() => new THREE.Vector3(-1, 0, 0), [])
  const targetPos = useMemo(() => new THREE.Vector3(), [])

  useFrame(() => {
    const offset = scrollRef.current
    const progress = easeInOutCubic(scrollRange(offset, 0.0, 0.35))

    targetPos.set(
      THREE.MathUtils.lerp(-0.5, -3.5, progress),
      THREE.MathUtils.lerp(0.5, 0.8, progress),
      THREE.MathUtils.lerp(7, 4.5, progress)
    )

    camera.position.lerp(targetPos, 0.08)

    lookTarget.x += (THREE.MathUtils.lerp(-1, -6.5, progress) - lookTarget.x) * 0.08
    lookTarget.y = 0
    lookTarget.z = 0
    camera.lookAt(lookTarget)
  })

  return null
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   SCENE ORCHESTRATOR  (lives inside ScrollControls)
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function SceneContent() {
  const scroll = useScroll()
  const scrollRef = useRef(0)

  useFrame(() => {
    scrollRef.current = scroll.offset
  })

  return (
    <>
      <CameraRig scrollRef={scrollRef} />
      <SceneLighting />

      <Suspense fallback={null}>
        <GlowRing scrollRef={scrollRef} />
        <PenguinModel scrollRef={scrollRef} />
        <FloatingParticles />
      </Suspense>

      <EffectComposer>
        <Bloom
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          intensity={1.6}
          mipmapBlur
        />
      </EffectComposer>
    </>
  )
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   SCROLL-DRIVEN HTML  (inside <Scroll html>)
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function ScrollHTML() {
  const scroll = useScroll()

  const heroRef = useRef()
  const leftTextRef = useRef()
  const rightTextRef = useRef()
  const detailRef = useRef()
  const block1Ref = useRef()
  const block2Ref = useRef()
  const block3Ref = useRef()

  useFrame(() => {
    const offset = scroll.offset

    if (heroRef.current && leftTextRef.current && rightTextRef.current) {
      heroRef.current.style.perspective = '1200px'

      const openProgress = easeInOutCubic(scrollRange(offset, 0.02, 0.15))
      const opacity = 1 - openProgress

      leftTextRef.current.style.opacity = opacity
      leftTextRef.current.style.transformOrigin = 'left center'
      leftTextRef.current.style.transform = `translateZ(${-500 * openProgress}px) rotateY(${-45 * openProgress}deg)`

      rightTextRef.current.style.opacity = opacity
      rightTextRef.current.style.transformOrigin = 'right center'
      rightTextRef.current.style.transform = `translateZ(${500 * openProgress}px) rotateY(${-45 * openProgress}deg)`
    }

    if (detailRef.current) {
      const fadeIn = easeInOutCubic(scrollRange(offset, 0.15, 0.35))
      detailRef.current.style.opacity = fadeIn
    }

    if (block1Ref.current) {
      const o = easeInOutCubic(scrollRange(offset, 0.15, 0.28))
      block1Ref.current.style.opacity = o
      block1Ref.current.style.transform = `translateY(${(1 - o) * 40}px)`
    }
    if (block2Ref.current) {
      const o = easeInOutCubic(scrollRange(offset, 0.20, 0.35))
      block2Ref.current.style.opacity = o
      block2Ref.current.style.transform = `translateY(${(1 - o) * 40}px)`
    }
    if (block3Ref.current) {
      const o = easeInOutCubic(scrollRange(offset, 0.25, 0.40))
      block3Ref.current.style.opacity = o
      block3Ref.current.style.transform = `translateY(${(1 - o) * 40}px)`
    }
  })

  return (
    <Scroll html style={{ width: '100%' }}>
      <div ref={heroRef} className="scroll-section hero-section">
        <div ref={leftTextRef} className="hero-text-group">
          <h1 className="hero-title">
            <span className="hero-line">DevlUp</span>
            <span className="hero-line hero-indent">Labs</span>
          </h1>
        </div>
        <div ref={rightTextRef} className="hero-description-wrap">
          <br />
          <span className=" text-stone-50 leading-relaxed">
          DevlUp Labs is a thriving student-led open source community at IIT Jodhpur.We believe in sharing of ideas and upskilling by collaboration through meaningful projects. Our focus is to deliver results with the
          highest of standards.We aim to build an open source community through proper guidance and by encouraging self learning.
          We encourage development of technology and Innovation through various sessions, workshops and webinars.
          </span>
        </div>
      </div>

      <div ref={detailRef} className="scroll-section detail-section" style={{ top: 0, opacity: 0 }}>
        <div className="detail-content">
          <div ref={block1Ref} className="detail-block" style={{ opacity: 0 }}>
            <h2 className="detail-heading">Learning Driven Endeavour</h2>
            <p className="detail-text">
              A Learning Driven Endeavour is a conscious, continuous effort to pursue knowledge, skills, or personal growth as the 
              primary objective. Rather than focusing solely on a final result, it prioritizes the process of 
              improvement, curiosity, and adaptation. 
            </p>
          </div>

          <div className="detail-separator" />

          <div ref={block2Ref} className="detail-block" style={{ opacity: 0 }}>
            <h2 className="detail-heading detail-heading-large">Projects that matter to the community</h2>
            <p className="detail-text">
              We at devlup labs are committed to products and projects that matter,
               projects that serve a real purpose for the community.
            </p>
          </div>

          <div className="detail-separator" />

          <div ref={block3Ref} className="detail-block" style={{ opacity: 0 }}>
            <h2 className="detail-heading">Self Learning</h2>
            <p className="detail-text">
            At DevlUp Labs, self-learning is the core philosophy, fostering a culture where individuals
            take initiative to master new technologies. We maximize efficiency by ensuring the optimal 
            utilization of available resources, enabling members to learn by building real-world projects.
            </p>
          </div>
        </div>
      </div>
    </Scroll>
  )
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   FIXED OVERLAY  (Nav, Grid, Pagination â€” always visible)
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function FixedOverlay({ onClose }) {
  return (
    <div className="museum-overlay">
      {/* Back Button */}
      
      
      {/* Faint vertical grid lines */}
      <div className="museum-grid-lines">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="museum-grid-line" />
        ))}
      </div>
    </div>
  )
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   MAIN EXPORT
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export function SciFiHUD({ onClose }) {
  return (
    <>
      <style>{CSS_STYLES}</style>
      <div className="museum-layout w-screen min-h-screen relative overflow-x-hidden bg-[#050814]">
        <Header />
        
        <div className="museum-page" style={{ height: '100vh', position: 'relative' }}>
          <Canvas

        className="museum-canvas"
        camera={{ position: [-0.5, 0.5, 7], fov: 45 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
        }}
      >
        <color attach="background" args={['#000000']} />
        <fog attach="fog" args={['#000000', 10, 22]} />

        <ScrollControls pages={1} damping={1}>
          <SceneContent />
          <ScrollHTML />
        </ScrollControls>
      </Canvas>

      <FixedOverlay onClose={onClose} />
        </div>
        <Footer />
      </div>
    </>
  )
}
