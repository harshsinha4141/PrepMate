import React, { useState } from "react";
import {
  Users,
  Coins,
  Video,
  Code,
  Star,
  Clock,
  Target,
  Trophy,
  ArrowRight,
  Play,
  CheckCircle,
  BookOpen,
  Zap,
  Shield,
  MessageCircle,
} from "lucide-react";
import symbol from "../assets/symbol.png";
import Navbar from "./Navbar";
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUserStats } from "../context/UserStatsContext";
import Lottie from "lottie-react";
import Money from "../assets/Money.json";
import coinSound from "../assets/coinSound.wav";
import CoinRain from "./CoinRain";
export default function PrepMateHome() {
  const [selectedRole, setSelectedRole] = useState("interviewee");
  const { userStats, loading, refresh } = useUserStats();
  const location = useLocation();
  const [showReward, setShowReward] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    if (location.state?.showReward) {
      setShowReward(true);

      const audio = new Audio(coinSound);
      audio.volume = 0.9;
      audio.play();

      // total display duration for the reward overlay (ms)
      const displayDuration = 5000; // 5 seconds
      const fadeOutDuration = 700; // fade duration

      // start fading audio shortly before the overlay ends
      const fadeAudioTimer = setTimeout(() => {
        const fadeInterval = setInterval(() => {
          if (audio.volume > 0.05) {
            audio.volume = Math.max(0, audio.volume - 0.05);
          } else {
            clearInterval(fadeInterval);
            audio.pause();
            audio.currentTime = 0;
          }
        }, 50);
      }, Math.max(0, displayDuration - fadeOutDuration));

      // when displayDuration elapses, trigger fade-out UI and then hide
      const hideTimer = setTimeout(() => {
        setFadeOut(true);
        // remove overlay after fade completes
        const afterFade = setTimeout(
          () => setShowReward(false),
          fadeOutDuration
        );
        // ensure afterFade is cleared on cleanup
        // store reference on closure by returning cleanup below
      }, displayDuration);

      // 👉 IMPORTANT PART: remove the state so it never repeats
      navigate(location.pathname, { replace: true, state: {} });

      return () => {
        clearTimeout(fadeAudioTimer);
        clearTimeout(hideTimer);
        audio.pause();
        audio.currentTime = 0;
      };
    }
  }, [location.state, navigate, location.pathname]);

  const handleClick = () => {
    if (selectedRole === "interviewee") {
      navigate("/interviewee");
    } else {
      navigate("/interviewer");
    }
  };
  const features = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Smart Matching",
      description:
        "Get paired with the right interviewer based on skills, experience, and timezone",
    },
    {
      icon: <Video className="w-8 h-8" />,
      title: "Live Video Sessions",
      description:
        "Real-time video/audio calls with integrated coding environment",
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: "Live Code Editor",
      description:
        "Practice coding problems in real-time with syntax highlighting",
    },
    {
      icon: <Coins className="w-8 h-8" />,
      title: "Fair Coin System",
      description:
        "Earn coins by interviewing others, spend to get interviewed",
    },
  ];

  const skillTags = [
    "JavaScript",
    "React",
    "Node.js",
    "Python",
    "Java",
    "DSA",
    "System Design",
    "MongoDB",
    "SQL",
    "AWS",
    "Machine Learning",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {showReward && (
        <>
          <CoinRain />
          <div
            className={`fixed inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm z-[9998] transition-opacity ${
              fadeOut ? "fade-out" : ""
            }`}
          >
            <div className="relative flex flex-col items-center justify-center">
              {/* 🪙 Center Lottie Animation */}
              <Lottie
                animationData={Money}
                loop={false}
                autoplay
                style={{ width: 250, height: 250 }}
              />

              {/* ✨ Center Text Below Animation */}
              <p
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
             text-yellow-300 text-4xl font-extrabold glow-pulse"
                style={{
                  marginTop: "180px",
                }}
              >
                +50 Coins Added!
              </p>
            </div>
          </div>
        </>
      )}

      <Navbar />

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-slate-100 mb-6">
              Master Your Interview Skills with
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                {" "}
                Peers
              </span>
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-8">
              Practice interviews in a peer-to-peer environment. Interview
              others to earn coins, spend coins to get interviewed. Fair,
              engaging, and effective.
            </p>

            {/* Role Selection */}
            <div className="flex justify-center mb-8">
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-2 shadow-lg">
                <div className="flex space-x-1">
                  <button
                    onClick={() => setSelectedRole("interviewee")}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                      selectedRole === "interviewee"
                        ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/50"
                        : "text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                    }`}
                  >
                    Get Interviewed
                  </button>
                  <button
                    onClick={() => setSelectedRole("interviewer")}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                      selectedRole === "interviewer"
                        ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/50"
                        : "text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                    }`}
                  >
                    Conduct Interview
                  </button>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={handleClick}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/70 transform hover:scale-105 transition-all duration-200 flex items-center space-x-2 mx-auto"
            >
              <Play className="w-5 h-5" />
              <span>
                Start{" "}
                {selectedRole === "interviewee" ? "Practice" : "Interviewing"}{" "}
                Now
              </span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-col md:flex-row md:items-stretch md:space-x-6 space-y-6 md:space-y-0 mb-16">
            <div className="md:flex-1 bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg hover:shadow-xl hover:border-cyan-600 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-cyan-400">
                    {userStats?.interviewsTaken}
                  </p>
                  <p className="text-slate-400">As Interviewer</p>
                </div>
                <div className="bg-cyan-900/30 border border-cyan-700/50 p-3 rounded-lg">
                  <MessageCircle className="w-10 h-10 text-cyan-400" />
                </div>
              </div>
            </div>

            <div className="md:flex-1 bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg hover:shadow-xl hover:border-cyan-600 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-cyan-400">
                    {userStats?.coins}
                  </p>
                  <p className="text-slate-400">Available Coins</p>
                </div>
                <div className="bg-cyan-900/30 border border-cyan-700/50 p-3 rounded-lg">
                  <Coins className="w-10 h-10 text-cyan-400" />
                </div>
              </div>
            </div>

            <div className="md:flex-1 bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg hover:shadow-xl hover:border-emerald-600 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-emerald-400">
                    {userStats?.interviewsGiven ?? 0}
                  </p>
                  <p className="text-slate-400">As Interviewee</p>
                </div>
                <div className="bg-emerald-900/30 border border-emerald-700/50 p-3 rounded-lg">
                  <Trophy className="w-10 h-10 text-emerald-400" />
                </div>
              </div>
            </div>

            <div className="md:flex-1 bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg hover:shadow-xl hover:border-orange-600 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-orange-400">
                    {userStats?.averageRating ?? 0}
                  </p>
                  <p className="text-slate-400">Rating</p>
                </div>
                <div className="bg-orange-900/30 border border-orange-700/50 p-3 rounded-lg">
                  <Star className="w-10 h-10 text-orange-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-slate-100 mb-4">
              Everything You Need for Interview Success
            </h3>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Our platform provides all the tools and features you need to
              practice and improve your interview skills
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center hover:shadow-lg hover:border-cyan-600 transition-all"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl mb-4 shadow-lg shadow-cyan-500/50">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-semibold text-slate-100 mb-3">
                  {feature.title}
                </h4>
                <p className="text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-slate-100 mb-4">
              How PrepMate Works
            </h3>
            <p className="text-lg text-slate-400">
              Simple steps to start your interview practice journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-full text-2xl font-bold mb-6 shadow-lg shadow-cyan-500/50">
                1
              </div>
              <h4 className="text-xl font-semibold text-slate-100 mb-3">
                Choose Your Role
              </h4>
              <p className="text-slate-400">
                Select whether you want to be interviewed or conduct an
                interview
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full text-2xl font-bold mb-6 shadow-lg shadow-purple-500/50">
                2
              </div>
              <h4 className="text-xl font-semibold text-slate-100 mb-3">
                Get Matched
              </h4>
              <p className="text-slate-400">
                Our smart algorithm pairs you with the perfect interview partner
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-full text-2xl font-bold mb-6 shadow-lg shadow-emerald-500/50">
                3
              </div>
              <h4 className="text-xl font-semibold text-slate-100 mb-3">
                Start Practicing
              </h4>
              <p className="text-slate-400">
                Join the video call and begin your interactive interview session
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-slate-100 mb-4">
              Practice Any Skill
            </h3>
            <p className="text-lg text-slate-400">
              Choose from a wide range of technical skills and topics
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {skillTags.map((skill, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-cyan-900/30 border border-cyan-700/50 text-cyan-300 rounded-full hover:bg-cyan-900/50 hover:border-cyan-600 hover:shadow-md hover:shadow-cyan-500/30 transition-all cursor-pointer"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-slate-100 mb-4">
              Why Choose PrepMate?
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-lg hover:border-emerald-600 transition-all">
              <div className="flex items-center mb-4">
                <div className="bg-emerald-900/30 border border-emerald-700/50 p-2 rounded-lg mr-3">
                  <Shield className="w-8 h-8 text-emerald-400" />
                </div>
                <h4 className="text-lg font-semibold text-slate-100">
                  Fair & Balanced
                </h4>
              </div>
              <p className="text-slate-400">
                Our coin system ensures everyone contributes and benefits
                equally
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-lg hover:border-cyan-600 transition-all">
              <div className="flex items-center mb-4">
                <div className="bg-cyan-900/30 border border-cyan-700/50 p-2 rounded-lg mr-3">
                  <Zap className="w-8 h-8 text-cyan-400" />
                </div>
                <h4 className="text-lg font-semibold text-slate-100">
                  Real-time Practice
                </h4>
              </div>
              <p className="text-slate-400">
                Live coding sessions with immediate feedback and interaction
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-lg hover:border-orange-600 transition-all">
              <div className="flex items-center mb-4">
                <div className="bg-orange-900/30 border border-orange-700/50 p-2 rounded-lg mr-3">
                  <Target className="w-8 h-8 text-orange-400" />
                </div>
                <h4 className="text-lg font-semibold text-slate-100">
                  Skill-based Matching
                </h4>
              </div>
              <p className="text-slate-400">
                Get paired with interviewers who match your skill level and
                goals
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="rounded-lg">
                <img
                  className="w-10 h-10 rounded-xl object-cover shadow-md ring-2 ring-cyan-500/40 hover:scale-110 hover:rotate-3 transition-transform duration-300"
                  src={symbol}
                  alt="PrepMate Logo"
                />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                PrepMate
              </h1>
            </div>
            <p className="text-slate-400 mb-6">
              Master your interviews through peer-to-peer practice
            </p>
            <div className="flex justify-center space-x-6 text-sm text-slate-400">
              <a href="#" className="hover:text-cyan-400 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-cyan-400 transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-cyan-400 transition-colors">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
