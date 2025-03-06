'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Helmet } from 'react-helmet';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import providerLogoUrls from '@/app/data/providerLogoUrls';
import municipalitiesData from '../data/municipalities.json';
import Image from 'next/image';

// Product interface
interface Product {
  id: number;
  productId: number;
  name: string;
  productType: string;
  monthlyFee?: number;
  addonPrice?: number;
  elCertificatePrice?: number;
  fixedPrice?: number;
  variablePrice?: number;
  spotPrice?: number;
  markup?: number;
  salesNetworks?: {
    id: string;
    type: string;
    name: string;
    kwPrice: number;
    purchaseKwPrice: number;
  }[];
  provider: {
    name: string;
    organizationNumber: number;
    url?: string;
    pricelistUrl?: string;
  };
}

interface StromavtalerClientProps {
  initialProducts?: Product[];
}

// Add a type declaration for the providerLogoUrls
type ProviderLogoUrls = {
  [key: string]: string;
};

// Cast the imported providerLogoUrls to the type
const typedProviderLogoUrls = providerLogoUrls as ProviderLogoUrls;

// Update the municipality type definition to properly handle null and undefined values
type Municipality = {
  number: number;
  name: string;
  areaCode?: string | null; // Allow areaCode to be null
} | null;

// Define an interface for the grid data structure
interface GridData {
  municipalityNumber: number;
  areaCode: string;
  // Add other properties that might be in the grid data
  name?: string;
  id?: string | number;
}

