import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  getPriceBreakdown 
} from '../utils/electricityPrices';

interface Top50ProductListProps {
  deals: any[];
  priceData: any;
  annualConsumption: number;
  expandedDeal: string | null;
  toggleDealExpansion: (dealId: string) => void;
  providerLogoUrls: Record<string, string>;
  providers: any[];
  formatPrice: (price: number) => string;
  formatMonthlyCost: (cost: number) => string;
  formatConsumption: (consumption: number) => string;
  getProductTypeNorwegian: (type: string) => string;
  getCurrentMonthName: () => string;
  getCurrentDate: () => string;
  pageType?: string;
}

const priceAreas = [
  { id: 'NO', name: 'Hele Norge' },
  { id: 'NO1', name: 'Øst-Norge (NO1)' },
  { id: 'NO2', name: 'Sør-Norge (NO2)' },
  { id: 'NO3', name: 'Midt-Norge (NO3)' },
  { id: 'NO4', name: 'Nord-Norge (NO4)' },
  { id: 'NO5', name: 'Vest-Norge (NO5)' }
];

const Top50ProductList: React.FC<Top50ProductListProps> = ({
  deals,
  priceData,
  annualConsumption,
  expandedDeal,
  toggleDealExpansion,
  providerLogoUrls,
  providers,
  formatPrice,
  formatMonthlyCost,
  formatConsumption,
  getProductTypeNorwegian,
  getCurrentMonthName,
  getCurrentDate,
  pageType
}) => {
  const [selectedPriceArea, setSelectedPriceArea] = useState('NO1');
  const [selectedCustomerType, setSelectedCustomerType] = useState('allCustomers');
  const [kingPrices, setKingPrices] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [cacheStatus, setCacheStatus] = useState<string>('');
  const [filteredDealsCache, setFilteredDealsCache] = useState<any[]>([]);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  
  // Customer type options
  const customerTypes = [
    { id: 'allCustomers', name: 'Alle kunder' },
    { id: 'newCustomers', name: 'Nye kunder' },
    { id: 'membersOnly', name: 'Kun medlemmer' }
  ];
  
  // Norwegian monthly consumption distribution (percentage of annual consumption)
  const MONTHLY_CONSUMPTION_DISTRIBUTION = {
    1: 12.51, // January
    2: 11.02, // February
    3: 10.77, // March
    4: 8.58,  // April
    5: 6.66,  // May
    6: 4.97,  // June
    7: 4.63,  // July
    8: 4.96,  // August
    9: 5.98,  // September
    10: 7.85, // October
    11: 9.91, // November
    12: 12.15 // December
  };
  
  // Get current month's consumption percentage
  const getCurrentMonthConsumption = (): number => {
    const currentMonth = new Date().getMonth() + 1; // JavaScript months are 0-indexed
    const monthPercentage = MONTHLY_CONSUMPTION_DISTRIBUTION[currentMonth] / 100;
    return annualConsumption * monthPercentage;
  };
  
  // Format spot price with correct decimal handling
  const formatSpotPrice = (price: number): string => {
    // For whole numbers, show without decimal places
    if (Number.isInteger(price)) {
      return price.toString();
    } else {
      // For decimal numbers, show with 2 decimal places
      return price.toFixed(2);
    }
  };
  
  // Format monthly cost
  const formatSpotMonthlyCost = (cost: number): string => {
    return cost.toFixed(0);
  };
  
  // Calculate monthly cost
  const calculateMonthlyCost = (deal: any, basePrice: number): number => {
    // Calculate monthly consumption with seasonal adjustment
    const monthlyConsumption = getCurrentMonthConsumption();
    
    // Convert price from øre/kWh to NOK/kWh
    const priceInNOK = basePrice / 100;
    
    // Calculate energy cost
    const energyCost = monthlyConsumption * priceInNOK;
    
    // Add monthly fee if present
    const monthlyFee = deal.monthlyFee || 0;
    
    // Add el certificate fee if present
    const elCertFee = (deal.elCertificatePrice || 0) * monthlyConsumption;
    
    // Add postal letter fee if present
    const postalLetterFee = (deal.feePostalLetter || 0);
    
    // Add any additional fees
    const additionalFees = (deal.additionalFees || 0);
    
    // Calculate total monthly cost
    const totalMonthlyCost = energyCost + monthlyFee + elCertFee + postalLetterFee + additionalFees;
    
    return totalMonthlyCost;
  };
  
  // Check if we're on the fastpris-strom page or spotpris page
  const isOnFastprisPage = pageType === 'fixed' || 
    (typeof window !== 'undefined' && window.location.pathname.includes('/fastpris-strom'));
  
  const isOnSpotprisPage = pageType === 'spot' || 
    (typeof window !== 'undefined' && 
      (window.location.pathname === '/' || 
       window.location.pathname.includes('/spotpris') ||
       window.location.pathname.includes('/dagens-strompris')));

  // Create a page type identifier for cache keys
  const pageTypeIdentifier = isOnFastprisPage ? 'fixed' : (isOnSpotprisPage ? 'spot' : 'other');

  // Fetch king average prices
  useEffect(() => {
    const fetchKingPrices = async () => {
      try {
        setIsLoading(true);
        
        // Check if we have cached data in localStorage and if it's still valid
        const cachedData = localStorage.getItem('kingPricesData');
        const cachedTimestamp = localStorage.getItem('kingPricesTimestamp');
        const cachedDeals = localStorage.getItem(`filteredDealsCache_${pageTypeIdentifier}`);
        const cachedArea = localStorage.getItem('selectedPriceArea');
        const cachedCustomerType = localStorage.getItem('selectedCustomerType');
        
        // Debug localStorage
        const localStorageDebug = {
          hasKingPricesData: !!cachedData,
          hasTimestamp: !!cachedTimestamp,
          hasFilteredDeals: !!cachedDeals,
          hasSelectedArea: !!cachedArea,
          hasSelectedCustomerType: !!cachedCustomerType,
          pageType: pageTypeIdentifier,
          kingPricesDataLength: cachedData ? JSON.parse(cachedData).length : 0,
          timestamp: cachedTimestamp ? new Date(parseInt(cachedTimestamp, 10)).toISOString() : null,
          filteredDealsLength: cachedDeals ? JSON.parse(cachedDeals).length : 0,
          selectedArea: cachedArea,
          selectedCustomerType: cachedCustomerType,
          allKeys: Object.keys(localStorage).join(', ')
        };
        
        setDebugInfo(localStorageDebug);
        console.log('LocalStorage Debug:', localStorageDebug);
        
        // Define cache validity period (24 hours in milliseconds)
        const cacheValidityPeriod = 24 * 60 * 60 * 1000;
        
        // Check if we have valid cached data
        if (cachedData && cachedTimestamp && cachedDeals && cachedArea && cachedCustomerType) {
          const timestamp = parseInt(cachedTimestamp, 10);
          const now = Date.now();
          
          // If cache is still valid, use it
          if (now - timestamp < cacheValidityPeriod) {
            console.log('Using cached data');
            setCacheStatus('Using cached data from ' + new Date(timestamp).toLocaleTimeString());
            
            // Set the cached price area and customer type
            setSelectedPriceArea(cachedArea);
            setSelectedCustomerType(cachedCustomerType);
            
            // Use cached data immediately
            setKingPrices(JSON.parse(cachedData));
            setFilteredDealsCache(JSON.parse(cachedDeals));
            setIsLoading(false);
            return;
          } else {
            setCacheStatus('Cache expired, fetching new data');
          }
        } else {
          setCacheStatus('No cache found, fetching new data');
          console.log('Missing cache items:', {
            kingPricesData: !cachedData,
            timestamp: !cachedTimestamp,
            filteredDeals: !cachedDeals,
            selectedArea: !cachedArea,
            selectedCustomerType: !cachedCustomerType
          });
        }
        
        // If no valid cache, fetch from API
        console.log('Fetching fresh king average prices');
        const response = await fetch('/api/kingAverage');
        const result = await response.json();
        
        if (result.success) {
          // Store the data in state
          setKingPrices(result.data);
          console.log('King average prices received:', result.data);
          setCacheStatus('New data fetched and cached at ' + new Date().toLocaleTimeString());
          
          // Cache the data in localStorage
          try {
            localStorage.setItem('kingPricesData', JSON.stringify(result.data));
            localStorage.setItem('kingPricesTimestamp', Date.now().toString());
            localStorage.setItem('selectedPriceArea', selectedPriceArea);
            localStorage.setItem('selectedCustomerType', selectedCustomerType);
            console.log('Data cached in localStorage');
            
            // Verify the data was stored
            const verifyData = localStorage.getItem('kingPricesData');
            const verifyTimestamp = localStorage.getItem('kingPricesTimestamp');
            console.log('Verify cache:', {
              dataStored: !!verifyData,
              timestampStored: !!verifyTimestamp
            });
          } catch (storageError) {
            console.error('Error storing data in localStorage:', storageError);
            setCacheStatus('Error caching data: ' + (storageError instanceof Error ? storageError.message : String(storageError)));
          }
        } else {
          console.error('Failed to fetch king average prices:', result.error);
          setCacheStatus('Error fetching data: ' + result.error);
        }
      } catch (error) {
        console.error('Error fetching king average prices:', error);
        setCacheStatus('Error: ' + (error instanceof Error ? error.message : String(error)));
        
        // If there's an error but we have cached data, use it as a fallback
        const cachedData = localStorage.getItem('kingPricesData');
        const cachedDeals = localStorage.getItem('filteredDealsCache');
        if (cachedData && cachedDeals) {
          console.log('Using cached data as fallback after error');
          setCacheStatus('Using cached data as fallback after error');
          setKingPrices(JSON.parse(cachedData));
          setFilteredDealsCache(JSON.parse(cachedDeals));
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    // Start fetching immediately
    fetchKingPrices();
  }, [pageTypeIdentifier]);

  // Handle price area change
  const handlePriceAreaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newArea = e.target.value;
    setSelectedPriceArea(newArea);
    localStorage.setItem('selectedPriceArea', newArea);
    
    // Clear the filtered deals cache when changing area
    setFilteredDealsCache([]);
  };
  
  // Handle customer type change
  const handleCustomerTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCustomerType = e.target.value;
    setSelectedCustomerType(newCustomerType);
    localStorage.setItem('selectedCustomerType', newCustomerType);
    
    // Clear the filtered deals cache when changing customer type
    setFilteredDealsCache([]);
  };

  // Get the spot price for the selected area
  const getSpotPrice = (): number => {
    const price = kingPrices[selectedPriceArea];
    console.log(`Getting spot price for ${selectedPriceArea}: ${price?.toFixed(2) || 'N/A'} øre/kWh`);
    
    if (price && price > 0) {
      return price;
    }
    
    // Fallback to national average or default
    const fallbackPrice = kingPrices.national || 75;
    console.log(`Using fallback price: ${fallbackPrice.toFixed(2)} øre/kWh`);
    return fallbackPrice;
  };

  // Filter and calculate prices for all deals
  const filteredDeals = !isLoading ? (
    filteredDealsCache.length > 0 && kingPrices[selectedPriceArea] ? 
    filteredDealsCache : 
    (() => {
      const newFilteredDeals = deals
        .filter(deal => {
          // If on fastpris-strom page, only include fixed price deals
          if (isOnFastprisPage) {
            return deal.productType === 'fixed';
          }
          
          // If on homepage or spotpris page, only include spot price deals
          if (isOnSpotprisPage) {
            const isSpotDeal = deal.productType === 'spot' || 
                            deal.productType === 'SPOT' || 
                            deal.productType === 'hourly_spot' || 
                            deal.productType === 'HOURLY_SPOT';
            
            if (!isSpotDeal) return false;
          }
          
          // Filter by price area
          if (!deal.salesNetworks || deal.salesNetworks.length === 0) return false;
          
          // Check if the deal is available in the selected area
          const isAvailableInArea = deal.salesNetworks.some(network => 
            network.id === selectedPriceArea || network.id === 'NO'
          );
          
          if (!isAvailableInArea) return false;
          
          // Filter by customer type
          // If we're looking for all customers, include deals for all customers or if no customer type is specified
          if (selectedCustomerType === 'allCustomers') {
            return !deal.applicableToCustomerType || 
                   deal.applicableToCustomerType === 'allCustomers';
          }
          
          // Otherwise, only include deals that match the selected customer type
          return deal.applicableToCustomerType === selectedCustomerType;
        })
        .map(deal => {
          // Get the spot price for the selected area
          const spotPrice = kingPrices[selectedPriceArea] || kingPrices.national || 75;
          
          // Ensure addonPrice is correctly scaled
          // The API provides addonPrice in a decimal format (like 0.01) when it should be in øre (like 1.0)
          // We need to scale it up by 100 to match the spot price scale
          let addonPrice = deal.addonPrice || 0;
          
          // If the addon price is very small (like 0.01 or -0.01), it's likely in the wrong scale
          // Scale it up to match the spot price (which is in øre/kWh)
          if (Math.abs(addonPrice) < 0.1) {
            addonPrice = addonPrice * 100;
          }
          
          // Calculate the total price (spot + addon)
          const basePrice = spotPrice + addonPrice;
          
          // Calculate monthly cost using our own function
          const monthlyPrice = calculateMonthlyCost(deal, basePrice);
          
          return {
            ...deal,
            spotPrice,
            addonPrice,
            basePrice,
            calculatedMonthlyPrice: monthlyPrice
          };
        })
        .sort((a, b) => a.calculatedMonthlyPrice - b.calculatedMonthlyPrice)
        .slice(0, 50);
      
      // Cache the filtered deals
      if (newFilteredDeals.length > 0) {
        setFilteredDealsCache(newFilteredDeals);
        localStorage.setItem(`filteredDealsCache_${pageTypeIdentifier}`, JSON.stringify(newFilteredDeals));
      }
      
      return newFilteredDeals;
    })()
  ) : [];

  // Function to clear the cache
  const clearCache = () => {
    try {
      // Remove all cache items
      localStorage.removeItem('kingPricesData');
      localStorage.removeItem('kingPricesTimestamp');
      localStorage.removeItem('filteredDealsCache');
      localStorage.removeItem('selectedPriceArea');
      localStorage.removeItem('selectedCustomerType');
      
      // Update status
      setCacheStatus('Cache cleared. Refresh the page to fetch new data.');
      console.log('Cache cleared successfully');
      
      // Force reload the page to fetch fresh data
      window.location.reload();
    } catch (error) {
      console.error('Error clearing cache:', error);
      setCacheStatus('Error clearing cache: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white shadow overflow-hidden rounded-lg p-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <p className="text-center mt-4 text-gray-600">Laster inn strømpriser for {selectedPriceArea}...</p>
        {cacheStatus && (
          <p className="text-center mt-2 text-xs text-gray-500">{cacheStatus}</p>
        )}
      </div>
    );
  }

  if (!filteredDeals.length) {
    return (
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <label htmlFor="priceArea" className="block text-sm font-medium text-gray-700">
              Velg prisområde:
            </label>
            <select
              id="priceArea"
              name="priceArea"
              className="mt-1 block w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={selectedPriceArea}
              onChange={handlePriceAreaChange}
            >
              <option value="NO1">NO1 - Oslo / Øst-Norge</option>
              <option value="NO2">NO2 - Kristiansand / Sør-Norge</option>
              <option value="NO3">NO3 - Trondheim / Midt-Norge</option>
              <option value="NO4">NO4 - Tromsø / Nord-Norge</option>
              <option value="NO5">NO5 - Bergen / Vest-Norge</option>
            </select>
          </div>
        </div>
        
        <div className="p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">Ingen strømavtaler tilgjengelig</h3>
          <p className="mt-1 text-sm text-gray-500">
            For øyeblikket har vi ingen strømavtaler i {priceAreas.find(area => area.id === selectedPriceArea)?.name} i vår database.
          </p>
        </div>
      </div>
    );
  }

  // Update the price breakdown calculation to include all fees and seasonal adjustment
  const getCustomPriceBreakdown = (deal: any, spotPrice: number) => {
    // Calculate monthly consumption with seasonal adjustment
    const monthlyConsumption = getCurrentMonthConsumption();
    
    const priceInNOK = spotPrice / 100;
    const energyCost = monthlyConsumption * priceInNOK;
    const monthlyFee = deal.monthlyFee || 0;
    const elCertFee = (deal.elCertificatePrice || 0) * monthlyConsumption;
    const postalLetterFee = (deal.feePostalLetter || 0);
    const additionalFees = (deal.additionalFees || 0);
    const totalMonthlyCost = energyCost + monthlyFee + elCertFee + postalLetterFee + additionalFees;
    
    return {
      monthlyConsumption,
      energyCost,
      monthlyFee,
      elCertFee,
      postalLetterFee,
      additionalFees,
      totalMonthlyCost,
      addonPrice: deal.addonPrice || 0
    };
  };

  // Helper function to get provider logo URL by organization number
  const getProviderLogoUrl = (provider: any): string | null => {
    if (!provider) return null;
    
    // Try to get the logo by organization number
    if (provider.organizationNumber && providerLogoUrls[provider.organizationNumber]) {
      return providerLogoUrls[provider.organizationNumber];
    }
    
    // If no logo found by organization number, try by name
    if (provider.name && providerLogoUrls[provider.name]) {
      return providerLogoUrls[provider.name];
    }
    
    return null;
  };

  // Helper function to get provider slug
  const getProviderSlug = (provider: any): string | null => {
    if (!provider) return null;
    
    // If provider has a slug, use it
    if (provider.slug) {
      return provider.slug;
    }
    
    // Try to find the provider in the providers array
    const foundProvider = providers.find(p => 
      p.organizationNumber === provider.organizationNumber || 
      p.name === provider.name
    );
    
    return foundProvider?.slug || null;
  };

  // Add a debug indicator at the bottom
  const renderDebugInfo = () => {
    return (
      <div className="text-xs text-gray-500 p-2 text-center">
        {cacheStatus}
        <div className="mt-1">
          <button 
            onClick={clearCache}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Clear Cache
          </button>
        </div>
        {debugInfo && (
          <details className="mt-2">
            <summary className="cursor-pointer">Debug Info</summary>
            <pre className="text-left mt-2 p-2 bg-gray-100 rounded overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </details>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white shadow overflow-hidden rounded-lg">
      {/* Area and customer type selectors - improved alignment */}
      <div className="p-4 border-b">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="priceArea" className="block text-sm font-medium text-gray-700 mb-2">
              Velg prisområde:
            </label>
            <div className="relative">
              <select
                id="priceArea"
                name="priceArea"
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={selectedPriceArea}
                onChange={handlePriceAreaChange}
              >
                <option value="NO1">NO1 - Oslo / Øst-Norge</option>
                <option value="NO2">NO2 - Kristiansand / Sør-Norge</option>
                <option value="NO3">NO3 - Trondheim / Midt-Norge</option>
                <option value="NO4">NO4 - Tromsø / Nord-Norge</option>
                <option value="NO5">NO5 - Bergen / Vest-Norge</option>
              </select>
            </div>
          </div>
          
          <div>
            <label htmlFor="customerType" className="block text-sm font-medium text-gray-700 mb-2">
              Kundetype:
            </label>
            <div className="relative">
              <select
                id="customerType"
                name="customerType"
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={selectedCustomerType}
                onChange={handleCustomerTypeChange}
              >
                {customerTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile view - fixed logo display */}
      <div className="md:hidden">
        {filteredDeals.map((deal, index) => {
          const providerSlug = getProviderSlug(deal.provider);
          const logoUrl = getProviderLogoUrl(deal.provider);
          const isExpanded = expandedDeal === deal.id;
          const priceBreakdown = getCustomPriceBreakdown(deal, deal.basePrice);
          
          return (
            <div key={`top50-mobile-${deal.id}`} className="border-b last:border-b-0">
              <div className="p-4">
                <div className="flex items-start">
                  {/* Logo with proper sizing */}
                  <div className="flex-shrink-0 mr-3">
                    {logoUrl ? (
                      <div className="w-12 h-12 flex items-center justify-center bg-white rounded-md overflow-hidden p-1">
                        <img 
                          src={logoUrl} 
                          alt={`${deal.provider?.name} logo`} 
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-md">
                        <span className="text-xs text-gray-500">{deal.provider?.name?.substring(0, 2) || 'N/A'}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Deal info */}
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        {providerSlug ? (
                          <Link href={`/stromleverandorer/${providerSlug}`} className="text-sm font-medium text-blue-600 hover:text-blue-800">
                            {deal.provider?.name}
                          </Link>
                        ) : (
                          <span className="text-sm font-medium text-gray-900">
                            {deal.provider?.name}
                          </span>
                        )}
                        <div className="text-xs text-gray-500 mt-0.5">
                          {getProductTypeNorwegian(deal.productType)}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          SPOTPRIS {deal.addonPrice > 0 ? '+' : ''}{formatSpotPrice(deal.addonPrice)} øre
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {formatSpotPrice(deal.basePrice)} øre/kWt
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-2">
                      <div className="text-base font-bold text-gray-900">
                        {formatMonthlyCost(deal.calculatedMonthlyPrice)} kr
                      </div>
                      
                      <button
                        onClick={() => toggleDealExpansion(deal.id)}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {isExpanded ? 'Skjul detaljer' : 'Vis detaljer'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {isExpanded && (
                <div className="p-4 bg-blue-50 border-t border-blue-100">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-medium text-gray-900 mb-2">Prisdetaljer</h3>
                      <dl className="grid grid-cols-2 gap-x-3 gap-y-2">
                        <div className="col-span-1">
                          <dt className="text-sm font-medium text-gray-500">Nordpool spotpris {selectedPriceArea}</dt>
                          <dd className="mt-1 text-sm text-gray-900">{formatSpotPrice(deal.spotPrice)} øre/kWt</dd>
                        </div>
                        <div className="col-span-1">
                          <dt className="text-sm font-medium text-gray-500">Påslag</dt>
                          <dd className="mt-1 text-sm text-gray-900">{formatSpotPrice(deal.addonPrice)} øre/kWt</dd>
                        </div>
                        <div className="col-span-1">
                          <dt className="text-sm font-medium text-gray-500">Total spotpris + påslag</dt>
                          <dd className="mt-1 text-sm text-gray-900">{formatSpotPrice(deal.basePrice)} øre/kWt</dd>
                        </div>
                      </dl>
                    </div>
                    
                    <div>
                      <h3 className="text-base font-medium text-gray-900 mb-2">Om avtalen</h3>
                      <dl className="grid grid-cols-2 gap-x-3 gap-y-2">
                        <div className="col-span-1">
                          <dt className="text-sm font-medium text-gray-500">Forbruk {formatConsumption(priceBreakdown.monthlyConsumption)}</dt>
                          <dd className="mt-1 text-sm text-gray-900">{formatMonthlyCost(priceBreakdown.energyCost)} kr</dd>
                        </div>
                        <div className="col-span-1">
                          <dt className="text-sm font-medium text-gray-500">Fastbeløp</dt>
                          <dd className="mt-1 text-sm text-gray-900">{formatMonthlyCost(deal.monthlyFee)} kr</dd>
                        </div>
                        <div className="col-span-1">
                          <dt className="text-sm font-medium text-gray-500">Elsertifikat</dt>
                          <dd className="mt-1 text-sm text-gray-900">{formatMonthlyCost(priceBreakdown.elCertFee)} kr</dd>
                        </div>
                        <div className="col-span-1">
                          <dt className="text-sm font-medium text-gray-500">Brevfaktura</dt>
                          <dd className="mt-1 text-sm text-gray-900">{formatMonthlyCost(deal.feePostalLetter)} kr</dd>
                        </div>
                        <div className="col-span-1">
                          <dt className="text-sm font-medium text-gray-500">Andre avgifter</dt>
                          <dd className="mt-1 text-sm text-gray-900">{formatMonthlyCost(deal.additionalFees)} kr</dd>
                        </div>
                        <div className="col-span-1">
                          <dt className="text-sm font-medium text-gray-500">Beregnet strømutgift for {getCurrentMonthName()}</dt>
                          <dd className="mt-1 text-sm text-gray-900">{formatMonthlyCost(priceBreakdown.totalMonthlyCost)} kr</dd>
                        </div>
                      </dl>
                    </div>
                    
                    <div className="pt-2">
                      <Link 
                        href={deal.orderUrl || "/tilbud"}
                        className="w-full block text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Få tilbud
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Desktop view - fixed logo display */}
      <div className="hidden md:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Leverandør
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Strømavtale
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pris per kWt
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Månedspris
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Detaljer
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredDeals.map((deal, index) => {
              const providerSlug = getProviderSlug(deal.provider);
              const logoUrl = getProviderLogoUrl(deal.provider);
              const isExpanded = expandedDeal === deal.id;
              const priceBreakdown = getCustomPriceBreakdown(deal, deal.basePrice);
              
              return (
                <React.Fragment key={`top50-desktop-${deal.id}`}>
                  <tr className={isExpanded ? 'bg-blue-50' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center">
                          {logoUrl ? (
                            <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center p-1 overflow-hidden">
                              <img 
                                className="max-h-8 max-w-8 object-contain" 
                                src={logoUrl} 
                                alt={`${deal.provider?.name} logo`} 
                              />
                            </div>
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-xs text-gray-500">{deal.provider?.name?.substring(0, 2) || 'N/A'}</span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          {providerSlug ? (
                            <Link href={`/stromleverandorer/${providerSlug}`} className="text-sm font-medium text-blue-600 hover:text-blue-800">
                              {deal.provider?.name}
                            </Link>
                          ) : (
                            <div className="text-sm font-medium text-gray-900">{deal.provider?.name}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{deal.name}</div>
                      <div className="text-xs text-gray-500">
                        {getProductTypeNorwegian(deal.productType)}
                        {deal.agreementTime > 0 && ` • ${deal.agreementTime} ${deal.agreementTimeUnit === 'year' ? 'års' : 'måneders'} bindingstid`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatSpotPrice(deal.basePrice)} øre
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatSpotMonthlyCost(deal.calculatedMonthlyPrice)} kr
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => toggleDealExpansion(deal.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        {isExpanded ? 'Skjul detaljer' : 'Vis detaljer'}
                      </button>
                    </td>
                  </tr>
                  
                  {/* Expanded Detail View */}
                  {isExpanded && priceBreakdown && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 bg-blue-50">
                        <div className="grid grid-cols-2 gap-8">
                          <div>
                            <h3 className="text-base font-medium text-gray-900 mb-2">Prisdetaljer</h3>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Nordpool spotpris {selectedPriceArea}</span>
                                <span className="font-medium">{formatSpotPrice(deal.spotPrice)} øre/kWt</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Påslag</span>
                                <span className="font-medium">{formatSpotPrice(deal.addonPrice)} øre/kWt</span>
                              </div>
                              <div className="flex justify-between text-sm border-t pt-1 mt-1">
                                <span className="text-gray-800 font-medium">Total spotpris + påslag</span>
                                <span className="font-bold">{formatSpotPrice(deal.basePrice)} øre/kWt</span>
                              </div>
                            </div>
                            
                            <div className="mt-4 space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Forbruk {formatConsumption(priceBreakdown.monthlyConsumption)}</span>
                                <span className="font-medium">{formatMonthlyCost(priceBreakdown.energyCost)} kr</span>
                              </div>
                              
                              {deal.monthlyFee > 0 && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Fastbeløp</span>
                                  <span className="font-medium">{formatMonthlyCost(deal.monthlyFee)} kr</span>
                                </div>
                              )}
                              
                              {deal.elCertificatePrice > 0 && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Elsertifikat</span>
                                  <span className="font-medium">{formatMonthlyCost(priceBreakdown.elCertFee)} kr</span>
                                </div>
                              )}
                              
                              {deal.feePostalLetter > 0 && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Brevfaktura</span>
                                  <span className="font-medium">{formatMonthlyCost(deal.feePostalLetter)} kr</span>
                                </div>
                              )}
                              
                              {deal.additionalFees > 0 && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Andre avgifter</span>
                                  <span className="font-medium">{formatMonthlyCost(deal.additionalFees)} kr</span>
                                </div>
                              )}
                              
                              <div className="flex justify-between text-sm border-t pt-1 mt-1">
                                <span className="text-gray-800 font-medium">Beregnet strømutgift for {getCurrentMonthName()}</span>
                                <span className="font-bold">{formatMonthlyCost(priceBreakdown.totalMonthlyCost)} kr</span>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-base font-medium text-gray-900 mb-2">Om avtalen</h3>
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
                                <dd className="mt-1 text-sm text-gray-900">
                                  {priceAreas.find(area => area.id === selectedPriceArea)?.name || 'Alle områder'}
                                </dd>
                              </div>
                              {deal.cancellationFee > 0 && (
                                <div className="sm:col-span-1">
                                  <dt className="text-sm font-medium text-gray-500">Bruddgebyr</dt>
                                  <dd className="mt-1 text-sm text-gray-900">{formatSpotMonthlyCost(deal.cancellationFee)} kr</dd>
                                </div>
                              )}
                            </dl>
                            
                            {deal.description && (
                              <div className="mt-4">
                                <h4 className="text-sm font-medium text-gray-500">Beskrivelse</h4>
                                <p className="mt-1 text-sm text-gray-900">{deal.description}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Add debug info */}
      {/* {renderDebugInfo()} */}
    </div>
  );
};

export default Top50ProductList; 