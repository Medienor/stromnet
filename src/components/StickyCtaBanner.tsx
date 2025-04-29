'use client'; // Add this directive for client-side hooks

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ChevronRightIcon } from '@heroicons/react/20/solid'; // Import an arrow icon

const StickyCtaBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Calculate 25% of the total scrollable height
      const scrollThreshold = document.documentElement.scrollHeight * 0.25;
      // Check if current scroll position is past the threshold
      if (window.scrollY + window.innerHeight >= scrollThreshold) {
        setIsVisible(true);
      } else {
        // Optionally hide again if scrolling back up above the threshold
        // setIsVisible(false); // Uncomment this if you want it to hide again
      }
    };

    // Add event listener
    window.addEventListener('scroll', toggleVisibility);

    // Initial check in case the page loads already scrolled past the threshold
    toggleVisibility();

    // Cleanup function to remove the listener
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []); // Empty dependency array ensures this runs only on mount and unmount

  return (
    // Apply transition classes for smooth appearance/disappearance
    // Use isVisible state to control transform and opacity
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 lg:hidden transition-transform duration-500 ease-out ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}
    >
      <div className="bg-indigo-600 text-white p-4 shadow-lg">
        <Link
          href="/tilbud"
          className="flex items-center justify-center text-center font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-600 focus:ring-white rounded-md"
        >
          Se hvor mye du kan spare på din strømavtale
          {/* Add the arrow icon */}
          <ChevronRightIcon className="ml-1 h-5 w-5" />
        </Link>
      </div>
    </div>
  );
};

export default StickyCtaBanner; 