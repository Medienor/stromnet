'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function KommunerSearch({ municipalities }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter municipalities based on search term
  const filteredMunicipalities = municipalities.filter(municipality => 
    municipality.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Helper function to create URL-friendly slugs
  const createSlug = (name: string): string => {
    if (!name) return '';
    
    return name
      .toLowerCase()
      .replace(/æ/g, 'ae')
      .replace(/ø/g, 'o')
      .replace(/å/g, 'a')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };
  
  return (
    <div>
      <div className="mb-8">
        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Søk etter kommune</label>
        <div className="relative">
          <input
            type="text"
            id="search"
            className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="F.eks. Oslo, Bergen, Trondheim..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredMunicipalities.map((municipality) => (
          <Link 
            key={municipality.number} 
            href={`/kommune/${createSlug(municipality.name)}`}
            className="p-4 border border-gray-200 rounded-md hover:bg-blue-50 hover:border-blue-200 transition-colors"
          >
            <div className="font-medium text-gray-900">{municipality.name}</div>
            <div className="text-sm text-gray-500">{municipality.postalCodes.length} postnummer</div>
          </Link>
        ))}
      </div>
      
      {filteredMunicipalities.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Ingen kommuner funnet. Prøv et annet søkeord.</p>
        </div>
      )}
    </div>
  );
} 