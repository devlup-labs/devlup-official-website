import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html, PerspectiveCamera, Environment } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';

const HUDStyles = () => (
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
    // .holo-corner.tr { top: 16px; right: 16px; transform: rotate(90deg); }
    // .holo-corner.tl { top: 16px; left: 16px; }
    // .holo-corner.bl { bottom: 16px; left: 16px; transform: rotate(-90deg); }
    // .holo-corner.br { bottom: 16px; right: 16px; transform: rotate(180deg); }
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
      left: 50%;
      transform: translateX(-50%);
      z-index: 10;
    }

    .typewriter-title {
      font-size: 2.8rem;
      letter-spacing: 6px;
      font-weight: 800;
      text-transform: uppercase;
      color: rgba(223, 240, 255, 0.95);
      text-shadow: 0 0 24px rgba(147, 194, 255, 0.7);
      overflow: hidden;
      border-right: .15em solid transparent;
      white-space: nowrap;
      margin: 0 auto;
      animation: 
        typing 2.5s steps(40) forwards,
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
);

const ProfileCard = () => {
  return (
    <group>
      <Html transform distanceFactor={8} position={[0, 0, 0]} zIndexRange={[100, 0]}>
        <div className="holo-card-shell">
          <div className="holo-border-glow" />
          <div className="holo-corner tl" />
          <div className="holo-corner tr" />
          <div className="holo-corner bl" />
          <div className="holo-corner br" />

          <div className="typewriter justify-center">
            <h1 className="typewriter-title">About Us</h1>
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

export default function SciFiHUD() {
  const navigate = useNavigate();
  const [showWhiteout, setShowWhiteout] = useState(true);

  useEffect(() => {
    // Remove the old transition overlay left behind by the previous page
    const oldOverlay = document.querySelector('.page-transition-overlay');
    if (oldOverlay) {
      oldOverlay.remove();
    }
  }, []);

  return (
    <div className="w-screen h-screen bg-[#02050A]">
      {showWhiteout && <div className="whiteout-fade" onAnimationEnd={() => setShowWhiteout(false)} />}
      <HUDStyles />
      <button className="hud-back-button" onClick={() => navigate('/')}>
        Back
      </button>
      <Canvas
        dpr={[1, 1.2]}
        gl={{ antialias: false, powerPreference: "high-performance" }}
        performance={{ min: 0.35 }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 24]} fov={40} />
        <color attach="background" args={["#02050A"]} />
        
        <ambientLight intensity={1.5} />
        <spotLight position={[5, 10, 5]} angle={0.3} penumbra={1} intensity={10} color="#00E5FF" />
        <spotLight position={[-5, 5, -5]} angle={0.5} penumbra={1} intensity={8} color="#FF00A0" />
        <Environment preset="city" frames={1} />

        <fog attach="fog" args={['#02050A', 18, 80]} />

        <ProfileCard />
      </Canvas>
    </div>
  );
}
