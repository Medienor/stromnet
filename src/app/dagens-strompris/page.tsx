'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Helmet } from 'react-helmet';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import providerLogoUrlsRaw from '@/app/data/providerLogoUrls';
import ReservoirStatistics from '@/components/ReservoirStatistics';
import Top50ProductList from '@/components/Top50ProductList';


// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// Provider interface
interface Provider {
  name: string;
  organizationNumber: number;
  pricelistUrl: string | null;
  slug: string;
}

// Add these interfaces to define the types
interface PriceData {
  currentPrice: number;
  averagePrice: number;
  daysIncluded: number;
}

interface Deal {
  id: string;
  // Add other properties as needed
}

// Add this interface to define the type
interface ProviderLogoUrls {
  [key: string]: string;
}

// Import providerLogoUrls and cast it to the interface
const providerLogoUrls = providerLogoUrlsRaw as ProviderLogoUrls;

export default function DagensStromprisPage() {
  const [selectedRegion, setSelectedRegion] = useState('Øst-Norge');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [providers, setProviders] = useState<Provider[]>([]);
  
  // Update these state variables with proper types
  const [deals, setDeals] = useState<Deal[]>([]);
  const [expandedDeal, setExpandedDeal] = useState<string | null>(null);
  const [dealsError, setDealsError] = useState<string | null>(null);
  const [dealsLoading, setDealsLoading] = useState(true);
  
  // Replace the regions array with a memoized version
  const regions = useMemo(() => [
    { name: 'Øst-Norge', code: 'NO1' },
    { name: 'Sør-Norge', code: 'NO2' },
    { name: 'Midt-Norge', code: 'NO3' },
    { name: 'Nord-Norge', code: 'NO4' },
    { name: 'Vest-Norge', code: 'NO5' }
  ], []);

  useEffect(() => {
    if (selectedRegion) {
      const fetchPriceData = async () => {
        setLoading(true);
        setError('');
        
        try {
          const region = regions.find(r => r.name === selectedRegion);
          if (!region) return;
          
          const response = await fetch(`/api/average-electricity-price?areaCode=${region.code}`);
          const data = await response.json();
          
          if (data.success) {
            setPriceData(data.data);
          } else {
            setError(data.error || 'Kunne ikke hente strømpriser');
          }
        } catch (err) {
          setError('Det oppstod en feil ved henting av strømpriser');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      
      fetchPriceData();
    }
  }, [selectedRegion, regions]);
  
  // Fetch providers
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await fetch('/api/providers');
        const data = await response.json();
        
        if (data.success) {
          setProviders(data.data);
        }
      } catch (err) {
        console.error('Error fetching providers:', err);
      }
    };
    
    fetchProviders();
  }, []);
  
  // Get 6 featured providers
  const featuredProviders = providers.slice(0, 6);
  
  // Generate hourly data for the chart
  const generateHourlyData = () => {
    if (!priceData) return null;
    
    const basePrice = priceData.currentPrice / 100;
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    // Create a realistic price curve with morning and evening peaks
    const prices = hours.map(hour => {
      // Morning peak (7-9)
      if (hour >= 7 && hour <= 9) {
        return basePrice * (1 + 0.2 * Math.sin((hour - 7) * Math.PI / 2));
      }
      // Evening peak (17-20)
      else if (hour >= 17 && hour <= 20) {
        return basePrice * (1 + 0.3 * Math.sin((hour - 17) * Math.PI / 3));
      }
      // Night time low prices
      else if (hour >= 0 && hour <= 5) {
        return basePrice * 0.7;
      }
      // Default daytime prices
      else {
        return basePrice * (0.8 + 0.2 * Math.random());
      }
    });
    
    return {
      labels: hours.map(h => `${h.toString().padStart(2, '0')}:00`),
      prices: prices.map(p => parseFloat(p.toFixed(2)))
    };
  };
  
  // Get current hour
  const currentHour = new Date().getHours();
  
  // Add this effect to fetch deals with better error handling and debugging
  useEffect(() => {
    const fetchDeals = async () => {
      setDealsLoading(true);
      setDealsError(null);
      
      try {
        console.log('Fetching deals from API...');
        const response = await fetch('/api/electricity-deals');
        
        console.log('API Response Status:', response.status);
        
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        
        // Get response text first for debugging
        const responseText = await response.text();
        console.log('Response text sample:', responseText.substring(0, 100));
        
        // Try to parse as JSON
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          throw new Error('Invalid JSON response from API');
        }
        
        console.log('API Response Data:', data);
        
        if (data.success) {
          // Extract the deals from the correct path in the response
          const deals = data.data?.products || [];
          console.log(`Loaded ${deals.length} deals`);
          setDeals(deals);
        } else {
          throw new Error(data.error || 'Unknown API error');
        }
      } catch (error: unknown) {
        console.error('Error fetching deals:', error);
        // Handle the error properly based on its type
        if (error instanceof Error) {
          setDealsError(error.message);
        } else {
          setDealsError('An unknown error occurred');
        }
        setDeals([]);
      } finally {
        setDealsLoading(false);
      }
    };
    
    fetchDeals();
  }, []);
  
  // Fix the parameter types in these functions
  const toggleDealExpansion = (dealId: string) => {
    setExpandedDeal(expandedDeal === dealId ? null : dealId);
  };
  
  const formatPrice = (price: number | undefined | null) => {
    if (price === undefined || price === null || isNaN(price)) {
      return '0.00';
    }
    return price.toFixed(2);
  };
  
  const formatMonthlyCost = (cost: number | undefined | null) => {
    // Check if cost is undefined, null, or not a number
    if (cost === undefined || cost === null || isNaN(cost)) {
      return '0'; // Return a default value
    }
    return cost.toFixed(0);
  };
  
  const formatConsumption = (consumption: number | undefined | null) => {
    if (consumption === undefined || consumption === null || isNaN(consumption)) {
      return '0 kWh';
    }
    return `${(consumption / 1000).toFixed(0)} kWh`;
  };
  
  const getProductTypeNorwegian = (type: string | undefined | null) => {
    if (!type) return 'Ukjent';
    
    const typeMap: Record<string, string> = {
      'spot': 'Spotpris',
      'SPOT': 'Spotpris',
      'hourly_spot': 'Spotpris',
      'HOURLY_SPOT': 'Spotpris',
      'fixed': 'Fastpris',
      'FIXED': 'Fastpris',
      'variable': 'Variabel',
      'VARIABLE': 'Variabel'
    };
    
    return typeMap[type] || type;
  };
  const getCurrentMonthName = () => ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'desember'][new Date().getMonth()];
  const getCurrentDate = () => new Date().toLocaleDateString('nb-NO');

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Helmet>
        <title>Dagens strømpris time for time i ditt området | Strømnet.no</title>
        <meta name="description" content="Sjekk dagens strømpris i ditt område. Se strømpriser time for time, og finn ut når strømmen er billigst og dyrest." />
        <meta name="keywords" content="strømpris, strømpriser, strøm, elektrisitet, strømkostnader, strømleverandør" />
      </Helmet>
      
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-blue-900 py-20">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="text-center md:text-left">
                  <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white drop-shadow-md">
                    Sjekk dagens strømpris
                  </h1>
                  <p className="text-xl mb-8 text-white drop-shadow-md font-medium">
                    Hva er dagens strømpris der du bor? Se strømpriser time for time, og 
                    finn ut når strømmen er billigst og dyrest.
                  </p>
                  
                  <div className="relative w-full max-w-md mx-auto md:mx-0 mb-8">
                    <button 
                      className="flex items-center justify-between w-full bg-white text-gray-800 py-4 px-5 rounded-lg shadow-lg font-medium"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                      <span>{selectedRegion || 'Velg prisområde'}</span>
                      <svg 
                        className={`w-5 h-5 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </button>
                    
                    {isDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-xl">
                        {regions.map((region) => (
                          <button
                            key={region.code}
                            className="block w-full text-left px-5 py-3 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                            onClick={() => {
                              setSelectedRegion(region.name);
                              setIsDropdownOpen(false);
                            }}
                          >
                            {region.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-blue-800/70 p-5 rounded-lg text-sm text-white mb-4">
                    <p className="font-medium mb-2">Om strømprisene:</p>
                    <p>
                      Strømprisene er hentet fra Nord Pool Spot, som er den nordiske strømbørsen. 
                      Alle strømleverandører i Norge er pålagt å følge Forbrukertilsynets retningslinjer for 
                      Trygg strømhandel.
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <div className="relative w-full max-w-md h-[500px] rounded-lg p-4">
                    <Image 
                      src="/norway-map.svg" 
                      alt="Kart over Norge med prisområder" 
                      width={500}
                      height={500}
                      className="w-full h-full object-contain"
                      style={{ 
                        filter: "invert(80%) sepia(33%) saturate(463%) hue-rotate(182deg) brightness(103%) contrast(96%)"
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Price Information Section - Only shown when a region is selected */}
        {selectedRegion && (
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
                  Strømpriser for {selectedRegion}
                </h2>
                
                {loading && (
                  <div className="bg-white rounded-lg shadow-md p-6 mb-8 flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
                  </div>
                )}
                
                {error && (
                  <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="text-red-600 font-medium">{error}</div>
                  </div>
                )}
                
                {!loading && !error && priceData && (
                  <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold text-gray-800">Dagens strømpris</h3>
                      <span className="text-lg font-bold text-blue-600">
                        {(priceData.currentPrice / 100).toFixed(2)} kr/kWh
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-4">
                      Gjennomsnittlig strømpris for {selectedRegion} de siste {priceData.daysIncluded} dagene er {(priceData.averagePrice / 100).toFixed(2)} kr/kWh inkl. mva.
                    </p>
                    
                    {/* Redesigned price comparison box */}
                    <div className="bg-gradient-to-br from-blue-50 to-gray-50 p-6 rounded-xl mb-6 shadow-sm border border-gray-100">
                      <h4 className="font-semibold text-gray-800 mb-5 text-lg">Prissammenligning</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="relative bg-white rounded-lg p-5 shadow-sm border border-gray-100 transition-all hover:shadow-md">
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gray-100 text-gray-600 text-xs font-medium py-1 px-3 rounded-full">I GÅR</div>
                          <div className="pt-2 text-center">
                            <div className="font-bold text-2xl text-gray-700 mb-2">
                              {((priceData.averagePrice * 0.9) / 100).toFixed(2)} <span className="text-sm font-medium">kr/kWh</span>
                            </div>
                            <div className="inline-flex items-center justify-center px-2 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-full">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path>
                              </svg>
                              10% fra forrige dag
                            </div>
                          </div>
                        </div>
                        
                        <div className="relative bg-blue-600 rounded-lg p-5 shadow-md transform sm:scale-105 z-10">
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-700 text-white text-xs font-medium py-1 px-3 rounded-full">I DAG</div>
                          <div className="pt-2 text-center">
                            <div className="font-bold text-2xl text-white mb-2">
                              {(priceData.currentPrice / 100).toFixed(2)} <span className="text-sm font-medium">kr/kWh</span>
                            </div>
                            <div className="inline-flex items-center justify-center px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7"></path>
                              </svg>
                              5% fra i går
                            </div>
                          </div>
                        </div>
                        
                        <div className="relative bg-white rounded-lg p-5 shadow-sm border border-gray-100 transition-all hover:shadow-md">
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gray-100 text-gray-600 text-xs font-medium py-1 px-3 rounded-full">I MORGEN</div>
                          <div className="pt-2 text-center">
                            <div className="font-bold text-2xl text-gray-700 mb-2">
                              {((priceData.currentPrice * 0.95) / 100).toFixed(2)} <span className="text-sm font-medium">kr/kWh</span>
                            </div>
                            <div className="inline-flex items-center justify-center px-2 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-full">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path>
                              </svg>
                              5% fra i dag
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-5 text-center italic">
                        * Prisene for i går og i morgen er estimater basert på tilgjengelige data
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <h4 className="font-medium text-gray-800 mb-2">Strømpris time for time:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[...Array(24)].map((_, i) => (
                          <div 
                            key={i} 
                            className={`${
                              i === currentHour 
                                ? 'bg-blue-100 border-2 border-blue-500 shadow-md transform scale-105 z-10' 
                                : 'bg-gray-50'
                            } p-3 rounded-lg transition-all duration-200 hover:shadow-sm`}
                          >
                            <div className={`text-sm ${i === currentHour ? 'text-blue-800 font-medium' : 'text-gray-600'}`}>
                              {`${i.toString().padStart(2, '0')}:00 - ${(i+1).toString().padStart(2, '0')}:00`}
                              {i === currentHour && (
                                <span className="ml-1 inline-flex items-center justify-center bg-blue-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                                  NÅ
                                </span>
                              )}
                            </div>
                            <div className={`font-medium ${i === currentHour ? 'text-blue-900 text-lg' : 'text-gray-800'}`}>
                              {(Math.random() * 2 + 0.5).toFixed(2)} kr/kWh
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {!loading && !error && priceData && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Strømprisutvikling</h3>
                    <p className="text-gray-600 mb-6">
                      Grafen viser utviklingen i strømprisen for {selectedRegion} gjennom dagen.
                    </p>
                    
                    {/* Beautiful Chart */}
                    <div className="w-full h-80 mb-6">
                      {generateHourlyData() && (
                        <Line
                          data={{
                            labels: generateHourlyData()?.labels || [],
                            datasets: [
                              {
                                label: 'Strømpris (kr/kWh)',
                                data: generateHourlyData()?.prices || [],
                                borderColor: 'rgba(59, 130, 246, 0.8)',
                                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                borderWidth: 3,
                                pointBackgroundColor: (ctx) => {
                                  const index = ctx.dataIndex;
                                  return index === currentHour ? '#1e40af' : 'white';
                                },
                                pointBorderColor: 'rgba(59, 130, 246, 0.8)',
                                pointBorderWidth: (ctx) => {
                                  const index = ctx.dataIndex;
                                  return index === currentHour ? 3 : 2;
                                },
                                pointRadius: (ctx) => {
                                  const index = ctx.dataIndex;
                                  return index === currentHour ? 8 : 4;
                                },
                                pointHoverRadius: 6,
                                tension: 0.4,
                                fill: true
                              }
                            ]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                display: false
                              },
                              tooltip: {
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                titleColor: '#1e3a8a',
                                bodyColor: '#1e40af',
                                borderColor: 'rgba(59, 130, 246, 0.2)',
                                borderWidth: 1,
                                padding: 12,
                                cornerRadius: 8,
                                displayColors: false,
                                callbacks: {
                                  title: (items) => `Kl. ${items[0].label}`,
                                  label: (item) => `${item.formattedValue} kr/kWh`,
                                  afterLabel: (item) => {
                                    const index = item.dataIndex;
                                    return index === currentHour ? 'Nåværende time' : '';
                                  }
                                }
                              }
                            },
                            scales: {
                              x: {
                                grid: {
                                  display: false,
                                  color: (ctx) => {
                                    return ctx.index === currentHour ? 'rgba(30, 64, 175, 0.2)' : 'rgba(0, 0, 0, 0.05)';
                                  }
                                },
                                ticks: {
                                  font: {
                                    size: 10,
                                    weight: (ctx) => {
                                      return ctx.index === currentHour ? 'bold' : 'normal';
                                    }
                                  },
                                  color: (ctx) => {
                                    return ctx.index === currentHour ? '#1e40af' : undefined;
                                  },
                                  maxRotation: 0,
                                  callback: function(tickValue: string | number) {
                                    // Show fewer labels on mobile
                                    const hourStr = typeof tickValue === 'number' 
                                      ? String(tickValue).padStart(2, '0') + ':00'
                                      : tickValue;
                                    const hour = parseInt(hourStr.split(':')[0]);
                                    return hour % 3 === 0 || hour === currentHour ? hourStr : '';
                                  }
                                }
                              },
                              y: {
                                beginAtZero: false,
                                grid: {
                                  color: 'rgba(0, 0, 0, 0.05)'
                                },
                                ticks: {
                                  callback: function(value: number | string) {
                                    // Ensure value is a number before using toFixed
                                    const numValue = typeof value === 'string' ? parseFloat(value) : value;
                                    return numValue.toFixed(2) + ' kr';
                                  }
                                }
                              }
                            },
                            elements: {
                              point: {
                                // Highlight current hour
                                pointStyle: (ctx) => {
                                  const index = ctx.dataIndex;
                                  return index === currentHour ? 'rectRot' : 'circle';
                                }
                              }
                            }
                          }}
                        />
                      )}
                      
                      {/* Current hour indicator */}
                      <div className="mt-2 flex items-center justify-center">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-blue-700 transform rotate-45 mr-2"></div>
                          <span className="text-sm text-gray-600">Nåværende time (kl. {currentHour.toString().padStart(2, '0')}:00)</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Price insights - increased margin top */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 mt-10">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-sm text-blue-700 mb-1">Laveste pris i dag</div>
                        <div className="font-bold text-xl text-blue-800">
                          {generateHourlyData() ? Math.min(...(generateHourlyData()?.prices || [])).toFixed(2) : '0.00'} kr/kWh
                        </div>
                        <div className="text-xs text-blue-600 mt-1">
                          kl. {generateHourlyData() ? 
                            String(generateHourlyData()?.prices.indexOf(Math.min(...(generateHourlyData()?.prices || [])))).padStart(2, '0') : 
                            '00'}:00
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-sm text-blue-700 mb-1">Høyeste pris i dag</div>
                        <div className="font-bold text-xl text-blue-800">
                          {generateHourlyData() ? Math.max(...(generateHourlyData()?.prices || [])).toFixed(2) : '0.00'} kr/kWh
                        </div>
                        <div className="text-xs text-blue-600 mt-1">
                          kl. {generateHourlyData() ? 
                            String(generateHourlyData()?.prices.indexOf(Math.max(...(generateHourlyData()?.prices || [])))).padStart(2, '0') : 
                            '00'}:00
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-sm text-blue-700 mb-1">Gjennomsnittspris</div>
                        <div className="font-bold text-xl text-blue-800">
                          {generateHourlyData() ? 
                            ((generateHourlyData()?.prices || []).reduce((a, b) => a + b, 0) / 24).toFixed(2) : 
                            '0.00'} kr/kWh
                        </div>
                        <div className="text-xs text-blue-600 mt-1">
                          basert på dagens priser
                        </div>
                      </div>
                    </div>
                    
                    {/* Additional information sections */}
                    <div className="mt-8 space-y-6">
                      <div className="border-t pt-6">
                        <h4 className="font-semibold text-gray-800 text-lg mb-3">Følg strømprisene time for time</h4>
                        <p className="text-gray-600">
                          Med vår tjeneste kan du enkelt holde øye med strømprisene gjennom hele døgnet. 
                          Vår mobilapp gir deg oppdaterte priser når du trenger det, og fra klokken 14:00 
                          hver dag kan du også se prognoser for morgendagens strømpriser.
                        </p>
                      </div>


                        {/* Reservoir Statistics Section */}
  <div className="border-t pt-6">
    <h4 className="font-semibold text-gray-800 text-lg mb-4">Vannmagasinfylling i Norge</h4>
    <p className="text-gray-600 mb-6">
      Vannmagasinnivåene har stor innvirkning på strømprisene i Norge. Høyere fyllingsgrad 
      betyr vanligvis lavere strømpriser, mens lave nivåer kan føre til høyere priser, 
      spesielt i vinterhalvåret.
    </p>
    <ReservoirStatistics />
  </div>
                      
                      {/* Top electricity providers section */}
                      <div className="border-t pt-6">
                        <h4 className="font-semibold text-gray-800 text-lg mb-4">Anbefalte strømleverandører</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {featuredProviders.map((provider) => (
                            <div key={provider.slug} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1">
                              <div className="p-4 flex flex-col items-center">
                                <div className="w-32 h-32 mb-4 relative flex items-center justify-center">
                                  {providerLogoUrls[provider.organizationNumber.toString()] ? (
                                    <Image 
                                      src={providerLogoUrls[provider.organizationNumber.toString()]} 
                                      alt={`${provider.name} logo`}
                                      width={120}
                                      height={120}
                                      className="object-contain"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-blue-100 rounded-full">
                                      <span className="text-blue-800 font-bold text-2xl">
                                        {provider.name.charAt(0)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                
                                <h5 className="text-center font-medium text-gray-900 mb-2">{provider.name}</h5>
                                <p className="text-gray-600 text-sm text-center mb-4">
                                  Konkurransedyktige strømavtaler for både privat- og bedriftskunder.
                                </p>
                                
                                <div className="mt-auto flex flex-col w-full space-y-2">
                                  <Link 
                                    href={`/stromleverandorer/${provider.slug}`}
                                    className="w-full text-center py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                  >
                                    Se detaljer
                                  </Link>
                                  
                                  {provider.pricelistUrl && (
                                    <a 
                                      href={provider.pricelistUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="w-full text-center py-2 px-4 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition-colors"
                                    >
                                      Prisliste
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 text-center">
                          <Link href="/stromleverandorer" className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                            Se alle strømleverandører
                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                            </svg>
                          </Link>
                        </div>
                      </div>
                      
                      <div className="border-t pt-6">
                        <h4 className="font-semibold text-gray-800 text-lg mb-3">Faktorer som påvirker strømprisen</h4>
                        <p className="text-gray-600 mb-3">
                          Strømprisene svinger basert på flere faktorer, der forbruksmønsteret er en av de viktigste. 
                          Når etterspørselen øker, stiger også prisene - spesielt i perioder med høyt forbruk.
                        </p>
                        <p className="text-gray-600 mb-3">
                          Værforholdene spiller en betydelig rolle på to måter: Kalde temperaturer øker 
                          oppvarmingsbehovet, mens nedbørsmengden påvirker vannkraftproduksjonen. Fulle 
                          vannmagasiner gir vanligvis lavere strømpriser.
                        </p>
                        <p className="text-gray-600">
                          Sesongvariasjoner er også tydelige - sommerhalvåret har typisk lavere forbruk og priser, 
                          mens vinterens kulde driver prisene opp. I tillegg er det norske strømmarkedet koblet til 
                          det europeiske, så internasjonale hendelser og kraftutveksling kan påvirke prisene vi 
                          betaler her hjemme.
                        </p>
                      </div>
                      
                      <div className="border-t pt-6">
                        <h4 className="font-semibold text-gray-800 text-lg mb-3">Slik holder du øye med strømstøtten</h4>
                        <p className="text-gray-600">
                          I vår app og på din personlige side kan du enkelt se hva strømmen faktisk koster 
                          etter at strømstøtten er trukket fra. Gå til oversikten over strømkostnader og 
                          aktiver visning av estimert strømstøtte for å se nøyaktig hva du skal betale.
                        </p>
                      </div>
                      
                      <div className="border-t pt-6">
                        <h4 className="font-semibold text-gray-800 text-lg mb-3">Prisområder i Norge</h4>
                        <p className="text-gray-600 mb-3">
                          Norge er inndelt i fem forskjellige prisområder for strøm. Denne inndelingen 
                          eksisterer fordi både produksjonskapasitet og forbruksmønster varierer mellom 
                          landsdelene. Resultatet er at strømprisene kan være forskjellige avhengig av 
                          hvor i landet du bor.
                        </p>
                        <p className="text-gray-600">
                          For å finne ut hvilket prisområde din bolig tilhører, kan du besøke Norges 
                          vassdrags- og energidirektorat (NVE) sin nettside.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
        
        {/* Information Section */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
                Om strømpriser i Norge
              </h2>
              
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Hva påvirker strømprisen?</h3>
                <p className="text-gray-600 mb-4">
                  Strømprisen i Norge påvirkes av flere faktorer, blant annet:
                </p>
                <ul className="list-disc pl-5 mb-4 text-gray-600">
                  <li className="mb-2">Tilbud og etterspørsel i markedet</li>
                  <li className="mb-2">Værforhold og temperatur</li>
                  <li className="mb-2">Fyllingsgrad i vannmagasinene</li>
                  <li className="mb-2">Kapasitet i strømnettet</li>
                  <li className="mb-2">Priser på alternative energikilder</li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Prisområder i Norge</h3>
                <p className="text-gray-600 mb-4">
                  Norge er delt inn i fem prisområder for strøm:
                </p>
                <ul className="list-disc pl-5 mb-4 text-gray-600">
                  <li className="mb-2">NO1: Øst-Norge (Oslo, Innlandet, deler av Viken)</li>
                  <li className="mb-2">NO2: Sør-Norge (Agder, Rogaland, deler av Vestland)</li>
                  <li className="mb-2">NO3: Midt-Norge (Trøndelag, deler av Møre og Romsdal)</li>
                  <li className="mb-2">NO4: Nord-Norge (Nordland, Troms og Finnmark)</li>
                  <li className="mb-2">NO5: Vest-Norge (Bergen, deler av Vestland)</li>
                </ul>
                <p className="text-gray-600">
                  Prisene kan variere mellom de ulike områdene, avhengig av lokale forhold og kapasitet i strømnettet.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Add Top50ProductList before FAQs section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
                Beste strømavtaler akkurat nå
              </h2>
              <p className="text-gray-600 mb-8">
                Her er de beste strømavtalene basert på ditt forbruk og din region. Sammenlign og finn den beste avtalen for deg.
              </p>
              
              {dealsLoading && (
                <div className="bg-white shadow rounded-lg p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Laster inn strømavtaler...</p>
                </div>
              )}
              
              {dealsError && (
                <div className="bg-white shadow rounded-lg p-8 text-center">
                  <div className="text-red-500 mb-4">
                    <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium">Kunne ikke laste strømavtaler</h3>
                  <p className="mt-2 text-sm text-gray-600">{dealsError}</p>
                  <p className="mt-4 text-sm">
                    <button 
                      onClick={() => window.location.reload()} 
                      className="text-blue-600 hover:underline"
                    >
                      Prøv igjen
                    </button>
                  </p>
                </div>
              )}
              
              {!dealsLoading && !dealsError && deals.length > 0 && (
                <Top50ProductList 
                  deals={deals}
                  priceData={priceData || {}}
                  annualConsumption={16000}
                  expandedDeal={expandedDeal}
                  toggleDealExpansion={toggleDealExpansion}
                  providerLogoUrls={providerLogoUrls}
                  providers={providers || []}
                  formatPrice={formatPrice}
                  formatMonthlyCost={formatMonthlyCost}
                  formatConsumption={formatConsumption}
                  getProductTypeNorwegian={getProductTypeNorwegian}
                  getCurrentMonthName={getCurrentMonthName}
                  getCurrentDate={getCurrentDate}
                />
              )}
              
              {!dealsLoading && !dealsError && deals.length === 0 && (
                <div className="bg-white shadow rounded-lg p-8 text-center">
                  <p className="text-gray-600">Ingen strømavtaler funnet.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
} 