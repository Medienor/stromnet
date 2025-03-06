'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  calculateEnhancedMonthlyCost, 
  getPriceBreakdown,
  MONTHLY_CONSUMPTION_DISTRIBUTION
} from '../utils/electricityPrices';
import MultiStepForm from '@/components/MultiStepForm';
import providerLogoUrls from '@/app/data/providerLogoUrls';
import ReservoirStatistics from '@/components/ReservoirStatistics';
import BergenProductList from '@/components/BergenProductList';
import TrondheimProductList from '@/components/TrondheimProductList';
import NordNorgeProductList from '@/components/NordNorgeProductList';
import OsloProductList from '@/components/OsloProductList';
import FastprisProductList from '@/components/FastprisProductList';
import Top50ProductList from '@/components/Top50ProductList';
import { Metadata } from 'next';

// Get current month and year in Norwegian - moved outside the component
const getCurrentMonthYear = () => {
  const months = [
    'januar', 'februar', 'mars', 'april', 'mai', 'juni',
    'juli', 'august', 'september', 'oktober', 'november', 'desember'
  ];
  const date = new Date();
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
};

export default function Home() {
  const [deals, setDeals] = useState([]);
  const [priceData, setPriceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedDeal, setExpandedDeal] = useState(null);
  const [annualConsumption, setAnnualConsumption] = useState(16000);
  const [providers, setProviders] = useState([]);
  
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
    const types = {
      'hourly_spot': 'Spotpris',
      'fixed': 'Fastpris',
      'variable': 'Variabel pris',
      'prepaid': 'Forskuddsbetalt'
    };
    return types[type] || type;
  };
  
  // Get current month name in Norwegian
  const getCurrentMonthName = () => {
    const months = [
      'januar', 'februar', 'mars', 'april', 'mai', 'juni',
      'juli', 'august', 'september', 'oktober', 'november', 'desember'
    ];
    return months[new Date().getMonth()];
  };
  
  // Add this utility function to calculate the correct average price
  // This converts from NOK/kWh to øre/kWh and calculates average for the raw API data
  const calculateSpotAverage = (hourlyPrices) => {
    if (!hourlyPrices || !Array.isArray(hourlyPrices) || hourlyPrices.length === 0) {
      return 0;
    }
    
    // Calculate average from hourly prices
    // The API returns NOK_per_kWh, we need to convert to øre (multiply by 100)
    const sum = hourlyPrices.reduce((total, hourData) => total + hourData.NOK_per_kWh, 0);
    const average = (sum / hourlyPrices.length) * 100; // Convert to øre
    
    return average;
  };
  
  // Update data fetching to handle the real API structure
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Fetch all deals
        const dealsResponse = await fetch('/api/electricity-deals');
        const dealsResult = await dealsResponse.json();
        
        // Our API endpoint should fetch and aggregate data from hvakosterstrommen
        // for the last 10 days across different price areas
        const priceResponse = await fetch('/api/electricity-prices');
        const priceResult = await priceResponse.json();
        
        if (dealsResult.success && priceResult.success) {
          // Access deals array correctly
          const dealsData = dealsResult.data.products || [];
          
          // Calculate spot prices - API should provide hourly prices for different areas
          const nationalAverage = priceResult.data.nationalAverage || 
                                 calculateSpotAverage(priceResult.data.hourlyPrices?.national);
          
          const osloAverage = priceResult.data.osloAverage || 
                             calculateSpotAverage(priceResult.data.hourlyPrices?.NO1);
          
          const bergenAverage = priceResult.data.bergenAverage || 
                               calculateSpotAverage(priceResult.data.hourlyPrices?.NO5);
          
          // Add Trondheim average (NO3)
          const trondheimAverage = priceResult.data.trondheimAverage || 
                                  calculateSpotAverage(priceResult.data.hourlyPrices?.NO3);
          
          // Add Nord-Norge average (NO4)
          const nordNorgeAverage = priceResult.data.nordNorgeAverage || 
                                  calculateSpotAverage(priceResult.data.hourlyPrices?.NO4);
          
          console.log('National Average:', nationalAverage, 'Oslo Average:', osloAverage, 
                     'Bergen Average:', bergenAverage, 'Trondheim Average:', trondheimAverage,
                     'Nord-Norge Average:', nordNorgeAverage);
          
          // Store enriched price data
          const enhancedPriceData = {
            ...priceResult.data,
            nationalAverage: nationalAverage,
            osloAverage: osloAverage,
            bergenAverage: bergenAverage,
            trondheimAverage: trondheimAverage,
            nordNorgeAverage: nordNorgeAverage
          };
          
          // Calculate monthly costs with correct prices
          const dealsWithCosts = dealsData.map(deal => ({
            ...deal,
            calculatedMonthlyPrice: calculateEnhancedMonthlyCost(
              deal, 
              annualConsumption,
              nationalAverage
            )
          }));
          
          setDeals(dealsWithCosts);
          setPriceData(enhancedPriceData);
        } else {
          setError('Kunne ikke hente strømavtaler eller strømpriser');
        }
      } catch (error) {
        console.error('Error fetching electricity data:', error);
        setError('Det oppstod en feil ved henting av strømdata. Vennligst prøv igjen senere.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [annualConsumption]);
  
  // Add this to your existing useEffect or create a new one
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await fetch('/api/providers');
        const result = await response.json();
        
        if (result.success) {
          setProviders(result.data);
        }
      } catch (error) {
        console.error('Error fetching providers:', error);
      }
    };
    
    fetchProviders();
  }, []);
  
  // Get the 50 cheapest deals based on current prices
  const getCheapestDeals = () => {
    if (!deals.length || !priceData) return [];
    
    // Use national average price as base price
    const basePrice = priceData.nationalAverage;
    
    return deals
      .map(deal => ({
        ...deal,
        calculatedMonthlyPrice: calculateEnhancedMonthlyCost(deal, annualConsumption, basePrice)
      }))
      .sort((a, b) => a.calculatedMonthlyPrice - b.calculatedMonthlyPrice)
      .slice(0, 50);
  };
  
  const cheapestDeals = getCheapestDeals();
  
  // Toggle expanded detail view for a deal
  const toggleDealExpansion = (dealId) => {
    if (expandedDeal === dealId) {
      setExpandedDeal(null);
    } else {
      setExpandedDeal(dealId);
    }
  };
  
  // Get current date in Norwegian format
  const getCurrentDate = () => {
    const date = new Date();
    return date.toLocaleDateString('nb-NO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Improved monthly consumption table with chart
  const getMonthlyConsumptionTable = () => {
    if (!annualConsumption) {
      return null;
    }

    const months = [
      'Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni',
      'Juli', 'August', 'September', 'Oktober', 'November', 'Desember'
    ];
    
    const monthlyData = months.map((month, index) => {
      const percentage = (MONTHLY_CONSUMPTION_DISTRIBUTION[index] || 0);
      const consumption = Math.round((annualConsumption * percentage) / 100);
      
      return { month, percentage, consumption };
    });
    
    // Find maximum percentage to scale chart bars
    const maxPercentage = Math.max(...monthlyData.map(d => d.percentage));
    
    return (
      <div className="mt-12 bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Slik beregnes ditt årlige forbruk</h3>
          <p className="mt-2 text-sm text-gray-600">
            Når du legger inn årlig forbruk, beregnes månedsprisen ut i fra en justert innmatningsprofil (JIP). 
            Denne er basert på tall fra NVE (Norges vassdrags- og energidirektorat).
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Strømforbruket varierer naturlig gjennom året. Det brukes mer strøm på vinteren når det er kaldt, 
            enn i juli når de fleste har sommerferie.
          </p>
        </div>
        
        {/* Consumption chart */}
        <div className="px-6 py-4">
          <div className="w-full h-64 bg-gray-50 relative mb-6">
            {monthlyData.map((data, index) => {
              const barHeight = (data.percentage / maxPercentage) * 180; // Scale to max height of 180px
              return (
                <div 
                  key={data.month} 
                  className="absolute bottom-0 flex flex-col items-center"
                  style={{ 
                    left: `${(index * 8.33) + 4.165}%`, 
                    width: '8%',
                    height: '100%'
                  }}
                >
                  <div className="w-full mt-auto relative group">
                    <div 
                      className="bg-blue-600 hover:bg-blue-700 transition-all rounded-t-sm relative z-10"
                      style={{ height: `${barHeight}px` }}
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 bg-gray-900 text-white text-xs rounded whitespace-nowrap transition-opacity">
                        {data.percentage.toFixed(2)}% ({formatConsumption(data.consumption)} kWh)
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-600 font-medium mt-2">
                    {data.month.substring(0, 3)}
                  </span>
                </div>
              );
            })}
            
            {/* Y-axis percentage labels */}
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 py-2">
              <span>15%</span>
              <span>10%</span>
              <span>5%</span>
              <span>0%</span>
            </div>
          </div>
        </div>
        
        {/* Consumption table */}
        <div className="px-6 pb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Månedlig fordelingsprosentandel:</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {monthlyData.map((data) => (
              <div key={data.month} className="bg-gray-50 p-3 rounded-md border border-gray-100">
                <p className="font-medium text-gray-900">{data.month}</p>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-sm text-gray-700">{data.percentage.toFixed(2)}%</p>
                  <p className="text-sm text-gray-700">{formatConsumption(data.consumption)} kWh</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Oslo deals section with derived data
  const renderOsloDealsSection = () => {
    if (!priceData || !deals.length) {
      return (
        <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="mt-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-gray-900">
                <Link href="/kommuner/oslo" className="hover:text-blue-600">
                  Beste strømavtale i Oslo
                </Link>
              </h2>
              <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-500">
                Her er de 5 beste strømavtalene i Oslo per {getCurrentDate()}.
              </p>
            </div>
            
            <div className="text-center py-12">
              {loading ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  <p className="mt-2 text-gray-600">Laster inn strømavtaler...</p>
                </>
              ) : (
                <p className="text-gray-600">Ingen strømavtaler tilgjengelig for Oslo for øyeblikket.</p>
              )}
            </div>
          </div>
        </div>
      );
    }
    
    // Use the correct Oslo price (NO1 area)
    const osloSpotPrice = priceData.osloAverage || priceData.nationalAverage || 71.84; // Fallback to a realistic value
    
    // Filter and sort deals for Oslo
    const osloDeals = deals
      .map(deal => ({
        ...deal,
        // Recalculate with Oslo prices if needed
        calculatedMonthlyPrice: calculateEnhancedMonthlyCost(
          deal,
          annualConsumption,
          osloSpotPrice
        )
      }))
      .sort((a, b) => a.calculatedMonthlyPrice - b.calculatedMonthlyPrice)
      .slice(0, 5);
      
    return (
      <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mt-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900">
              Beste strømavtale i Oslo
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-500">
              Her er de 5 beste strømavtalene i Oslo per {getCurrentDate()}.
            </p>
            <p className="mt-2 max-w-2xl mx-auto text-md text-gray-500">
              Vi har tatt ut de billigste alternativene til strømavtaler i Oslo, fordi det er relevant for denne artikkelen.
            </p>
          </div>
          
          <OsloProductList 
            deals={deals}
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
      </div>
    );
  };

  // Bergen Deals Section
  <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
    <div className="mt-8">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-gray-900">
          Beste strømavtale i Bergen
        </h2>
        <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-500">
          Her er de 5 beste strømavtalene i Bergen per {getCurrentDate()}.
        </p>
        <p className="mt-2 max-w-2xl mx-auto text-md text-gray-500">
          Vi har tatt ut de billigste alternativene til strømavtaler i Bergen, fordi det er relevant for denne artikkelen.
        </p>
      </div>
      
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Strømselskap
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produkt
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pris per kWh
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Beregnet månedspris
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Detaljer
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {priceData && deals.length ? 
                deals
                  .map(deal => ({
                    ...deal,
                    // Recalculate with Bergen prices (NO5)
                    calculatedMonthlyPrice: calculateEnhancedMonthlyCost(
                      deal,
                      annualConsumption,
                      priceData.bergenAverage || priceData.nationalAverage
                    )
                  }))
                  .sort((a, b) => a.calculatedMonthlyPrice - b.calculatedMonthlyPrice)
                  .slice(0, 5)
                  .map((deal, index) => {
                    const isExpanded = expandedDeal === `bergen-${deal.id}`;
                    const bergenSpotPrice = priceData.bergenAverage || priceData.nationalAverage || 71.84; // Fallback
                    const priceBreakdown = getPriceBreakdown(deal, annualConsumption, bergenSpotPrice);
                    
                    return (
                      <React.Fragment key={`bergen-${deal.id}`}>
                        <tr className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col items-center sm:items-start">
                              {deal.provider?.organizationNumber && providerLogoUrls[deal.provider.organizationNumber] ? (
                                <div className="mb-2">
                                  <img 
                                    src={providerLogoUrls[deal.provider.organizationNumber]} 
                                    alt={`${deal.provider?.name || 'Ukjent leverandør'} logo`}
                                    className="h-16 w-16 object-contain"
                                  />
                                </div>
                              ) : (
                                <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                                  <span className="text-2xl font-bold text-blue-600">
                                    {(deal.provider?.name || 'U').charAt(0)}
                                  </span>
                                </div>
                              )}
                              <div className="font-medium text-gray-900 text-center sm:text-left">
                                {deal.provider?.name || 'Ukjent leverandør'}
                                {deal.provider?.organizationNumber && (
                                  <div className="mt-1">
                                    <Link 
                                      href={`/stromleverandorer/${providers.find(p => p.organizationNumber === deal.provider.organizationNumber)?.slug || ''}`}
                                      className="text-xs text-blue-600 hover:text-blue-800"
                                    >
                                      Se alle avtaler
                                    </Link>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{deal.name}</div>
                            {deal.agreementTime > 0 && (
                              <div className="text-xs text-gray-500">
                                {deal.agreementTime} {deal.agreementTimeUnit === 'year' ? 'års' : 'måneders'} bindingstid
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatPrice(bergenSpotPrice + deal.addonPrice)} øre
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatMonthlyCost(deal.calculatedMonthlyPrice)} kr
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => toggleDealExpansion(`bergen-${deal.id}`)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              {isExpanded ? 'Skjul detaljer' : 'Vis detaljer'}
                            </button>
                          </td>
                        </tr>
                        
                        {/* Expanded Detail View */}
                        {isExpanded && priceBreakdown && (
                          <tr>
                            <td colSpan={5} className="px-6 py-4 bg-blue-50">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <h3 className="text-lg font-medium text-gray-900 mb-4">Prisdetaljer</h3>
                                  <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                      <span className="text-gray-600">Nordpool spotpris Bergen (NO5)</span>
                                      <span className="font-medium">{formatPrice(priceBreakdown.spotPrice)} øre/kWt</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-gray-600">Påslag til {deal.provider?.name}</span>
                                      <span className="font-medium">{formatPrice(priceBreakdown.addonPrice)} øre/kWt</span>
                                    </div>
                                    {priceBreakdown.elCertificatePrice > 0 && (
                                      <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Elsertifikatpris</span>
                                        <span className="font-medium">{formatPrice(priceBreakdown.elCertificatePrice)} øre/kWt</span>
                                      </div>
                                    )}
                                    <div className="flex justify-between text-sm font-medium border-t border-blue-200 pt-2">
                                      <span>Total spotpris + påslag</span>
                                      <span>{formatPrice(priceBreakdown.totalKwhPrice)} øre/kWt</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-gray-600">Ditt ca. forbruk {formatConsumption(priceBreakdown.monthlyConsumption)} kWt * {formatPrice(priceBreakdown.totalKwhPrice)} øre</span>
                                      <span className="font-medium">{formatMonthlyCost(priceBreakdown.energyCost)} kr</span>
                                    </div>
                                    {priceBreakdown.monthlyFee > 0 && (
                                      <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Fast beløp til {deal.provider?.name} per måned</span>
                                        <span className="font-medium">{formatMonthlyCost(priceBreakdown.monthlyFee)} kr</span>
                                      </div>
                                    )}
                                    <div className="flex justify-between text-base font-bold border-t border-blue-200 pt-2">
                                      <span>Beregnet strømutgift for {getCurrentMonthName()}</span>
                                      <span>{formatMonthlyCost(priceBreakdown.totalMonthlyCost)} kr</span>
                                    </div>
                                  </div>
                                  
                                  <div className="mt-6">
                                    <Link 
                                      href="/tilbud"
                                      className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                      Få tilbud
                                    </Link>
                                  </div>
                                </div>
                                
                                <div>
                                  <h3 className="text-lg font-medium text-gray-900 mb-4">Om avtalen</h3>
                                  <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                                    <div className="sm:col-span-1">
                                      <dt className="text-sm font-medium text-gray-500">Avtaletype</dt>
                                      <dd className="mt-1 text-sm text-gray-900">{getProductTypeNorwegian(deal.productType)}</dd>
                                    </div>
                                    {deal.agreementTime > 0 && (
                                      <div className="sm:col-span-1">
                                        <dt className="text-sm font-medium text-gray-500">Bindingstid</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{deal.agreementTime} {deal.agreementTimeUnit === 'year' ? 'år' : 'måneder'}</dd>
                                      </div>
                                    )}
                                    <div className="sm:col-span-1">
                                      <dt className="text-sm font-medium text-gray-500">Prisområde</dt>
                                      <dd className="mt-1 text-sm text-gray-900">Bergen (NO5)</dd>
                                    </div>
                                  </dl>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center">
                      {loading ? (
                        <>
                          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                          <p className="mt-2 text-gray-600">Laster inn strømavtaler...</p>
                        </>
                      ) : (
                        <p className="text-gray-600">Ingen strømavtaler tilgjengelig for Bergen for øyeblikket.</p>
                      )}
                    </td>
                  </tr>
                )
              }
            </tbody>
          </table>
        </div>
        
        <div className="bg-gray-50 px-6 py-4">
          {priceData && deals.length > 0 ? (
            <p className="text-sm text-gray-600">
              Den billigste strømavtalen i Bergen per {getCurrentDate()} er {
                deals
                  .map(deal => ({
                    ...deal,
                    calculatedMonthlyPrice: calculateEnhancedMonthlyCost(
                      deal,
                      annualConsumption,
                      priceData.bergenAverage || priceData.nationalAverage
                    )
                  }))
                  .sort((a, b) => a.calculatedMonthlyPrice - b.calculatedMonthlyPrice)[0]?.name
              } fra {
                deals
                  .map(deal => ({
                    ...deal,
                    calculatedMonthlyPrice: calculateEnhancedMonthlyCost(
                      deal,
                      annualConsumption,
                      priceData.bergenAverage || priceData.nationalAverage
                    )
                  }))
                  .sort((a, b) => a.calculatedMonthlyPrice - b.calculatedMonthlyPrice)[0]?.provider?.name
              }. 
              Denne strømavtalen koster {
                formatPrice(
                  (priceData.bergenAverage || priceData.nationalAverage) + 
                  deals
                    .sort((a, b) => a.calculatedMonthlyPrice - b.calculatedMonthlyPrice)[0]?.addonPrice
                )
              } øre per kWh og har en estimert månedspris på {
                formatMonthlyCost(
                  deals
                    .map(deal => ({
                      ...deal,
                      calculatedMonthlyPrice: calculateEnhancedMonthlyCost(
                        deal,
                        annualConsumption,
                        priceData.bergenAverage || priceData.nationalAverage
                      )
                    }))
                    .sort((a, b) => a.calculatedMonthlyPrice - b.calculatedMonthlyPrice)[0]?.calculatedMonthlyPrice
                )
              } kr ved et årlig forbruk på {formatConsumption(annualConsumption)} kilowattimer.
            </p>
          ) : (
            <p className="text-sm text-gray-600">
              Ingen strømavtaler tilgjengelig for Bergen for øyeblikket.
            </p>
          )}
          <div className="mt-4 text-center">
            <Link href="/kommuner/bergen" className="text-blue-600 hover:text-blue-800 font-medium">
              Se billigste strømavtaler i Bergen
            </Link>
          </div>
        </div>
      </div>
    </div>
  </div>

  // Get current month and year in Norwegian
  const getCurrentMonthYear = () => {
    const months = [
      'januar', 'februar', 'mars', 'april', 'mai', 'juni',
      'juli', 'august', 'september', 'oktober', 'november', 'desember'
    ];
    const date = new Date();
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section with Form */}
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
                  <h1 className="text-4xl md:text-5xl font-bold mb-6">Beste og billigste strømavtale ({getCurrentMonthYear()})</h1>
                  <p className="text-xl mb-8">La strømleverandørene konkurrere om å gi deg den beste strømavtalen</p>
                  
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
                
                <div id="form-section" className="bg-white rounded-xl shadow-xl md:col-span-2">
                  <MultiStepForm />
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Main Content */}
        <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8" id="compare">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">
              Norges 50 billigste spotprisavtaler
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-500">
              Her er de 50 billigste spotprisavtalene i Norge per {getCurrentDate()}.
            </p>
            <p className="mt-2 max-w-2xl mx-auto text-md text-gray-500">
              Spotprisavtaler følger markedsprisen og er vanligvis det billigste alternativet over tid.
            </p>
          </div>
          
          <Top50ProductList 
            deals={deals}
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
          
          <div className="mt-10 text-center">
            <Link href="/tilbud" className="inline-block px-8 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700">
              Få tilbud på strømavtale
            </Link>
          </div>
        </div>
        
        {/* Fixed Price Deals Section */}
        <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="mt-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-gray-900">
                Her er beste strømavtale med fastpris for deg
              </h2>
              <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-500">
                Her er de 5 beste fastprisavtalene per {getCurrentDate()}.
              </p>
              <p className="mt-2 max-w-2xl mx-auto text-md text-gray-500">
                Fastprisavtaler gir deg forutsigbarhet i en periode med usikre strømpriser.
              </p>
            </div>
            
            <FastprisProductList 
              deals={deals}
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
        </div>
        
        {/* Oslo Deals Section */}
        <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="mt-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-gray-900">
                Beste strømavtale i Oslo
              </h2>
              <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-500">
                Her er de 5 beste strømavtalene i Oslo per {getCurrentDate()}.
              </p>
              <p className="mt-2 max-w-2xl mx-auto text-md text-gray-500">
                Vi har tatt ut de billigste alternativene til strømavtaler i Oslo, fordi det er relevant for denne artikkelen.
              </p>
            </div>
            
            <OsloProductList 
              deals={deals}
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
        </div>
        
        {/* Bergen Deals Section */}
        <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="mt-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-gray-900">
                Beste strømavtale i Bergen
              </h2>
              <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-500">
                Her er de 5 beste strømavtalene i Bergen per {getCurrentDate()}.
              </p>
              <p className="mt-2 max-w-2xl mx-auto text-md text-gray-500">
                Vi har tatt ut de billigste alternativene til strømavtaler i Bergen, fordi det er relevant for denne artikkelen.
              </p>
            </div>
            
            <BergenProductList 
              deals={deals}
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
            />
          </div>
        </div>
        
        {/* Trondheim Deals Section */}
        <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="mt-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-gray-900">
                Beste strømavtale i Trondheim
              </h2>
              <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-500">
                Her er de 5 beste strømavtalene i Trondheim per {getCurrentDate()}.
              </p>
              <p className="mt-2 max-w-2xl mx-auto text-md text-gray-500">
                Vi har tatt ut de billigste alternativene til strømavtaler i Trondheim, fordi det er relevant for denne artikkelen.
              </p>
            </div>
            
            <TrondheimProductList 
              deals={deals}
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
            />
          </div>
        </div>
        
        {/* Nord-Norge Deals Section */}
        <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="mt-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-gray-900">
                Beste strømavtale i Nord-Norge (NO4)
              </h2>
              <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-500">
                Her er de 5 beste strømavtalene i Nord-Norge per {getCurrentDate()}.
              </p>
              <p className="mt-2 max-w-2xl mx-auto text-md text-gray-500">
                Vi har tatt ut de billigste alternativene til strømavtaler i Nord-Norge, fordi det er relevant for denne artikkelen.
              </p>
            </div>
            
            <NordNorgeProductList 
              deals={deals}
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
        </div>
        
        {/* CTA Section */}
        <div className="bg-blue-600 py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Klar for å spare på strømregningen?</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Det tar bare ett minutt å sammenligne priser og finne den beste strømavtalen for din bolig.
            </p>
            <Link href="/tilbud" className="inline-block px-8 py-4 bg-white text-blue-600 rounded-md font-medium text-lg hover:bg-gray-100">
              Sammenlign strømpriser nå
            </Link>
          </div>
        </div>

        {/* Velg riktig strømavtale Section */}
        <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Velg riktig strømavtale</h2>
            <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-500">
              Hvordan finne den beste strømavtalen for ditt forbruk og dine behov
            </p>
          </div>
          
          <div className="bg-white shadow overflow-hidden rounded-lg mb-10">
            <div className="px-6 py-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Hvordan velge riktig strømavtale?</h3>
              <p className="text-gray-600 mb-4">
                Å velge riktig strømavtale kan være utfordrende med alle de forskjellige tilbudene på markedet. Her er noen tips som kan hjelpe deg med å finne den beste avtalen for dine behov:
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div className="bg-blue-50 p-5 rounded-lg">
                  <h4 className="font-medium text-lg text-gray-900 mb-3">Forstå de ulike avtaletypene</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span><strong>Spotprisavtale:</strong> Prisen følger markedsprisen time for time. Ofte det billigste alternativet over tid, men kan variere mye fra måned til måned.</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span><strong>Fastprisavtale:</strong> Gir forutsigbarhet med en fast pris i avtaleperioden. Kan være dyrere enn spot over tid, men gir beskyttelse mot pristopper.</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span><strong>Variabel pris:</strong> Prisen kan endres av leverandøren, vanligvis med 14 dagers varsel. Ofte dyrere enn spotpris over tid.</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 p-5 rounded-lg">
                  <h4 className="font-medium text-lg text-gray-900 mb-3">Vurder disse faktorene</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span><strong>Påslag:</strong> Hvor mye leverandøren legger på toppen av spotprisen. Lavere påslag gir lavere totalpris.</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span><strong>Fastbeløp:</strong> Månedlig eller årlig gebyr som kommer i tillegg til strømprisen. Kan utgjøre en betydelig del av totalkostnaden.</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span><strong>Bindingstid:</strong> Hvor lenge du er bundet til avtalen. Kortere bindingstid gir mer fleksibilitet.</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span><strong>Forbruksmønster:</strong> Når på døgnet og året du bruker mest strøm påvirker hvilken avtale som er best for deg.</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-8">
                <h4 className="font-medium text-lg text-gray-900 mb-3">Tips for å finne den beste avtalen</h4>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span><strong>Sammenlign totalkostnaden:</strong> Se på både påslag, fastbeløp og andre gebyrer for å få et realistisk bilde av hva avtalen vil koste deg.</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span><strong>Les vilkårene nøye:</strong> Vær oppmerksom på skjulte kostnader, bindingstid og oppsigelsesvilkår.</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span><strong>Sjekk kundeservice og omdømme:</strong> Et selskap med god kundeservice kan være verdt litt høyere pris hvis du skulle få problemer.</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span><strong>Vurder ditt forbruksmønster:</strong> Hvis du bruker mye strøm om vinteren, kan en fastprisavtale være gunstig. Hvis forbruket ditt er jevnt, kan spotpris være bedre.</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span><strong>Bruk prissammenligningstjenester:</strong> Tjenester som vår kan hjelpe deg med å sammenligne ulike avtaler basert på ditt forbruk.</span>
                  </li>
                </ul>
              </div>
              
              <div className="mt-8 grid md:grid-cols-2 gap-6">
                <div className="bg-yellow-50 p-5 rounded-lg">
                  <h4 className="font-medium text-lg text-gray-900 mb-3">For deg med lavt forbruk</h4>
                  <p className="text-gray-600 mb-3">
                    Hvis du har et lavt strømforbruk (under 10.000 kWh/år), bør du være spesielt oppmerksom på fastbeløp. Et høyt fastbeløp kan utgjøre en stor del av din totale strømregning.
                  </p>
                  <p className="text-gray-600">
                    <strong>Anbefaling:</strong> Velg en avtale med lavt eller ingen fastbeløp, selv om påslaget er litt høyere.
                  </p>
                </div>
                
                <div className="bg-yellow-50 p-5 rounded-lg">
                  <h4 className="font-medium text-lg text-gray-900 mb-3">For deg med høyt forbruk</h4>
                  <p className="text-gray-600 mb-3">
                    Med et høyt strømforbruk (over 20.000 kWh/år) vil påslaget ha større betydning enn fastbeløpet for din totale kostnad.
                  </p>
                  <p className="text-gray-600">
                    <strong>Anbefaling:</strong> Fokuser på avtaler med lavt påslag, selv om de har et moderat fastbeløp. Vurder også fastprisavtaler for forutsigbarhet.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Billigste strømleverandører Section */}
        <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">
              Billigste strømleverandører {getCurrentDate()}
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-500">
              Her er noen av de mest populære strømleverandørene i Norge
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Provider 1 - Fjordkraft */}
            <div className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-5 flex justify-center">
                {providerLogoUrls['976944682'] ? (
                  <img 
                    src={providerLogoUrls['976944682']} 
                    alt="Fjordkraft AS logo" 
                    className="h-16 w-auto object-contain"
                  />
                ) : (
                  <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-blue-600">F</span>
                  </div>
                )}
              </div>
              <div className="px-5 pb-5 text-center">
                <h3 className="text-lg font-medium text-gray-900">Fjordkraft AS</h3>
                <p className="mt-1 text-sm text-gray-500">Populær leverandør med flere avtaletyper</p>
                <Link href="/stromleverandorer/fjordkraft-as" className="mt-3 inline-block text-blue-600 hover:text-blue-800 font-medium">
                  Se avtaler
                </Link>
              </div>
            </div>
            
            {/* Provider 2 - Tibber */}
            <div className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-5 flex justify-center">
                {providerLogoUrls['917245975'] ? (
                  <img 
                    src={providerLogoUrls['917245975']} 
                    alt="Tibber logo" 
                    className="h-16 w-auto object-contain"
                  />
                ) : (
                  <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-blue-600">T</span>
                  </div>
                )}
              </div>
              <div className="px-5 pb-5 text-center">
                <h3 className="text-lg font-medium text-gray-900">Tibber</h3>
                <p className="mt-1 text-sm text-gray-500">Smart strømavtale med app-styring</p>
                <Link href="/stromleverandorer/tibber" className="mt-3 inline-block text-blue-600 hover:text-blue-800 font-medium">
                  Se avtaler
                </Link>
              </div>
            </div>
            
            {/* Provider 3 - Fortum */}
            <div className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-5 flex justify-center">
                {providerLogoUrls['982584027'] ? (
                  <img 
                    src={providerLogoUrls['982584027']} 
                    alt="Fortum logo" 
                    className="h-16 w-auto object-contain"
                  />
                ) : (
                  <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-blue-600">F</span>
                  </div>
                )}
              </div>
              <div className="px-5 pb-5 text-center">
                <h3 className="text-lg font-medium text-gray-900">Fortum</h3>
                <p className="mt-1 text-sm text-gray-500">Internasjonal leverandør med konkurransedyktige priser</p>
                <Link href="/stromleverandorer/fortum" className="mt-3 inline-block text-blue-600 hover:text-blue-800 font-medium">
                  Se avtaler
                </Link>
              </div>
            </div>
            
            {/* Provider 4 - Gudbrandsdal Energi */}
            <div className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-5 flex justify-center">
                {providerLogoUrls['916319983'] ? (
                  <img 
                    src={providerLogoUrls['916319983']} 
                    alt="Gudbrandsdal Energi AS logo" 
                    className="h-16 w-auto object-contain"
                  />
                ) : (
                  <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-blue-600">G</span>
                  </div>
                )}
              </div>
              <div className="px-5 pb-5 text-center">
                <h3 className="text-lg font-medium text-gray-900">Gudbrandsdal Energi AS</h3>
                <p className="mt-1 text-sm text-gray-500">Kjent for konkurransedyktige spotprisavtaler</p>
                <Link href="/stromleverandorer/gudbrandsdal-energi-as" className="mt-3 inline-block text-blue-600 hover:text-blue-800 font-medium">
                  Se avtaler
                </Link>
              </div>
            </div>
            
            {/* Provider 5 - Wattn */}
            <div className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-5 flex justify-center">
                {providerLogoUrls['925638153'] ? (
                  <img 
                    src={providerLogoUrls['925638153']} 
                    alt="Wattn AS logo" 
                    className="h-16 w-auto object-contain"
                  />
                ) : (
                  <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-blue-600">W</span>
                  </div>
                )}
              </div>
              <div className="px-5 pb-5 text-center">
                <h3 className="text-lg font-medium text-gray-900">Wattn AS</h3>
                <p className="mt-1 text-sm text-gray-500">Moderne strømleverandør med fokus på bærekraft</p>
                <Link href="/stromleverandorer/wattn-as" className="mt-3 inline-block text-blue-600 hover:text-blue-800 font-medium">
                  Se avtaler
                </Link>
              </div>
            </div>
            
            {/* Provider 6 - Agva Kraft */}
            <div className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-5 flex justify-center">
                {providerLogoUrls['914902371'] ? (
                  <img 
                    src={providerLogoUrls['914902371']} 
                    alt="Agva Kraft logo" 
                    className="h-16 w-auto object-contain"
                  />
                ) : (
                  <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-blue-600">A</span>
                  </div>
                )}
              </div>
              <div className="px-5 pb-5 text-center">
                <h3 className="text-lg font-medium text-gray-900">Agva Kraft</h3>
                <p className="mt-1 text-sm text-gray-500">Digital strømleverandør med enkle løsninger</p>
                <Link href="/stromleverandorer/agva-kraft" className="mt-3 inline-block text-blue-600 hover:text-blue-800 font-medium">
                  Se avtaler
                </Link>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <Link href="/stromleverandorer" className="inline-flex items-center px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors">
              Se alle strømleverandører
              <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
        
        {/* Reservoir Statistics Section */}
        <ReservoirStatistics />
        
        {/* FAQ Section with Accordions */}
        <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Ofte stilte spørsmål</h2>
            <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-500">
              Svar på de vanligste spørsmålene om strøm og strømavtaler
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* FAQ Item 1 */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button 
                  className="w-full px-6 py-4 text-left bg-white hover:bg-gray-50 flex justify-between items-center focus:outline-none" 
                  onClick={() => {
                    const el = document.getElementById('faq-1');
                    if (el) el.classList.toggle('hidden');
                  }}
                >
                  <span className="font-medium text-gray-900">Hva er forskjellen mellom spotpris og fastpris?</span>
                  <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div id="faq-1" className="hidden px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <p className="text-gray-600">
                    Spotpris følger markedsprisen på strømbørsen time for time og kan variere mye. Fastpris gir en forutsigbar pris i en avtalt periode, uavhengig av markedsprisene. Spotpris er vanligvis billigere over tid, men fastpris gir beskyttelse mot pristopper.
                  </p>
                </div>
              </div>
              
              {/* FAQ Item 2 */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button 
                  className="w-full px-6 py-4 text-left bg-white hover:bg-gray-50 flex justify-between items-center focus:outline-none" 
                  onClick={() => {
                    const el = document.getElementById('faq-2');
                    if (el) el.classList.toggle('hidden');
                  }}
                >
                  <span className="font-medium text-gray-900">Hva er påslag og hvorfor er det viktig?</span>
                  <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div id="faq-2" className="hidden px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <p className="text-gray-600">
                    Påslag er det strømleverandøren legger på toppen av spotprisen for å tjene penger. Dette varierer mellom leverandører og er en viktig faktor når du sammenligner avtaler. Lavt påslag betyr at du betaler mindre for strømmen, men sjekk også om det er månedlige fastbeløp i tillegg.
                  </p>
                </div>
              </div>
              
              {/* FAQ Item 3 */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button 
                  className="w-full px-6 py-4 text-left bg-white hover:bg-gray-50 flex justify-between items-center focus:outline-none" 
                  onClick={() => {
                    const el = document.getElementById('faq-3');
                    if (el) el.classList.toggle('hidden');
                  }}
                >
                  <span className="font-medium text-gray-900">Hva er prisområder og hvorfor varierer prisene?</span>
                  <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div id="faq-3" className="hidden px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <p className="text-gray-600">
                    Norge er delt inn i fem prisområder (NO1-NO5) basert på geografiske regioner. Prisene kan variere mellom områdene på grunn av forskjeller i produksjon, forbruk og overføringskapasitet. For eksempel har Nord-Norge (NO4) ofte lavere priser på grunn av høy produksjon og lavt forbruk.
                  </p>
                </div>
              </div>
              
              {/* FAQ Item 4 */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button 
                  className="w-full px-6 py-4 text-left bg-white hover:bg-gray-50 flex justify-between items-center focus:outline-none" 
                  onClick={() => {
                    const el = document.getElementById('faq-4');
                    if (el) el.classList.toggle('hidden');
                  }}
                >
                  <span className="font-medium text-gray-900">Hvor ofte kan jeg bytte strømleverandør?</span>
                  <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div id="faq-4" className="hidden px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <p className="text-gray-600">
                    Du kan bytte strømleverandør så ofte du vil, med mindre du har en avtale med bindingstid. Byttet tar vanligvis 2-3 uker å gjennomføre. Hvis du har en avtale med bindingstid, kan det påløpe et gebyr hvis du bytter før bindingstiden er over.
                  </p>
                </div>
              </div>
              
              {/* FAQ Item 5 */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button 
                  className="w-full px-6 py-4 text-left bg-white hover:bg-gray-50 flex justify-between items-center focus:outline-none" 
                  onClick={() => {
                    const el = document.getElementById('faq-5');
                    if (el) el.classList.toggle('hidden');
                  }}
                >
                  <span className="font-medium text-gray-900">Hva er forskjellen mellom nettleie og strømpris?</span>
                  <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div id="faq-5" className="hidden px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <p className="text-gray-600">
                    Nettleie betaler du til nettselskapet for transport av strøm og vedlikehold av strømnettet. Dette kan du ikke velge selv, da det bestemmes av hvor du bor. Strømpris betaler du til strømleverandøren for selve strømmen du bruker. Dette kan du velge fritt, og det er her du kan spare penger ved å sammenligne tilbud.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Right Column */}
            <div className="space-y-4">
              {/* FAQ Item 6 */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button 
                  className="w-full px-6 py-4 text-left bg-white hover:bg-gray-50 flex justify-between items-center focus:outline-none" 
                  onClick={() => {
                    const el = document.getElementById('faq-6');
                    if (el) el.classList.toggle('hidden');
                  }}
                >
                  <span className="font-medium text-gray-900">Hvordan fungerer strømstøtten?</span>
                  <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div id="faq-6" className="hidden px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <p className="text-gray-600">
                    Strømstøtten er en midlertidig ordning der staten dekker deler av strømkostnaden når prisen overstiger et visst nivå (for tiden 70 øre/kWh). Støtten beregnes automatisk og trekkes fra på strømregningen. Den gjelder for husholdninger og beregnes måned for måned basert på gjennomsnittlig spotpris i ditt prisområde.
                  </p>
                </div>
              </div>
              
              {/* FAQ Item 7 */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button 
                  className="w-full px-6 py-4 text-left bg-white hover:bg-gray-50 flex justify-between items-center focus:outline-none" 
                  onClick={() => {
                    const el = document.getElementById('faq-7');
                    if (el) el.classList.toggle('hidden');
                  }}
                >
                  <span className="font-medium text-gray-900">Hva er en plusskunde?</span>
                  <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div id="faq-7" className="hidden px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <p className="text-gray-600">
                    En plusskunde er en strømkunde som produserer egen strøm, for eksempel med solceller, og som kan selge overskuddsstrøm tilbake til strømnettet. Som plusskunde er det viktig å velge en strømleverandør som tilbyr gode vilkår for tilbakekjøp av strøm, da dette kan variere betydelig mellom leverandører.
                  </p>
                </div>
              </div>
              
              {/* FAQ Item 8 */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button 
                  className="w-full px-6 py-4 text-left bg-white hover:bg-gray-50 flex justify-between items-center focus:outline-none" 
                  onClick={() => {
                    const el = document.getElementById('faq-8');
                    if (el) el.classList.toggle('hidden');
                  }}
                >
                  <span className="font-medium text-gray-900">Hva er timesspot og hvordan fungerer det?</span>
                  <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div id="faq-8" className="hidden px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <p className="text-gray-600">
                    Timesspot (eller timespot) betyr at strømprisen følger spotprisen time for time. Spotprisen fastsettes på strømbørsen Nord Pool for hver time i døgnet, basert på tilbud og etterspørsel. Med en timespotavtale og en smartmåler (AMS) blir strømforbruket ditt målt hver time, og du betaler den aktuelle spotprisen for hver time du bruker strøm.
                  </p>
                </div>
              </div>
              
              {/* FAQ Item 9 */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button 
                  className="w-full px-6 py-4 text-left bg-white hover:bg-gray-50 flex justify-between items-center focus:outline-none" 
                  onClick={() => {
                    const el = document.getElementById('faq-9');
                    if (el) el.classList.toggle('hidden');
                  }}
                >
                  <span className="font-medium text-gray-900">Er det trygt å bytte strømleverandør?</span>
                  <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div id="faq-9" className="hidden px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <p className="text-gray-600">
                    Ja, det er helt trygt å bytte strømleverandør. Strømforsyningen din vil ikke bli påvirket, og det blir ikke strømbrudd når du bytter. Alle strømleverandører i Norge må følge samme regelverk og levere strøm av samme kvalitet. Det eneste som endres er hvem du betaler for strømmen og hvilken pris du betaler.
                  </p>
                </div>
              </div>
              
              {/* FAQ Item 10 */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button 
                  className="w-full px-6 py-4 text-left bg-white hover:bg-gray-50 flex justify-between items-center focus:outline-none" 
                  onClick={() => {
                    const el = document.getElementById('faq-10');
                    if (el) el.classList.toggle('hidden');
                  }}
                >
                  <span className="font-medium text-gray-900">Hvordan kan jeg redusere strømforbruket mitt?</span>
                  <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div id="faq-10" className="hidden px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <p className="text-gray-600">
                    Det finnes mange måter å redusere strømforbruket på: Senk innetemperaturen med 1-2 grader, bruk timer på elektriske apparater, slå av lys i rom som ikke er i bruk, vask klær med full maskin og på lavere temperaturer, bytt til LED-pærer og energieffektive apparater, installer varmepumpe, og etterisoler boligen.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
