'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import municipalitiesData from '@/app/data/municipalities.json';
import Image from 'next/image';
import providerLogoUrls from '@/app/data/providerLogoUrls';

interface SalesNetwork {
  id: string | number;
  type: string;
  name: string;
  kwPrice: number;
  purchaseKwPrice: number | null;
}

interface Product {
  id: number;
  productId: number;
  name: string;
  productType: 'fixed' | 'hourly_spot' | 'spot' | 'plus';
  monthlyFee: number;
  addonPrice: number;
  elCertificatePrice: number;
  salesNetworks: SalesNetwork[];
  addonPriceMinimumFixedFor?: number;
  addonPriceMinimumFixedForUnit?: string;
  provider: {
    name: string;
    organizationNumber: number;
    pricelistUrl?: string;
  };
}

interface Provider {
  name: string;
  organizationNumber: number;
  products: Product[];
}

interface PriceComparison {
  currentPrice: number;
  averagePrice: number;
  areaCode: string;
}

interface Municipality {
  number: number;
  name: string;
  countyNumber: number;
  areaCode: string;
  postalCodes: string[];
}

// Add type for the provider logo URLs at the top
type ProviderLogoUrls = typeof providerLogoUrls;
type OrganizationNumber = keyof ProviderLogoUrls;

export default function ElectricityDealTester() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isProvidersLoading, setIsProvidersLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [postalCode, setPostalCode] = useState<string>('');
  const [priceComparison, setPriceComparison] = useState<PriceComparison | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedProductDetails, setSelectedProductDetails] = useState<Product | null>(null);

  const fadeIn = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.3 }
  };

  // Fetch providers and deals
  useEffect(() => {
    const fetchDeals = async () => {
      setIsProvidersLoading(true);
      try {
        const response = await fetch('/api/electricity-deals');
        const data = await response.json();
        if (data.success) {
          const providerMap = data.data.products.reduce((acc: any, product: any) => {
            if (!acc[product.provider.name]) {
              acc[product.provider.name] = {
                name: product.provider.name,
                products: [],
              };
            }
            acc[product.provider.name].products.push(product);
            return acc;
          }, {});
          setProviders(Object.values(providerMap));
        }
      } catch (error) {
        console.error('Error fetching deals:', error);
      } finally {
        setIsProvidersLoading(false);
      }
    };
    fetchDeals();
  }, []);

  // Add this function to find municipality by postal code
  const findMunicipalityByPostalCode = (postalCode: string): Municipality | undefined => {
    return municipalitiesData.find((municipality: Municipality) => 
      municipality.postalCodes.includes(postalCode)
    );
  };

  // Update the getAreaCodeFromPostalCode function
  const getAreaCodeFromPostalCode = async (postal: string): Promise<string> => {
    try {
      const municipality = findMunicipalityByPostalCode(postal);
      
      if (municipality) {
        const response = await fetch('/api/stromtest-local-grids');
        const data = await response.json();
        
        if (!data.error) {
          const localGrid = Array.isArray(data) ? 
            data.find((grid: any) => grid.municipalityNumber === municipality.number) : null;
          
          if (localGrid) {
            return localGrid.areaCode;
          }
        }
      }

      return 'NO1';
    } catch (error) {
      console.error('Error getting area code:', error);
      return 'NO1';
    }
  };

  // Update the price comparison effect to handle async area code lookup
  useEffect(() => {
    if (postalCode.length === 4 && selectedProductDetails) {
      const fetchPriceComparison = async () => {
        setIsLoading(true);
        try {
          const areaCode = await getAreaCodeFromPostalCode(postalCode);

          const response = await fetch(`/api/average-electricity-price?areaCode=${areaCode}`);
          const data = await response.json();
          
          if (data.success) {
            const marketPrice = data.data.currentPrice;
            const currentPrice = calculateCurrentPrice(selectedProductDetails, marketPrice);
            
            // Calculate average market price plus average addon
            const averageAddon = 5; // Example: 5 øre/kWh as average addon
            const totalAveragePrice = data.data.averagePrice + averageAddon;
            
            setTimeout(() => {
              setPriceComparison({
                currentPrice: currentPrice,
                averagePrice: totalAveragePrice,
                areaCode: areaCode
              });
              setIsLoading(false);
            }, 1500); // Slightly faster animation
          } else {
            console.error('API returned success: false', data);
            setIsLoading(false);
          }
        } catch (error) {
          console.error('Error in price comparison:', error);
          setIsLoading(false);
        }
      };
      fetchPriceComparison();
    }
  }, [postalCode, selectedProductDetails]);

  const handleNextStep = () => {
    setStep(prev => prev + 1);
  };

  const handleBackStep = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
      // Reset relevant state when going back
      if (step === 2) setSelectedProduct('');
      if (step === 3) setPostalCode('');
      if (step === 4) setPriceComparison(null);
    }
  };

  const handleProductSelect = (productId: string) => {
    const provider = providers.find(p => p.name === selectedProvider);
    const numericProductId = parseInt(productId, 10);
    const product = provider?.products.find(p => p.id === numericProductId);
    
    if (product) {
      setSelectedProductDetails(product);
      setSelectedProduct(productId);
      handleNextStep();
    }
  };

  const renderProgressBar = () => (
    <div className="w-full mb-8 px-2">
      <div className="flex justify-between mb-2">
        <span className={`text-xs font-semibold uppercase tracking-wider ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>Leverandør</span>
        <span className={`text-xs font-semibold uppercase tracking-wider ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>Avtale</span>
        <span className={`text-xs font-semibold uppercase tracking-wider ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>Postnummer</span>
        <span className={`text-xs font-semibold uppercase tracking-wider ${step >= 4 ? 'text-blue-600' : 'text-gray-400'}`}>Resultat</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-blue-600 rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: `${(step / 4) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div {...fadeIn} className="bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-gray-100">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Hvilken strømleverandør har du i dag?</h2>
            <p className="text-gray-500 mb-8">Velg din nåværende leverandør for å starte sammenligningen</p>
            
            {isProvidersLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 font-medium">Henter leverandører...</p>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <select 
                  value={selectedProvider}
                  onChange={(e) => {
                    setSelectedProvider(e.target.value);
                    if (e.target.value) setTimeout(handleNextStep, 300);
                  }}
                  className="block w-full pl-10 pr-10 py-4 text-base border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm rounded-xl shadow-sm bg-gray-50 hover:bg-white transition-colors cursor-pointer appearance-none"
                >
                  <option value="">Velg leverandør fra listen</option>
                  {providers.sort((a, b) => a.name.localeCompare(b.name)).map(provider => (
                    <option key={provider.name} value={provider.name}>
                      {provider.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
          </motion.div>
        );

      case 2:
        return (
          <motion.div {...fadeIn} className="bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-gray-100">
            <button onClick={handleBackStep} className="text-sm text-gray-500 hover:text-blue-600 mb-6 flex items-center transition-colors">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Tilbake
            </button>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Hvilken avtale har du?</h2>
            <p className="text-gray-500 mb-8">Velg avtalen du har hos {selectedProvider}</p>
            
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {providers
                .find(p => p.name === selectedProvider)
                ?.products.map(product => (
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    key={product.id}
                    onClick={() => handleProductSelect(product.id.toString())}
                    className="p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all flex justify-between items-center group"
                  >
                    <div>
                      <h4 className="font-semibold text-gray-900 group-hover:text-blue-700">{product.name}</h4>
                      <p className="text-sm text-gray-500">
                        {product.productType === 'fixed' ? 'Fastpris' : 'Spotpris'} • 
                        {product.productType === 'fixed' ? 
                          ` ${(product.salesNetworks[0]?.kwPrice).toFixed(2)} øre/kWh` :
                          ` Spot + ${product.addonPrice.toFixed(2)} øre/kWh`
                        }
                      </p>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </motion.div>
                ))}
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div {...fadeIn} className="bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-gray-100">
            <button onClick={handleBackStep} className="text-sm text-gray-500 hover:text-blue-600 mb-6 flex items-center transition-colors">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Tilbake
            </button>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Hvor bor du?</h2>
            <p className="text-gray-500 mb-8">Vi trenger postnummeret ditt for å hente riktige strømpriser for ditt område</p>
            
            <div className="max-w-xs mx-auto">
              <input
                type="text"
                value={postalCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setPostalCode(value);
                  if (value.length === 4) {
                    setTimeout(handleNextStep, 300);
                  }
                }}
                placeholder="0000"
                className="w-full p-6 text-center text-4xl font-bold tracking-[0.5em] border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-0 outline-none transition-all placeholder-gray-300"
                maxLength={4}
                autoFocus
              />
              <p className="text-center text-sm text-gray-400 mt-4">Skriv inn 4 siffer</p>
            </div>
          </motion.div>
        );

      case 4:
        const organizationNumber = selectedProductDetails?.provider?.organizationNumber?.toString() as OrganizationNumber;
        
        return (
          <motion.div {...fadeIn} className="bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-gray-100">
             <button onClick={handleBackStep} className="text-sm text-gray-500 hover:text-blue-600 mb-6 flex items-center transition-colors">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Tilbake
            </button>
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Analyserer din strømavtale</h2>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <span>{selectedProvider}</span>
                <span>•</span>
                <span>{selectedProductDetails?.name}</span>
                <span>•</span>
                <span>{postalCode}</span>
              </div>
            </div>
            
            <div className="flex justify-center mb-12">
              {organizationNumber && providerLogoUrls[organizationNumber] ? (
                <div className="relative w-32 h-32 bg-white rounded-full shadow-lg p-4 flex items-center justify-center border border-gray-100">
                  <Image 
                    src={providerLogoUrls[organizationNumber]}
                    alt={`${selectedProvider} logo`}
                    width={80}
                    height={80}
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center text-4xl font-bold text-gray-400">
                  {selectedProvider.charAt(0)}
                </div>
              )}
            </div>
            
            {isLoading ? (
              <div className="py-8">
                <div className="max-w-md mx-auto space-y-4">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-blue-500"
                      animate={{ width: ["0%", "100%"] }}
                      transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity }}
                    />
                  </div>
                  <div className="text-center text-gray-600 font-medium">Sammenligner priser med markedet...</div>
                </div>
              </div>
            ) : priceComparison ? (
              renderPriceComparison(priceComparison, selectedProductDetails)
            ) : (
              <div className="text-center p-8 bg-red-50 rounded-xl text-red-600">
                <p>Kunne ikke hente prissammenligning. Vennligst prøv igjen.</p>
                <button onClick={() => window.location.reload()} className="mt-4 text-sm font-semibold underline">Last siden på nytt</button>
              </div>
            )}
          </motion.div>
        );
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto font-inter">
      {renderProgressBar()}
      <AnimatePresence mode="wait">
        {renderStep()}
      </AnimatePresence>
    </div>
  );
}

// Calculation logic remains the same
const calculateCurrentPrice = (product: Product, marketPrice: number): number => {
  if (!product) return 0;

  switch (product.productType) {
    case 'fixed':
      return product.salesNetworks[0]?.kwPrice || 0;
    
    case 'hourly_spot':
    case 'spot':
    case 'plus':
      const monthlyFeePerKwh = (product.monthlyFee || 0) / 1000;
      return marketPrice + 
             ((product.addonPrice || 0) * 100) +
             (product.elCertificatePrice || 0) + 
             monthlyFeePerKwh;
    
    default:
      return 0;
  }
};

const renderPriceComparison = (priceComparison: PriceComparison, selectedProductDetails: Product | null) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="space-y-8"
  >
    {selectedProductDetails?.addonPriceMinimumFixedFor === 1 && 
     selectedProductDetails?.addonPriceMinimumFixedForUnit === 'month' && (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-4">
        <div className="flex-shrink-0 mt-1">
          <svg className="h-6 w-6 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <h4 className="text-amber-800 font-semibold mb-1">Dette ser ut til å være et lokketilbud</h4>
          <p className="text-sm text-amber-700 leading-relaxed">
            Påslaget er kun garantert i én måned, deretter kan det øke betydelig. Det kan være lurt å bytte avtale snart.
          </p>
        </div>
      </div>
    )}

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 text-center">
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Din beregnede pris</p>
        <div className="flex items-baseline justify-center">
          <span className="text-4xl font-extrabold text-gray-900">{priceComparison.currentPrice.toFixed(2)}</span>
          <span className="ml-2 text-gray-500 font-medium">øre/kWh</span>
        </div>
        <p className="text-xs text-gray-400 mt-3">Inkluderer påslag og månedlige gebyrer</p>
      </div>
      
      <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase">Markedet</div>
        <p className="text-sm font-medium text-blue-600 uppercase tracking-wide mb-2">Gjennomsnittspris</p>
        <div className="flex items-baseline justify-center">
          <span className="text-4xl font-extrabold text-blue-900">{priceComparison.averagePrice.toFixed(2)}</span>
          <span className="ml-2 text-blue-600 font-medium">øre/kWh</span>
        </div>
        <p className="text-xs text-blue-400 mt-3">Basert på konkurransedyktige avtaler</p>
      </div>
    </div>
    
    <div className="bg-white border-2 border-gray-100 rounded-2xl p-8 text-center shadow-sm">
      <h4 className="text-xl font-bold text-gray-900 mb-6">Konklusjon</h4>
      
      {priceComparison.currentPrice > priceComparison.averagePrice ? (
        <div>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h5 className="text-lg font-semibold text-red-600 mb-2">Du betaler for mye</h5>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Din avtale er ca. <span className="font-bold text-gray-900">{((priceComparison.currentPrice - priceComparison.averagePrice) / priceComparison.averagePrice * 100).toFixed(1)}%</span> dyrere enn de beste avtalene på markedet akkurat nå.
          </p>
          <a href="/tilbud" className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 text-base font-bold text-white transition-all duration-200 bg-blue-600 border border-transparent rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg shadow-blue-200">
            Få tilbud på billigere strøm
            <svg className="w-5 h-5 ml-2 -mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      ) : (
        <div>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h5 className="text-lg font-semibold text-green-600 mb-2">Du har en god avtale!</h5>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Din strømavtale er konkurransedyktig sammenlignet med markedet. Det er ingen akutt grunn til å bytte.
          </p>
          <a href="/tilbud" className="text-blue-600 font-medium hover:text-blue-800 underline decoration-2 underline-offset-2">
            Sjekk om du kan spare enda mer
          </a>
        </div>
      )}
    </div>
  </motion.div>
);