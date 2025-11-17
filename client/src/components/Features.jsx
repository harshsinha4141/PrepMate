import React, { useEffect, useRef } from 'react';
import { Video, Code, Clock, Shield, Trophy, Zap } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Features = () => {
  const featuresRef = useRef(null);

  useEffect(() => {
    const features = gsap.utils.toArray('.feature-card');
    
    features.forEach((feature, index) => {
      gsap.fromTo(feature,
        { opacity: 0, y: 50, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: feature,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          },
          delay: index * 0.1
        }
      );
    });
  }, []);

  const features = [
    {
      icon: Video,
      title: "Video/Audio Calls",
      description:
        "High-quality WebRTC integration for seamless interview experiences",
      color: "from-cyan-500 to-blue-600",
    },
    {
      icon: Code,
      title: "Live Code Editor",
      description:
        "Monaco code editor for real-time collaborative coding sessions",
      color: "from-purple-500 to-blue-600",
    },
    {
      icon: Clock,
      title: "Timed Sessions",
      description:
        "Built-in timer and structured interview formats for realistic practice",
      color: "from-emerald-500 to-green-600",
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "JWT authentication and secure user data protection",
      color: "from-orange-500 to-red-600",
    },
    {
      icon: Trophy,
      title: "Rating System",
      description:
        "Comprehensive feedback and rating system for continuous improvement",
      color: "from-yellow-500 to-orange-600",
    },
    {
      icon: Zap,
      title: "Real-time Matching",
      description:
        "WebSocket-powered instant matching with compatible interview partners",
      color: "from-cyan-500 to-purple-600",
    },
  ];

  return (
    <section id="features" ref={featuresRef} className="py-20 bg-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-100 mb-6">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Excel
            </span>
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Our platform provides all the tools and features you need for
            effective interview practice
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="feature-card bg-slate-900 rounded-2xl p-8 border border-slate-700 hover:shadow-2xl hover:shadow-cyan-500/20 hover:border-cyan-600 transition-all duration-300 transform hover:-translate-y-2 group"
            >
              <div
                className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
              >
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-100 mb-3">
                {feature.title}
              </h3>
              <p className="text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
