import { useRef, useMemo, useState, useCallback, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Line, ScrollControls, useScroll, Html, SpotLight } from "@react-three/drei";
import * as THREE from "three";
import { AnimatePresence, motion } from "framer-motion";

/* CONSTANTS */
const SECTIONS = [
  { name: "Home", icon: "🏠", tagline: "Welcome to DevlUp Labs", description: "Your command center for everything we build." },
  { name: "Timeline", icon: "📅", tagline: "Chronicle Your Journey", description: "Visualize your milestones and progress." },
  { name: "Videos", icon: "🎬", tagline: "Cinematic Storytelling", description: "Immersive video content crafted for maximum impact." },
  { name: "Podcast", icon: "🎙️", tagline: "Voices That Resonate", description: "Deep conversations and thought-provoking discussions." },
  { name: "Blogs", icon: "✍️", tagline: "Words That Inspire", description: "In-depth articles and thought leadership." },
  { name: "Team", icon: "👥", tagline: "The Minds Behind the Vision", description: "Passionate creators building the future." },
];

const BLOCK_COLORS = ["#F43F5E", "#E11D48", "#8B5CF6", "#F59E0B", "#10B981", "#D946EF"];
const X_RADIUS = 6.5, Z_RADIUS = 6.5;
const matConfig = (color) => ({ color, metalness: 0.1, roughness: 0.8, transparent: true });

