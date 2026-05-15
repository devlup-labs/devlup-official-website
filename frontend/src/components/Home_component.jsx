import React, { useRef, useMemo, useState, useCallback, useEffect, Suspense, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, ScrollControls, Scroll, useScroll, OrbitControls, Html, PerspectiveCamera, useGLTF } from "@react-three/drei";
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from "three";
import { AnimatePresence, motion } from "framer-motion";
import Header from "./Header.jsx";
import { ThemeContext } from "../App.jsx";
import { FiMoon, FiSun } from "react-icons/fi";

/* Disc Components */

function UniformDisc() {
  const { isDarkMode } = useContext(ThemeContext);
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.absarc(0, 0, 8, 0, Math.PI * 2, false);
    const hole = new THREE.Path();
    hole.absarc(0, 0, 5.1, 0, Math.PI * 2, true);
    s.holes.push(hole);
    return s;
  }, []);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.65, 0]}>
      <extrudeGeometry args={[shape, {depth: 0.05, bevelEnabled: false, curveSegments: 48}]} />
      <meshStandardMaterial color={isDarkMode ? "#000000" : "#aaaaaa"} metalness={0} roughness={1} />
    </mesh>
  );
}

export function Disc() {
  return (
    <div className="w-screen h-screen">
      <Canvas camera={{ position: [0, 4, 8], fov: 50 }} dpr={[1, 1.2]}>
        <UniformDisc />
        <OrbitControls enablePan={false} />
      </Canvas>
    </div>
  );
}

/* Effects Components */

function FaceCamera({ children, lockY = true }) {
  const ref = useRef();
  const { camera } = useThree();
  useFrame(() => {
    if (!ref.current) return;
    // Align the group's forward to face the camera. If lockY, keep rotation only around Y axis.
    const worldPos = new THREE.Vector3();
    ref.current.getWorldPosition(worldPos);
    if (lockY) {
      const camPos = camera.position.clone();
      camPos.y = worldPos.y; // constrain to horizontal plane
      ref.current.lookAt(camPos);
    } else {
      ref.current.lookAt(camera.position);
    }
  });
  return <group ref={ref}>{children}</group>;
}

export function AnimatedBlock({ visible, popped = false, children }) {
  const groupRef = useRef();
  const innerRef = useRef();
  const currentScale = useRef(0);
  useFrame((state, delta) => {
    const target = visible ? (popped ? 2.05 : 1.8) : 0;
    currentScale.current = THREE.MathUtils.lerp(currentScale.current, target, 1 - Math.exp(-4 * delta));
    if (groupRef.current) {
      groupRef.current.scale.setScalar(currentScale.current);

      const worldPos = new THREE.Vector3();
      groupRef.current.getWorldPosition(worldPos);

      const targetAngle = Math.atan2(
        state.camera.position.x - worldPos.x,
        state.camera.position.z - worldPos.z
      );

      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetAngle,
        5 * delta
      );
    }
    if (innerRef.current) {
      innerRef.current.rotation.x = THREE.MathUtils.lerp(
        innerRef.current.rotation.x,
        0,
        5 * delta
      );
    }
  });
  return (
    <group ref={groupRef} scale={0}>
      <group ref={innerRef}>
        <FaceCamera lockY>{children}</FaceCamera>
      </group>
    </group>
  );
}

export function FloatingDisc({ position, color, scale = 1, isFocused, isLightOn = true, allowHoverScale = true, onClick, softness = 2.0 }) {
  const meshRef = useRef(), caseMatRef = useRef();
  const [hovered, setHovered] = useState(false);
  const { isDarkMode } = useContext(ThemeContext);
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

  const discUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColorInner: { value: new THREE.Color(isDarkMode ? '#eeeeee' : '#000000') },
    uColorOuter: { value: new THREE.Color('#000000') },
    uGlobalOpacity: { value: 1.2 }
  }), []);

  useEffect(() => {
    if (!caseMatRef.current) return;
    caseMatRef.current.uniforms.uColorInner.value.set(isDarkMode ? '#eeeeee' : '#000000');
  }, [isDarkMode]);

  const dotsCount = 16;
  const dots = useMemo(() => {
    return Array.from({ length: dotsCount }).map((_, i) => {
      const angle = (i / dotsCount) * Math.PI * 2;
      return [Math.cos(angle) * 1.3, 0.21, Math.sin(angle) * 1.3];
    });
  }, []);

  return (
    <group ref={meshRef} position={position} onClick={(e) => { if (e.intersections.length > 0 && e.intersections[0].eventObject !== e.eventObject) return; onClick(e); }} onPointerOver={() => { setHovered(true); document.body.style.cursor = "pointer"; }} onPointerOut={() => { setHovered(false); document.body.style.cursor = "default"; }}>
      <pointLight color={color || (isDarkMode ? "#00D2FF" : "#9CA3AF")} distance={10} intensity={isLightOn ? 8 : 0} position={[0, 2, 0]} />

      <mesh><cylinderGeometry args={[1.45, 1.5, 0.4, 32]} /><meshStandardMaterial color={isDarkMode ? "#000000" : "#aaaaaa"} roughness={0.6} metalness={0.4} /></mesh>

      <>
        <mesh position={[0, 0.201, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.1, 1.15, 36]} />
          <meshBasicMaterial
            color={isDarkMode ? "#cfd2f7" : "#636d94"}
            opacity={0.4}
          />
        </mesh>
        <mesh position={[0, 0.201, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.9, 0.92, 36]} />
          <meshBasicMaterial
            color={isDarkMode ? "#eeeeee" : "#000000"}
            transparent
            opacity={0.2}
          />
        </mesh>

        {dots.map((pos, i) => (
          <mesh key={i} position={pos} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.04, 16]} />
            <meshBasicMaterial
              color={isDarkMode ? "#eeeeee" : "#98b0ff"}
              opacity={0.4}
            />
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
            uniforms={discUniforms}
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
                float viewDist = length(vViewPosition);
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
    </group>
  );
}

export function FloatingBlocks({ count = 30, showFloor = true }) {
  if (!showFloor) return null;

  const { isDarkMode } = useContext(ThemeContext);
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
      <meshStandardMaterial color={isDarkMode ? "#ffffff" : "#9CA3AF"} roughness={0.2} metalness={0.1} transparent opacity={1} envMapIntensity={1.5} />
    </instancedMesh>
  );
}

