import React, { useState, useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

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

const Loader = ({ onComplete }) => {
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

    const completeTimer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 7600);

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
      className={`fixed inset-0 z-50 flex items-center justify-center cursor-text transition-opacity duration-1000 loader-bg-bluish-red ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
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
                <span className={`loader-path-dot ${morphPath && text === './' ? 'loader-dot-orbit' : ''}`}>·</span>
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

export default Loader;
