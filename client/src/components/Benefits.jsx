import React, { useEffect, useRef } from 'react';
import { TrendingUp, Brain, Network, Award, Clock, DollarSign } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Benefits = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const benefits = gsap.utils.toArray('.benefit-item');
    
    benefits.forEach((benefit, index) => {
      gsap.fromTo(
        benefit,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: benefit,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          },
          delay: index * 0.1
        }
      );
    });
  }, []);

  const benefits = [
    {
      icon: TrendingUp,
      title: 'Improve Interview Skills',
      description: 'Practice with real scenarios and get immediate feedback',
      color: 'text-blue-600'
    },
    {
      icon: Brain,
      title: 'Learn from Peers',
      description: 'Gain insights from diverse backgrounds and experiences',
      color: 'text-purple-600'
    },
    {
      icon: Network,
      title: 'Build Your Network',
      description: 'Connect with like-minded professionals in your field',
      color: 'text-green-600'
    },
    {
      icon: Award,
      title: 'Earn Recognition',
      description: 'Build your reputation through our rating system',
      color: 'text-orange-600'
    },
    {
      icon: Clock,
      title: 'Flexible Scheduling',
      description: 'Practice anytime with our global community',
      color: 'text-red-600'
    },
    {
      icon: DollarSign,
      title: 'Completely Free',
      description: 'No subscription fees - just our fair coin economy',
      color: 'text-indigo-600'
    }
  ];

  return (
    <section id="benefits" ref={sectionRef} className="py-20 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-100 mb-6">
            Why Choose{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              InterviewHub
            </span>
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Join thousands of professionals who are already improving their
            interview skills
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="benefit-item group">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 h-full hover:bg-slate-750 hover:shadow-xl hover:shadow-cyan-500/10 hover:border-cyan-600 transition-all duration-300">
                <div className="flex items-center mb-4">
                  <benefit.icon
                    className={`w-8 h-8 ${benefit.color} group-hover:scale-110 transition-transform duration-300`}
                  />
                </div>
                <h3 className="text-xl font-semibold text-slate-100 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-16 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-3xl p-8 md:p-12 text-center text-white shadow-xl shadow-cyan-500/30">
          <h3 className="text-3xl font-bold mb-4">
            Ready to Transform Your Interview Skills?
          </h3>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join our community of ambitious professionals and start practicing
            today. Your first 2 interviews are completely free!
          </p>
          <button className="bg-white text-cyan-600 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-white/50 transition-all duration-300 transform hover:scale-105">
            Start Your Journey
          </button>
        </div>
      </div>
    </section>
  );
};

export default Benefits;