export default function StromavtalerClient({ initialProducts = [] }: StromavtalerClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(initialProducts.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState('price');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterType, setFilterType] = useState('all');
  const [postalCode, setPostalCode] = useState('');
  const [municipality, setMunicipality] = useState<Municipality>(null);
  const [areaAverage, setAreaAverage] = useState<number | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [activeSort, setActiveSort] = useState('');
  const tableRef = useRef<HTMLDivElement>(null);
  const [postalCodeError, setPostalCodeError] = useState<string | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Only fetch if we don't have initial products
    if (initialProducts.length === 0) {
      const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        
        // Check for cached data first
        try {
          const cachedData = localStorage.getItem('stromavtaler_products');
          
          if (cachedData) {
            const { timestamp, products: cachedProducts } = JSON.parse(cachedData);
            const cacheAge = Math.round((Date.now() - timestamp) / (60 * 60 * 1000) * 10) / 10;
            const isExpired = Date.now() - timestamp > 16 * 60 * 60 * 1000; // 16 hours
            
            if (!isExpired && cachedProducts && cachedProducts.length > 0) {
              console.log(`%c✅ CACHE HIT: Using cached products (${cachedProducts.length} items, ${cacheAge} hours old)`, 'color: green; font-weight: bold');
              setProducts(cachedProducts);
              setLoading(false);
              return;
            } else {
              console.log(`%c⏱️ CACHE EXPIRED: Cached data is ${cacheAge} hours old, fetching fresh data`, 'color: orange');
            }
          } else {
            console.log('%c❓ NO CACHE: No cached products found', 'color: blue');
          }
        } catch (cacheError) {
          console.error('%c🔴 CACHE ERROR: Failed to read cache', 'color: red', cacheError);
          // Continue to fetch from API
        }
        
        // Fetch from API if no valid cache
        try {
          console.log('%c🔄 API REQUEST: Fetching products from API...', 'color: purple; font-weight: bold');
          const startTime = performance.now();
          
          const response = await fetch('/api/electricity-deals');
          
          if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
          }
          
          const data = await response.json();
          const fetchTime = Math.round(performance.now() - startTime);
          
          if (data.success) {
            const fetchedProducts = data.data.products || [];
            console.log(`%c✅ API SUCCESS: Fetched ${fetchedProducts.length} products in ${fetchTime}ms`, 'color: green; font-weight: bold');
            
            // Store in state
            setProducts(fetchedProducts);
            
            // Cache the products
            try {
              localStorage.setItem('stromavtaler_products', JSON.stringify({
                timestamp: Date.now(),
                products: fetchedProducts
              }));
              console.log('%c💾 CACHE SAVED: Products saved to localStorage', 'color: green');
            } catch (saveError) {
              console.error('%c🔴 CACHE SAVE ERROR: Failed to save to cache', 'color: red', saveError);
            }
          } else {
            throw new Error(data.error || 'Unknown API error');
          }
        } catch (error: unknown) {
          // Fix: Properly type the error
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error('%c🔴 API ERROR: Failed to fetch products', 'color: red; font-weight: bold', error);
          setError(errorMessage);
          
          // Try to use expired cache as fallback
          try {
            const cachedData = localStorage.getItem('stromavtaler_products');
            if (cachedData) {
              const { products: cachedProducts, timestamp } = JSON.parse(cachedData);
              if (cachedProducts && cachedProducts.length > 0) {
                const cacheAge = Math.round((Date.now() - timestamp) / (60 * 60 * 1000) * 10) / 10;
                console.log(`%c🔶 FALLBACK: Using expired cache (${cacheAge} hours old) due to API error`, 'color: orange; font-weight: bold');
                setProducts(cachedProducts);
              }
            }
          } catch (fallbackError) {
            console.error('%c🔴 FALLBACK ERROR: Failed to use cached fallback', 'color: red', fallbackError);
          }
        } finally {
          setLoading(false);
        }
      };
      
      fetchProducts();
    }
  }, [initialProducts]);

  // Generate slug for product
  const generateSlug = (product: Product) => {
    const providerName = product.provider.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    const productName = product.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    return `${providerName}-${productName}`;
  };

  // Get the price for a product based on its type
  const getProductPrice = (product: Product) => {
    if (product.productType === 'hourly_spot' || product.productType === 'spot') {
      // For spot products, use markup + addonPrice
      return product.markup || product.addonPrice || 0;
    } else if (product.productType === 'fixed') {
      // For fixed products, use fixedPrice
      return product.fixedPrice || 0;
    } else if (product.productType === 'variable') {
      // For variable products, use variablePrice
      return product.variablePrice || 0;
    }
    // Default fallback
    return product.addonPrice || 0;
  };

  // Handle sort change
  const handleSort = (field: string) => {
    if (field === sortField) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
    
    setActiveSort(field);
    
    // Scroll to top of table
    if (tableRef.current) {
      tableRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle filter change
  const handleFilterChange = (type: string) => {
    setFilterType(type);
    setShowFilterModal(false);
    
    // Scroll to top of table
    if (tableRef.current) {
      tableRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Update the useEffect for sorting and filtering
  useEffect(() => {
    if (!products || products.length === 0) return;
    
    // Create a copy of the products array
    const sorted = [...products];
    
    // Apply sorting
    if (sortField === 'name') {
      sorted.sort((a, b) => {
        return sortDirection === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      });
    } else if (sortField === 'provider') {
      sorted.sort((a, b) => {
        return sortDirection === 'asc'
          ? a.provider.name.localeCompare(b.provider.name)
          : b.provider.name.localeCompare(a.provider.name);
      });
    } else if (sortField === 'price') {
      sorted.sort((a, b) => {
        const priceA = getProductPrice(a);
        const priceB = getProductPrice(b);
        return sortDirection === 'asc' 
          ? priceA - priceB
          : priceB - priceA;
      });
    } else if (sortField === 'monthlyFee') {
      sorted.sort((a, b) => {
        const feeA = a.monthlyFee || 0;
        const feeB = b.monthlyFee || 0;
        return sortDirection === 'asc'
          ? feeA - feeB
          : feeB - feeA;
      });
    }
    
    // Apply filters
    let filtered = sorted;
    if (filterType !== 'all') {
      filtered = sorted.filter(product => {
        if (filterType === 'spot' && (product.productType === 'hourly_spot' || product.productType === 'spot')) {
          return true;
        } else if (filterType === 'fixed' && product.productType === 'fixed') {
          return true;
        } else if (filterType === 'variable' && product.productType === 'variable') {
          return true;
        } else if (filterType === 'other' && 
                  !product.productType.includes('spot') && 
                  !product.productType.includes('fixed') && 
                  !product.productType.includes('variable')) {
          return true;
        }
        return false;
      });
    }
    
    // Update the filtered products state
    setFilteredProducts(filtered);
  }, [products, sortField, sortDirection, filterType]);

  // Get product type in Norwegian
  const getProductTypeNorwegian = (type: string) => {
    switch (type) {
      case 'hourly_spot':
      case 'spot':
        return 'Spotpris';
      case 'fixed':
        return 'Fastpris';
      case 'variable':
        return 'Variabel pris';
      default:
        return type;
    }
  };

  // Update the handlePostalCodeChange function to fetch area data
  const handlePostalCodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    setPostalCode(value);
    setPostalCodeError(null); // Clear any previous errors
    
    if (value.length === 4) {
      // Find municipality by postal code
      const foundMunicipality = municipalitiesData.find(m => 
        m.postalCodes && m.postalCodes.includes(value)
      );
      
      if (foundMunicipality) {
        // First set basic municipality info
        setMunicipality({
          number: foundMunicipality.number,
          name: foundMunicipality.name,
          areaCode: null // We'll get this from the local-grids API
        });
        
        // Fetch grid information to get the correct area code
        try {
          const gridResponse = await fetch(`/api/local-grids?name=${encodeURIComponent(foundMunicipality.name)}`);
          
          if (gridResponse.ok) {
            const gridData = await gridResponse.json();
            
            if (gridData.success && gridData.data && gridData.data.length > 0) {
              // Find the grid that matches our municipality number
              const matchingGrid = gridData.data.find((grid: GridData) => 
                grid.municipalityNumber === foundMunicipality.number
              ) || gridData.data[0] as GridData; // Fallback to first result if no exact match
              
              // Update municipality with the correct area code
              setMunicipality(prev => {
                if (!prev) {
                  return null;
                }
                
                return {
                  number: prev.number,
                  name: prev.name,
                  areaCode: matchingGrid.areaCode
                };
              });
              
              // Now fetch the price data for this area code
              if (matchingGrid.areaCode) {
                try {
                  const priceResponse = await fetch(`/api/kingAverage`);
                  if (priceResponse.ok) {
                    const priceData = await priceResponse.json();
                    if (priceData.success && priceData.data) {
                      // Get the price for this specific area code (NO1, NO2, etc.)
                      const areaPrice = priceData.data[matchingGrid.areaCode] || 0;
                      setAreaAverage(areaPrice / 100); // Convert from øre to NOK
                    }
                  }
                } catch (priceError) {
                  console.error('Failed to fetch area price:', priceError);
                }
              }
            }
          }
        } catch (gridError) {
          console.error('Failed to fetch grid information:', gridError);
        }
        
        // Scroll to the table after a short delay
        setTimeout(() => {
          if (tableRef.current) {
            tableRef.current.scrollIntoView({ behavior: 'smooth' });
          }
        }, 300);
      } else {
        setMunicipality(null);
        setAreaAverage(null);
        setPostalCodeError('Feil postnummer. Vennligst prøv igjen.');
      }
    } else if (value.length === 0) {
      setMunicipality(null);
      setAreaAverage(null);
    }
  };

  // Add this function to format the date in Norwegian
  const formatNorwegianDate = () => {
    const months = [
      'januar', 'februar', 'mars', 'april', 'mai', 'juni', 
      'juli', 'august', 'september', 'oktober', 'november', 'desember'
    ];
    
    const today = new Date();
    const day = today.getDate();
    const month = months[today.getMonth()];
    const year = today.getFullYear();
    
    return `${day}. ${month} ${year}`;
  };

  // Your existing JSX return
  return (
    <>
      <Helmet>
        <title>Sammenlign strømavtaler - Finn beste strømavtale for deg</title>
        <meta name="description" content="Sammenlign strømavtaler fra ulike leverandører. Finn den beste strømavtalen for deg og spar penger på strømregningen." />
      </Helmet>
      
      <Navbar />
      
      <main className="bg-gray-50 min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Sammenlign strømavtaler</h1>
              <p className="text-xl mb-8">Finn den beste strømavtalen for deg og spar penger på strømregningen.</p>
              
              {/* Postal Code Input */}
              <div className="max-w-md mx-auto">
                <div className="relative">
                  <input
                    type="text"
                    value={postalCode}
                    onChange={handlePostalCodeChange}
                    placeholder="Skriv inn postnummer"
                    className={`w-full px-5 py-4 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg shadow-lg bg-white ${
                      postalCodeError ? 'border-2 border-red-500' : ''
                    }`}
                    maxLength={4}
                  />
                  {municipality && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600 flex items-center">
                      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="font-medium">{municipality.name}</span>
                    </div>
                  )}
                  {postalCodeError && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 flex items-center">
                      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium">Feil postnummer</span>
                    </div>
                  )}
                </div>
                
                {postalCodeError && (
                  <div className="mt-2 text-red-200 text-sm">
                    {postalCodeError}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
        
        {/* Products Section */}
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
              Alle strømavtaler {formatNorwegianDate()}
            </h2>
            
            <div ref={tableRef}>
              {/* Filter and Sort Controls - Top */}
              <div className="hidden md:flex mb-6 justify-between items-center">
                {/* Filter Buttons - Left */}
                <div className="bg-white rounded-lg shadow-sm p-1.5 flex flex-wrap gap-1">
                  <button
                    onClick={() => handleFilterChange('all')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      filterType === 'all' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Alle avtaler
                  </button>
                  <button
                    onClick={() => handleFilterChange('spot')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      filterType === 'spot' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Spotpris
                  </button>
                  <button
                    onClick={() => handleFilterChange('fixed')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      filterType === 'fixed' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Fastpris
                  </button>
                  <button
                    onClick={() => handleFilterChange('variable')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      filterType === 'variable' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Variabel
                  </button>
                  <button
                    onClick={() => handleFilterChange('other')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      filterType === 'other' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Andre
                  </button>
                </div>
                
                {/* Sort Dropdown - Right */}
                <div className="relative">
                  <div className="bg-white rounded-lg shadow-sm p-3 flex items-center">
                    <span className="text-sm text-gray-600 mr-3">Sorter etter:</span>
                    <div className="relative inline-block">
                      <select 
                        className="appearance-none bg-white border border-gray-200 text-gray-700 py-2 px-4 pr-8 rounded-md leading-tight focus:outline-none focus:border-gray-300 text-sm font-medium min-w-[120px]"
                        value={activeSort}
                        onChange={(e) => {
                          const field = e.target.value;
                          handleSort(field);
                        }}
                      >
                        <option value="name">Navn</option>
                        <option value="provider">Leverandør</option>
                        <option value="price">Pris</option>
                        <option value="monthlyFee">Månedsgebyr</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Mobile Filter Button */}
              <div className="md:hidden mb-4">
                <button
                  onClick={() => setShowFilterModal(true)}
                  className="w-full px-4 py-3 bg-white rounded-md shadow-md text-gray-700 font-medium flex items-center justify-center transition-colors hover:bg-gray-50"
                >
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filtrer og sorter avtaler
                </button>
              </div>
              
              {/* Area Information Box - Now positioned below filters but above table */}
              {municipality && municipality.areaCode && (
                <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-800">
                        Prisområde: <span className="font-semibold">{municipality.areaCode}</span> ({municipality.name})
                      </h3>
                      {areaAverage !== null && (
                        <p className="text-sm text-gray-600 mt-1">
                          Gjennomsnittlig strømpris siste 10 dager: <span className="font-semibold">{(areaAverage * 100).toFixed(2)} øre/kWh</span>
                        </p>
                      )}
                    </div>
                    <div className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                      {municipality.areaCode}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Products Table - Desktop View */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600">Laster strømavtaler...</p>
                  </div>
                ) : error ? (
                  <div className="p-8 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-red-600 font-medium mb-2">Feil ved lasting av strømavtaler</p>
                    <p className="text-gray-600">{error}</p>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100 mb-4">
                      <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <p className="text-gray-800 font-medium mb-2">Ingen strømavtaler funnet</p>
                    <p className="text-gray-600">Prøv å endre filteret eller søk på nytt.</p>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table - Hidden on Mobile */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 table-fixed">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[18%]">
                              Leverandør
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[22%]">
                              Avtale
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">
                              Type
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">
                              Pris
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">
                              Månedsgebyr
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">
                              Handling
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredProducts.map(product => {
                            const orgNumber = product.provider.organizationNumber?.toString();
                            const hasLogo = orgNumber && typedProviderLogoUrls[orgNumber];
                            
                            return (
                              <tr key={product.id}>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                  <div className="flex flex-col items-start">
                                    {orgNumber && hasLogo ? (
                                      <Image 
                                        src={typedProviderLogoUrls[orgNumber]} 
                                        alt={`${product.provider.name} logo`} 
                                        width={80}
                                        height={80}
                                        className="h-10 w-auto object-contain"
                                        quality={100}
                                        unoptimized
                                        onError={() => {
                                          console.error(`Failed to load image for ${product.provider.name}`);
                                        }}
                                      />
                                    ) : (
                                      <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                                        <span className="text-sm font-medium text-gray-500">
                                          {product.provider.name.substring(0, 2).toUpperCase()}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-sm">
                                  <div className="flex flex-col">
                                    <span className="font-medium text-gray-900 mb-1 truncate">{product.provider.name}</span>
                                    <span className="text-gray-500 truncate">{product.name}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                  {getProductTypeNorwegian(product.productType)}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                  {getProductPrice(product).toFixed(2)} øre/kWh
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                  {product.monthlyFee?.toFixed(2) || '0.00'} kr
                                </td>
                                <td className="px-6 py-4 text-sm font-medium">
                                  <Link href={`/stromavtaler/${generateSlug(product)}`} className="text-blue-600 hover:text-blue-900">
                                    Se avtale
                                  </Link>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Mobile Card View */}
                    <div className="md:hidden">
                      <div className="divide-y divide-gray-200">
                        {filteredProducts.map(product => {
                          const orgNumber = product.provider.organizationNumber?.toString();
                          const hasLogo = orgNumber && typedProviderLogoUrls[orgNumber];
                          
                          return (
                            <div key={product.id} className="p-4">
                              {/* Centered Logo */}
                              <div className="flex justify-center mb-3">
                                {orgNumber && hasLogo ? (
                                  <Image 
                                    src={typedProviderLogoUrls[orgNumber]} 
                                    alt={`${product.provider.name} logo`} 
                                    width={96}
                                    height={96}
                                    className="h-12 w-auto object-contain"
                                    quality={100}
                                    unoptimized
                                  />
                                ) : (
                                  <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-medium text-gray-500">
                                      {product.provider.name.substring(0, 2).toUpperCase()}
                                    </span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Provider and Product Name - Centered and Full Width */}
                              <div className="text-center mb-4">
                                <p className="text-sm font-medium text-gray-900">
                                  {product.provider.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {product.name}
                                </p>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2 mb-3">
                                {/* Type - Single Column with Centered Text */}
                                <div className="bg-gray-50 rounded-md p-2 text-center">
                                  <p className="text-xs text-gray-500">Type</p>
                                  <p className="text-sm font-medium text-gray-900">{getProductTypeNorwegian(product.productType)}</p>
                                </div>
                                
                                {/* Price - Single Column with Centered Text */}
                                <div className="bg-gray-50 rounded-md p-2 text-center">
                                  <p className="text-xs text-gray-500">Pris</p>
                                  <p className="text-sm font-medium text-gray-900">{getProductPrice(product).toFixed(2)} øre/kWh</p>
                                </div>
                                
                                {/* Monthly Fee - Full Width (2 columns) */}
                                <div className="col-span-2 bg-gray-50 rounded-md p-2 text-center">
                                  <p className="text-xs text-gray-500">Månedsgebyr</p>
                                  <p className="text-sm font-medium text-gray-900">{product.monthlyFee?.toFixed(2) || '0.00'} kr</p>
                                </div>
                              </div>
                              
                              <Link 
                                href={`/stromavtaler/${generateSlug(product)}`} 
                                className="block w-full text-center px-4 py-2 bg-blue-50 text-blue-600 rounded-md font-medium hover:bg-blue-100 transition-colors"
                              >
                                Se avtale
                              </Link>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
        
        {/* Mobile Filter Modal */}
        {showFilterModal && (
          <div className="fixed inset-0 bg-black/10 backdrop-blur-md z-50 flex items-center justify-center p-4 md:hidden">
            <div className="bg-white/95 rounded-xl w-full max-w-sm shadow-xl overflow-hidden">
              <div className="p-5 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800">Filtrer strømavtaler</h3>
                  <button 
                    onClick={() => setShowFilterModal(false)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-5">
                <h4 className="text-sm font-medium text-gray-500 uppercase mb-3">Avtaletype</h4>
                <div className="space-y-2 mb-6">
                  <button
                    onClick={() => handleFilterChange('all')}
                    className={`w-full px-4 py-3 rounded-lg font-medium transition-colors text-left flex items-center ${
                      filterType === 'all' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100/80 text-gray-700 hover:bg-gray-200/90'
                    }`}
                  >
                    <span className="flex-1">Alle avtaler</span>
                    {filterType === 'all' && (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => handleFilterChange('spot')}
                    className={`w-full px-4 py-3 rounded-lg font-medium transition-colors text-left flex items-center ${
                      filterType === 'spot' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100/80 text-gray-700 hover:bg-gray-200/90'
                    }`}
                  >
                    <span className="flex-1">Spotpris</span>
                    {filterType === 'spot' && (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => handleFilterChange('fixed')}
                    className={`w-full px-4 py-3 rounded-lg font-medium transition-colors text-left flex items-center ${
                      filterType === 'fixed' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100/80 text-gray-700 hover:bg-gray-200/90'
                    }`}
                  >
                    <span className="flex-1">Fastpris</span>
                    {filterType === 'fixed' && (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => handleFilterChange('variable')}
                    className={`w-full px-4 py-3 rounded-lg font-medium transition-colors text-left flex items-center ${
                      filterType === 'variable' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100/80 text-gray-700 hover:bg-gray-200/90'
                    }`}
                  >
                    <span className="flex-1">Variabel</span>
                    {filterType === 'variable' && (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => handleFilterChange('other')}
                    className={`w-full px-4 py-3 rounded-lg font-medium transition-colors text-left flex items-center ${
                      filterType === 'other' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100/80 text-gray-700 hover:bg-gray-200/90'
                    }`}
                  >
                    <span className="flex-1">Andre</span>
                    {filterType === 'other' && (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                </div>
                
                <h4 className="text-sm font-medium text-gray-500 uppercase mb-3">Sortering</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      handleSort('name');
                      setShowFilterModal(false);
                    }}
                    className={`w-full px-4 py-3 rounded-lg font-medium transition-colors text-left flex items-center ${
                      sortField === 'name' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100/80 text-gray-700 hover:bg-gray-200/90'
                    }`}
                  >
                    <span className="flex-1">Navn</span>
                    {sortField === 'name' && (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      handleSort('provider');
                      setShowFilterModal(false);
                    }}
                    className={`w-full px-4 py-3 rounded-lg font-medium transition-colors text-left flex items-center ${
                      sortField === 'provider' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100/80 text-gray-700 hover:bg-gray-200/90'
                    }`}
                  >
                    <span className="flex-1">Leverandør</span>
                    {sortField === 'provider' && (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      handleSort('price');
                      setShowFilterModal(false);
                    }}
                    className={`w-full px-4 py-3 rounded-lg font-medium transition-colors text-left flex items-center ${
                      sortField === 'price' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100/80 text-gray-700 hover:bg-gray-200/90'
                    }`}
                  >
                    <span className="flex-1">Pris</span>
                    {sortField === 'price' && (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      handleSort('monthlyFee');
                      setShowFilterModal(false);
                    }}
                    className={`w-full px-4 py-3 rounded-lg font-medium transition-colors text-left flex items-center ${
                      sortField === 'monthlyFee' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100/80 text-gray-700 hover:bg-gray-200/90'
                    }`}
                  >
                    <span className="flex-1">Månedsgebyr</span>
                    {sortField === 'monthlyFee' && (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              
              <div className="p-5 border-t border-gray-200">
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Vis resultater
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </>
  );
} 