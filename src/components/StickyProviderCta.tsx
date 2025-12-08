'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { HiXMark, HiOutlineBolt } from 'react-icons/hi2';

export default function StickyProviderCta() {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Determine scroll direction
      if (currentScrollY > lastScrollY) {
        setScrollDirection('down');
      } else {
        setScrollDirection('up');
      }

      // Show banner after scrolling down 100px (if not closed)
      if (currentScrollY > 100 && !isClosed) {
        setIsVisible(true);
      } else if (currentScrollY <= 100) {
        setIsVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, isClosed]);

  const closeBanner = () => {
    setIsClosed(true);
    setIsVisible(false);
  };

  if (!isVisible || isClosed) return null;

  return (
    <>
      {/* Desktop Version - Sticky at top, slides down */}
      <div className={`hidden md:block fixed top-0 left-0 right-0 z-50 transform transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-3">
                <HiOutlineBolt className="h-6 w-6 text-yellow-300" />
                <span className="text-lg font-semibold">
                  Spar opptil 50% på strømregningen - Få opptil 3 tilbud nå
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <Link 
                  href="/tilbud"
                  className="bg-white text-blue-600 px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors shadow-md"
                >
                  Få tilbud nå
                </Link>
                <button
                  onClick={closeBanner}
                  className="text-white hover:text-gray-200 transition-colors"
                  aria-label="Lukk banner"
                >
                  <HiXMark className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Version - Sticky at bottom, shows when scrolling up */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 z-50 transform transition-transform duration-300 ease-in-out ${
        scrollDirection === 'up' ? 'translate-y-0' : 'translate-y-full'
      }`}>
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 flex-1">
                <HiOutlineBolt className="h-5 w-5 text-yellow-300 flex-shrink-0" />
                <span className="text-sm font-semibold leading-tight">
                  Spar opptil 50% på strømregningen
                </span>
              </div>
              <div className="flex items-center space-x-2 ml-2">
                <Link 
                  href="/tilbud"
                  className="bg-white text-blue-600 px-4 py-2 rounded-full text-sm font-semibold hover:bg-gray-100 transition-colors shadow-md whitespace-nowrap"
                >
                  Få tilbud
                </Link>
                <button
                  onClick={closeBanner}
                  className="text-white hover:text-gray-200 transition-colors flex-shrink-0"
                  aria-label="Lukk banner"
                >
                  <HiXMark className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 