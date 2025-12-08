'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import municipalitiesData from '../app/data/municipalities.json';

interface NavbarProps {
  transparent?: boolean;
  textColor?: string;
  hoverColor?: string;
  backgroundColor?: string;
}

export default function Navbar({ 
  transparent = false, 
  textColor = 'text-gray-700', 
  hoverColor = 'hover:text-blue-600',
  backgroundColor = 'bg-white'
}: NavbarProps = {}) {
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
  const pathname = usePathname();
  const isOnTilbudPage = pathname === '/tilbud';

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
          setMunicipalities(municipalitiesData);
        }
      } catch (error) {
        console.error('Error loading municipalities:', error);
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
      const filteredMunicipalities = municipalities
        .filter(municipality => 
          municipality.name.toLowerCase().includes(value.toLowerCase())
        )
        .map(municipality => ({
          type: 'municipality' as const,
          number: municipality.number,
          name: municipality.name
        }));
      
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
      const nameForUrl = result.name
        .toLowerCase()
        .replace(/æ/g, 'ae')
        .replace(/ø/g, 'o')
        .replace(/å/g, 'a')
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      
      router.push(`/kommune/${nameForUrl}`);
    } else if (result.type === 'provider' && result.slug) {
      router.push(`/stromleverandorer/${result.slug}`);
    }
    
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
    setSearchTerm('');
    setShowResults(false);
    
    setTimeout(() => {
      const searchInput = document.getElementById('search-modal-input');
      if (searchInput) {
        searchInput.focus();
      }
    }, 100);
  };

  // Determine navbar styles based on state
  const isTransparent = transparent;
  const navbarClasses = isTransparent 
    ? 'bg-transparent' 
    : 'bg-white shadow-sm border-b border-gray-100/50';
  
  const currentTextColor = isTransparent ? (isOnTilbudPage ? 'text-white' : textColor) : 'text-gray-700';
  const hoverBgColor = (isTransparent && isOnTilbudPage) ? 'hover:bg-white/10' : 'hover:bg-gray-100';
  const logoSrc = (isTransparent && isOnTilbudPage) ? "/images/stromnetwhite.svg" : "/logo.svg";

  return (
    <nav className={`${isTransparent ? 'absolute' : 'relative'} w-full top-0 z-50 font-inter ${navbarClasses}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center group">
              <div className="relative h-10 w-36 transition-transform duration-300 group-hover:scale-105">
                <Image 
                  src={logoSrc}
                  alt="Strømnet Logo" 
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {[
              { href: '/stromavtaler', label: 'Strømavtale' },
              { href: '/spotpris', label: 'Spotpris' },
              { href: '/fastpris-strom', label: 'Fastpris' },
              { href: '/dagens-strompris', label: 'Dagens strømpris' },
              { href: '/stromtest', label: 'Test din strømavtale ⚡' },
            ].map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${currentTextColor} ${hoverBgColor} hover:text-blue-600`}
              >
                {link.label}
              </Link>
            ))}
            
            {/* Search icon button */}
            <button 
              onClick={openSearchModal}
              className={`p-2 rounded-full transition-colors duration-200 ${currentTextColor} ${hoverBgColor} focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
              aria-label="Search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
          
          {/* Desktop CTA button */}
          {!isOnTilbudPage && (
            <div className="hidden md:flex items-center ml-4">
              <Link 
                href="/tilbud" 
                className="px-5 py-2.5 bg-blue-600 text-white rounded-full text-sm font-semibold shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:shadow-blue-600/40 transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Få tilbud
              </Link>
            </div>
          )}
          
          {/* Mobile navigation controls */}
          <div className="flex items-center md:hidden space-x-2">
            <button 
              onClick={() => {
                setMobileSearchOpen(!mobileSearchOpen);
                setMobileMenuOpen(false);
              }}
              className={`p-2 rounded-md ${currentTextColor} hover:bg-black/5 transition-colors`}
              aria-label="Search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            
            <button 
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen);
                setMobileSearchOpen(false);
              }}
              className={`p-2 rounded-md ${currentTextColor} hover:bg-black/5 transition-colors`}
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
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileSearchOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="p-4 bg-white border-t border-gray-100 shadow-inner" ref={searchRef}>
          <div className="relative">
            <input
              type="text"
              placeholder="Søk etter kommune..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 placeholder-gray-500"
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => searchTerm.length > 1 && setShowResults(true)}
            />
            
            {showResults && searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-lg shadow-xl overflow-hidden">
                <ul className="divide-y divide-gray-50">
                  {searchResults.map((result) => (
                    <li 
                      key={`${result.type}-${result.number}`}
                      className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors"
                      onClick={() => handleSelectResult(result)}
                    >
                      <div className="flex items-center">
                        <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3 ${result.type === 'municipality' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                          {result.type === 'municipality' ? (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          ) : (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          )}
                        </span>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">{result.name}</span>
                          <span className="text-xs text-gray-500">{result.type === 'municipality' ? 'Kommune' : 'Strømleverandør'}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-white ${mobileMenuOpen ? 'max-h-screen opacity-100 shadow-xl' : 'max-h-0 opacity-0'}`}>
        <div className="px-4 pt-2 pb-6 space-y-2">
          {[
            { href: '/stromavtaler', label: 'Strømavtale' },
            { href: '/spotpris', label: 'Spotpris' },
            { href: '/fastpris-strom', label: 'Fastpris' },
            { href: '/dagens-strompris', label: 'Dagens strømpris' },
            { href: '/stromtest', label: 'Test din strømavtale ⚡' },
          ].map((link) => (
            <Link 
              key={link.href}
              href={link.href} 
              className="block px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors border border-transparent hover:border-gray-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          
          {!isOnTilbudPage && (
            <div className="pt-4 mt-4 border-t border-gray-100">
              <Link 
                href="/tilbud" 
                className="block w-full px-4 py-3 bg-blue-600 text-center text-white rounded-lg font-semibold shadow-md hover:bg-blue-700 transition-all active:scale-95"
                onClick={() => setMobileMenuOpen(false)}
              >
                Få tilbud
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Search Modal */}
      <div 
        className={`fixed inset-0 z-[60] overflow-y-auto bg-gray-900/40 backdrop-blur-sm transition-opacity duration-300 ${searchModalOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <div className="min-h-screen px-4 text-center">
          {/* This element is to trick the browser into centering the modal contents. */}
          <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>
          
          <div 
            ref={searchModalRef}
            className={`inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl ${searchModalOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}`}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Søk etter kommune eller strømleverandør</h3>
              <button 
                onClick={() => setSearchModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="relative">
              <div className="relative flex items-center">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  id="search-modal-input"
                  type="text"
                  placeholder="Skriv inn kommunenavn eller strømleverandør..."
                  className="w-full py-4 pl-12 pr-4 text-lg bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all placeholder-gray-400"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={() => searchTerm.length > 1 && setShowResults(true)}
                />
              </div>
              
              {/* Search results */}
              {showResults && (
                <div className="mt-4 animate-fadeIn">
                  {searchResults.length > 0 ? (
                    <div className="overflow-hidden bg-white border border-gray-100 rounded-xl shadow-sm">
                      <ul className="divide-y divide-gray-50">
                        {searchResults.map((result, index) => (
                          <li 
                            key={`${result.type}-${result.number}-${index}`}
                            className="p-4 hover:bg-blue-50 cursor-pointer transition-all duration-150 ease-in-out group"
                            onClick={() => handleSelectResult(result)}
                          >
                            <div className="flex items-center">
                              <span className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-4 transition-colors ${result.type === 'municipality' ? 'bg-green-100 text-green-600 group-hover:bg-green-200' : 'bg-blue-100 text-blue-600 group-hover:bg-blue-200'}`}>
                                {result.type === 'municipality' ? (
                                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                ) : (
                                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                  </svg>
                                )}
                              </span>
                              <div>
                                <h4 className="text-base font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
                                  {result.name}
                                </h4>
                                <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                  {result.type === 'municipality' ? 'Kommune' : 'Strømleverandør'}
                                </span>
                              </div>
                              <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-gray-400">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : searchTerm.length > 1 ? (
                    <div className="py-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <p className="text-lg font-medium text-gray-900">Ingen resultater funnet</p>
                      <p className="text-sm text-gray-500 mt-1">Vi fant ingen treff for "{searchTerm}"</p>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}