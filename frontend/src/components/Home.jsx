import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function App() {
  const leftRef = useRef(null);
  const rightRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline();

    tl.fromTo(
      leftRef.current,
      { xPercent: -100, opacity: 0 },
      { xPercent: 0, opacity: 1, duration: 1.2, ease: "power3.out" }
    )
    .fromTo(
      rightRef.current,
      { xPercent: 100, opacity: 0 },
      { xPercent: 0, opacity: 1, duration: 1.2, ease: "power3.out" },
      "-=0.1"
    );
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      
      {/* Background Image */}
      <div className="absolute inset-0 bg-[url('/construction.jpg')] bg-cover bg-center" />

      {/* THEME OVERLAY (IMPORTANT) */}
      <div className="absolute inset-0  [background-image:var(--bg-main-gradient)] bg-[var(--bg-fallback)] " />

      {/* Subtle blur layer */}
      <div className="absolute inset-0 backdrop-blur-[2px]" />

      {/* CONTENT */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-8 flex items-center text-[var(--text-primary)]">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full">
          
          {/* LEFT */}
          <div ref={leftRef} className="flex flex-col justify-center">
            
            <div className="flex items-start gap-4">
              
              {/* Accent line */}
              <div 
                className="w-1 h-32 mt-2 rounded-full"
                style={{ background: "var(--gradient-primary)" }}
              />

              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                About Our <br /> Devlup Labs
              </h1>
            </div>

            <p className="mt-6 text-[var(--text-secondary)] max-w-lg leading-relaxed">
              DevlUp Labs is a thriving student-led open source community at IIT Jodhpur.
              We believe in sharing ideas and upskilling through collaboration on meaningful projects.
              Our focus is to deliver results with the highest standards while encouraging self-learning,
              innovation, and technological growth through sessions, workshops, and webinars.
            </p>
          </div>

          {/* RIGHT */}
          <div ref={rightRef} className="flex flex-col justify-center">
            
            <h3 
              className="text-xl font-semibold mb-8"
              style={{ background: "var(--gradient-primary)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
            >
              Guiding Principles
            </h3>

            <div className="space-y-8">
              
              {/* ITEM */}
              {[
                {
                  icon: "👥",
                  title: "Open Source Community",
                  desc: "An open and collaborative environment where learning, contribution, and innovation go hand in hand."
                },
                {
                  icon: "🧠",
                  title: "Learning Driven Endeavour",
                  desc: "Everything we do is rooted in learning. Growth comes before outcomes—every project is an opportunity to evolve together."
                },
                {
                  icon: "✨",
                  title: "Unparalleled Standards",
                  desc: "We maintain the highest standards in all our projects and initiatives. Every contribution is carefully reviewed and refined."
                }
              ].map((item, i) => (
                <div key={i} className="flex gap-5 group">
                  
                  {/* ICON */}
                  <div className="text-4xl transition-transform duration-300 group-hover:scale-110">
                    {item.icon}
                  </div>

                  {/* TEXT */}
                  <div>
                    <h4 className="font-semibold text-lg">
                      {item.title}
                    </h4>

                    <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}