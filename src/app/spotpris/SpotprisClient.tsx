'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  calculateEnhancedMonthlyCost, 
  getPriceBreakdown,
  MONTHLY_CONSUMPTION_DISTRIBUTION
} from '@/utils/electricityPrices';
import { fieldOptions } from '@/utils/electricityFields';
import MultiStepForm from '@/components/MultiStepForm';
import Top50ProductList from '@/components/Top50ProductList';

// Define interfaces
interface Provider {
  id: string;
  name: string;
  logo?: string;
  website?: string;
}

interface Deal {
  id: string;
  name: string;
  providerId: string;
  productType: string;
  monthlyFee: number;
  markupPrice: number;
  elCertificatePrice?: number;
  agreementTime?: number;
  agreementTimeUnit?: string;
  cancellationFee?: number;
  feePostalLetter?: number;
  additionalFees?: number;
  description?: string;
  customerType?: string;
  [key: string]: any;
}

interface PriceData {
  spotPrices: Record<string, number>;
  [key: string]: any;
}

interface SpotprisClientProps {
  initialDeals?: Deal[];
  initialPriceData?: PriceData;
  initialProviders?: Provider[];
}

export default function SpotprisClient({ 
  initialDeals = [], 
  initialPriceData = null, 
  initialProviders = [] 
}: SpotprisClientProps) {
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [priceData, setPriceData] = useState<PriceData | null>(initialPriceData);
  const [loading, setLoading] = useState(!initialDeals.length);
  const [error, setError] = useState(null);
  const [expandedDeal, setExpandedDeal] = useState(null);
  const [annualConsumption, setAnnualConsumption] = useState(20000);
  const [providers, setProviders] = useState<Provider[]>(initialProviders);
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

  // Toggle deal expansion
  const toggleDealExpansion = (dealId) => {
    if (expandedDeal === dealId) {
      setExpandedDeal(null);
    } else {
      setExpandedDeal(dealId);
    }
  };

  // Fetch data if not provided initially
  useEffect(() => {
    if (initialDeals.length && initialPriceData && initialProviders.length) {
      return; // Skip fetching if we have initial data
    }
    
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Fetch all deals
        const dealsResponse = await fetch('/api/electricity-deals');
        const dealsResult = await dealsResponse.json();
        
        // Fetch price data
        const priceResponse = await fetch('/api/electricity-prices');
        const priceResult = await priceResponse.json();
        
        // Fetch providers
        const providersResponse = await fetch('/api/providers');
        const providersResult = await providersResponse.json();
        
        if (dealsResult.success && dealsResult.data && 
            priceResult.success && priceResult.data &&
            providersResult.success && providersResult.data) {
          setDeals(dealsResult.data);
          setPriceData(priceResult.data);
          setProviders(providersResult.data);
          setLoading(false);
        } else {
          throw new Error('Failed to fetch data');
        }
      } catch (err) {
        setError(err.message || 'An error occurred');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [initialDeals.length, initialPriceData, initialProviders.length]);

  // Rest of your component rendering code...
  return (
    <div>
      <main>
        {/* Hero Section */}
        <section className="py-16 bg-blue-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 text-center">
                Spotpris på strøm: Finn de billigste spotprisavtalene
              </h1>
              
              <p className="text-lg text-gray-600 mb-8 text-center">
                Her viser vi deg Norges billigste spotprisavtale pr {getCurrentMonthName()} {new Date().getFullYear()}
              </p>
              
              {/* Interactive consumption slider */}
              <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Beregn din månedlige strømkostnad</h2>
                
                <div className="mb-4">
                  <label htmlFor="consumption" className="block text-gray-700 mb-2">
                    Årlig strømforbruk: {formatConsumption(annualConsumption)} kWh
                  </label>
                  
                  <input
                    type="range"
                    id="consumption"
                    min="5000"
                    max="40000"
                    step="1000"
                    value={annualConsumption}
                    onChange={(e) => setAnnualConsumption(parseInt(e.target.value))}
                    onMouseDown={() => setIsDragging(true)}
                    onMouseUp={() => setIsDragging(false)}
                    onTouchStart={() => setIsDragging(true)}
                    onTouchEnd={() => setIsDragging(false)}
                    className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                  />
                  
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>5 000 kWh</span>
                    <span>40 000 kWh</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <button
                    onClick={() => setAnnualConsumption(10000)}
                    className="py-2 px-4 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    Leilighet<br />(10 000 kWh)
                  </button>
                  <button
                    onClick={() => setAnnualConsumption(20000)}
                    className="py-2 px-4 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    Enebolig<br />(20 000 kWh)
                  </button>
                  <button
                    onClick={() => setAnnualConsumption(30000)}
                    className="py-2 px-4 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    Stor bolig<br />(30 000 kWh)
                  </button>
                </div>
              </div>
              
              {/* Top deals section */}
              <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Vi i strømnet har sammmenlignet alle spotprisavtaler i Norge. Nedenfor kan du se opplistingen av de billigste per {getCurrentDate()}
                </h2>
                
                {loading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    <p className="mt-2 text-gray-600">Laster inn strømavtaler...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-red-500">Kunne ikke laste inn strømavtaler. Vennligst prøv igjen senere.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {deals
                      .filter(deal => deal.productType === 'spot')
                      .sort((a, b) => {
                        const aCost = calculateEnhancedMonthlyCost(a, annualConsumption, priceData?.spotPrices?.NO1 || 100);
                        const bCost = calculateEnhancedMonthlyCost(b, annualConsumption, priceData?.spotPrices?.NO1 || 100);
                        return aCost - bCost;
                      })
                      .slice(0, 5)
                      .map(deal => {
                        const monthlyCost = calculateEnhancedMonthlyCost(deal, annualConsumption, priceData?.spotPrices?.NO1 || 100);
                        const priceBreakdown = getPriceBreakdown(deal, priceData?.spotPrices?.NO1 || 100);
                        const provider = providers.find(p => p.id === deal.providerId);
                        
                        return (
                          <div key={deal.id} className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="p-4 bg-white">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  {provider?.logo ? (
                                    <div className="w-12 h-12 mr-3 relative">
                                      <Image
                                        src={provider.logo}
                                        alt={provider?.name || 'Strømleverandør'}
                                        width={48}
                                        height={48}
                                        className="object-contain"
                                      />
                                    </div>
                                  ) : (
                                    <div className="w-12 h-12 mr-3 bg-gray-200 rounded-full flex items-center justify-center">
                                      <span className="text-gray-500 text-xs">{provider?.name?.substring(0, 2) || 'NA'}</span>
                                    </div>
                                  )}
                                  
                                  <div>
                                    <h3 className="font-semibold text-gray-800">{deal.name}</h3>
                                    <p className="text-sm text-gray-600">{provider?.name || 'Ukjent leverandør'}</p>
                                  </div>
                                </div>
                                
                                <div className="text-right">
                                  <p className="text-2xl font-bold text-blue-600">{formatMonthlyCost(monthlyCost)} kr</p>
                                  <p className="text-sm text-gray-600">per måned</p>
                                </div>
                              </div>
                              
                              <div className="mt-4">
                                <button
                                  onClick={() => toggleDealExpansion(deal.id)}
                                  className="text-blue-600 text-sm font-medium flex items-center"
                                >
                                  {expandedDeal === deal.id ? 'Skjul detaljer' : 'Vis detaljer'}
                                  <svg
                                    className={`w-4 h-4 ml-1 transform transition-transform ${expandedDeal === deal.id ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                  </svg>
                                </button>
                              </div>
                              
                              {expandedDeal === deal.id && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm text-gray-600">Påslag:</p>
                                      <p className="font-medium">{formatPrice(deal.markupPrice)} øre/kWh</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-600">Fastbeløp:</p>
                                      <p className="font-medium">{deal.monthlyFee} kr/mnd</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-600">Avtaleperiode:</p>
                                      <p className="font-medium">{deal.agreementTime ? `${deal.agreementTime} ${deal.agreementTimeUnit}` : 'Ingen bindingstid'}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-600">Oppsigelsesgebyr:</p>
                                      <p className="font-medium">{deal.cancellationFee ? `${deal.cancellationFee} kr` : 'Ingen'}</p>
                                    </div>
                                  </div>
                                  
                                  {deal.description && (
                                    <div className="mt-4">
                                      <p className="text-sm text-gray-600">Om avtalen:</p>
                                      <p className="text-sm mt-1">{deal.description}</p>
                                    </div>
                                  )}
                                  
                                  <div className="mt-4">
                                    <a
                                      href={provider?.website || '#'}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-block bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                      Bestill nå
                                    </a>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
                
                <div className="mt-6 text-center">
                  <Link
                    href="/tilbud"
                    className="inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-blue-700 transition-colors duration-300 shadow-md"
                  >
                    Se alle strømavtaler
                  </Link>
                </div>
              </div>
              
              <div className="text-center mb-8">
                <p className="text-gray-600">
                  I denne oversikten viser Strømnet Norges 20 billigste spotprisavtaler per {getCurrentMonthName()} {new Date().getFullYear()}
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Rest of your component sections... */}
      </main>
    </div>
  );
} 