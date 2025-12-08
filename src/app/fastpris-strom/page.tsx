'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  calculateEnhancedMonthlyCost, 
  getPriceBreakdown,
  MONTHLY_CONSUMPTION_DISTRIBUTION
} from '@/utils/electricityPrices';
import { fieldOptions } from '@/utils/electricityFields';
import providerLogoUrls from '../data/providerLogoUrls';
import MultiStepForm from '@/components/MultiStepForm';
import Top50ProductList from '@/components/Top50ProductList';

// Helper function to create a slug
function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .trim();
}

// Custom hook for provider data with caching
function useProviderData() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        // Check if we have cached data and if it's from today
        const cachedData = localStorage.getItem('providerData');
        const cachedTimestamp = localStorage.getItem('providerDataTimestamp');
        const today = new Date().toDateString();
        
        // Use cached data if it exists and is from today
        if (cachedData && cachedTimestamp === today) {
          console.log('🔄 Using cached provider data from localStorage');
          setProviders(JSON.parse(cachedData));
          setLoading(false);
          return;
        }
        
        // Otherwise fetch fresh data
        console.log('📡 Fetching fresh provider data from API');
        const response = await fetch('/api/providers');
        if (!response.ok) {
          throw new Error('Failed to fetch providers');
        }
        
        const data = await response.json();
        if (data.success && data.data) {
          console.log('💾 Caching provider data to localStorage');
          // Cache the data with today's timestamp
          localStorage.setItem('providerData', JSON.stringify(data.data));
          localStorage.setItem('providerDataTimestamp', today);
          
          setProviders(data.data);
        } else {
          throw new Error(data.error || 'Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching providers:', err);
        setError('Kunne ikke hente strømleverandører.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProviders();
  }, []);

  return { providers, loading, error };
}

