import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useMemo } from "react";

export function UniformDisc() {
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
			<extrudeGeometry args={[shape, { depth: 0.05, bevelEnabled: false, curveSegments: 96 }]} />
			<meshStandardMaterial color="#1565C0" emissive="#0D47A1" emissiveIntensity={0.08} metalness={0} roughness={1} />
		</mesh>
	);
}

export default function Disc() {
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
