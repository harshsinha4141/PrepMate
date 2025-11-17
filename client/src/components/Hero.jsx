import React, { useEffect, useRef } from 'react';
import { Play, Star, Users, Coins } from 'lucide-react';
import { gsap } from 'gsap';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const heroRef = useRef(null);
  const coinsRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const tl = gsap.timeline();

    tl.fromTo(
      '.hero-title',
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
    )
      .fromTo(
        '.hero-subtitle',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
        '-=0.5'
      )
      .fromTo(
        '.hero-buttons',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
        '-=0.3'
      )
      .fromTo(
        '.hero-features',
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.7)' },
        '-=0.2'
      );

    // Floating animation for coins
    gsap.to('.floating-coin', {
      y: -10,
      duration: 2,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      stagger: 0.3,
    });
  }, []);

 return (
   <section
     ref={heroRef}
     className="pt-16 pb-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden relative"
   >
     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
       <div className="text-center max-w-4xl mx-auto">
         {/* Hero Content */}
         <h1 className="hero-title text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
           <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-500 bg-clip-text text-transparent">
             Master Interviews
           </span>
           <br />
           <span className="text-slate-100">Through Practice</span>
         </h1>

         <p className="hero-subtitle text-xl md:text-2xl text-slate-400 mb-8 leading-relaxed">
           Join the world's first peer-to-peer interview platform where you earn
           coins by helping others practice, and spend coins to improve your own
           skills.
         </p>

         {/* CTA Buttons */}
         <div className="hero-buttons flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
           <button onClick={() => navigate("/credentials")} className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/70 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 cursor-pointer">
             <Play className="w-5 h-5" />
             <span>Start Practicing</span>
           </button>
           <button className="border-2 border-slate-700 text-slate-300 px-8 py-4 rounded-xl font-semibold text-lg hover:border-cyan-500 hover:text-cyan-400 hover:bg-slate-800 transition-all duration-300 flex items-center space-x-2 cursor-pointer">
             <Users className="w-5 h-5" />
             <span>Learn More</span>
           </button>
         </div>

         {/* Key Features Cards */}
         <div className="hero-features grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
           <div className="bg-slate-800 border border-slate-700 backdrop-blur-sm rounded-2xl p-6 hover:shadow-lg hover:shadow-cyan-500/20 hover:border-cyan-600 transition-all duration-300 transform hover:-translate-y-1">
             <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 mx-auto shadow-lg shadow-cyan-500/50">
               <Coins className="w-6 h-6 text-white floating-coin" />
             </div>
             <h3 className="text-lg font-semibold text-slate-100 mb-2">
               Coin Economy
             </h3>
             <p className="text-slate-400">
               Earn coins by interviewing others, spend coins to practice your
               skills
             </p>
           </div>

           <div className="bg-slate-800 border border-slate-700 backdrop-blur-sm rounded-2xl p-6 hover:shadow-lg hover:shadow-purple-500/20 hover:border-purple-600 transition-all duration-300 transform hover:-translate-y-1">
             <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 mx-auto shadow-lg shadow-purple-500/50">
               <Users className="w-6 h-6 text-white floating-coin" />
             </div>
             <h3 className="text-lg font-semibold text-slate-100 mb-2">
               Smart Matching
             </h3>
             <p className="text-slate-400">
               Get matched with peers based on skills, experience, and timezone
             </p>
           </div>

           <div className="bg-slate-800 border border-slate-700 backdrop-blur-sm rounded-2xl p-6 hover:shadow-lg hover:shadow-emerald-500/20 hover:border-emerald-600 transition-all duration-300 transform hover:-translate-y-1">
             <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center mb-4 mx-auto shadow-lg shadow-emerald-500/50">
               <Star className="w-6 h-6 text-white floating-coin" />
             </div>
             <h3 className="text-lg font-semibold text-slate-100 mb-2">
               Quality Assured
             </h3>
             <p className="text-slate-400">
               Rating system ensures high-quality interviews and constructive
               feedback
             </p>
           </div>
         </div>
       </div>
     </div>

     {/* Background Elements */}
     <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
       <div className="absolute top-20 left-10 w-20 h-20 bg-cyan-500/10 rounded-full opacity-50 floating-coin"></div>
       <div className="absolute top-40 right-20 w-16 h-16 bg-purple-500/10 rounded-full opacity-50 floating-coin"></div>
       <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-emerald-500/10 rounded-full opacity-50 floating-coin"></div>
     </div>
   </section>
 );
};

export default Hero;