export function CameraAnimator({ focusedIndex, isTransitioning, cameraReturnLockRef }) {
  const { camera, scene } = useThree();
  const targetPos = useRef(new THREE.Vector3());
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const targetLookAt = useRef(new THREE.Vector3());
  const outDir = useRef(new THREE.Vector3());
  const savedPos = useRef(new THREE.Vector3(0, 0.2, 0.5));
  const savedLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const isAnimatingBack = useRef(false);
  const prevFocused = useRef(null);
  const worldTarget = useRef(new THREE.Vector3());
  const damping = 1.5;

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
      savedPos.current.copy(camera.position);
      savedLookAt.current.copy(currentLookAt.current);
      isAnimatingBack.current = false;
    }

    if (!targetSet && previousFocused !== null) {
      isAnimatingBack.current = true;
      if (cameraReturnLockRef) cameraReturnLockRef.current = true;
    }
    prevFocused.current = focusedIndex;

    const lerpFactor = 1 - Math.exp(-damping * delta);
    if (targetSet) {
      const discObj = scene.getObjectByName(`disc-${focusedIndex}`);
      if (discObj) {
        discObj.getWorldPosition(worldTarget.current);
        outDir.current.set(worldTarget.current.x, 0, worldTarget.current.z).normalize();

        if (isNaN(outDir.current.x)) outDir.current.set(0, 0, 1);

        const hDist = 5, vDist = hDist * Math.tan(THREE.MathUtils.degToRad(25));
        targetPos.current.set(worldTarget.current.x + outDir.current.x * hDist, worldTarget.current.y + vDist, worldTarget.current.z + outDir.current.z * hDist);
        targetLookAt.current.set(worldTarget.current.x, worldTarget.current.y + 0.4, worldTarget.current.z);

        camera.position.lerp(targetPos.current, lerpFactor);
        currentLookAt.current.lerp(targetLookAt.current, lerpFactor);
        camera.lookAt(currentLookAt.current);
      }
    } else if (isAnimatingBack.current) {
      camera.position.lerp(savedPos.current, lerpFactor);
      currentLookAt.current.lerp(savedLookAt.current, lerpFactor);
      camera.lookAt(currentLookAt.current);
      if (camera.position.distanceTo(savedPos.current) < 0.05) {
        isAnimatingBack.current = false;
        if (cameraReturnLockRef) cameraReturnLockRef.current = false;
      }
    }
  });

  return null;
}

export function ParallaxRig({ children, enabled }) {
  const groupRef = useRef();
  const { pointer } = useThree();
  useFrame(() => {
    if (groupRef.current && enabled) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, 0.05);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, 0.05);
    }
  });
  return <group ref={groupRef}>{children}</group>;
}

export function FlowingGrid({ showHologram, showFloor = true }) {
  const { isDarkMode } = useContext(ThemeContext);
  const meshRef = useRef();
  const scroll = useScroll();
  const count = 16, size = 65 / count;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);
  const baseColor = useMemo(() => new THREE.Color(isDarkMode ? "#000000" : "#eeeeee"), [isDarkMode]);
  const accentColor = useMemo(() => new THREE.Color("#eeeeee"), []);
  const hoveredIdRef = useRef(null);
  const prevHoveredIdRef = useRef(null);
  const prevActivationRef = useRef(0);
  const prevThemeRef = useRef(isDarkMode);
  const staticPoseAppliedRef = useRef(false);
  const holoAnim = useRef(0);
  const waveTime = useRef(0);

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
    const offset = scroll ? scroll.offset : 0;
    if (offset > 0.35) {
      waveTime.current += delta;
    }
    const time = waveTime.current;
    
    const scrollActivation = THREE.MathUtils.smoothstep(offset, 0.15, 0.5);

    holoAnim.current = THREE.MathUtils.lerp(holoAnim.current, showHologram ? 1 : 0, 1 - Math.exp(-3 * delta));
    const activation = scrollActivation * (1 - holoAnim.current);
    const hoveredChanged = hoveredIdRef.current !== prevHoveredIdRef.current;
    const activationChanged = Math.abs(activation - prevActivationRef.current) > 0.001;
    const themeChanged = prevThemeRef.current !== isDarkMode;
    const isStatic = activation < 0.001;

    if (isStatic && staticPoseAppliedRef.current && !hoveredChanged && !themeChanged) return;

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

      if (hoveredChanged || !staticPoseAppliedRef.current || themeChanged) {
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
    prevThemeRef.current = isDarkMode;
    staticPoseAppliedRef.current = isStatic;
  });

  if (!showFloor) return null;

  return (
    <group>
      <mesh position={[0, -0.11, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[65, 65]} />
        <meshBasicMaterial color={isDarkMode ? "#ffffff" : "#D1D5DB"} opacity={0.15} />
      </mesh>
      <instancedMesh
        ref={meshRef}
        args={[null, null, count * count]}
        position={[0, -0.1, 0]}
        onPointerMove={(e) => {
          e.stopPropagation();
          if (scroll && scroll.offset < 0 && hoveredIdRef.current !== e.instanceId) hoveredIdRef.current = e.instanceId;
        }}
        onPointerOut={() => { hoveredIdRef.current = null; }}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={isDarkMode ? "#000000" : "#9CA3AF"} metalness={0} roughness={1} />
      </instancedMesh>
    </group>
  );
}

const HoloCard = ({ position, rotation, title, opacity, isMain }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const mainColor = isDarkMode ? "#00E5FF" : "#D1D5DB";
  const otherColor = isDarkMode ? "#0044FF" : "#9CA3AF";
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[isMain ? 4 : 3, isMain ? 6 : 4.5]} />
      <meshBasicMaterial color={isMain ? mainColor : otherColor} transparent opacity={opacity * 0.5} wireframe />
    </mesh>
  );
};


export function WormholeTransition({ active }) {
  const transitionUniforms = useMemo(() => ({
    time: { value: 0 },
    color1: { value: new THREE.Color('#000000') },
    color2: { value: new THREE.Color('#00FFFF') },
    color3: { value: new THREE.Color('#FFFFFF') }
  }), []);

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
        uniforms={transitionUniforms}
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
  const { scene } = useGLTF("/logo.glb");
  return <primitive object={scene} scale={0.9} position={[0, 0.55, 0.2]} rotation={[Math.PI / 2, 0, 0]} />;
}

