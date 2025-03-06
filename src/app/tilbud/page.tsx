'use client';

import React, { useEffect, useState } from 'react';

export default function TilbudRedirectPage() {
  const redirectUrl = 'https://tjenestetorget.no/stroem/?utm_source=besteitest&utm_medium=cpa&utm_campaign=tt-besteitest-k31-strom&utm_term=tt-besteitest-k31-strom&utm_content=tt-besteitest-k31-strom-besteitest';

  useEffect(() => {
    // Redirect after 2 seconds
    const redirectTimeout = setTimeout(() => {
      window.location.href = redirectUrl;
    }, 2000);

    return () => {
      clearTimeout(redirectTimeout);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Vi sender deg videre</h1>
        
        <div className="flex justify-center items-center space-x-4 my-6 text-blue-600 relative overflow-hidden w-48 h-12 mx-auto">
          {/* Arrows with continuous rightward animation */}
          <div className="absolute inset-0 flex items-center animate-marquee">
            <svg className="h-6 w-6 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            <svg className="h-6 w-6 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            <svg className="h-6 w-6 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            <svg className="h-6 w-6 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </div>
        
        <p className="text-gray-600">
          Du blir nå sendt videre til vår samarbeidspartner Tjenestetorget 
          hvor du kan få tilbud på strøm.
        </p>
      </div>
      
      {/* Add the animation keyframes with corrected direction */}
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-marquee {
          animation: marquee 2s linear infinite;
        }
      `}</style>
    </div>
  );
} 