export default function FastprisStromPage() {
  const [deals, setDeals] = useState([]);
  const [priceData, setPriceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedDeal, setExpandedDeal] = useState(null);
  const [annualConsumption, setAnnualConsumption] = useState(16000);
  const [isDragging, setIsDragging] = useState(false);
  
  // Format price to Norwegian format with 2 decimals
  const formatPrice = (price) => {
    return (price * 100).toFixed(2).replace('.', ',');
  };
  
  // Format monthly cost to Norwegian format
  const formatMonthlyCost = (cost) => {
    return Math.round(cost).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };
  
  // Format consumption to Norwegian format
  const formatConsumption = (consumption) => {
    return Math.round(consumption).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };
  
  // Get product type in Norwegian
  const getProductTypeNorwegian = (type) => {
    return fieldOptions.productType[type] || type;
  };
  
  // Get current date in Norwegian format
  const getCurrentDate = () => {
    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth();
    const year = now.getFullYear();
    
    const months = [
      'januar', 'februar', 'mars', 'april', 'mai', 'juni',
      'juli', 'august', 'september', 'oktober', 'november', 'desember'
    ];
    
    return `${day}. ${months[month]} ${year}`;
  };

  // Function to get the current month name in Norwegian
  const getCurrentMonthName = () => {
    const months = [
      'januar', 'februar', 'mars', 'april', 'mai', 'juni',
      'juli', 'august', 'september', 'oktober', 'november', 'desember'
    ];
    const currentMonth = new Date().getMonth(); // 0-indexed
    return months[currentMonth];
  };

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Fetch all deals
        const dealsResponse = await fetch('/api/electricity-deals');
        const dealsResult = await dealsResponse.json();
        
        // Fetch price data
        const priceResponse = await fetch('/api/electricity-prices');
        const priceResult = await priceResponse.json();
        
        if (dealsResult.success && dealsResult.data && priceResult.success && priceResult.data) {
          // Process deals data
          const processedDeals = dealsResult.data.products.map(deal => {
            // Calculate monthly cost
            const monthlyConsumption = annualConsumption / 12;
            const calculatedMonthlyPrice = calculateEnhancedMonthlyCost(
              deal,
              annualConsumption,
              priceResult.data.nationalAverage || 0
            );
            
            return {
              ...deal,
              calculatedMonthlyPrice
            };
          });
          
          setDeals(processedDeals);
          setPriceData(priceResult.data);
        } else {
          throw new Error('Failed to fetch data');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [annualConsumption]);

  // Toggle expanded deal
  const toggleDealExpansion = (dealId) => {
    if (expandedDeal === dealId) {
      setExpandedDeal(null);
    } else {
      setExpandedDeal(dealId);
    }
  };

  // Calculate average price for a list of deals
  const calculateAveragePrice = (deals) => {
    if (!deals || deals.length === 0 || !priceData) return 0;
    
    const totalPrice = deals.reduce((sum, deal) => {
      const dealPrice = priceData.nationalAverage + (deal.addonPrice || 0);
      return sum + dealPrice;
    }, 0);
    
    return totalPrice / deals.length;
  };

  // Calculate average monthly price for a list of deals
  const calculateAverageMonthlyPrice = (deals) => {
    if (!deals || deals.length === 0) return 0;
    
    const totalMonthlyPrice = deals.reduce((sum, deal) => {
      return sum + deal.calculatedMonthlyPrice;
    }, 0);
    
    return totalMonthlyPrice / deals.length;
  };

  // Get price difference percentage
  const getPriceDifferencePercentage = (fixedPrice, spotPrice) => {
    if (spotPrice === 0) return 0;
    return ((fixedPrice - spotPrice) / spotPrice) * 100;
  };

  // Get recommendation based on price difference
  const getRecommendation = (fixedPrice, spotPrice) => {
    const difference = getPriceDifferencePercentage(fixedPrice, spotPrice);
    
    if (difference > 15) {
      return {
        recommended: 'spot',
        reason: 'Spotpris er betydelig billigere akkurat nå',
        confidence: 'high'
      };
    } else if (difference > 5) {
      return {
        recommended: 'spot',
        reason: 'Spotpris er litt billigere akkurat nå',
        confidence: 'medium'
      };
    } else if (difference < -15) {
      return {
        recommended: 'fixed',
        reason: 'Fastpris er betydelig billigere akkurat nå',
        confidence: 'high'
      };
    } else if (difference < -5) {
      return {
        recommended: 'fixed',
        reason: 'Fastpris er litt billigere akkurat nå',
        confidence: 'medium'
      };
    } else {
      return {
        recommended: 'either',
        reason: 'Prisforskjellen er minimal akkurat nå',
        confidence: 'low'
      };
    }
  };

  // Add these handlers for the slider
  const handleSliderStart = () => setIsDragging(true);
  const handleSliderEnd = () => {
    // Add a small delay to ensure calculations are complete before showing the values
    setTimeout(() => setIsDragging(false), 100);
  };

  // Use the custom hook to get provider data
  const { providers } = useProviderData();
  
  // Function to get provider logo URL
  const getProviderLogoUrl = (organizationNumber) => {
    // First check if we have the logo in our static mapping
    if (organizationNumber && providerLogoUrls[organizationNumber]) {
      return providerLogoUrls[organizationNumber];
    }
    
    // Fall back to the provider data from API if available
    if (providers && providers.length > 0) {
      const provider = providers.find(p => p.organizationNumber === organizationNumber);
      return provider?.logoUrl || null;
    }
    
    return null;
  };

  // Function to get provider slug using the cached providers data
  const getProviderSlug = (organizationNumber, name) => {
    if (!providers || providers.length === 0) {
      return createSlug(name || '');
    }
    
    const provider = providers.find(p => p.organizationNumber === organizationNumber);
    return provider?.slug || createSlug(name || '');
  };

  // Filter deals to only include fixed price products
  const fixedPriceDeals = deals.filter(deal => deal.productType === 'fixed');

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
          <div className="absolute inset-0 z-0">
            <Image 
              src="/bg-img.jpg"
              alt="Background"
              fill
              className="object-cover opacity-30"
              priority
            />
            <div className="absolute inset-0 bg-black opacity-50"></div>
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-5 gap-12 items-center">
                <div className="text-center md:text-left md:col-span-3">
                  <h1 className="text-4xl md:text-5xl font-bold mb-6">
                    Finn beste og billigste fastpris strøm ({getCurrentMonthName()} {new Date().getFullYear()})
                  </h1>
                  <p className="text-xl mb-8">
                    Sammenlign fastprisavtaler og finn den beste strømavtalen for deg.
                  </p>
                  
                  <div className="flex flex-col md:flex-row gap-4 mb-8 justify-center md:justify-start">
                    <div className="flex items-center justify-center md:justify-start">
                      <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span className="text-white text-sm md:text-base">Helt gratis!</span>
                    </div>
                    <div className="flex items-center justify-center md:justify-start">
                      <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span className="text-white text-sm md:text-base">Du sparer penger på strøm!</span>
                    </div>
                  </div>
                  
                  <button 
                    className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold py-4 px-8 rounded-full text-lg shadow-lg transform transition hover:scale-105 md:hidden"
                    onClick={() => {
                      const formElement = document.getElementById('form-section');
                      formElement?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Få gratis tilbud nå
                  </button>
                </div>
                
                <div className="bg-white rounded-xl shadow-xl md:col-span-2">
                  <MultiStepForm />
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Fixed Price Deals Section */}
        <div className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">
                Billigste fastpris strøm i Norge
              </h2>
              
              <p className="text-gray-600 mb-8 text-center">
                Her er de billigste fastprisavtalene på strøm i Norge per {getCurrentDate()}. 
                Prisene er basert på et årlig forbruk på {formatConsumption(annualConsumption)} kWh.
              </p>
              
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">Laster inn strømavtaler...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-600">Det oppstod en feil: {error}</p>
                </div>
              ) : (
                <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
                  <Top50ProductList 
                    deals={fixedPriceDeals} 
                    priceData={priceData}
                    annualConsumption={annualConsumption}
                    expandedDeal={expandedDeal}
                    toggleDealExpansion={toggleDealExpansion}
                    providerLogoUrls={providerLogoUrls}
                    providers={providers}
                    formatPrice={formatPrice}
                    formatMonthlyCost={formatMonthlyCost}
                    formatConsumption={formatConsumption}
                    getProductTypeNorwegian={getProductTypeNorwegian}
                    getCurrentMonthName={getCurrentMonthName}
                    getCurrentDate={getCurrentDate}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Spot vs Fixed Price Comparison Section */}
        <div className="py-16 bg-gradient-to-b from-blue-50 to-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
                  Fastpris vs. Spotpris: Hva lønner seg nå?
                </h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  Basert på dagens strømpriser og historiske data – hvilken avtaleform gir deg mest for pengene?
                </p>
              </div>
              
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">Laster inn sammenligningsdata...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-600">Det oppstod en feil: {error}</p>
                </div>
              ) : (
                <>
                  {/* Current Price Comparison */}
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-12">
                    <div className="bg-blue-600 text-white p-4">
                      <h3 className="text-xl font-semibold">Prissammenligning per {getCurrentDate()}</h3>
                    </div>
                    
                    <div className="p-6">
                      <div className="grid md:grid-cols-2 gap-8">
                        {/* Fixed Price Column */}
                        <div className="relative">
                          <div className="absolute -top-6 right-0 bg-blue-100 text-blue-800 px-4 py-1 rounded-full text-sm font-medium">
                            {priceData && deals.filter(d => d.productType === 'fixed').length > 0 && 
                             deals.filter(d => d.productType === 'hourly_spot').length > 0 && 
                             calculateAveragePrice(deals.filter(d => d.productType === 'fixed').slice(0, 5)) < 
                             calculateAveragePrice(deals.filter(d => d.productType === 'hourly_spot').slice(0, 5)) 
                             ? 'Billigst nå' : ''}
                          </div>
                          
                          <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                              </svg>
                            </div>
                            <h4 className="text-xl font-bold text-gray-800">Fastpris</h4>
                            <p className="text-gray-600">Forutsigbar pris i hele avtaleperioden</p>
                          </div>
                          
                          {deals.filter(d => d.productType === 'fixed').length > 0 ? (
                            <>
                              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                                <div className="text-center">
                                  <span className="text-4xl font-bold text-blue-800">
                                    {formatPrice(calculateAveragePrice(deals.filter(d => d.productType === 'fixed').slice(0, 5)))}
                                  </span>
                                  <span className="text-xl text-blue-800 ml-1">øre/kWh</span>
                                  <p className="text-sm text-blue-600 mt-1">Gjennomsnittlig pris for topp 5 fastprisavtaler</p>
                                </div>
                              </div>
                              
                              <ul className="space-y-3">
                                {deals.filter(d => d.productType === 'fixed')
                                  .sort((a, b) => a.calculatedMonthlyPrice - b.calculatedMonthlyPrice)
                                  .slice(0, 5)
                                  .map((deal, index) => (
                                    <li key={deal.id} className="flex justify-between items-center border-b pb-2">
                                      <span className="font-medium">{index + 1}. {deal.name}</span>
                                      <span className="text-blue-600 font-semibold">
                                        {priceData ? formatPrice(priceData.nationalAverage + (deal.addonPrice || 0)) : '-'} øre
                                      </span>
                                    </li>
                                  ))
                                }
                              </ul>
                            </>
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              Ingen fastprisavtaler tilgjengelig
                            </div>
                          )}
                        </div>

                        {/* Spot Price Column */}
                        <div className="relative">
                          <div className="absolute -top-6 right-0 bg-green-100 text-green-800 px-4 py-1 rounded-full text-sm font-medium">
                            {priceData && deals.filter(d => d.productType === 'fixed').length > 0 && 
                             deals.filter(d => d.productType === 'hourly_spot').length > 0 && 
                             calculateAveragePrice(deals.filter(d => d.productType === 'hourly_spot').slice(0, 5)) < 
                             calculateAveragePrice(deals.filter(d => d.productType === 'fixed').slice(0, 5)) 
                             ? 'Billigst nå' : ''}
                          </div>
                          
                          <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                              </svg>
                            </div>
                            <h4 className="text-xl font-bold text-gray-800">Spotpris</h4>
                            <p className="text-gray-600">Følger markedets svingninger time for time</p>
                          </div>
                          
                          {deals.filter(d => d.productType === 'hourly_spot').length > 0 ? (
                            <>
                              <div className="bg-green-50 rounded-lg p-4 mb-6">
                                <div className="text-center">
                                  <span className="text-4xl font-bold text-green-800">
                                    {formatPrice(calculateAveragePrice(deals.filter(d => d.productType === 'hourly_spot').slice(0, 5)))}
                                  </span>
                                  <span className="text-xl text-green-800 ml-1">øre/kWh</span>
                                  <p className="text-sm text-green-600 mt-1">Gjennomsnittlig pris for topp 5 spotprisavtaler</p>
                                </div>
                              </div>
                              
                              <ul className="space-y-3">
                                {deals.filter(d => d.productType === 'hourly_spot')
                                  .sort((a, b) => a.calculatedMonthlyPrice - b.calculatedMonthlyPrice)
                                  .slice(0, 5)
                                  .map((deal, index) => (
                                    <li key={deal.id} className="flex justify-between items-center border-b pb-2">
                                      <span className="font-medium">{index + 1}. {deal.name}</span>
                                      <span className="text-green-600 font-semibold">
                                        {priceData ? formatPrice(priceData.nationalAverage + (deal.addonPrice || 0)) : '-'} øre
                                      </span>
                                    </li>
                                  ))
                                }
                              </ul>
                            </>
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              Ingen spotprisavtaler tilgjengelig
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Price Difference Highlight */}
                  {priceData && deals.filter(d => d.productType === 'fixed').length > 0 && 
                   deals.filter(d => d.productType === 'hourly_spot').length > 0 && (
                    <div className="col-span-1 md:col-span-2 mt-8 border-t pt-8">
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">Vår anbefaling</h4>
                        
                        {(() => {
                          const fixedAvgPrice = calculateAveragePrice(deals.filter(d => d.productType === 'fixed').slice(0, 5));
                          const spotAvgPrice = calculateAveragePrice(deals.filter(d => d.productType === 'hourly_spot').slice(0, 5));
                          const priceDiff = fixedAvgPrice - spotAvgPrice;
                          const priceDiffPercentage = getPriceDifferencePercentage(fixedAvgPrice, spotAvgPrice);
                          const recommendation = getRecommendation(fixedAvgPrice, spotAvgPrice);
                          
                          return (
                            <div className="flex flex-col md:flex-row items-center">
                              <div className="flex-1">
                                <p className="mb-2">
                                  Akkurat nå er <span className="font-semibold">
                                    {priceDiff > 0 ? 'spotpris' : priceDiff < 0 ? 'fastpris' : 'begge avtaletyper'}
                                  </span> mest lønnsomt.
                                </p>
                                
                                <p className="mb-4">
                                  Fastpris er {Math.abs(priceDiffPercentage).toFixed(1)}% 
                                  {priceDiff > 0 ? ' dyrere ' : ' billigere '} 
                                  enn spotpris per {getCurrentDate()}.
                                </p>
                                
                                <div className={`p-4 rounded-lg ${
                                  recommendation.recommended === 'spot' ? 'bg-green-100 text-green-800' : 
                                  recommendation.recommended === 'fixed' ? 'bg-blue-100 text-blue-800' : 
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  <div className="flex items-start">
                                    <svg className="w-6 h-6 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    <div>
                                      <p className="font-medium">Vår anbefaling: {
                                        recommendation.recommended === 'spot' ? 'Velg spotpris' : 
                                        recommendation.recommended === 'fixed' ? 'Velg fastpris' : 
                                        'Begge avtaletyper er gunstige'
                                      }</p>
                                      <p className="text-sm mt-1">{recommendation.reason}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="mt-6 md:mt-0 md:ml-8 flex-shrink-0">
                                <div className="relative w-48 h-48">
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                      <div className="text-2xl font-bold">
                                        {formatPrice(Math.abs(priceDiff))} øre
                                      </div>
                                      <div className="text-sm">Prisforskjell per kWh</div>
                                    </div>
                                  </div>
                                  <svg className="w-full h-full" viewBox="0 0 100 100">
                                    <circle 
                                      cx="50" cy="50" r="45" 
                                      fill="none" 
                                      stroke="#e5e7eb" 
                                      strokeWidth="10"
                                    />
                                    <circle 
                                      cx="50" cy="50" r="45" 
                                      fill="none" 
                                      stroke={priceDiff > 0 ? "#10b981" : "#3b82f6"} 
                                      strokeWidth="10"
                                      strokeDasharray={`${Math.min(Math.abs(priceDiffPercentage) * 2.5, 283)} 283`}
                                      strokeDashoffset="0" 
                                      transform="rotate(-90 50 50)"
                                    />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Personalized Calculator */}
        <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden mb-12">
          <div className="bg-teal-600 text-white p-4">
            <h3 className="text-xl font-semibold">Personlig prissammenligning</h3>
          </div>
          
          <div className="p-6">
            <div className="mb-6">
              <label htmlFor="consumption" className="block text-sm font-medium text-gray-700 mb-2">
                Ditt årlige strømforbruk (kWh)
              </label>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center">
                  <input
                    type="range"
                    id="consumption"
                    min="5000"
                    max="30000"
                    step="1000"
                    value={annualConsumption}
                    onChange={(e) => setAnnualConsumption(parseInt(e.target.value))}
                    onMouseDown={handleSliderStart}
                    onMouseUp={handleSliderEnd}
                    onTouchStart={handleSliderStart}
                    onTouchEnd={handleSliderEnd}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer relative z-10"
                    style={{
                      background: `linear-gradient(to right, #10b981 0%, #10b981 ${((annualConsumption - 5000) / 25000) * 100}%, #e5e7eb ${((annualConsumption - 5000) / 25000) * 100}%, #e5e7eb 100%)`,
                      height: '8px'
                    }}
                  />
                  <span className="ml-4 min-w-[100px] text-center font-medium">
                    {formatConsumption(annualConsumption)} kWh
                  </span>
                </div>
                <div className="flex justify-between px-1 text-xs text-gray-500">
                  <span>5 000</span>
                  <span>10 000</span>
                  <span>15 000</span>
                  <span>20 000</span>
                  <span>25 000</span>
                  <span>30 000</span>
                </div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-blue-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-blue-800 mb-4 text-center">Fastpris</h4>
                
                {deals.filter(d => d.productType === 'fixed').length > 0 ? (
                  <>
                    <div className="text-center mb-6">
                      {isDragging ? (
                        <div className="inline-block bg-gray-200 animate-pulse h-10 w-24 rounded"></div>
                      ) : (
                        <>
                          <span className="text-3xl font-bold text-blue-800">
                            {formatMonthlyCost(calculateAverageMonthlyPrice(deals.filter(d => d.productType === 'fixed').slice(0, 5)))}
                          </span>
                          <span className="text-xl text-blue-800 ml-1">kr/mnd</span>
                        </>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Årlig kostnad:</span>
                        {isDragging ? (
                          <div className="bg-gray-200 animate-pulse h-5 w-20 rounded"></div>
                        ) : (
                          <span className="font-medium">
                            {formatMonthlyCost(calculateAverageMonthlyPrice(deals.filter(d => d.productType === 'fixed').slice(0, 5)) * 12)} kr
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Gjennomsnittlig kWh-pris:</span>
                        {isDragging ? (
                          <div className="bg-gray-200 animate-pulse h-5 w-16 rounded"></div>
                        ) : (
                          <span className="font-medium">
                            {formatPrice(calculateAveragePrice(deals.filter(d => d.productType === 'fixed').slice(0, 5)))} øre
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Forutsigbarhet:</span>
                        <span className="font-medium text-green-600">Høy</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Ingen fastprisavtaler tilgjengelig
                  </div>
                )}
              </div>
              
              <div className="bg-green-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-green-800 mb-4 text-center">Spotpris</h4>
                
                {deals.filter(d => d.productType === 'hourly_spot').length > 0 ? (
                  <>
                    <div className="text-center mb-6">
                      {isDragging ? (
                        <div className="inline-block bg-gray-200 animate-pulse h-10 w-24 rounded"></div>
                      ) : (
                        <>
                          <span className="text-3xl font-bold text-green-800">
                            {formatMonthlyCost(calculateAverageMonthlyPrice(deals.filter(d => d.productType === 'hourly_spot').slice(0, 5)))}
                          </span>
                          <span className="text-xl text-green-800 ml-1">kr/mnd</span>
                        </>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Årlig kostnad:</span>
                        {isDragging ? (
                          <div className="bg-gray-200 animate-pulse h-5 w-20 rounded"></div>
                        ) : (
                          <span className="font-medium">
                            {formatMonthlyCost(calculateAverageMonthlyPrice(deals.filter(d => d.productType === 'hourly_spot').slice(0, 5)) * 12)} kr
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Gjennomsnittlig kWh-pris:</span>
                        {isDragging ? (
                          <div className="bg-gray-200 animate-pulse h-5 w-16 rounded"></div>
                        ) : (
                          <span className="font-medium">
                            {formatPrice(calculateAveragePrice(deals.filter(d => d.productType === 'hourly_spot').slice(0, 5)))} øre
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Forutsigbarhet:</span>
                        <span className="font-medium text-yellow-600">Middels</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Ingen spotprisavtaler tilgjengelig
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-4">
                Basert på ditt forbruk på {formatConsumption(annualConsumption)} kWh/år, kan du spare ca. 
                {isDragging ? (
                  <span className="inline-block bg-gray-200 animate-pulse h-7 w-20 rounded mx-1"></span>
                ) : (
                  <span className="font-bold text-lg mx-1">
                    {formatMonthlyCost(Math.abs(
                      calculateAverageMonthlyPrice(deals.filter(d => d.productType === 'fixed').slice(0, 5)) - 
                      calculateAverageMonthlyPrice(deals.filter(d => d.productType === 'hourly_spot').slice(0, 5))
                    ) * 12)}
                  </span>
                )}
                kr per år ved å velge 
                {!isDragging && (
                  calculateAverageMonthlyPrice(deals.filter(d => d.productType === 'hourly_spot').slice(0, 5)) < 
                  calculateAverageMonthlyPrice(deals.filter(d => d.productType === 'fixed').slice(0, 5)) 
                  ? ' spotpris' : ' fastpris'
                )}
                {isDragging ? (
                  <span className="inline-block bg-gray-200 animate-pulse h-5 w-16 rounded mx-1"></span>
                ) : (
                  ' akkurat nå.'
                )}
              </p>
              
              <div className="flex justify-center space-x-4">
                <Link 
                  href="/spotpris" 
                  className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors duration-300"
                >
                  Se spotprisavtaler
                </Link>
                <Link 
                  href="/fastpris-strom" 
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-300"
                >
                  Se fastprisavtaler
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Pros and Cons Section */}
        <div className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
                Fordeler & ulemper med fastpris strøm
              </h2>

              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <svg className="h-6 w-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Fordeler
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex">
                      <svg className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span className="text-gray-600">
                        Med en fastprisavtale på strøm, vil du ha en fast pris for strømmen din gjennom avtaleperioden. Dette kan gjøre det enklere for deg å planlegge budsjettet ditt og unngå overraskelser på strømregningen.
                      </span>
                    </li>
                    <li className="flex">
                      <svg className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span className="text-gray-600">
                        Fastprisavtaler kan være en god måte å beskytte seg mot prisøkninger på strøm i perioder med høy etterspørsel. Dette kan gi deg trygghet i tider med usikkerhet rundt strømprisene.
                      </span>
                    </li>
                    <li className="flex">
                      <svg className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span className="text-gray-600">
                        Med en fastprisavtale trenger du ikke bekymre deg for endringer i ditt eget strømforbruk, da prisen vil være fast uavhengig av hvor mye strøm du bruker.
                      </span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <svg className="h-6 w-6 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Ulemper
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex">
                      <svg className="h-6 w-6 text-red-500 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                      <span className="text-gray-600">
                        Fastprisavtaler på strøm kan være dyrere enn variable priser i perioder med lav etterspørsel, og du kan betale mer for strømmen din enn nødvendig.
                      </span>
                    </li>
                    <li className="flex">
                      <svg className="h-6 w-6 text-red-500 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                      <span className="text-gray-600">
                        Hvis du velger en fastprisavtale, kan du gå glipp av muligheten til å dra nytte av fallende strømpriser i perioder med lav etterspørsel.
                      </span>
                    </li>
                    <li className="flex">
                      <svg className="h-6 w-6 text-red-500 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                      <span className="text-gray-600">
                        Fastprisavtaler kan ha en lengre bindingstid enn variable avtaler, og du kan bli belastet med gebyrer hvis du ønsker å avslutte avtalen før utløpsdatoen.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg overflow-hidden mb-8">
                <div className="relative h-[300px] w-full">
                  <Image
                    src="/compare.png"
                    alt="Sammenligning av strømpriser"
                    fill
                    style={{ objectFit: 'cover', objectPosition: 'center' }}
                    className="rounded-lg"
                    priority
                  />
                </div>
              </div>
              
              <div className="text-center mb-12">
                <Link 
                  href="/tilbud" 
                  className="inline-block bg-blue-600 text-white font-bold py-4 px-12 rounded-lg text-lg hover:bg-blue-700 transition-colors duration-300 shadow-md"
                >
                  Finn beste fastprisavtale nå
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-10 text-center">
                Spørsmål og svar om fastpris strøm
              </h2>
              
              <div className="grid md:grid-cols-2 gap-x-12 gap-y-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* FAQ Item 1 */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <details className="group">
                      <summary className="flex items-center justify-between p-4 bg-white cursor-pointer">
                        <h3 className="text-lg font-medium text-gray-800">Hva er fastpris strøm?</h3>
                        <span className="relative ml-2 flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 transform transition-transform duration-300 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </span>
                      </summary>
                      <div className="p-4 pt-0 border-t border-gray-100 bg-gray-50 animate-[fadeIn_0.3s_ease-in-out]">
                        <p className="text-gray-600">
                          Fastpris strøm er en avtale hvor du betaler en fast pris per kilowattime (kWh) for strømmen du bruker i en avtalt periode, 
                          vanligvis 1-3 år. Dette betyr at strømprisen din ikke endres selv om markedsprisen på strøm går opp eller ned. 
                          Fastprisavtaler gir forutsigbarhet i strømutgiftene dine og beskytter deg mot prisøkninger i perioder med høye strømpriser.
                        </p>
                      </div>
                    </details>
                  </div>
                  
                  {/* FAQ Item 2 */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <details className="group">
                      <summary className="flex items-center justify-between p-4 bg-white cursor-pointer">
                        <h3 className="text-lg font-medium text-gray-800">Hvordan skiller fastpris seg fra spotpris?</h3>
                        <span className="relative ml-2 flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 transform transition-transform duration-300 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </span>
                      </summary>
                      <div className="p-4 pt-0 border-t border-gray-100 bg-gray-50 animate-[fadeIn_0.3s_ease-in-out]">
                        <p className="text-gray-600">
                          Mens fastpris gir deg en forutsigbar pris gjennom hele avtaleperioden, følger spotpris de løpende prisene i strømmarkedet. 
                          Med spotpris betaler du den faktiske markedsprisen time for time, pluss et påslag til strømleverandøren. 
                          Spotpris kan være billigere i perioder med lave strømpriser, men kan også føre til høyere regninger når strømprisene stiger. 
                          Fastpris gir deg derimot beskyttelse mot prissvingninger og gjør det enklere å budsjettere strømutgiftene dine.
                        </p>
                      </div>
                    </details>
                  </div>
                  
                  {/* FAQ Item 3 */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <details className="group">
                      <summary className="flex items-center justify-between p-4 bg-white cursor-pointer">
                        <h3 className="text-lg font-medium text-gray-800">Hvor lenge varer en fastprisavtale?</h3>
                        <span className="relative ml-2 flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 transform transition-transform duration-300 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </span>
                      </summary>
                      <div className="p-4 pt-0 border-t border-gray-100 bg-gray-50 animate-[fadeIn_0.3s_ease-in-out]">
                        <p className="text-gray-600">
                          Fastprisavtaler tilbys vanligvis med bindingstid på 1, 2 eller 3 år. Noen leverandører kan også tilby kortere perioder som 6 måneder, 
                          eller lengre perioder opp til 5 år. Jo lengre bindingstid, jo større risiko tar strømleverandøren, noe som kan påvirke prisen du får tilbud om. 
                          Det er viktig å vurdere hvor lenge du ønsker å binde deg, da dette ofte påløper gebyrer hvis du ønsker å avslutte avtalen før bindingstiden er utløpt.
                        </p>
                      </div>
                    </details>
                  </div>
                  
                  {/* FAQ Item 4 */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <details className="group">
                      <summary className="flex items-center justify-between p-4 bg-white cursor-pointer">
                        <h3 className="text-lg font-medium text-gray-800">Kan jeg bryte en fastprisavtale før tiden?</h3>
                        <span className="relative ml-2 flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 transform transition-transform duration-300 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </span>
                      </summary>
                      <div className="p-4 pt-0 border-t border-gray-100 bg-gray-50 animate-[fadeIn_0.3s_ease-in-out]">
                        <p className="text-gray-600">
                          Ja, du kan vanligvis bryte en fastprisavtale før bindingstiden er utløpt, men det medfører ofte et bruddgebyr. 
                          Dette gebyret er ment å dekke strømleverandørens tap ved at du avslutter avtalen tidlig. Størrelsen på gebyret 
                          varierer mellom leverandører og kan avhenge av hvor lenge det er igjen av bindingstiden. Noen leverandører beregner 
                          gebyret basert på ditt forventede forbruk i den gjenværende perioden. Det er viktig å lese vilkårene nøye før du 
                          inngår en fastprisavtale, slik at du vet hva det vil koste å avslutte avtalen tidlig.
                        </p>
                      </div>
                    </details>
                  </div>
                  
                  {/* FAQ Item 5 */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <details className="group">
                      <summary className="flex items-center justify-between p-4 bg-white cursor-pointer">
                        <h3 className="text-lg font-medium text-gray-800">Hva skjer når fastprisavtalen min utløper?</h3>
                        <span className="relative ml-2 flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 transform transition-transform duration-300 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </span>
                      </summary>
                      <div className="p-4 pt-0 border-t border-gray-100 bg-gray-50 animate-[fadeIn_0.3s_ease-in-out]">
                        <p className="text-gray-600">
                          Når fastprisavtalen din utløper, vil strømleverandøren vanligvis overføre deg til en annen avtale, ofte en variabel 
                          prisavtale eller spotprisavtale, hvis du ikke aktivt velger noe annet. De fleste leverandører vil kontakte deg før 
                          utløpet av avtalen for å informere om alternativer. Dette er et godt tidspunkt å vurdere om du ønsker å fornye fastprisavtalen, 
                          bytte til en annen type avtale, eller kanskje bytte leverandør. Det er lurt å sammenligne tilbud fra flere leverandører 
                          før du bestemmer deg, da prisene kan variere betydelig.
                        </p>
                      </div>
                    </details>
                  </div>
                </div>
                
                {/* Right Column */}
                <div className="space-y-6">
                  {/* FAQ Item 6 */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <details className="group">
                      <summary className="flex items-center justify-between p-4 bg-white cursor-pointer">
                        <h3 className="text-lg font-medium text-gray-800">Er fastpris alltid dyrere enn spotpris?</h3>
                        <span className="relative ml-2 flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 transform transition-transform duration-300 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </span>
                      </summary>
                      <div className="p-4 pt-0 border-t border-gray-100 bg-gray-50 animate-[fadeIn_0.3s_ease-in-out]">
                        <p className="text-gray-600">
                          Nei, fastpris er ikke alltid dyrere enn spotpris. Historisk sett har spotpris ofte vært billigere over tid, 
                          men dette er ingen garanti for fremtiden. I perioder med høye strømpriser kan en fastprisavtale være betydelig 
                          billigere enn spotpris. Fastprisavtaler inkluderer en "forsikringspremie" som du betaler for forutsigbarheten, 
                          men i ustabile markeder kan denne sikkerheten være verdt kostnaden. Det er viktig å vurdere både nåværende 
                          markedsforhold og dine egne behov for forutsigbarhet når du velger mellom fastpris og spotpris.
                        </p>
                      </div>
                    </details>
                  </div>
                  
                  {/* FAQ Item 7 */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <details className="group">
                      <summary className="flex items-center justify-between p-4 bg-white cursor-pointer">
                        <h3 className="text-lg font-medium text-gray-800">Påvirker fastpris nettleien min?</h3>
                        <span className="relative ml-2 flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 transform transition-transform duration-300 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </span>
                      </summary>
                      <div className="p-4 pt-0 border-t border-gray-100 bg-gray-50 animate-[fadeIn_0.3s_ease-in-out]">
                        <p className="text-gray-600">
                          Nei, fastprisavtalen påvirker kun prisen du betaler for selve strømmen (kraftprisen). Nettleien, som er kostnaden 
                          for å transportere strømmen til hjemmet ditt, bestemmes av ditt lokale nettselskap og er regulert av myndighetene. 
                          Denne kostnaden vil være den samme uavhengig av hvilken strømavtale du har eller hvilken strømleverandør du velger. 
                          På strømregningen din vil du se både kraftprisen (som påvirkes av din fastprisavtale) og nettleien som separate poster.
                        </p>
                      </div>
                    </details>
                  </div>
                  
                  {/* FAQ Item 8 */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <details className="group">
                      <summary className="flex items-center justify-between p-4 bg-white cursor-pointer">
                        <h3 className="text-lg font-medium text-gray-800">Hvordan påvirker strømstøtten fastprisavtaler?</h3>
                        <span className="relative ml-2 flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 transform transition-transform duration-300 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </span>
                      </summary>
                      <div className="p-4 pt-0 border-t border-gray-100 bg-gray-50 animate-[fadeIn_0.3s_ease-in-out]">
                        <p className="text-gray-600">
                          Strømstøtteordningen som ble innført av regjeringen gjelder primært for husholdninger med spotprisavtaler eller 
                          variable prisavtaler. Hvis du har en fastprisavtale, vil du vanligvis ikke motta strømstøtte, siden formålet med 
                          støtten er å beskytte forbrukere mot ekstraordinært høye spotpriser. Dette er viktig å være klar over når du 
                          sammenligner fastpris med spotpris i perioder med høye strømpriser. Fastprisavtaler gir deg forutsigbarhet gjennom 
                          en fast pris, mens spotprisavtaler kan gi deg fordelen av strømstøtte når prisene er høye.
                        </p>
                      </div>
                    </details>
                  </div>
                  
                  {/* FAQ Item 9 */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <details className="group">
                      <summary className="flex items-center justify-between p-4 bg-white cursor-pointer">
                        <h3 className="text-lg font-medium text-gray-800">Kan jeg få fastpris med timesavregning?</h3>
                        <span className="relative ml-2 flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 transform transition-transform duration-300 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </span>
                      </summary>
                      <div className="p-4 pt-0 border-t border-gray-100 bg-gray-50 animate-[fadeIn_0.3s_ease-in-out]">
                        <p className="text-gray-600">
                          Ja, noen strømleverandører tilbyr fastprisavtaler med timesavregning. Dette betyr at du har en fast pris per kWh, 
                          men forbruket ditt måles og avregnes time for time. Dette kan være fordelaktig hvis du har mulighet til å flytte 
                          strømforbruket ditt til timer med lavere belastning på strømnettet. Noen leverandører tilbyr også fastprisavtaler 
                          med ulike priser for dag og natt, hvor prisen er lavere om natten når etterspørselen er mindre. Disse avtalene 
                          kombinerer forutsigbarheten ved fastpris med muligheten til å spare penger ved å tilpasse forbruket ditt.
                        </p>
                      </div>
                    </details>
                  </div>
                  
                  {/* FAQ Item 10 */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <details className="group">
                      <summary className="flex items-center justify-between p-4 bg-white cursor-pointer">
                        <h3 className="text-lg font-medium text-gray-800">Hvordan finner jeg den beste fastprisavtalen?</h3>
                        <span className="relative ml-2 flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 transform transition-transform duration-300 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </span>
                      </summary>
                      <div className="p-4 pt-0 border-t border-gray-100 bg-gray-50 animate-[fadeIn_0.3s_ease-in-out]">
                        <p className="text-gray-600">
                          For å finne den beste fastprisavtalen bør du sammenligne tilbud fra flere leverandører. Vurder ikke bare prisen, 
                          men også bindingstid, vilkår for brudd på avtalen, og leverandørens omdømme. Bruk prissammenligningsverktøy som 
                          vår tjeneste for å få en oversikt over tilgjengelige avtaler. Vurder også ditt eget forbruksmønster og hvor lenge 
                          du ønsker å binde deg. Hvis du forventer at strømprisene vil stige, kan det være lurt å velge en lengre bindingstid, 
                          mens hvis du tror prisene vil falle, kan en kortere bindingstid være bedre. Husk også å lese vilkårene nøye før du 
                          signerer, spesielt med tanke på hva som skjer når avtaleperioden utløper.
                        </p>
                      </div>
                    </details>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; max-height: 0; }
          to { opacity: 1; max-height: 1000px; }
        }
        
        details[open] summary ~ * {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style> 
    </div>
  );
}