const BLOCK_CONFIGS = [
  { render: () => (<group position={[0, 0.45, 0]}><mesh><boxGeometry args={[0.4, 0.35, 0.4]} /><meshPhysicalMaterial {...matConfig("#F43F5E")} /></mesh><mesh position={[0, 0.27, 0]}><coneGeometry args={[0.35, 0.25, 4]} /><meshPhysicalMaterial {...matConfig("#FDA4AF")} /></mesh><mesh position={[0, -0.08, 0.21]}><boxGeometry args={[0.1, 0.15, 0.02]} /><meshPhysicalMaterial {...matConfig("#e2e8f0")} /></mesh></group>) },
  { render: () => {const steps = [{ w: 0.5, h: 0.08, x: -0.15, y: 0.1 }, { w: 0.4, h: 0.08, x: -0.05, y: 0.22 }, { w: 0.3, h: 0.08, x: 0.05, y: 0.34 }, { w: 0.2, h: 0.08, x: 0.15, y: 0.46 }]; return (<group position={[0, 0.15, 0]}>{steps.map((s, i) => (<mesh key={i} position={[s.x, s.y, 0]}><boxGeometry args={[s.w, s.h, 0.35]} /><meshPhysicalMaterial {...matConfig(["#BE123C", "#E11D48", "#F43F5E", "#e2e8f0"][i])} /></mesh>))}<mesh position={[0.15, 0.6, 0]}><cylinderGeometry args={[0.01, 0.01, 0.2, 8]} /><meshPhysicalMaterial {...matConfig("#e2e8f0")} /></mesh><mesh position={[0.21, 0.63, 0]}><boxGeometry args={[0.1, 0.06, 0.01]} /><meshPhysicalMaterial {...matConfig("#F43F5E")} /></mesh></group>);} },
  { render: () => (<group position={[0, 0.45, 0]}><mesh><boxGeometry args={[0.55, 0.35, 0.04]} /><meshPhysicalMaterial {...matConfig("#2E1065")} /></mesh><mesh position={[0, 0, -0.01]}><boxGeometry args={[0.6, 0.4, 0.02]} /><meshPhysicalMaterial {...matConfig("#8B5CF6")} /></mesh><mesh position={[0, 0, 0.04]} rotation={[0, 0, -Math.PI / 2]}><coneGeometry args={[0.08, 0.14, 3]} /><meshPhysicalMaterial {...matConfig("#DDD6FE")} /></mesh></group>) },
  { render: () => (<group position={[0, 0.25, 0]}><mesh position={[0, 0.35, 0]}><sphereGeometry args={[0.12, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshPhysicalMaterial {...matConfig("#F59E0B")} /></mesh><mesh position={[0, 0.28, 0]}><cylinderGeometry args={[0.12, 0.12, 0.14, 32]} /><meshPhysicalMaterial {...matConfig("#FCD34D")} /></mesh><mesh position={[0, 0.1, 0]}><cylinderGeometry args={[0.025, 0.025, 0.3, 16]} /><meshPhysicalMaterial {...matConfig("#cbd5e1")} /></mesh><mesh position={[0, -0.05, 0]}><cylinderGeometry args={[0.15, 0.15, 0.03, 32]} /><meshPhysicalMaterial {...matConfig("#B45309")} /></mesh>{[0.16, 0.22, 0.28].map((r, i) => (<mesh key={i} position={[0, 0.33, 0]}><torusGeometry args={[r, 0.008, 8, 32, Math.PI]} /><meshPhysicalMaterial {...matConfig("#FDE68A")} opacity={0.5 - i * 0.12} /></mesh>))}</group>) },
  { render: () => (<group position={[0, 0.3, 0]}>{[0, 0.06, 0.12].map((y, i) => (<mesh key={i} position={[0, y, -i * 0.03]}><boxGeometry args={[0.35, 0.04, 0.45]} /><meshPhysicalMaterial {...matConfig(["#e2e8f0", "#cbd5e1", "#94a3b8"][i])} opacity={0.85} /></mesh>))}{[0.08, 0.02, -0.04, -0.1].map((z, i) => (<mesh key={`l-${i}`} position={[0, 0.15, z]}><boxGeometry args={[0.22 - i * 0.03, 0.008, 0.015]} /><meshPhysicalMaterial {...matConfig("#10B981")} /></mesh>))}<mesh position={[0.22, 0.18, 0.05]} rotation={[0, 0, 0.3]}><cylinderGeometry args={[0.012, 0.012, 0.25, 8]} /><meshPhysicalMaterial {...matConfig("#34D399")} /></mesh></group>) },
  { render: () => {const nodes = [{ pos: [0, 0.55, 0], size: 0.09 }, { pos: [-0.2, 0.35, 0.1], size: 0.07 }, { pos: [0.2, 0.35, -0.1], size: 0.07 }, { pos: [-0.12, 0.2, -0.15], size: 0.06 }, { pos: [0.15, 0.2, 0.12], size: 0.06 }]; const cols = ["#D946EF", "#C084FC", "#E879F9", "#e2e8f0", "#A21CAF"]; return (<group position={[0, 0.1, 0]}>{nodes.map((n, i) => (<group key={i}><mesh position={n.pos}><sphereGeometry args={[n.size, 16, 16]} /><meshPhysicalMaterial {...matConfig(cols[i])} /></mesh><mesh position={[n.pos[0], n.pos[1] - n.size - 0.04, n.pos[2]]}><capsuleGeometry args={[n.size * 0.5, n.size * 0.6, 4, 8]} /><meshPhysicalMaterial {...matConfig(cols[i])} /></mesh></group>))}{[[0, 1], [0, 2], [1, 3], [2, 4], [1, 2], [3, 4]].map(([a, b], i) => (<Line key={`tl-${i}`} points={[nodes[a].pos, nodes[b].pos]} color="#D946EF" lineWidth={1} transparent opacity={0.4} />))}</group>);} },
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
function AnimatedBlock({ visible, children }) {
  const groupRef = useRef();
  const currentScale = useRef(0);
  useFrame((_, delta) => {
    const target = visible ? 1.8 : 0;
    currentScale.current = THREE.MathUtils.lerp(currentScale.current, target, 1 - Math.exp(-4 * delta));
    if (groupRef.current) groupRef.current.scale.setScalar(currentScale.current);
  });
  return <group ref={groupRef} scale={0}>{children}</group>;
}

function FloatingDisc({ position, color, scale = 1, isFocused, onClick, softness = 2.0 }) {
  const meshRef = useRef(), caseMatRef = useRef(), beamMatRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    const tCaseOp = isFocused ? 1.2 : 0.4, tBeamOp = isFocused ? 0.8 : (hovered ? 0.15 : 0);
    if (caseMatRef.current) {
      caseMatRef.current.uniforms.uGlobalOpacity.value = THREE.MathUtils.lerp(caseMatRef.current.uniforms.uGlobalOpacity.value, tCaseOp, 1 - Math.exp(-4 * delta));
      caseMatRef.current.uniforms.uTime.value += delta;
      if (caseMatRef.current.uniforms.uBeamSoftness) caseMatRef.current.uniforms.uBeamSoftness.value = softness;
    }
    if (beamMatRef.current) beamMatRef.current.opacity = THREE.MathUtils.lerp(beamMatRef.current.opacity, tBeamOp, 1 - Math.exp(-4 * delta));
  });

  return (
    <group ref={meshRef} position={position} scale={hovered ? scale * 1.05 : scale} onClick={onClick} onPointerOver={() => { setHovered(true); document.body.style.cursor = "pointer"; }} onPointerOut={() => { setHovered(false); document.body.style.cursor = "default"; }}>
      <SpotLight color={color || "#00D2FF"} distance={15} angle={0.6} attenuation={4} anglePower={5} intensity={isFocused ? 20 : 0} opacity={isFocused ? 0.8 : 0} position={[0, 6, 0]} penumbra={1} />
      <mesh castShadow receiveShadow><cylinderGeometry args={[1.45, 1.45, 0.4, 64]} /><meshStandardMaterial color="#050814" roughness={0.8} metalness={0.2} /></mesh>
      <mesh position={[0, 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}><torusGeometry args={[1.45, 0.03, 16, 64]} /><meshBasicMaterial color="#FF004D" /></mesh>
      <mesh position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}><torusGeometry args={[1.45, 0.03, 16, 64]} /><meshBasicMaterial color="#FF004D" /></mesh>
      <mesh position={[0, 0, 0]}><cylinderGeometry args={[1.48, 1.48, 0.42, 64, 1, true]} /><meshBasicMaterial color="#FF0080" transparent opacity={0.25} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
      <mesh position={[0, 2.2, 0]}><cylinderGeometry args={[1.45, 1.45, 4.0, 64, 1, true]} /><shaderMaterial ref={caseMatRef} transparent depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} uniforms={{ uTime: { value: 0 }, uColorInner: { value: new THREE.Color('#FF0080') }, uColorOuter: { value: new THREE.Color('#00E5FF') }, uGlobalOpacity: { value: 1.2 }, uBeamCount: { value: 2500 }, uBeamSoftness: { value: 5}, uHeight: { value: 1.0 }, uRadius: { value: 1.45 }, uNoiseScale: { value: 2.5 }, uNoiseSpeed: { value: 0.6 }, uRotation: { value: 0 } }} vertexShader="varying vec2 vUv; varying vec3 vPosition; void main() { vUv = uv; vPosition = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }" fragmentShader="precision mediump float; varying vec2 vUv; varying vec3 vPosition; uniform float uTime; uniform vec3 uColorInner; uniform vec3 uColorOuter; uniform float uGlobalOpacity; uniform float uBeamCount; uniform float uBeamSoftness; float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123); } float noise(vec2 p) { vec2 i = floor(p); vec2 f = fract(p); float a = hash(i); float b = hash(i + vec2(1.0, 0.0)); float c = hash(i + vec2(0.0, 1.0)); float d = hash(i + vec2(1.0, 1.0)); vec2 u = f * f * (3.0 - 2.0 * f); return mix(a, b, u.x) + (c - a)*u.y*(1.0 - u.x) + (d - b)*u.x*u.y; } void main() { float theta = vUv.x * 6.28318530718 + uTime * 0.1; float y = vUv.y; float n = noise(vec2(theta * 2.5, y * 2.5) + vec2(uTime * 0.6)); float phase = (n - 0.5) * 2.0; float p = theta * uBeamCount + phase * 1.2; float lob = max(0.0, cos(p)); float beam = pow(lob, 1.0 + uBeamSoftness * 2.0); float vfall = pow(1.0 - smoothstep(0.0, 1.0, y), uBeamSoftness); float radial = 1.0 - abs(length(vec2(vPosition.x, vPosition.z)) - 1.45) / (1.45 * 0.6); radial = clamp(radial, 0.0, 1.0); float intensity = beam * vfall * radial; float shimmer = noise(vec2(theta * 1.5, uTime * 0.5)) * 0.25; intensity += shimmer * 0.35; vec3 col = mix(uColorInner, uColorOuter, clamp(beam * 2.0, 0.0, 1.0)); vec3 outCol = col * intensity * uGlobalOpacity * 1.6; gl_FragColor = vec4(outCol, clamp(intensity * uGlobalOpacity, 0.0, 1.0)); }" /></mesh>
      {[0.4, 0.65, 0.9].map((r, i) => (<mesh key={i} position={[0, 0.202, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[r, r + 0.02, 64]} /><meshBasicMaterial color="#20010aff" transparent opacity={0.15 + (i * 0.15)} blending={THREE.AdditiveBlending} /></mesh>))}
      <mesh position={[0, 0.205, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.15, 32]} /><meshBasicMaterial transparent opacity={1.0} blending={THREE.AdditiveBlending} /></mesh>
      <mesh position={[0, 0.203, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.5, 32]} /><meshBasicMaterial color="#00E5FF" transparent opacity={hovered ? 0.8 : 0.6} blending={THREE.AdditiveBlending} /></mesh>
    </group>
  );
}

function FloatingBlocks({ count = 80 }) {
  const meshRef = useRef();
  const scroll = useScroll();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) temp.push({ factor: 10 + Math.random() * 40, speed: 0.05 + Math.random() * 0.3, x: (Math.random() - 0.5) * 40, z: (Math.random() - 0.5) * 40, yStart: -10 - Math.random() * 10, yEnd: 15 + Math.random() * 15, scale: Math.random() * 0.6 + 0.3, timeOffset: Math.random() * 100 });
    return temp;
  }, [count]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const r1 = scroll ? scroll.offset : 0;
    particles.forEach((p, i) => {
      const time = state.clock.getElapsedTime() + p.timeOffset;
      let curY = THREE.MathUtils.lerp(p.yStart, p.yEnd, r1 * 1.5);
      const xOff = Math.sin(time * p.speed) * (p.factor * 0.05) * (1 + r1);
      const zOff = Math.cos(time * p.speed) * (p.factor * 0.05) * (1 + r1);
      const yOff = Math.sin(time * p.speed * 1.5) * (p.factor * 0.05);
      const spread = 1 + r1 * 0.5;
      dummy.position.set(p.x * spread + xOff, curY + yOff, p.z * spread + zOff);
      dummy.rotation.set(time * p.speed, time * p.speed * 0.5, time * p.speed * 0.2);
      dummy.scale.setScalar(p.scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (<instancedMesh ref={meshRef} args={[null, null, count]}><boxGeometry args={[1, 1, 1]} /><meshPhysicalMaterial color="#ffffff" transmission={0.8} roughness={0.2} metalness={0.1} thickness={2} transparent opacity={0.6} envMapIntensity={2} /></instancedMesh>);
}

function CameraAnimator({ focusedIndex }) {
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
    const targetSet = focusedIndex !== null;
    if (targetSet && prevFocused.current === null) {
      savedPos.current.copy(camera.position);
      savedLookAt.current.set(0, 0, 0);
      currentLookAt.current.set(0, 0, 0);
      isAnimatingBack.current = false;
    }
    if (!targetSet && prevFocused.current !== null) isAnimatingBack.current = true;
    prevFocused.current = focusedIndex;

    const lerpFactor = 1 - Math.exp(-damping * delta);
    if (targetSet) {
      const discObj = scene.getObjectByName(`disc-${focusedIndex}`);
      if (!discObj) return;
      discObj.getWorldPosition(worldTarget.current);
      outDir.current.set(worldTarget.current.x, 0, worldTarget.current.z).normalize();
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

function FlowingGrid() {
  const meshRef = useRef();
  const scroll = useScroll();
  const count = 40, size = 65 / count;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);
  const hoveredIdRef = useRef(null);
  const [showAbout, setShowAbout] = useState(false);
  const aboutAnim = useRef(0);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const time = _.clock.elapsedTime;
    const offset = scroll ? scroll.offset : 0;
    if (showAbout && offset <= 0.15) setShowAbout(false);
    const activation = THREE.MathUtils.smoothstep(offset, 0.15, 0.5);
    aboutAnim.current = THREE.MathUtils.lerp(aboutAnim.current, showAbout ? 1 : 0, 1 - Math.exp(-4 * delta));

    let i = 0;
    for (let x = 0; x < count; x++) {
      for (let z = 0; z < count; z++) {
        const h = Math.abs(Math.sin(x * 12.9898 + z * 78.233) * 43758.5453) % 1;
        const posX = (x - count / 2) * size + size / 2;
        const posZ = (z - count / 2) * size + size / 2;
        const distFromCenter = Math.sqrt(posX * posX + posZ * posZ);
        const edgeFade = Math.max(0, 1.0 - distFromCenter / 30.0);
        const hoverIntensity = hoveredIdRef.current === i && !showAbout ? 1.0 : 0.0;
        const currentActivation = activation * (1 - aboutAnim.current);
        const heightAnim = Math.sin(time * (1.0 + h * 2.0) + h * 10.0) * 0.5 + 0.5;
        let blockHeight = 0.03 + (heightAnim * h * 4.0 * currentActivation * edgeFade);
        let targetX = posX, targetY = blockHeight / 2, targetZ = posZ, scaleX = size * 0.9, scaleY = blockHeight, scaleZ = size * 0.9;
        const isScreenBlock = (x >= 16 && x <= 23 && z === 23);
        if (aboutAnim.current > 0.001 && isScreenBlock) {
          scaleX = THREE.MathUtils.lerp(scaleX, size * 1.01, aboutAnim.current);
          scaleY = THREE.MathUtils.lerp(scaleY, 4.5, aboutAnim.current);
          targetY = THREE.MathUtils.lerp(targetY, 4.5 / 2, aboutAnim.current);
        }
        dummy.rotation.set(0, 0, 0);
        dummy.position.set(targetX, targetY, targetZ);
        dummy.scale.set(scaleX, scaleY, scaleZ);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
        if (isScreenBlock && aboutAnim.current > 0.1) {
          color.set("#050814").lerp(new THREE.Color("#FF004D"), aboutAnim.current * 0.8);
        } else if (hoverIntensity > 0) {
          color.set("#050814").lerp(new THREE.Color("#FF004D"), hoverIntensity + 0.2);
        } else {
          color.set("#050814");
        }
        meshRef.current.setColorAt(i, color);
        i++;
      }
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={meshRef} args={[null, null, count * count]} castShadow receiveShadow position={[0, -0.1, 0]} onPointerMove={(e) => { e.stopPropagation(); if (scroll && scroll.offset > 0.15) hoveredIdRef.current = e.instanceId; }} onPointerOut={() => { hoveredIdRef.current = null; }} onClick={(e) => { e.stopPropagation(); if (scroll && scroll.offset > 0.15) setShowAbout(!showAbout); }}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#000000" metalness={0} roughness={1} />
      </instancedMesh>
      {showAbout && (
        <Html position={[0, 2.5, 5.4]} transform center opacity={aboutAnim.current} scale={0.7}>
          <div className="w-[850px] p-10 text-left bg-black/60 backdrop-blur-3xl border border-cyan-500/50 rounded-3xl shadow-[0_0_60px_-15px_rgba(0,229,255,0.4)] relative overflow-hidden" style={{ opacity: aboutAnim.current }}>
            <div className="absolute top-[-50%] left-[-10%] w-[120%] h-[120%] bg-cyan-500/10 blur-[100px] pointer-events-none" />
            <div className="relative z-10 flex flex-col gap-6">
              <div className="inline-block px-4 py-1.5 rounded-full border border-cyan-400/30 bg-cyan-900/30 text-cyan-300 text-sm font-bold tracking-widest uppercase w-max mb-1">Who We Are</div>
              <h1 className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-br from-white via-cyan-200 to-blue-600 tracking-tight leading-none drop-shadow-lg">DevlUp Labs.</h1>
              <p className="text-slate-300 text-xl font-light leading-relaxed max-w-2xl mt-2 drop-shadow-md">We craft immersive digital realities merging engineering with creative vision.</p>
              <div className="grid grid-cols-3 gap-6 mt-6">{[["50+", "Projects"], ["3D", "Web"], ["100%", "Innovation"]].map((item, i) => (<div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-inner"><div className="text-cyan-400 text-4xl font-black mb-1 drop-shadow-[0_0_10px_rgba(0,229,255,0.8)]">{item[0]}</div><div className="text-slate-400 text-xs font-bold uppercase tracking-widest">{item[1]}</div></div>))}</div>
              <div className="flex justify-end mt-4"><button className="px-8 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold tracking-wider hover:scale-105 hover:shadow-[0_0_30px_rgba(0,229,255,0.6)] transition-all duration-300 flex items-center gap-3 border border-cyan-300/50" onClick={() => setShowAbout(false)}>Return to Grid<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg></button></div>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

function Scene({ focusedIndex, setFocusedIndex }) {
  const ringGroupRef = useRef();
  const { gl } = useThree();
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
    const onWheel = (e) => { if (focusedIndex === null && Math.abs(e.deltaX) > 0) targetRotationY.current += e.deltaX * 0.01; };
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

  useFrame((_, delta) => {
    if (ringGroupRef.current) {
      ringGroupRef.current.rotation.y = THREE.MathUtils.lerp(ringGroupRef.current.rotation.y, targetRotationY.current, 1 - Math.exp(-8 * delta));
      const offset = scroll ? scroll.offset : 0;
      const vanishScale = Math.max(0, 1 - offset * 3);
      const sinkDepth = -(offset * 12);
      ringGroupRef.current.scale.setScalar(vanishScale);
      ringGroupRef.current.position.y = sinkDepth;
    }
  });

  return (
    <>
      <color attach="background" args={['#050814']} />
      <fog attach="fog" args={['#050814', 8, 30]} />
      <ambientLight intensity={1} />
      <directionalLight position={[5, 10, 5]} intensity={0} />
      <spotLight position={[0, 15, 0]} angle={0.6} penumbra={1} intensity={2} />
      <spotLight position={[5, 12, 5]} angle={0.4} penumbra={0.8} intensity={4.0} color="#FF004D" />
      <spotLight position={[-5, 12, -5]} angle={0.4} penumbra={0.8} intensity={4.0} color="#3A0CA3" />
      <pointLight position={[0, 3, 0]} intensity={2.0} distance={15} />
      <Environment preset="city" background={false} />
      <CameraAnimator focusedIndex={focusedIndex} />
      <FloatingBlocks />
      <FlowingGrid />
      <group ref={ringGroupRef}>
        <ParallaxRig enabled={focusedIndex === null}>
          <group rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.8, 0]} scale={[X_RADIUS, Z_RADIUS, 1]}>
            <mesh><torusGeometry args={[1, 0.18, 16, 100]} /><meshStandardMaterial color="#001829" roughness={0.8} metalness={0.3} /></mesh>
            <mesh><torusGeometry args={[1, 0.2, 16, 100]} /><meshBasicMaterial color="#FF004D" transparent opacity={0.35} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
            <mesh><torusGeometry args={[1, 0.08, 12, 100]} /><meshBasicMaterial color="#3A0CA3" transparent opacity={0.7} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
          </group>
          {DISC_DATA.map((disc, i) => (
            <group key={i}>
              <FloatingDisc {...disc} isFocused={focusedIndex === i} onClick={(e) => { e.stopPropagation(); setFocusedIndex(i); }} />
              <group position={disc.position} name={`disc-${i}`}>
                <AnimatedBlock visible={focusedIndex === null || focusedIndex === i}>
                  {BLOCK_CONFIGS[i].render()}
                </AnimatedBlock>
              </group>
            </group>
          ))}
        </ParallaxRig>
      </group>
      <group position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshPhysicalMaterial color="#ff7575ff" metalness={0.25} roughness={0.35} emissive="#dfe3ecff" emissiveIntensity={0.85} />
      </group>
      <mesh position={[0, 30, -30]} receiveShadow><planeGeometry args={[60, 60]} /><meshStandardMaterial color="#d4d7e4ff" roughness={0.8} metalness={1} /></mesh>
      <mesh position={[-30, 30, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow><planeGeometry args={[60, 60]} /><meshStandardMaterial color="#d6dae8ff" roughness={0.8} metalness={0} /></mesh>
      <mesh position={[30, 30, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow><planeGeometry args={[60, 60]} /><meshStandardMaterial color="#050814" roughness={0.8} metalness={0} /></mesh>
    </>
  );
}

function DiscSidebar({ focusedIndex, setFocusedIndex }) {
  return (
    <AnimatePresence>
      {focusedIndex !== null && (
        <motion.div initial={{ x: "100%", opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: "100%", opacity: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="absolute right-0 top-0 h-screen w-full sm:w-[500px] bg-black/60 backdrop-blur-2xl border-l border-[#FF0080]/30 shadow-[-30px_0_80px_-20px_rgba(255,0,128,0.3)] z-50 flex flex-col pointer-events-auto">
          <button onClick={() => setFocusedIndex(null)} className="absolute top-8 right-8 p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-white border border-white/10">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
          <div className="flex-1 p-12 flex flex-col pt-28 overflow-y-auto">
            <div className="text-7xl mb-8 drop-shadow-[0_0_20px_rgba(255,0,128,0.6)]">{SECTIONS[focusedIndex].icon}</div>
            <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-[#FF0080] mb-3 tracking-tight">{SECTIONS[focusedIndex].name}</h2>
            <h3 className="text-2xl font-bold text-indigo-300 uppercase tracking-widest mb-10">{SECTIONS[focusedIndex].tagline}</h3>
            <div className="w-16 h-1.5 bg-gradient-to-r from-[#FF0080] to-indigo-500 rounded-full mb-10" />
            <p className="text-slate-300 text-xl leading-relaxed font-light">{SECTIONS[focusedIndex].description}</p>
            <div className="mt-auto pt-16">
              <button onClick={() => setFocusedIndex(null)} className="w-full py-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-[#FF0080] text-white text-lg font-bold tracking-widest uppercase hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,0,128,0.5)] transition-all duration-300 border border-white/20">Return to View</button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  const [focusedIndex, setFocusedIndex] = useState(null);
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <div className="absolute inset-0 z-[1]">
        <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 5, 15], fov: 55 }} gl={{ antialias: true, alpha: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}>
          <ScrollControls pages={2} damping={0.2} distance={1.5}>
            <Scene focusedIndex={focusedIndex} setFocusedIndex={setFocusedIndex} />
          </ScrollControls>
        </Canvas>
      </div>
      <div className="absolute inset-0 pointer-events-none z-[10] overflow-hidden">
        <DiscSidebar focusedIndex={focusedIndex} setFocusedIndex={setFocusedIndex} />
      </div>
    </div>
  );
}