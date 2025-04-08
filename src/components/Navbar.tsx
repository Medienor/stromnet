'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import municipalitiesData from '../app/data/municipalities.json';

export default function Navbar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{
    type: 'municipality' | 'provider',
    number: number | string,
    name: string,
    slug?: string
  }>>([]);
  const [showResults, setShowResults] = useState(false);
  const [municipalities, setMunicipalities] = useState<{number: number, name: string}[]>([]);
  const [providers, setProviders] = useState<{name: string, organizationNumber: number, slug: string}[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchModalRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Load municipalities data
  useEffect(() => {
    async function loadMunicipalities() {
      try {
        const response = await fetch('/api/municipalities');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.municipalities) {
            setMunicipalities(data.municipalities);
          }
        } else {
          // Fallback to static import if API fails
          setMunicipalities(municipalitiesData);
        }
      } catch (error) {
        console.error('Error loading municipalities:', error);
        // Fallback to static import
        setMunicipalities(municipalitiesData);
      }
    }
    
    loadMunicipalities();
  }, []);

  // Load providers data
  useEffect(() => {
    async function loadProviders() {
      try {
        const response = await fetch('/api/providers');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setProviders(data.data);
          }
        }
      } catch (error) {
        console.error('Error loading providers:', error);
      }
    }
    
    loadProviders();
  }, []);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.length > 1) {
      // Filter municipalities that match the search term
      const filteredMunicipalities = municipalities
        .filter(municipality => 
          municipality.name.toLowerCase().includes(value.toLowerCase())
        )
        .map(municipality => ({
          type: 'municipality' as const,
          number: municipality.number,
          name: municipality.name
        }));
      
      // Filter providers that match the search term
      const filteredProviders = providers
        .filter(provider => 
          provider.name.toLowerCase().includes(value.toLowerCase())
        )
        .map(provider => ({
          type: 'provider' as const,
          number: provider.organizationNumber,
          name: provider.name,
          slug: provider.slug
        }));
      
      // Combine and limit results
      const combinedResults = [...filteredMunicipalities, ...filteredProviders].slice(0, 10);
      
      setSearchResults(combinedResults);
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  // Handle selection from search results
  const handleSelectResult = (result: {type: 'municipality' | 'provider', name: string, slug?: string}) => {
    if (result.type === 'municipality') {
      // Convert municipality name to URL-friendly format
      const nameForUrl = result.name
        .toLowerCase()
        .replace(/æ/g, 'ae')
        .replace(/ø/g, 'o')
        .replace(/å/g, 'a')
        .replace(/[^\w\s-]/g, '') // Remove all non-word chars except spaces and hyphens
        .replace(/\s+/g, '-')     // Replace spaces with hyphens
        .replace(/-+/g, '-')      // Replace multiple hyphens with single hyphen
        .trim();                  // Trim leading/trailing whitespace
      
      // Navigate to the municipality page with the new path
      router.push(`/kommune/${nameForUrl}`);
    } else if (result.type === 'provider' && result.slug) {
      // Navigate to the provider page using slug
      router.push(`/stromleverandorer/${result.slug}`);
    }
    
    // Clear search
    setSearchTerm('');
    setShowResults(false);
    setMobileSearchOpen(false);
    setSearchModalOpen(false);
  };

  // Close search modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchModalRef.current && !searchModalRef.current.contains(event.target as Node)) {
        setSearchModalOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close mobile menu and search modal when route changes
  useEffect(() => {
    const handleRouteChange = () => {
      setMobileMenuOpen(false);
      setMobileSearchOpen(false);
      setSearchModalOpen(false);
    };

    window.addEventListener('popstate', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  // Handle search modal open
  const openSearchModal = () => {
    setSearchModalOpen(true);
    // Reset search when opening modal
    setSearchTerm('');
    setShowResults(false);
    
    // Focus the search input after modal animation completes
    setTimeout(() => {
      const searchInput = document.getElementById('search-modal-input');
      if (searchInput) {
        searchInput.focus();
      }
    }, 100);
  };

  return (
    <nav className="bg-white shadow-md font-inter">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo - Updated to use SVG image */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image 
                src="/logo.svg" 
                alt="Strømnet Logo" 
                width={140} 
                height={40} 
                priority
              />
            </Link>
          </div>
          
          {/* Desktop Navigation - hidden on mobile */}
          <div className="hidden md:flex items-center space-x-2">
            <Link href="/stromavtaler" className="px-2 py-2 text-gray-700 font-medium hover:text-blue-600">Strømavtale</Link>
            <Link href="/spotpris" className="px-2 py-2 text-gray-700 font-medium hover:text-blue-600">Spotpris</Link>
            <Link href="/fastpris-strom" className="px-2 py-2 text-gray-700 font-medium hover:text-blue-600">Fastpris</Link>
            <Link href="/dagens-strompris" className="px-2 py-2 text-gray-700 font-medium hover:text-blue-600">Dagens strømpris</Link>
            <Link href="/stromtest" className="px-2 py-2 text-gray-700 font-medium hover:text-blue-600">Test din strømavtale ⚡</Link>
            <Link href="/bedrift" className="px-2 py-2 text-gray-700 font-medium hover:text-blue-600">Bedrift</Link>
            
            {/* Search icon button */}
            <button 
              onClick={openSearchModal}
              className="px-2 py-2 text-gray-700 hover:text-blue-600 focus:outline-none"
              aria-label="Search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
          
          {/* Desktop CTA button - hidden on mobile */}
          <div className="hidden md:flex items-center">
            <Link href="/tilbud" className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700">Få tilbud</Link>
          </div>
          
          {/* Mobile navigation controls */}
          <div className="flex items-center md:hidden">
            {/* Search button */}
            <button 
              onClick={() => {
                setMobileSearchOpen(!mobileSearchOpen);
                setMobileMenuOpen(false);
              }}
              className="p-2 text-gray-600 hover:text-blue-600 mr-2"
              aria-label="Search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            
            {/* Menu button */}
            <button 
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen);
                setMobileSearchOpen(false);
              }}
              className="p-2 text-gray-600 hover:text-blue-600"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile search panel */}
      {mobileSearchOpen && (
        <div className="md:hidden p-4 border-t border-gray-200" ref={searchRef}>
          <div className="relative">
            <input
              type="text"
              placeholder="Søk etter kommune..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => searchTerm.length > 1 && setShowResults(true)}
              autoFocus
            />
            
            {/* Search results dropdown */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                <ul>
                  {searchResults.map((result) => (
                    <li 
                      key={`${result.type}-${result.number}`}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleSelectResult(result)}
                    >
                      <div className="flex items-center">
                        {result.type === 'municipality' ? (
                          <svg className="h-5 w-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        )}
                        <span className="text-gray-800">{result.name}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link 
              href="/stromavtaler" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Strømavtale
            </Link>
            <Link 
              href="/spotpris" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Spotpris
            </Link>
            <Link 
              href="/fastpris-strom" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Fastpris
            </Link>
            <Link 
              href="/dagens-strompris" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dagens strømpris
            </Link>
            <Link 
              href="/stromtest" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Test din strømavtale ⚡
            </Link>
            <Link 
              href="/bedrift" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Bedrift
            </Link>
            <div className="pt-2">
              <Link 
                href="/tilbud" 
                className="block w-full px-4 py-2 bg-blue-600 text-center text-white rounded-md font-medium hover:bg-blue-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                Få tilbud
              </Link>
            </div>
          </div>
        </div>
      )}
      
      {/* Search Modal */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/20 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
          <div 
            ref={searchModalRef}
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl transform transition-all duration-300 ease-in-out"
            style={{ 
              opacity: 1,
              transform: 'scale(1)',
              animation: 'modalFadeIn 0.3s ease-out'
            }}
          >
            <div className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Søk etter kommune eller strømleverandør</h3>
                <button 
                  onClick={() => setSearchModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="relative">
                <div className="flex items-center border-b-2 border-gray-300 py-2">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    id="search-modal-input"
                    type="text"
                    placeholder="Skriv inn kommunenavn eller strømleverandør..."
                    className="w-full px-4 py-2 focus:outline-none text-lg"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onFocus={() => searchTerm.length > 1 && setShowResults(true)}
                  />
                </div>
                
                {/* Search results */}
                {showResults && (
                  <div className="mt-4">
                    {searchResults.length > 0 ? (
                      <ul className="divide-y divide-gray-200">
                        {searchResults.map((result, index) => (
                          <li 
                            key={`${result.type}-${result.number}-${index}`}
                            className="py-3 px-2 hover:bg-gray-50 cursor-pointer transition duration-150 ease-in-out rounded-md"
                            onClick={() => handleSelectResult(result)}
                          >
                            <div className="flex items-center">
                              {result.type === 'municipality' ? (
                                <svg className="h-5 w-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                              ) : (
                                <svg className="h-5 w-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                              )}
                              <span className="text-gray-800">
                                {result.name}
                                <span className="text-xs text-gray-500 ml-2">
                                  {result.type === 'municipality' ? 'Kommune' : 'Strømleverandør'}
                                </span>
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : searchTerm.length > 1 ? (
                      <div className="py-4 text-center text-gray-500">
                        Ingen resultater funnet for "{searchTerm}"
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Add CSS animation for modal */}
      <style jsx>{`
        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </nav>
  );
} 