export function MicModel() {
  const { scene } = useGLTF("/mic.glb");
  const { isDarkMode } = useContext(ThemeContext);
  const clone = useMemo(() => (scene ? scene.clone(true) : null), [scene]);

  useEffect(() => {
    if (!clone) return;
    const color = new THREE.Color(isDarkMode ? "#969696" : "#949494");

    clone.traverse((n) => {
      if (n.isMesh) {
        n.castShadow = true;
        n.receiveShadow = true;
        n.frustumCulled = false;
        if (n.material) {
          n.material.side = THREE.DoubleSide;
          n.material.metalness = 1;
          if (n.material.color) n.material.color.set(color);
        }
      }
    });
  }, [clone, isDarkMode]);

  if (!clone) return null;
  return (
    <primitive
      object={clone}
      scale={0.00125}
      position={[0.05, 0.2, -0.1]}
      rotation={[0, -Math.PI / 3, 0]}
    />
  );
}

export function VideoButtonModel() {
  const { scene } = useGLTF("/MOVIE%20-%20Copy.glb");
  const { isDarkMode } = useContext(ThemeContext);
  const clone = useMemo(() => (scene ? scene.clone(true) : null), [scene]);

  useEffect(() => {
    if (!clone) return;
    const color = new THREE.Color(isDarkMode ? "#eeeeee" : "#9b9b9b");

    clone.traverse((n) => {
      if (n.isMesh) {
        n.castShadow = true;
        n.receiveShadow = true;
        n.frustumCulled = false;
        if (n.material) {
          n.material.side = THREE.DoubleSide;
          n.material.metalness = 0.2;
          if (n.material.color) n.material.color.set(color);
        }
      }
    });
  }, [clone, isDarkMode]);

  if (!clone) return null;
  return (
    <primitive object={clone} position={[-0.35, -0.7, -0.9]} rotation={[Math.PI / 2, 0, Math.PI / 3]} scale={0.011} />
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
    <group position={[0, 0.45, 0]} rotation={[0, -Math.PI/2, -Math.PI/4]} scale={0.15}>
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
      <primitive object={clones[0]} scale={2.15} position={[0.2, 0.2, 0]} rotation={[0, 2 * Math.PI, 0]} />
      <primitive object={clones[1]} scale={2.15} position={[0, 0.2, -0.1]} rotation={[0, 2 * Math.PI, 0]} />
      <primitive object={clones[2]} scale={2.15} position={[-0.2, 0.2, -0.2]} rotation={[0, 2 * Math.PI, 0]} />
    </group>
  );
}

export function StickmanModel() {
  const { scene } = useGLTF("/stickman2f.glb");
  const { isDarkMode } = useContext(ThemeContext);
  const groupRef = useRef();
  const NUM_CLONES = 16;
  const RADIUS = 0;
  const HEIGHT = 0.12;
  const CENTER_X = 0.001;
  const CENTER_Z = 0.02;
  const clones = useMemo(() => {
    if (!scene) return [];
    return Array.from({ length: NUM_CLONES }, () => scene.clone(true));
  }, [scene]);

  useEffect(() => {
    if (!clones.length) return;
    const color = new THREE.Color(isDarkMode ? "#eeeeee" : "#929292");

    clones.forEach((c) =>
      c.traverse((n) => {
        if (n.isMesh) {
          n.castShadow = true;
          n.receiveShadow = true;
          n.frustumCulled = false;
          if (n.material) {
            n.material.side = THREE.DoubleSide;
            if (n.material.color) n.material.color.set(color);
          }
        }
      })
    );
  }, [clones, isDarkMode]);

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
          <primitive object={clones[idx]} scale={0.1} />
        </group>
      ))}
    </group>
  );
}

const BLOCK_CONFIGS = [
  { render: () => <HomeModel /> },
  { render: () => <TimelineModel /> },
  { render: () => <VideoButtonModel /> },
  { render: () => <MicModel /> },
  { render: () => <DocumentModel /> },
  { render: () => <StickmanModel /> },
];

useGLTF.preload("/logo.glb");
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

      
      const typeNext = () => {
        typedIndex += 1;
        setText(pathPrefix.slice(0, typedIndex));

        if (typedIndex < pathPrefix.length) {
          typingTimer = setTimeout(typeNext, typeCharDelayMs);
        } else {
          
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
      className={`fixed inset-0 z-50 flex items-center justify-center cursor-text loader-bg-bluish-red ${fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
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
                <span className={`loader-path-dot ${morphPath && text === './' ? 'loader-dot-orbit' : ''}`}>.</span>
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

  `}</style>
  </>
);

/* ==================== LANDING PAGE / HOME COMPONENTS ==================== */

const SECTIONS = [
  { name: "Home", tagline: "Welcome to DevlUp Labs", description: "Step into the central hub of DevlUp Labs where innovation meets creativity. Discover everything we build, explore our projects, and stay updated with our latest work. This is your starting point to navigate through our ecosystem. Designed to give you a complete overview of who we are and what we do." },
  { name: "Timeline", tagline: "Chronicle Your Journey", description: "Track your growth and visualize your journey through meaningful milestones. From small achievements to major breakthroughs, everything is captured here. The timeline helps you reflect on progress and stay motivated. It’s a dynamic view of how far you've come and where you're headed." },
  { name: "Videos", tagline: "Visual Learning for Developers", description: "Experience visually engaging content crafted to inspire and educate. Our videos showcase projects, tutorials, and creative explorations. Each frame is designed to deliver impact and clarity. Dive into a cinematic journey of learning and innovation." },
  { name: "Podcast", tagline: "Voices That Resonate", description: "Listen to insightful conversations with creators, developers, and thinkers. Our podcasts dive deep into ideas, experiences, and industry trends. Each episode is designed to spark curiosity and broaden perspectives. Tune in and connect with voices that truly matter." },
  { name: "Blogs", tagline: "Words That Inspire", description: "Explore thoughtfully written articles covering technology, ideas, and innovation. Our blogs aim to educate, inspire, and provoke meaningful thinking. Whether you're a beginner or an expert, there's something valuable for everyone. Learn, grow, and stay ahead with our insights." },
  { name: "Team", tagline: "The Minds Behind the Vision", description: "Meet the passionate individuals who bring DevlUp Labs to life. Our team is a blend of creativity, skill, and dedication. Each member contributes uniquely to building impactful projects. Together, we strive to innovate, collaborate, and shape the future." },
];

const X_RADIUS = 6.5, Z_RADIUS = 6.5;

const DISC_DATA = [0, 1, 2, 3, 4, 5].map(i => {
  const angle = (i * Math.PI * 2) / 6;
  return {
    position: [Math.sin(angle) * X_RADIUS, 0.3, Math.cos(angle) * Z_RADIUS],
    speed: [0.8, 1.1, 0.6, 0.9, 1.3, 0.7][i],
    rotSpeed: [1.2, 0.8, 1.5, 1.0, 0.7, 1.3][i],
    scale: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0][i],
  };
});

