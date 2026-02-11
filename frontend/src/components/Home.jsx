import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function App() {
  const leftRef = useRef(null);
  const rightRef = useRef(null);

useEffect(() => {
  const tl = gsap.timeline();

  tl.fromTo(
    leftRef.current,
    {
      xPercent: -100,   // completely off-screen left
      opacity: 0,
    },
    {
      xPercent: 0,
      opacity: 1,
      duration: 1.2,
      ease: "power3.out",
    }
  )
  .fromTo(
    rightRef.current,
    {
      xPercent: 100,   // completely off-screen right
      opacity: 0,
    },
    {
      xPercent: 0,
      opacity: 1,
      duration: 1.2,
      ease: "power3.out",
    },
    "-=0.1"
  );
}, []);


  return (
    <div className="relative h-screen w-full bg-[url('/construction.jpg')] bg-cover bg-center">
      
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Content */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-8 flex items-center">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full">
          
          {/* LEFT SIDE */}
          <div
            ref={leftRef}
            className="text-white flex flex-col justify-center"
          >
            <div className="flex items-start gap-4">
              <div className="w-1 bg-yellow-500 h-32 mt-2" />
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                About Our <br /> Devlup Labs
              </h1>
            </div>

            <p className="mt-6 text-gray-300 max-w-lg">
              DevlUp Labs is a thriving student-led open source community at IIT Jodhpur.
              We believe in sharing of ideas and upskilling by collaboration through meaningful projects.
              Our focus is to deliver results with the highest of standards.
              We aim to build an open source community through proper guidance and by encouraging self learning.
              We encourage development of technology and Innovation through various sessions, workshops and webinars.
            </p>
          </div>

          {/* RIGHT SIDE */}
          <div
            ref={rightRef}
            className="text-white flex flex-col justify-center"
          >
            <h3 className="text-yellow-500 text-xl font-semibold mb-8">
              Guiding Principles
            </h3>

            <div className="space-y-8">
              
              <div className="flex gap-5">
                <div className="text-yellow-500 text-4xl">👥</div>
                <div>
                  <h4 className="font-semibold text-lg">Open Source Community</h4>
                  <p className="text-gray-400 text-sm">
                    An open and collaborative environment where learning,
                    contribution, and innovation go hand in hand.
                  </p>
                </div>
              </div>

              <div className="flex gap-5">
                <div className="text-yellow-500 text-4xl">🧠</div>
                <div>
                  <h4 className="font-semibold text-lg">Learning Driven Endeavour</h4>
                  <p className="text-gray-400 text-sm">
                    Everything we do is rooted in learning.
                    Growth comes before outcomes—every project is an opportunity to evolve together.
                  </p>
                </div>
              </div>

              <div className="flex gap-5">
                <div className="text-yellow-500 text-4xl">✨</div>
                <div>
                  <h4 className="font-semibold text-lg">Unparalleled Standards</h4>
                  <p className="text-gray-400 text-sm">
                    We maintain the highest standards in all our projects and initiatives.
                    Every contribution is carefully reviewed and refined to ensure excellence.
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
