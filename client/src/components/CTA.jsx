import React, { useEffect, useRef } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const CTA = () => {
  const ctaRef = useRef(null);

  useEffect(() => {
    gsap.fromTo('.cta-content',
      { opacity: 0, scale: 0.9 },
      {
        opacity: 1,
        scale: 1,
        duration: 1,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: '.cta-content',
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      }
    );

    gsap.to('.sparkle', {
      y: -20,
      rotation: 360,
      duration: 3,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      stagger: 0.5
    });
  }, []);

 return (
   <section
     ref={ctaRef}
     className="py-20 bg-gradient-to-br from-cyan-600 via-blue-600 to-slate-800 relative overflow-hidden"
   >
     <div className="absolute inset-0">
       <div className="absolute top-10 left-10 sparkle">
         <Sparkles className="w-6 h-6 text-white/30" />
       </div>
       <div className="absolute top-20 right-20 sparkle">
         <Sparkles className="w-8 h-8 text-white/20" />
       </div>
       <div className="absolute bottom-20 left-1/4 sparkle">
         <Sparkles className="w-5 h-5 text-white/25" />
       </div>
       <div className="absolute bottom-10 right-1/3 sparkle">
         <Sparkles className="w-7 h-7 text-white/20" />
       </div>
     </div>
     <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
       <div className="cta-content">
         <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
           Ready to Ace Your Next Interview?
         </h2>
         <p className="text-xl md:text-2xl text-cyan-100 mb-12 leading-relaxed">
           Join thousands of professionals who are already mastering their
           interview skills. Get started with free coins and begin your journey
           today!
         </p>
         <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
           <button className="bg-white text-cyan-600 px-10 py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-white/50 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 group">
             <span>Start Free Practice</span>
             <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
           </button>
           <button className="border-2 border-white text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-cyan-600 transition-all duration-300">
             Learn More
           </button>
         </div>
         <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 max-w-md mx-auto shadow-lg shadow-cyan-500/20">
           <h3 className="text-lg font-semibold text-white mb-2">
             🎉 Launch Special
           </h3>
           <p className="text-cyan-100">
             Get <strong className="text-white">50 FREE COINS</strong> when you
             sign up in the first week!
           </p>
         </div>
       </div>
     </div>
   </section>
 );
};

export default CTA;