function Scene({ focusedIndex, setFocusedIndex, showHologram, setShowHologram, isTransitioning, discClickedRef, cameraReturnLockRef }) {
  const { isDarkMode } = useContext(ThemeContext);
  const floorUniforms = useMemo(() => ({ color: { value: new THREE.Color("#eeeeee") } }), []);
  const ringGroupRef = useRef();
  const [showFloor, setShowFloor] = useState(true);
  const { gl } = useThree();
  const [hoveredModelIndex, setHoveredModelIndex] = useState(null);
  const isDragging = useRef(false);
  const previousX = useRef(0);
  const targetRotationY = useRef(0);
  const scroll = useScroll();
  const lastOffset = useRef(0);

  useEffect(() => {
    if (isTransitioning) {
      setShowFloor(false);
      return;
    }

    const restoreFloor = requestAnimationFrame(() => {
      setShowFloor(true);
    });

    return () => cancelAnimationFrame(restoreFloor);
  }, [isTransitioning]);

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

    if (focusedIndex === null && !isTransitioning && !cameraReturnLockRef?.current) {
      const targetZ = showHologram ? 18 : 15;
      const targetY = showHologram ? 6 : 5;
      _.camera.position.lerp(new THREE.Vector3(0, targetY, targetZ), 1 - Math.exp(-3 * delta));
      if (showHologram) _.camera.lookAt(0, 4, 10);
    }
  });

  const cardOffsetFactor = scroll ? THREE.MathUtils.smoothstep(scroll.offset, 1, 0) : 0;

  const handleSmoothScrollDown = () => {
    if (!scroll || !scroll.el) return;
    const start = scroll.el.scrollTop;
    const target = scroll.el.scrollHeight - scroll.el.clientHeight; 
    const change = target - start;
    if (change <= 0) return;
    
    const duration = 2500;
    const startTime = performance.now();
    
    const animateScroll = (time) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const ease = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      scroll.el.scrollTop = start + change * ease;
      
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };
    
    requestAnimationFrame(animateScroll);
  };

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
      <color attach="background" args={[isDarkMode ? '#050814' : '#cfd5e7']} />
      <fog attach="fog" args={[isDarkMode ? '#050814' : '#CED5E8', 8, 30]} />
      {/* <ambientLight intensity={1} /> */}
      {/* <spotLight position={[0, 15, 0]} angle={0.6} penumbra={1} intensity={1.5} castShadow={false} />
      <spotLight position={[5, 12, 5]} angle={0.4} penumbra={0.8} intensity={3.0} color="#00E5FF" castShadow={false} />
      <spotLight position={[-5, 12, -5]} angle={0.4} penumbra={0.8} intensity={3.0} color="#0044FF" castShadow={false} /> */}
      {/* <pointLight position={[0, 3, 0]} intensity={1.5} distance={15} castShadow={false} /> */}
      <Environment preset="dawn" background={false} frames={1} />

      <CameraAnimator focusedIndex={focusedIndex} isTransitioning={isTransitioning} cameraReturnLockRef={cameraReturnLockRef} />
      <WormholeTransition active={isTransitioning} />

      <FlowingGrid showHologram={showHologram} showFloor={showFloor} />

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
                isLightOn={focusedIndex === null || focusedIndex === i}
                allowHoverScale={focusedIndex === null}
                onClick={(e) => {
                  e.stopPropagation();
                  if (discClickedRef) discClickedRef.current = true;

                  if (i === 0) {
                    handleSmoothScrollDown();
                    return;
                  }

                  if (focusedIndex === i) {
                    const routeMap = ["", "/timeline", "/video", "/podcast", "/blog", "/team"];
                    navigate(routeMap[i]);
                    setFocusedIndex(null);
                  } else {
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

                  if (i === 0) {
                    handleSmoothScrollDown();
                    return;
                  }

                  if (focusedIndex === i) {
                    const routeMap = ["", "/timeline", "/video", "/podcast", "/blog", "/team"];
                    navigate(routeMap[i]);
                    setFocusedIndex(null);
                  } else {
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

      {showFloor && (
        <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[60, 60]} />
          <shaderMaterial
            depthWrite={false}
            uniforms={floorUniforms}
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
                float coreX = smoothstep(0.8, 0.0, lineDistX);
                float coreZ = smoothstep(0.8, 0.0, lineDistZ);
                float core = max(coreX, coreZ);
                float glowX = 0.015 / max(lineDistX, 0.005) - 0.03;
                float glowZ = 0.015 / max(lineDistZ, 0.005) - 0.03;
                float glow = max(glowX, glowZ);
                float alpha = max(core, glow);
                float dist = length(vWorldPos.xz);
                float fade = smoothstep(30.0, 5.0, dist);
                gl_FragColor = vec4(color, clamp(alpha * fade, 0.0, 1.0));
              }
            `}
          />
        </mesh>
      )}
    </>
  );
}

function FloatingCard({ focusedIndex, setFocusedIndex, sidebarRef }) {
  const navigate = useNavigate();
  const { isDarkMode } = useContext(ThemeContext);

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
          initial={{ x: 140, opacity: 0}}
          animate={{ x: 0, opacity: 1}}
          exit={{ x: 140, opacity: 0}}
          transition={{
            duration: 0.7,
            ease: [0.16, 1, 0.3, 1],
          }}
          className={`fixed right-10 md:right-10 top-1/2 -translate-y-1/2 w-[calc(100vw-3rem)] sm:w-[360px] md:w-[420px] max-h-[calc(100vh-2rem)] rounded-[1.75rem] backdrop-blur-xl z-50 flex flex-col overflow-hidden pointer-events-auto transition-all border shadow-lg ${isDarkMode ? 'bg-black/55 border-white/15 hover:bg-black/65 text-white' : 'bg-white/55 border-gray-300 hover:bg-white/65 text-slate-900'}`}
          style={{ willChange: "transform" }}
        >
          <div className="flex-1 p-6 md:p-8 flex flex-col gap-4 overflow-y-auto">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className={`text-3xl md:text-4xl font-black text-transparent bg-clip-text tracking-tight ${isDarkMode ? 'bg-gradient-to-br from-white to-[#00E5FF]' : 'bg-gradient-to-br from-slate-950 to-slate-600'}`}>
                  {SECTIONS[focusedIndex].name}
                </h2>
                <h3 className={`text-sm md:text-lg font-bold uppercase tracking-[0.25em] mt-2 ${isDarkMode ? 'text-cyan-300' : 'text-slate-600'}`}>
                  {SECTIONS[focusedIndex].tagline}
                </h3>
              </div>

              <button
                type="button"
                aria-label="Close card"
                onClick={(e) => {
                  e.stopPropagation();
                  setFocusedIndex(null);
                }}
                className={`shrink-0 w-10 h-10 rounded-full transition flex items-center justify-center ${isDarkMode ? 'border border-white/10 bg-white/5 text-white/70 hover:text-white hover:bg-white/10' : 'border border-slate-300 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
              >
                ×
              </button>
            </div>

            <p className={`text-sm md:text-base leading-relaxed font-light ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              {SECTIONS[focusedIndex].description}
            </p>

            {focusedIndex !== 0 && (
              <button className={`mt-auto px-5 py-3 rounded-xl transition-all text-sm md:text-base cursor-pointer border ${isDarkMode ? 'bg-cyan-500/20 hover:bg-cyan-500/40 border-cyan-400 text-cyan-300' : 'bg-slate-900/5 hover:bg-slate-900/10 border-slate-400 text-slate-800'}`} onClick={handleNavigate}>
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
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const rootRef = useRef(null);
  const sidebarRef = useRef(null);
  const aboutUsRef = useRef(null);
  const [focusedIndex, setFocusedIndex] = useState(null);
  const [showHologram, setShowHologram] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showSciFiHUD, setShowSciFiHUD] = useState(false);
  const discClickedRef = useRef(false);
  const cameraReturnLockRef = useRef(false);
  const secretClickStateRef = useRef({ startTime: 0, count: 0, required: 0 });
  const secretResetTimerRef = useRef(null);
  const [showLoader, setShowLoader] = useState(() => {
    if (typeof window === 'undefined') return true;
    return !(sessionStorage.getItem('loader_shown_this_session') === 'true');
  });

  const getRequiredClicks = () => {
    const minuteMod = new Date().getMinutes() % 5;
    return minuteMod === 0 ? 5 : minuteMod;
  };

  const resetSecretWindow = () => {
    if (secretResetTimerRef.current) {
      clearTimeout(secretResetTimerRef.current);
      secretResetTimerRef.current = null;
    }
    secretClickStateRef.current = { startTime: 0, count: 0, required: 0 };
  };

  const handleSecretCornerClick = () => {
    const now = Date.now();
    const current = secretClickStateRef.current;

    const windowExpired = !current.startTime || now - current.startTime > 5000;

    if (windowExpired) {
      const required = getRequiredClicks();
      secretClickStateRef.current = { startTime: now, count: 1, required };

      if (secretResetTimerRef.current) clearTimeout(secretResetTimerRef.current);
      secretResetTimerRef.current = setTimeout(() => {
        resetSecretWindow();
      }, 5000);

      if (required <= 1) {
        resetSecretWindow();
        navigate('/login');
      }
      return;
    }

    const nextCount = current.count + 1;
    secretClickStateRef.current = { ...current, count: nextCount };

    if (nextCount >= current.required) {
      resetSecretWindow();
      navigate('/login');
    }
  };

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

  useEffect(() => {
    if (focusedIndex === null) return;

    const onWheel = (event) => {
      if (event.deltaY > 0) {
        event.preventDefault();
        setFocusedIndex(null);
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [focusedIndex]);

  useEffect(() => {
    return () => {
      if (secretResetTimerRef.current) clearTimeout(secretResetTimerRef.current);
    };
  }, []);

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
              opacity: 1,
              transform: showLoader ? 'scale(1.03)' : 'scale(1)',
              transition: 'transform 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              pointerEvents: showLoader ? 'none' : 'auto'
            }}
          >
            <button
              onClick={toggleTheme}
              className={`absolute top-5 right-5 z-30 flex items-center gap-3 rounded-full px-4 py-3 shadow-lg backdrop-blur-xl transition-all hover:scale-105 ${isDarkMode ? 'bg-black/55 border border-white/15 text-white' : 'bg-white/85 border border-gray-300 text-gray-900'}`}
            >
              <span>
                {isDarkMode ? <FiMoon className="h-4 w-4" /> : <FiSun className="h-4 w-4" />}
              </span>
              <span className="text-sm font-semibold">{isDarkMode ? 'Dark' : 'Light'}</span>
            </button>
            
            <button className={`absolute top-5 left-5 z-30 flex items-center gap-3 rounded-full px-4 py-3 shadow-lg backdrop-blur-xl transition-all hover:scale-105 pointer-events-auto ${isDarkMode ? 'bg-black/55 border border-white/15 text-white' : 'bg-white/85 border border-gray-300 text-gray-900'}`}
            >
              <h1 className="text-sm font-semibold whitespace-nowrap">
                DevlUp Labs
              </h1>
            </button>

            <div className="absolute inset-0 z-[1]">
              <Canvas
                dpr={[1, 1.1]}
                camera={{ position: [0, 0.2, 0.5], fov: 45 }}
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
                <ScrollControls pages={2} damping={0.1}>
                  <Suspense fallback={null}>
                    <Scene focusedIndex={focusedIndex} setFocusedIndex={setFocusedIndex} showHologram={showHologram} setShowHologram={setShowHologram} isTransitioning={isTransitioning} discClickedRef={discClickedRef} cameraReturnLockRef={cameraReturnLockRef} />
                  </Suspense>
                  <Scroll html style={{ width: '100vw' }}>
                    <div className={`w-screen h-screen flex flex-col items-center justify-center transition-all duration-1000 ${isTransitioning ? 'pointer-events-none opacity-0 scale-150 duration-500' : showHologram ? 'pointer-events-none opacity-0 scale-110' : 'pointer-events-auto opacity-100 scale-100'}`} style={{ top: '100vh', position: 'absolute' }}>
                      <div className={`w-full h-full flex flex-col items-center justify-center p-20 text-center overflow-visible ${isDarkMode ? 'bg-gradient-to-t from-black/80 to-transparent' : 'bg-gradient-to-t from-gray-300/60 to-transparent'}`}>
                        <h2 className={isDarkMode ? `text-8xl font-black leading-tight text-transparent bg-clip-text max-w-5xl mb-8 bg-gradient-to-r from-blue-400 via-cyan-300 to-[#00E5FF]` : `text-8xl font-black leading-tight text-transparent bg-clip-text max-w-5xl mb-8 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-500`}>
                          DevlUp Labs
                        </h2>
                        <p className={`text-2xl max-w-3xl font-light leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-900'}`}>
                          Welcome to DevlUp Labs, the Open Source Enthusiast Community of IIT Jodhpur.
                        </p>
                        <button onClick={() => {
                          setIsTransitioning(true);
                          setTimeout(() => {
                            setShowSciFiHUD(true);
                            setIsTransitioning(false);
                          }, 3200);
                        }} className={`mt-14 px-12 py-5 rounded-full font-bold tracking-[0.2em] uppercase transition-all backdrop-blur-md ${isDarkMode ? 'bg-white/10 text-white border border-white/30 hover:bg-white/20 hover:shadow-[0_0_40px_rgba(0,229,255,0.3)]' : 'bg-slate-900/5 text-slate-900 border border-slate-300 hover:bg-slate-900/10'} hover:scale-[1.03]`}>
                          Explore Further
                        </button>
                        
                      </div>
                    </div>

                  </Scroll>
                </ScrollControls>
              </Canvas>
            </div>
            <div className="absolute inset-0 pointer-events-none z-[10] overflow-hidden">
              <FloatingCard focusedIndex={focusedIndex} setFocusedIndex={setFocusedIndex} sidebarRef={sidebarRef} />
            </div>

            <div className="absolute inset-0 z-[20] pointer-events-none">
              <button
                type="button"
                aria-label="Hidden login trigger left"
                onClick={handleSecretCornerClick}
                className="absolute top-2 left-2 w-9 h-9 pointer-events-auto opacity-0"
              />
              <button
                type="button"
                aria-label="Hidden login trigger right"
                onClick={handleSecretCornerClick}
                className="absolute top-2 right-2 w-9 h-9 pointer-events-auto opacity-0"
              />
            </div>
          </div>
        </>
      )}
    </>
  );
}



useGLTF.preload('/penguin3l.glb')

/** Map a scroll offset range [start, end] â†’ [0, 1] */
function scrollRange(offset, start, end) {
  return THREE.MathUtils.clamp((offset - start) / (end - start), 0, 1)
}

/** Smooth cubic ease-in-out */
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function GlowRing({ scrollRef, isDarkMode }) {
  const ringRef = useRef()

  useFrame((state) => {
    if (!ringRef.current) return
    const t = state.clock.getElapsedTime()
    const offset = scrollRef.current

    ringRef.current.material.emissiveIntensity = 1.5 + Math.sin(t * 0.8) * 0.3

    const hinge = easeInOutCubic(scrollRange(offset, 0.05, 0.35))

    ringRef.current.position.x = THREE.MathUtils.lerp(-1.10, -1.10 - 2, hinge)
  })

  return (
    <mesh ref={ringRef} position={[-1.10, -0.2, -2.3]} scale={[1, 1, 1]}>
      <torusGeometry args={[3.2, 0.06, 32, 128]} />
      <meshStandardMaterial
        color={isDarkMode ? "#ffffff" : "#000000"}
        emissive={isDarkMode ? "#ffffff" : "#000000"}
        emissiveIntensity={1.8}
        toneMapped={false}
        transparent
      />
    </mesh>
  )
}

function SceneLighting({ isDarkMode }) {
  return (
    <>
      <ambientLight intensity={isDarkMode ? 0.15 : 0.8} color={isDarkMode ? "#b0c4de" : "#ffffff"} />
      <directionalLight
        position={[1.5, 4, 6]}
        intensity={isDarkMode ? 2.0 : 2.6}
        color={isDarkMode ? "#ffeedd" : "#ffffff"}
        castShadow
      />
      <directionalLight
        position={[-2.5, 2.5, 5.5]}
        intensity={isDarkMode ? 1.2 : 1.6}
        color={isDarkMode ? "#4488ff" : "#88aaff"}
      />
      <directionalLight
        position={[0, 1.5, 4.5]}
        intensity={isDarkMode ? 0.8 : 1.0}
        color="#aabbcc"
      />
      <spotLight
        position={[0, 6, 7]}
        angle={0.35}
        penumbra={0.8}
        intensity={isDarkMode ? 2.2 : 3.0}
        color="#ffffff"
        castShadow
      />
      {/* Extra fill lights in positive Z towards the penguin */}
      <pointLight position={[0, 1, 8]} intensity={isDarkMode ? 1.2 : 1.2} color="#ffffff" distance={20} />
      <pointLight position={[2.2, 1.2, 7]} intensity={isDarkMode ? 0.8 : 0.8} color="#ffeedd" distance={18} />
      <pointLight position={[-2.2, 1.2, 7]} intensity={isDarkMode ? 0.8 : 0.8} color="#ffeedd" distance={18} />
    </>
  )
}


function PenguinModel({ scrollRef }) {
  const { scene } = useGLTF('/penguin3l.glb')

  // 1) Center the geometry internally once so it rotates around its own spine
  useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene)
    const center = new THREE.Vector3()
    box.getCenter(center)
    // Offset the scene by the negative of its bounding box center
    scene.position.sub(center)
  }, [scene])

  const groupRef = useRef()
  const targetPosition = useMemo(() => new THREE.Vector3(), [])

  useFrame((state, delta) => {
    if (!groupRef.current) return
    const offset = scrollRef.current

    // Calculate the overall scroll progress
    const move = easeInOutCubic(scrollRange(offset, 0.05, 0.35))

    // Set exactly where the penguin SHOULD be right now based on scroll
    // Aligned to match the GlowRing center
    const targetX = THREE.MathUtils.lerp(-1, -4.2, move)
    const targetScale = THREE.MathUtils.lerp(0.2, 0.1, move)

    targetPosition.set(targetX, -0.2, -3)

    groupRef.current.position.lerp(targetPosition, 1 - Math.exp(-8 * delta))

    const s = THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 8 * delta)
    groupRef.current.scale.set(s, s, s)

    // 2) Rotate slightly toward the cursor on the local Y-axis
    // Find where the penguin is essentially on the screen (-1 to 1)
    const projected = targetPosition.clone().project(state.camera)

    // dx is the difference between mouse cursor (state.pointer.x) and the penguin's screen X
    const dx = state.pointer.x - projected.x
    // dy for looking up/down if you want, or just stick to dx for Y-rotation
    const dy = state.pointer.y - projected.y

    // Calculate angle: standard rotation is -Math.PI / 2
    // We add an angle based on the cursor distance. 
    // Math.atan2 scales perfectly and smoothly without breaking 360 degrees.
    const targetRotationY = -Math.PI / 2 + Math.atan2(dx, 1.5)

    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetRotationY,
      1 - Math.exp(-10 * delta)
    )
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


function FloatingParticles({ isDarkMode }) {
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
        color={isDarkMode ? "#ffffff" : "#0055ff"}
        transparent
        opacity={isDarkMode ? 0.4 : 0.6}
        sizeAttenuation
      />
    </points>
  )
}

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

