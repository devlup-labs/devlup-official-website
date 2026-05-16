import { useState, useEffect, useContext } from "react";
import { ThemeContext } from "../App";
import CircuitTree from "./Timeline/circuitTree";
import RoadmapCard from "./Timeline/roadmapCard";
import CameraRig from "./Timeline/cameraRig";
import { getBranches } from "./Timeline/data";

export default function Timeline_Tree() {
  const { isDarkMode } = useContext(ThemeContext);

  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(true);

  const [activeCard, setActiveCard] = useState(null);
  const [cameraFocus, setCameraFocus] = useState(null);
  const [flippedCards, setFlippedCards] = useState({});
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  const handleFlip = (id, flipped) => {
    setFlippedCards((prev) => ({
      ...prev,
      [id]: flipped,
    }));
  };

  useEffect(() => {
    getBranches()
      .then((data) => {
        setBranches(data);
        setLoadingBranches(false);
      })
      .catch((err) => {
        console.error(err);
        setLoadingBranches(false);
      });
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

 if (loadingBranches) {
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-400 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-lg font-semibold text-white">
          
        </p>
      </div>
    </div>
  );
}

  const containerHeight = 400 + branches.length * 240;

  return (
    <div
      style={{
          minHeight: containerHeight,
          backgroundImage: isDarkMode ? "url('/bg_dark.jpeg')" : "url('/bg_light.jpeg')",
      }}
      className={`relative overflow-hidden ${isMobile ? "pt-40" : "pt-64"} transition-all duration-500 bg-cover bg-fixed bg-center`}
    >
      <CameraRig focus={cameraFocus} reset={!cameraFocus} />

      {/* HEADING */}
      <div className={`absolute ${isMobile ? "top-20 px-4" : "top-24"} w-full flex justify-center z-20 pointer-events-none`}>
        <div className="bg-[var(--bg-blog_card)] shadow-lg rounded-lg px-8 py-6 text-center max-w-2xl border border-gray-200">
          <h1
            className={`${isMobile ? "text-2xl" : "text-4xl md:text-6xl"} font-bold text-[var(--text-primary)]`}
          >
            Workflow Timeline
          </h1>
          <p className="mt-2 text-lg text-[var(--text-primary)]">
            Defining growth through enduring milestones
          </p>
        </div>
      </div>
 
      <div className="scene [filter:drop-shadow(0_40px_120px_rgba(56,189,248,0.25))] [transform-style:preserve-3d] origin-top relative">
        <CircuitTree activeCard={activeCard} flippedCards={flippedCards} branches={branches} isMobile={isMobile} />

        {branches.map((branch) => (
          <RoadmapCard
            key={branch.id}
            {...branch}
            isMobile={isMobile}
            isActive={activeCard === branch.id}
            onActivate={() => {
              setActiveCard(branch.id);
              setFlippedCards({ [branch.id]: true });
            }}
            onDeactivate={() => {
              setActiveCard(null);
              setFlippedCards({});
            }}
            onFlip={(flipped) => handleFlip(branch.id, flipped)}
          />
        ))}
      </div>
    </div>
  );
}
