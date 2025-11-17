import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const AuthContainer = () => {
  const [isLogin, setIsLogin] = useState(true);
  const leftPanelRef = useRef(null);
  const rightPanelRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(leftPanelRef.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.5 })
      .fromTo(rightPanelRef.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.8, ease: 'back.out(1.7)' }, "-=0.3");
  }, []);

  const toggleMode = () => setIsLogin(!isLogin);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-slate-800 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex min-h-[600px]">
        {/* Left Panel */}
        <div ref={leftPanelRef} className="flex-1 p-8 lg:p-12">
          {isLogin ? (
            <LoginForm toggleMode={toggleMode} />
          ) : (
            <RegisterForm toggleMode={toggleMode} />
          )}
        </div>
        {/* Right Panel */}
        <div
          ref={rightPanelRef}
          className="hidden lg:flex flex-1 bg-gradient-to-br from-cyan-600 to-blue-600 items-center justify-center p-12 relative overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
          </div>
          {/* Content */}
          <div className="text-center text-white z-10">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full mb-6 shadow-lg shadow-cyan-500/50">
                {/* Optional icon */}
              </div>
              <h2 className="text-3xl font-bold mb-4">
                {isLogin ? "Welcome Back!" : "Join PrepMate"}
              </h2>
              <p className="text-xl text-white/90 mb-8">
                {isLogin
                  ? "Continue your interview journey"
                  : "Start practicing interviews worldwide"}
              </p>
            </div>
            {/* Feature highlights */}
            <div className="space-y-4">
              <div className="flex items-center text-white/90">
                <div className="w-2 h-2 bg-white rounded-full mr-3 shadow-lg shadow-white/50"></div>
                <span>Practice with real interview questions</span>
              </div>
              <div className="flex items-center text-white/90">
                <div className="w-2 h-2 bg-white rounded-full mr-3 shadow-lg shadow-white/50"></div>
                <span>Get feedback from experienced peers</span>
              </div>
              <div className="flex items-center text-white/90">
                <div className="w-2 h-2 bg-white rounded-full mr-3 shadow-lg shadow-white/50"></div>
                <span>Earn coins by helping others</span>
              </div>
            </div>
          </div>
          {/* Floating elements */}
          <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full animate-pulse shadow-lg shadow-cyan-500/30"></div>
          <div
            className="absolute bottom-32 right-16 w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full animate-pulse shadow-lg shadow-cyan-500/30"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute top-1/2 left-8 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full animate-pulse shadow-lg shadow-cyan-500/30"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default AuthContainer;