function SceneContent({ isDarkMode }) {
  const scroll = useScroll()
  const scrollRef = useRef(0)

  useFrame(() => {
    scrollRef.current = scroll.offset
  })

  return (
    <>
      <CameraRig scrollRef={scrollRef} />
      <SceneLighting isDarkMode={isDarkMode} />

      <Suspense fallback={null}>
        <GlowRing scrollRef={scrollRef} isDarkMode={isDarkMode} />
        <PenguinModel scrollRef={scrollRef} />
        <FloatingParticles isDarkMode={isDarkMode} />
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

function ScrollHTML({ isDarkMode }) {
  const scroll = useScroll()

  const heroRef = useRef()
  const leftTextRef = useRef()
  const rightTextRef = useRef()
  const detailRef = useRef()
  const block1Ref = useRef()
  const block2Ref = useRef()
  const block3Ref = useRef()
  const autoScrolledRef = useRef(false)
  const autoBackedRef = useRef(false)
  const prevOffsetRef = useRef(0)

  useFrame(() => {
    const offset = scroll.offset

    // Auto full-scroll when crossing threshold (downward only)
    const THRESHOLD = 0.1
    const BACK_THRESHOLD = 0.9

    // Back-scroll: when user scrolls up past BACK_THRESHOLD, snap back to top
    if (!autoBackedRef.current && prevOffsetRef.current > BACK_THRESHOLD && offset <= BACK_THRESHOLD) {
      if (typeof scroll.scrollTo === 'function') {
        scroll.scrollTo(0)
        autoBackedRef.current = true
        // eslint-disable-next-line no-console
        console.log('[ScrollHTML] auto back-scroll: used scroll.scrollTo')
      } else if (scroll && scroll.el && typeof scroll.el.scrollTo === 'function') {
        try {
          scroll.el.scrollTo({ top: 0, behavior: 'smooth' })
          autoBackedRef.current = true
          // eslint-disable-next-line no-console
          console.log('[ScrollHTML] auto back-scroll: used scroll.el.scrollTo fallback')
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn('[ScrollHTML] auto back-scroll fallback failed', e)
        }
      } else {
        try {
          window.scrollTo({ top: 0, behavior: 'smooth' })
          autoBackedRef.current = true
          // eslint-disable-next-line no-console
          console.log('[ScrollHTML] auto back-scroll: used window.scrollTo fallback')
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn('[ScrollHTML] no scrollTo available for back-scroll', scroll)
        }
      }
    }

    // reset back-scroll allow if user scrolls down above a small hysteresis
    if (autoBackedRef.current && offset > BACK_THRESHOLD + 0.05) {
      autoBackedRef.current = false
    }

    if (!autoScrolledRef.current && prevOffsetRef.current < THRESHOLD && offset >= THRESHOLD) {
      // Primary API (react-three/drei)
      if (typeof scroll.scrollTo === 'function') {
        scroll.scrollTo(1)
        autoScrolledRef.current = true
        // debug
        // eslint-disable-next-line no-console
        console.log('[ScrollHTML] auto scroll: used scroll.scrollTo')
      } else if (scroll && scroll.el && typeof scroll.el.scrollTo === 'function') {
        // fallback: attempt to scroll the element directly
        try {
          scroll.el.scrollTo({ top: scroll.el.scrollHeight, behavior: 'smooth' })
          autoScrolledRef.current = true
          // eslint-disable-next-line no-console
          console.log('[ScrollHTML] auto scroll: used scroll.el.scrollTo fallback')
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn('[ScrollHTML] auto scroll fallback failed', e)
        }
      } else {
        // final fallback: window scroll
        try {
          window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
          autoScrolledRef.current = true
          // eslint-disable-next-line no-console
          console.log('[ScrollHTML] auto scroll: used window.scrollTo fallback')
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn('[ScrollHTML] no scrollTo available', scroll)
        }
      }
    }
    // Allow re-trigger if user scrolls back up past hysteresis
    if (autoScrolledRef.current && offset < THRESHOLD - 0.05) {
      autoScrolledRef.current = false
    }
    prevOffsetRef.current = offset

    if (heroRef.current && leftTextRef.current && rightTextRef.current) {
      heroRef.current.style.perspective = '1200px'

      const openProgress = easeInOutCubic(scrollRange(offset, 0.02, 0.15));
      const opacity = 1 - openProgress;

      const scrollY = offset * window.innerHeight;
      const stopThreshold = 60; // How many pixels it can move up before stopping
      const counterScroll = Math.max(0, scrollY - stopThreshold);

      leftTextRef.current.style.opacity = opacity;
      leftTextRef.current.style.transformOrigin = 'left center';
      leftTextRef.current.style.transform = `translateY(${counterScroll}px) translateZ(${-500 * openProgress}px) rotateY(${-45 * openProgress}deg)`;

      rightTextRef.current.style.opacity = opacity;
      rightTextRef.current.style.transformOrigin = 'right center';
      rightTextRef.current.style.transform = `translateY(${counterScroll}px) translateZ(${500 * openProgress}px) rotateY(${-45 * openProgress}deg)`;
    }

    if (detailRef.current) {
      const fadeIn = easeInOutCubic(scrollRange(offset, 0.16, 0.30))
      detailRef.current.style.opacity = fadeIn
      detailRef.current.style.transform = `translateY(${(1 - fadeIn) * 50}px)`
    }

    if (block1Ref.current) {
      const o = easeInOutCubic(scrollRange(offset, 0.16, 0.30))
      block1Ref.current.style.opacity = o
      block1Ref.current.style.transform = `translateY(${(1 - o) * 20}px)`
    }
    if (block2Ref.current) {
      const o = easeInOutCubic(scrollRange(offset, 0.16, 0.30))
      block2Ref.current.style.opacity = o
      block2Ref.current.style.transform = `translateY(${(1 - o) * 20}px)`
    }
    if (block3Ref.current) {
      const o = easeInOutCubic(scrollRange(offset, 0.16, 0.30))
      block3Ref.current.style.opacity = o
      block3Ref.current.style.transform = `translateY(${(1 - o) * 20}px)`
    }
  })

  return (
    <Scroll html style={{ width: '100%' }}>
      <div ref={heroRef} className="scroll-section flex items-end justify-between px-12 pb-[10%]">
        <div ref={leftTextRef} className="max-w-[600px] mt-20">
          <h1 className={`${isDarkMode ? 'text-white' : 'text-slate-900'} font-sans font-light text-[clamp(3rem,7vw,6.5rem)] leading-[1.05] m-0`}>
            <span className={`${isDarkMode ? 'text-slate-300' : 'text-slate-900'} block`}>DevlUp</span>
            <span className={`${isDarkMode ? 'text-slate-300' : 'text-slate-900'} block ml-[0.6em]`}>Labs</span>
          </h1>
        </div>
        <div ref={rightTextRef} className={`${isDarkMode ? 'text-slate-300' : 'text-slate-700'} max-w-[320px] self-center mt-[130px] mb-2 text-center`}>
          <br />
          <p className={`font-inter text-base font-light leading-[1.75] m-0`}>
            DevlUp Labs is a thriving student-led open source community at IIT Jodhpur.We believe in sharing of ideas and upskilling by collaboration through meaningful projects. Our focus is to deliver results with the
            highest of standards.We aim to build an open source community through proper guidance and by encouraging self learning.
            We encourage development of technology and Innovation through various sessions, workshops and webinars.
          </p>
        </div>
      </div>

      <div ref={detailRef} className="scroll-section flex items-center pl-20" style={{ top: 0, opacity: 0 }}>
        <div className="max-w-[620px] flex flex-col gap-0 mt-[100px] pt-[100px]">
          <div ref={block1Ref} className="py-6" style={{ opacity: 0 }}>
            <h2 className={`${isDarkMode ? 'text-white' : 'text-slate-900'} text-[clamp(1.8rem,3.5vw,2.8rem)] font-light leading-[1.15] m-0`}>Learning Driven Endeavour</h2>
            <span className={`${isDarkMode ? 'text-white/35' : 'text-slate-700'} font-inter text-base font-light leading-[1.75]` }>
              A Learning Driven Endeavour is a conscious, continuous effort to pursue knowledge, skills, or personal growth
              as the primary objective. Rather than focusing solely on a final result, it prioritizes the process of
              improvement, curiosity, and adaptation.
            </span>
          </div>

          <div className={`w-full h-px ${isDarkMode ? 'bg-gradient-to-r from-white/12 via-white/4 to-transparent' : 'bg-gradient-to-r from-white/12 via-white/4 to-transparent'}`} />

          <div ref={block2Ref} className="py-6" style={{ opacity: 0 }}>
            <h2>
              <span className={`${isDarkMode ? 'text-white' : 'text-slate-900'} text-[clamp(2rem,4vw,3.2rem)] font-thin`}>Projects that matter to the community</span>
            </h2>
            <span className={`${isDarkMode ? 'text-white/35' : 'text-slate-700'} font-inter text-base font-light leading-[1.75]`}>
              We at devlup labs are committed to products and projects that matter,
              projects that serve a real purpose for the community.
            </span>
          </div>

          <div className={`w-full h-px ${isDarkMode ? 'bg-gradient-to-r from-white/12 via-white/4 to-transparent' : 'bg-gradient-to-r from-white/12 via-white/4 to-transparent'}`} />

          <div ref={block3Ref} className="py-6" style={{ opacity: 0 }}>
            <h2 className={`${isDarkMode ? 'text-white' : 'text-slate-900'} text-[clamp(1.8rem,3.5vw,2.8rem)] font-light leading-[1.15] m-0`}>Self Learning</h2>

            <span className={`${isDarkMode ? 'text-white/35' : 'text-slate-700'} font-inter text-base font-light leading-[1.75]`}>
              At DevlUp Labs, self-learning is the core philosophy, fostering a culture where individuals take initiative to master new technologies.
              We maximize efficiency by ensuring the optimal utilization of available resources, enabling members to learn by building real-world projects.
            </span>

          </div>
        </div>
      </div>
    </Scroll>
  )
}

function FixedOverlay({ onClose }) {
  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Faint vertical grid lines */}
      <div className="absolute inset-0 flex justify-evenly pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="w-px h-full bg-gradient-to-b from-transparent via-white/4 to-transparent" />
        ))}
      </div>
    </div>
  )
}

