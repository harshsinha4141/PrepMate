import React, { useEffect, useRef } from 'react';
import { Users, Clock, Star, Zap } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Stats = () => {
  const sectionRef = useRef(null);
  const statsRef = useRef(null);

  useEffect(() => {
    // Animate numbers counting up
    const stats = gsap.utils.toArray('.stat-number');

    stats.forEach((stat) => {
      const element = stat;
      const target = parseInt(element.dataset.target || '0');

      gsap.fromTo(
        element,
        { textContent: 0 },
        {
          textContent: target,
          duration: 2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
          snap: { textContent: 1 },
          onUpdate: function () {
            element.textContent = Math.ceil(element.textContent);
          },
        }
      );
    });

    // Animate stat cards
    const cards = gsap.utils.toArray('.stat-card');

    cards.forEach((card, index) => {
      gsap.fromTo(
        card,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
          delay: index * 0.1,
        }
      );
    });
  }, []);

  const stats = [
    {
      icon: Users,
      number: 5420,
      label: 'Active Users',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: Clock,
      number: 12500,
      label: 'Interviews Completed',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: Star,
      number: 98,
      label: 'Satisfaction Rate',
      suffix: '%',
      color: 'from-green-500 to-green-600',
    },
    {
      icon: Zap,
      number: 45,
      label: 'Avg. Match Time',
      suffix: 's',
      color: 'from-orange-500 to-orange-600',
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Trusted by{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Thousands
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Join a growing community of professionals who are advancing their
            careers
          </p>
        </div>

        {/* Stats */}
        <div ref={statsRef} className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg`}
                >
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl font-bold mb-2">
                  <span className="stat-number" data-target={stat.number}>
                    0
                  </span>
                  {stat.suffix && <span>{stat.suffix}</span>}
                </div>
                <p className="text-gray-300 font-medium">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="mt-20">
          <h3 className="text-3xl font-bold text-center mb-12">
            What Our Users Say
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Chen',
                role: 'Software Engineer',
                text: 'InterviewHub helped me land my dream job at Google. The practice sessions were incredibly realistic!',
                rating: 5,
              },
              {
                name: 'Mike Rodriguez',
                role: 'Product Manager',
                text: 'The coin system is genius! I love helping others while earning coins for my own practice sessions.',
                rating: 5,
              },
              {
                name: 'Emily Johnson',
                role: 'Data Scientist',
                text: 'The quality of interviewers is amazing. I got detailed feedback that really improved my performance.',
                rating: 5,
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-200 mb-4 leading-relaxed">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mr-3"></div>
                  <div>
                    <p className="font-semibold text-white">
                      {testimonial.name}
                    </p>
                    <p className="text-gray-400 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stats;
