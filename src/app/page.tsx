"use client"

import { useState, useEffect } from 'react';
import { Wrench, Sparkles, Clock, Twitter, Instagram, Linkedin, Facebook } from 'lucide-react';

export default function MaintenancePage() {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2e3f6e] via-[#3d528b] to-[#4DB7FE] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-2xl w-full">
        {/* Main Card */}
        <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-12 text-center transform hover:scale-105 transition-transform duration-300">
          {/* Icon Animation */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#3d528b] to-[#4DB7FE] rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-[#3d528b] to-[#4DB7FE] p-6 rounded-full">
                <Wrench className="w-12 h-12 text-white animate-spin" style={{ animationDuration: '3s' }} />
              </div>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#2e3f6e] to-[#4DB7FE] bg-clip-text text-transparent mb-4">
            We're Cooking Up Something Amazing!
          </h1>

          {/* Subheading */}
          <p className="text-xl text-gray-600 mb-6">
            Our site is getting a glow-up ✨
          </p>

          {/* Loading dots */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <Sparkles className="w-5 h-5 text-[#4DB7FE] animate-bounce" />
            <p className="text-lg text-gray-700 font-medium">
              We'll be back soon{dots}
            </p>
            <Sparkles className="w-5 h-5 text-[#3d528b] animate-bounce delay-150" />
          </div>

          {/* Details */}
          <div className="bg-gradient-to-r from-blue-50 to-sky-50 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-center gap-3 text-gray-700">
              <Clock className="w-5 h-5 text-[#4DB7FE]" />
              <p className="text-sm md:text-base">
                Our team is working hard to bring you an even better experience
              </p>
            </div>
          </div>

          {/* Contact Info */}
          <p className="text-gray-500 text-sm">
            Need immediate assistance? Reach us at{' '}
            <a href="mailto:support@example.com" className="text-[#3d528b] hover:text-[#4DB7FE] font-semibold underline">
              admin@squamish.realestate
            </a>
          </p>

          {/* Social Links */}
           <div className="mt-8 flex justify-center gap-4">
            <a 
              href="https://twitter.com/SquamishRE" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 bg-gradient-to-r from-[#3d528b] to-[#4DB7FE] rounded-full flex items-center justify-center hover:scale-110 transition-transform"
            >
              <Twitter className="w-5 h-5 text-white" />
            </a>
            <a 
              href="https://www.instagram.com/sean.squamish.realestate/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 bg-gradient-to-r from-[#3d528b] to-[#4DB7FE] rounded-full flex items-center justify-center hover:scale-110 transition-transform"
            >
              <Instagram className="w-5 h-5 text-white" />
            </a>
            <a 
              href="https://www.linkedin.com/company/squamish-realestate" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 bg-gradient-to-r from-[#3d528b] to-[#4DB7FE] rounded-full flex items-center justify-center hover:scale-110 transition-transform"
            >
              <Linkedin className="w-5 h-5 text-white" />
            </a>
            <a 
              href="https://www.facebook.com/sean.squamish.realestate" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 bg-gradient-to-r from-[#3d528b] to-[#4DB7FE] rounded-full flex items-center justify-center hover:scale-110 transition-transform"
            >
              <Facebook className="w-5 h-5 text-white" />
            </a>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-white/80 text-sm mt-6 drop-shadow-lg">
          Thank you for your patience! 💙
        </p>
      </div>
    </div>
  );
}