export function SciFiHUD({ onClose }) {
  const { isDarkMode } = useContext(ThemeContext);
  return (
    <>
      <div
        className={`w-screen h-screen overflow-hidden relative`}
        style={{
          backgroundImage: `url('${isDarkMode ? '/bgweb4.jpeg' : '/bgweb3.jpeg'}')`,
          backgroundSize: 'cover',
          backgroundAttachment: 'fixed',
          backgroundPosition: 'center',
        }}
      >
        <Header onClose={onClose} />
        <div className="relative w-screen h-screen overflow-hidden bg-transparent">
          <Canvas
            className="absolute inset-0 w-full h-full z-[1]"
            camera={{ position: [0, 0, 0], fov: 45 }}
            gl={{
              antialias: true,
              alpha: true,
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.0,
            }}
          >
            {isDarkMode ? (
              <>
                <fog attach="fog" args={['#000000', 10, 22]} />
              </>
            ) : (
              <fog attach="fog" args={['#cfdcf2', 10, 22]} />
            )}

            <ScrollControls pages={2} damping={0.1}>
              <SceneContent isDarkMode={isDarkMode} />
              <ScrollHTML isDarkMode={isDarkMode} />
            </ScrollControls>
          </Canvas>

          <FixedOverlay onClose={onClose} />
        </div>
      </div>
    </>
  )
}