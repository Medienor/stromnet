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

interface LocalGrid {
  id: number;
  name: string;
  municipalityNumber: number;
  areaCode: string;
  vatExemption: boolean;
  elCertificateExemption: boolean;
}

// Add type for the provider logo URLs at the top
type ProviderLogoUrls = typeof providerLogoUrls;
type OrganizationNumber = keyof ProviderLogoUrls;

export default function ElectricityDealTester() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [postalCode, setPostalCode] = useState<string>('');
  const [priceComparison, setPriceComparison] = useState<PriceComparison | null>(null);
  const [bestDeals, setBestDeals] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedProductDetails, setSelectedProductDetails] = useState<Product | null>(null);

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  // Fetch providers and deals
  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const response = await fetch('/api/electricity-deals');
        const data = await response.json();
        if (data.success) {
          // Group products by provider
          const providerMap = data.data.products.reduce((acc, product) => {
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
      }
    };
    fetchDeals();
  }, []);

  // Add logging for state changes
  useEffect(() => {
    console.log('Selected Provider:', selectedProvider);
    console.log('Selected Product:', selectedProduct);
    console.log('Selected Product Details:', selectedProductDetails);
    console.log('Postal Code:', postalCode);
    console.log('Price Comparison:', priceComparison);
  }, [selectedProvider, selectedProduct, selectedProductDetails, postalCode, priceComparison]);

  // Add this function to find municipality by postal code
  const findMunicipalityByPostalCode = (postalCode: string): Municipality | undefined => {
    return municipalitiesData.find((municipality: Municipality) => 
      municipality.postalCodes.includes(postalCode)
    );
  };

  // Update the getAreaCodeFromPostalCode function
  const getAreaCodeFromPostalCode = async (postal: string): Promise<string> => {
    console.log('Getting area code for postal code:', postal);
    
    try {
      const municipality = findMunicipalityByPostalCode(postal);
      
      if (municipality) {
        console.log('Found municipality:', municipality.name);
        console.log('Municipality number:', municipality.number);
        
        const response = await fetch('/api/stromtest-local-grids');
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        console.log('Fetched local grids:', data);
        
        const localGrid = Array.isArray(data) ? 
          data.find((grid: any) => grid.municipalityNumber === municipality.number) : null;
        
        if (localGrid) {
          console.log('Found local grid:', localGrid.name);
          console.log('Area code from local grid:', localGrid.areaCode);
          return localGrid.areaCode;
        } else {
          console.warn('No local grid found for municipality number:', municipality.number);
        }
      }

      console.warn('Defaulting to NO1 for postal code:', postal);
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
          console.log('Final area code:', areaCode);

          const response = await fetch(`/api/average-electricity-price?areaCode=${areaCode}`);
          const data = await response.json();
          
          if (data.success) {
            const marketPrice = data.data.currentPrice;
            const currentPrice = calculateCurrentPrice(selectedProductDetails, marketPrice);
            
            // Calculate average market price plus average addon
            const averageAddon = 5; // Example: 5 øre/kWh as average addon
            const totalAveragePrice = data.data.averagePrice + averageAddon;
            
            setTimeout(() => {
              console.log('Price breakdown:', {
                areaCode,
                baseMarketPrice: marketPrice,
                addonPrice: selectedProductDetails.addonPrice,
                elCertificate: selectedProductDetails.elCertificatePrice,
                monthlyFee: selectedProductDetails.monthlyFee,
                calculatedTotal: currentPrice,
                marketAverage: data.data.averagePrice,
                totalWithAverageAddon: totalAveragePrice
              });

              setPriceComparison({
                currentPrice: currentPrice,
                averagePrice: totalAveragePrice,
                areaCode: areaCode
              });
              setIsLoading(false);
            }, 2000);
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

  // Add logging to handleProductSelect
  const handleProductSelect = (productId: string) => {
    console.log('Product selected:', productId);
    const provider = providers.find(p => p.name === selectedProvider);
    console.log('Found provider:', provider);
    
    // Convert the productId to number since it comes from select as string
    const numericProductId = parseInt(productId, 10);
    const product = provider?.products.find(p => p.id === numericProductId);
    console.log('Found product:', product);
    
    if (product) {
      setSelectedProductDetails(product);
      setSelectedProduct(productId);
      handleNextStep();
    } else {
      console.error('Product not found:', {
        productId,
        numericProductId,
        availableProducts: provider?.products.map(p => p.id)
      });
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div 
            {...fadeIn}
            className="bg-white rounded-lg shadow-lg p-8"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Velg din nåværende strømleverandør</h3>
            <select 
              value={selectedProvider}
              onChange={(e) => {
                setSelectedProvider(e.target.value);
                handleNextStep();
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Velg leverandør</option>
              {providers.map(provider => (
                <option key={provider.name} value={provider.name}>
                  {provider.name}
                </option>
              ))}
            </select>
          </motion.div>
        );

      case 2:
        return (
          <motion.div 
            {...fadeIn}
            className="bg-white rounded-lg shadow-lg p-8"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Velg din nåværende strømavtale</h3>
            <select
              value={selectedProduct}
              onChange={(e) => handleProductSelect(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Velg avtale</option>
              {providers
                .find(p => p.name === selectedProvider)
                ?.products.map(product => (
                  <option key={product.id} value={product.id.toString()}>
                    {product.name} - {
                      product.productType === 'fixed' ? 
                        `${product.salesNetworks[0]?.kwPrice.toFixed(2)} øre/kWh` :
                      product.productType === 'spot' || product.productType === 'hourly_spot' || product.productType === 'plus' ? 
                        `Spot + ${product.addonPrice.toFixed(2)} øre/kWh` :
                        'Ukjent pristype'
                    }
                  </option>
                ))}
            </select>
          </motion.div>
        );

      case 3:
        return (
          <motion.div 
            {...fadeIn}
            className="bg-white rounded-lg shadow-lg p-8"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Skriv inn ditt postnummer</h3>
            <input
              type="text"
              value={postalCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                setPostalCode(value);
                if (value.length === 4) {
                  handleNextStep();
                }
              }}
              placeholder="0000"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-wide"
              maxLength={4}
            />
          </motion.div>
        );

      case 4:
        // Get organization number from the product's provider
        const organizationNumber = selectedProductDetails?.provider?.organizationNumber?.toString() as OrganizationNumber;
        
        return (
          <motion.div 
            {...fadeIn}
            className="bg-white rounded-lg shadow-lg p-8"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">Analyserer din strømavtale</h3>
            
            <div className="flex items-center justify-center mb-8 space-x-4 bg-white border border-gray-100 p-6 rounded-lg shadow-sm">
              {organizationNumber && providerLogoUrls[organizationNumber] && (
                <Image 
                  src={providerLogoUrls[organizationNumber]}
                  alt={`${selectedProvider} logo`}
                  width={90}
                  height={90}
                  className="object-contain"
                />
              )}
              <div className="text-gray-700">
                <p className="font-semibold">{selectedProductDetails?.provider?.name || 'No provider selected'}</p>
                <p className="text-sm">{selectedProductDetails?.name || 'No product selected'}</p>
              </div>
            </div>
            
            {isLoading ? (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <motion.div
                    animate={{
                      rotate: 360
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    className="w-16 h-16"
                  >
                    <svg className="w-full h-full text-blue-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </motion.div>
                </div>
                <div className="text-center space-y-3">
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-gray-600"
                  >
                    Sammenligner priser...
                  </motion.p>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.0 }}
                    className="text-gray-600"
                  >
                    Søker etter bedre avtaler...
                  </motion.p>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    className="text-gray-600"
                  >
                    Analyserer besparelser...
                  </motion.p>
                </div>
              </div>
            ) : priceComparison ? (
              renderPriceComparison(priceComparison, selectedProductDetails)
            ) : (
              <div className="text-center text-gray-600">
                Kunne ikke hente prissammenligning. Vennligst prøv igjen.
              </div>
            )}

            <div className="mt-8 bg-blue-50 p-6 rounded-lg text-center">
              <h4 className="text-lg font-semibold text-blue-900 mb-3">
                Få tilbud fra opptil 3 strømleverandører
              </h4>
              <p className="text-blue-700 mb-4">Se hvor mye du kan spare!</p>
              <a 
                href="/tilbud"
                className="inline-block bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Se tilbud
              </a>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="max-w-2xl mx-auto font-inter">
      <div className="mb-12">
        <div className="flex justify-between items-center mb-8 px-4">
          {[1, 2, 3, 4].map((stepNumber) => (
            <div key={stepNumber} className="flex flex-1 items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                  stepNumber <= step 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {stepNumber}
              </div>
              {stepNumber < 4 && (
                <div 
                  className={`flex-1 h-1 mx-4 rounded ${
                    stepNumber < step ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
      <AnimatePresence mode="wait">
        {renderStep()}
      </AnimatePresence>
    </div>
  );
}

// Update the calculation function to properly handle Norwegian electricity pricing
const calculateCurrentPrice = (product: Product, marketPrice: number): number => {
  if (!product) return 0;

  switch (product.productType) {
    case 'fixed':
      // For fixed price contracts, use the kwPrice from the sales network
      return product.salesNetworks[0]?.kwPrice || 0;
    
    case 'hourly_spot':
    case 'spot':
    case 'plus':
      // For spot-based products:
      // Market price + addon price + el certificate + monthly fee converted to per kWh
      const monthlyFeePerKwh = (product.monthlyFee || 0) / 1000; // Assuming 1000 kWh monthly usage
      return marketPrice + 
             (product.addonPrice || 0) + 
             (product.elCertificatePrice || 0) + 
             monthlyFeePerKwh;
    
    default:
      return 0;
  }
};

// Update the results display to show more detailed price breakdown
const renderPriceComparison = (priceComparison: PriceComparison, selectedProductDetails: Product | null) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.5 }}
    className="space-y-6"
  >
    {selectedProductDetails?.addonPriceMinimumFixedFor === 1 && 
     selectedProductDetails?.addonPriceMinimumFixedForUnit === 'month' && (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>OBS!</strong> Dette er et lokketilbud. Påslaget er kun garantert i én måned, 
              deretter kan det øke betydelig. Sett en påminnelse om å sjekke prisen din etter én måned.
            </p>
          </div>
        </div>
      </div>
    )}

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="bg-gray-50 p-6 rounded-lg">
        <p className="text-sm text-gray-600 mb-2">Din nåværende pris</p>
        <p className="text-3xl font-bold text-gray-900">{priceComparison.currentPrice.toFixed(2)} øre/kWh</p>
        <p className="text-sm text-gray-500 mt-2">
          Inkludert påslag og avgifter
        </p>
      </div>
      <div className="bg-gray-50 p-6 rounded-lg">
        <p className="text-sm text-gray-600 mb-2">Gjennomsnittspris i markedet</p>
        <p className="text-3xl font-bold text-gray-900">{priceComparison.averagePrice.toFixed(2)} øre/kWh</p>
        <p className="text-sm text-gray-500 mt-2">
          Inkludert gjennomsnittlig påslag
        </p>
      </div>
    </div>
    
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">Vår anbefaling</h4>
      {priceComparison.currentPrice > priceComparison.averagePrice ? (
        <div className="space-y-4">
          <p className="text-red-600">
            Du betaler {((priceComparison.currentPrice - priceComparison.averagePrice) / priceComparison.averagePrice * 100).toFixed(1)}% mer enn markedsgjennomsnittet
          </p>
          <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors">
            Se bedre avtaler
          </button>
        </div>
      ) : (
        <p className="text-green-600">
          Gratulerer! Din strømavtale er bedre enn markedsgjennomsnittet.
        </p>
      )}
    </div>
  </motion.div>
); 