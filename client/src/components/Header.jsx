import React, { useState, useEffect } from 'react';
import { Menu, X, Users } from 'lucide-react';
import { gsap } from 'gsap';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png'
import symbol from '../assets/symbol.png';
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    gsap.fromTo(
      '.header-item',
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, delay: 0.2 }
    );
  }, []);

  return (
  <header
    className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? "bg-slate-900/95 backdrop-blur-md shadow-lg border-b border-slate-700" : "bg-transparent"
    }`}
  >
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        {/* Logo */}
        <div className="flex items-center space-x-2 header-item">
          <img
            className="w-10 h-10 rounded-xl object-cover shadow-md ring-2 ring-cyan-500/40 hover:scale-110 hover:rotate-3 transition-transform duration-300"
            src={symbol}
            alt="PrepMate Logo"
          />
          <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            PrepMate
          </span>
        </div>
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8 header-item">
          <a
            href="#features"
            className="text-slate-300 hover:text-cyan-400 transition-colors font-medium"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="text-slate-300 hover:text-cyan-400 transition-colors font-medium"
          >
            How It Works
          </a>
          <a
            href="#benefits"
            className="text-slate-300 hover:text-cyan-400 transition-colors font-medium"
          >
            Benefits
          </a>
          <Link
            to="/credentials"
            className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-2 rounded-lg font-medium shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/70 hover:from-cyan-700 hover:to-blue-700 transition-all"
          >
            Get Started
          </Link>
        </nav>
        {/* Mobile menu button */}
        <button
          className="md:hidden header-item text-slate-300 hover:text-cyan-400"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-slate-800 border border-slate-700 rounded-lg shadow-xl mt-2 p-4">
          <nav className="flex flex-col space-y-4">
            <a
              href="#features"
              className="text-slate-300 hover:text-cyan-400 transition-colors font-medium"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-slate-300 hover:text-cyan-400 transition-colors font-medium"
            >
              How It Works
            </a>
            <a
              href="#benefits"
              className="text-slate-300 hover:text-cyan-400 transition-colors font-medium"
            >
              Benefits
            </a>
            <Link
              to="/credentials"
              className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-2 rounded-lg font-medium w-full text-center shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/70 hover:from-cyan-700 hover:to-blue-700 transition-all"
            >
              Get Started
            </Link>
          </nav>
        </div>
      )}
    </div>
  </header>
);
};

export default Header;
