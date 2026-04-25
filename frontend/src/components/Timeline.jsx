import { useState, useEffect, useContext } from "react";
import { ThemeContext } from "../App";
import CircuitTree from "./Timeline/circuitTree";
import RoadmapCard from "./Timeline/roadmapCard";
import CameraRig from "./Timeline/cameraRig";
import { getBranches } from "./Timeline/data";

export default function Timeline() {
  const { isDarkMode } = useContext(ThemeContext);

  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(true);

  const [activeCard, setActiveCard] = useState(null);
  const [cameraFocus, setCameraFocus] = useState(null);
  const [flippedCards, setFlippedCards] = useState({});

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
        backgroundImage: isDarkMode
          ? "url('/bgweb4.jpeg')"
          : "url('/bgweb3.jpeg')",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
        backgroundPosition: "center",
      }}
      className="relative overflow-hidden pt-64 transition-all duration-500"
    >
      <CameraRig focus={cameraFocus} reset={!cameraFocus} />

      {/* HEADING */}
      <div className="absolute top-24 w-full flex justify-center z-20 pointer-events-none">
        <div className="bg-[var(--bg-blog_card)] shadow-lg rounded-lg px-8 py-6 text-center max-w-2xl border border-gray-200">
          <h1 className="text-4xl md:text-6xl font-bold text-[var(--text-primary)]">
            Timeline
          </h1>
          <p className="mt-2 text-lg text-[var(--text-primary)]">
            Defining growth through enduring milestones
          </p>
        </div>
      </div>

      <div className="scene [filter:drop-shadow(0_40px_120px_rgba(56,189,248,0.25))] [transform-style:preserve-3d] origin-top relative">
        <CircuitTree activeCard={activeCard} flippedCards={flippedCards}  branches={branches}  />

        {branches.map((branch) => (
          <RoadmapCard
            key={branch.id}
            {...branch}
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


// the old-code

// import { useEffect, useRef } from "react";
// import gsap from "gsap";
// import ScrollTrigger from "gsap/ScrollTrigger";

// gsap.registerPlugin(ScrollTrigger);

// export default function Timeline() {
//   const containerRef = useRef(null);
//   const lineRef = useRef(null);



//   const data = [
//     {
//       title: "What is Timeline Text?",
//       text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
//       time: "11 April 2024 12:30 PM",
//     },
//     {
//       title: "What is Timeline Text?",
//       text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
//       time: "11 April 2024 12:30 PM",
//     },
//     {
//       title: "What is Timeline Text?",
//       text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
//       time: "11 April 2024 12:30 PM",
//     },
//     {
//       title: "What is Timeline Text?",
//       text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
//       time: "11 April 2024 12:30 PM",
//     },
//     {
//       title: "What is Timeline Text?",
//       text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
//       time: "11 April 2024 12:30 PM",
//     },
//     {
//       title: "What is Timeline Text?",
//       text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
//       time: "11 April 2024 12:30 PM",
//     },{
//       title: "What is Timeline Text?",
//       text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
//       time: "11 April 2024 12:30 PM",
//     },{
//       title: "What is Timeline Text?",
//       text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
//       time: "11 April 2024 12:30 PM",
//     },{
//       title: "What is Timeline Text?",
//       text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
//       time: "11 April 2024 12:30 PM",
//     },{
//       title: "What is Timeline Text?",
//       text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
//       time: "11 April 2024 12:30 PM",
//     },{
//       title: "What is Timeline Text?",
//       text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
//       time: "11 April 2024 12:30 PM",
//     },{
//       title: "What is Timeline Text?",
//       text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
//       time: "11 April 2024 12:30 PM",
//     },{
//       title: "What is Timeline Text?",
//       text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
//       time: "11 April 2024 12:30 PM",
//     },{
//       title: "What is Timeline Text?",
//       text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
//       time: "11 April 2024 12:30 PM",
//      },{
//       title: "What is Timeline Text?",
//       text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
//       time: "11 April 2024 12:30 PM",
//     },
//   ];

//   useEffect(() => {
//   const ctx = gsap.context(() => {

//     //  CENTER LINE (draws first)
//     gsap.fromTo(
//       lineRef.current,
//       {
//         scaleY: 0,
//         transformOrigin: "top",
//       },
//       {
//         scaleY: 1,
//         ease: "none",
//         scrollTrigger: {
//           trigger: lineRef.current,
//           start: "top 70%",
//           end: "bottom 20%",
//           scrub: true, //  scroll controls drawing
//         },
//   }, lineRef);

//     //  CARD SLIDE-IN (one time)
//    gsap.utils.toArray(".timeline-item").forEach((item, index) => {
//   const fromX = index % 2 === 0 ? -80 : 80;

//   gsap.from(item.querySelector(".timeline-card"), {
//     scrollTrigger: {
//       trigger: item,
//       start: "top 50%",
//       once: true,
//     },
//     opacity: 0,
//     x: fromX,
//     duration: 1,              // ⬅ slightly longer
//     ease: "power1.out",
//   });
// });

//     // BRANCH SVG DRAW (center → curve → card)
//     gsap.utils.toArray(".branch-path").forEach((path) => {
//       const length = path.getTotalLength();

//       gsap.fromTo(
//         path,
//         {
//           strokeDasharray: length,
//           strokeDashoffset: length,
//         },
//         {
//           strokeDashoffset: 0,
//           ease: "power1.out",
//           scrollTrigger: {
//             trigger: path.closest(".timeline-item"),
//             start: "top 70%",
//             end: "top 45%",
//             scrub: true,
//             // onLeave: (self) => self.kill(), //  one-time
//           },
//         }
//       );
//     });

//   }, containerRef);

//   return () => ctx.revert();
// }, []);


//  return (
//   <div ref={containerRef} className="min-h-screen bg-[#F8F4FF] py-20">
//     <h1 className="text-4xl font-bold text-center text-teal-600 mb-20">
//       Timeline
//     </h1>

//     <div className="relative max-w-6xl mx-auto">
//       {/* CENTER LINE */}
//       <div
//         ref={lineRef}
//         className="absolute left-1/2 top-0 h-full w-[20px] bg-[#F8F4FF] -translate-x-1/2 origin-top"
//       />

//       {data.map((item, index) => {
//         const isLeft = index % 2 === 0;
//         const isFirst = index === 0;

//         return (
//           <div
//             key={index}
//             className={`timeline-item relative mb-20 flex ${
//               isLeft ? "justify-start pr-12" : "justify-end pl-12"
//             }`}
//           >
            
//             {/*  BRANCH SVG (center → vertical → curve → card) */}
//           {isFirst ?(
//             <svg
//               className={`absolute top-6 ${
//                 isLeft ? "right-1/2 -translate-y-6" : "left-1/2 -translate-y-44 -translate-x-1"
//               }`}
//               width="140"
//               height="500"
//               viewBox="0 0 140 600"
//               fill="none"
//             >
//               <path
//                 className="branch-path"
//                 d={
//                   isLeft
//                     ? "M 152 0 V 200 Q 140 250 80 250 H60"
//                     : "M -11 0 V 300 Q 0 350 80 350 H 85"
//                 }
//                 stroke="#14b8a6"
//                 strokeWidth="3"
//                 fill="none"
//               />
//             </svg>
//           ) : (
//             <svg
//               className={`absolute top-6 ${
//                 isLeft ? "right-1/2 -translate-y-[76%]" : "left-1/2 -translate-y-[75%] -translate-x-1"
//               }`}
//               width="140"
//               height="500"
//               viewBox="0 0 140 600"
//               fill="none"
//             >
//               <path
//                 className="branch-path"
//                 d={
//                   isLeft
//                     ? "M 152 0 V 450 Q 140 500 80 500 H60"
//                     : "M -11 0 V 450 Q 0 500 80 500 H 85"
//                 }
//                 stroke="#14b8a6"
//                 strokeWidth="3"
//                 fill="none"
//               />
//             </svg>
//           )}
//             {/*  CARD */}
//             <div className="timeline-card w-[45%] bg-[#DDD6E1] rounded-xl shadow-lg p-10 hover:-translate-y-3 hover:shadow-3xl transition-all duration-300">
//               <h3 className="text-xl font-semibold text-teal-600 mb-2">
//                 {item.title}
//               </h3>

//               <p className="text-gray-600 mb-4">
//                 {item.text}
//               </p>

//               <span className="inline-block bg-teal-500 text-white text-sm px-6 py-2 rounded-full shadow-md">
//                 {item.time}
//               </span>
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   </div>
// );
// }
