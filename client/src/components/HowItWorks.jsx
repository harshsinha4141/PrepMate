import React, { useEffect, useRef } from 'react';
import { ArrowRight, UserPlus, Coins, Users, Star } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const HowItWorks = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const steps = gsap.utils.toArray('.step-card');
    const arrows = gsap.utils.toArray('.step-arrow');

    steps.forEach((step, index) => {
      gsap.fromTo(
        step,
        { opacity: 0, x: index % 2 === 0 ? -50 : 50 },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: step,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
          delay: index * 0.2,
        }
      );
    });

    arrows.forEach((arrow, index) => {
      gsap.fromTo(
        arrow,
        { opacity: 0, scale: 0 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: arrow,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
          delay: (index + 1) * 0.3,
        }
      );
    });
  }, []);

  const steps = [
    {
      icon: UserPlus,
      title: "Sign Up & Get Free Coins",
      description:
        "Create your account and receive free coins to start your interview journey",
      color: "from-cyan-500 to-blue-600",
    },
    {
      icon: Users,
      title: "Choose Your Role",
      description:
        "Decide whether to be an interviewer (earn coins) or interviewee (spend coins)",
      color: "from-purple-500 to-blue-600",
    },
    {
      icon: Coins,
      title: "Smart Matching",
      description:
        "Get matched with peers based on your skills, experience level, and availability",
      color: "from-emerald-500 to-green-600",
    },
    {
      icon: Star,
      title: "Practice & Improve",
      description:
        "Conduct or participate in interviews, give feedback, and earn ratings",
      color: "from-orange-500 to-red-600",
    },
  ];

  return (
    <section id="how-it-works" ref={sectionRef} className="py-20 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-100 mb-6">
            How It{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Our innovative peer-to-peer system creates a balanced ecosystem
            where everyone benefits
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="step-card bg-slate-800 rounded-2xl p-8 border-2 border-slate-700 hover:border-cyan-600 hover:shadow-xl hover:shadow-cyan-500/20 transition-all duration-300 text-center">
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg`}
                  >
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-cyan-500/50">
                    {index + 1}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-100 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Arrow between steps */}
                {index < steps.length - 1 && (
                  <div className="step-arrow hidden lg:block absolute top-1/2 -right-6 transform -translate-y-1/2">
                    <ArrowRight className="w-6 h-6 text-cyan-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Coin Economy Explanation */}
        <div className="mt-20 bg-gradient-to-r from-slate-800 to-slate-800 border border-slate-700 rounded-3xl p-8 md:p-12 shadow-xl">
          <div className="text-center">
            <h3 className="text-3xl font-bold text-slate-100 mb-6">
              The Coin Economy Explained
            </h3>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-lg hover:border-emerald-600 transition-all">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center mb-4 mx-auto shadow-lg shadow-emerald-500/50">
                  <Coins className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-xl font-semibold text-slate-100 mb-3">
                  As an Interviewer
                </h4>
                <p className="text-slate-400">
                  <strong className="text-emerald-400">Earn 10 coins</strong>{" "}
                  for each interview you conduct. Help others improve while
                  building your own interviewing and mentoring skills.
                </p>
              </div>
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-lg hover:border-cyan-600 transition-all">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 mx-auto shadow-lg shadow-cyan-500/50">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-xl font-semibold text-slate-100 mb-3">
                  As an Interviewee
                </h4>
                <p className="text-slate-400">
                  <strong className="text-cyan-400">Spend 10 coins</strong> per
                  interview session. Get personalized feedback and practice with
                  real interview scenarios.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
