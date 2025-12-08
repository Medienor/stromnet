'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StickyProviderCta from '@/components/StickyProviderCta';
import Link from 'next/link';
import municipalities from '@/app/data/municipalities.json';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import providerLogoUrls from '../../data/providerLogoUrls';

interface Municipality {
  number: number;
  name: string;
  countyNumber: number;
  areaCode: string;
  postalCodes: string[];
}

interface Provider {
  name: string;
  organizationNumber: number;
  pricelistUrl: string | null;
  slug?: string;
}

interface ProviderDetailClientProps {
  provider: any;
  initialDeals?: any[];
  initialSpotPrice?: number;
}

// Define the product interface based on the actual data structure
interface Product {
  id: number;
  productId: number;
  name: string;
  productType: string;
  monthlyFee: number;
  addonPrice: number | null;
  orderUrl: string;
  otherConditions?: string;
  applicableToCustomerType?: string;
  provider: Provider;
  totalPricePerKwt?: number;
  calculatedMonthlyPrice?: number;
  salesNetworks?: Array<{
    id: string;
    name: string;
    kwPrice: number;
    type: string;
  }>;
}

interface ElectricityPriceData {
  currentPrice?: number;
  averagePrice?: number;
  areaCode?: string;
}

export default function ProviderDetailClient({ provider, initialDeals = [], initialSpotPrice = 1.0 }: ProviderDetailClientProps) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Add state for providers list
  const [allProviders, setAllProviders] = useState<Provider[]>([]);
  
  // Filter states
  const [postalCode, setPostalCode] = useState('0001');
  const [municipalityName, setMunicipalityName] = useState('Oslo');
  const [consumption, setConsumption] = useState(16000);
  const [productTypeFilter, setProductTypeFilter] = useState('all');
  
  // Electricity price data
  const [electricityPriceData, setElectricityPriceData] = useState<ElectricityPriceData>({
    currentPrice: 0,
    averagePrice: 0,
    areaCode: 'NO1'
  });
  
  // Add debug state
  const [debugInfo, setDebugInfo] = useState({
    postalCode: '',
    municipalityName: '',
    areaCode: '',
    priceSource: '',
    averagePrice: 0,
    currentPrice: 0
  });
  
  // Monthly consumption distribution according to NVE (Norwegian Water Resources and Energy Directorate)
  const monthlyDistribution = {
    1: 0.1251, // January
    2: 0.1102, // February
    3: 0.1077, // March
    4: 0.0858, // April
    5: 0.0666, // May
    6: 0.0497, // June
    7: 0.0463, // July
    8: 0.0496, // August
    9: 0.0598, // September
    10: 0.0785, // October
    11: 0.0991, // November
    12: 0.1215  // December
  };
  
  // Get current month (1-12)
  const currentMonth = new Date().getMonth() + 1;
  
  // State to track which product's price breakdown is being shown
  const [showBreakdown, setShowBreakdown] = useState<number | null>(null);
  
  // Use the initial data for state initialization
  const [deals, setDeals] = useState<any[]>(initialDeals);
  const [spotPrice, setSpotPrice] = useState<number>(initialSpotPrice);
  
  // Fetch providers from API
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await fetch('/api/providers');
        if (!response.ok) {
          throw new Error('Failed to fetch providers');
        }
        
        const data = await response.json();
        if (data.success && data.data) {
          setAllProviders(data.data);
        }
      } catch (err) {
        console.error('Error fetching providers:', err);
      }
    };
    
    fetchProviders();
  }, []);
  
  // Helper function to find a provider by name
  const findProvider = (name: string) => {
    return allProviders.find(p => 
      p.name.toLowerCase() === name.toLowerCase() || 
      p.name.toLowerCase().includes(name.toLowerCase())
    );
  };
  
  // Data for Norway's cheapest and most expensive providers
  // Now dynamically generated from the API data
  const norwayProviderComparison = useMemo(() => {
    if (allProviders.length === 0) {
      // Default values until API data is loaded
      return {
        cheapest: [
          { name: "Tibber", slug: "tibber", averagePrice: "-0.09 øre/kWh", averageMonthlyCost: 1950 },
          { name: "Fjordkraft AS", slug: "fjordkraft-as", averagePrice: "-0.05 øre/kWh", averageMonthlyCost: 1980 },
          { name: "Gudbrandsdal Energi AS", slug: "gudbrandsdal-energi-as", averagePrice: "0.00 øre/kWh", averageMonthlyCost: 2010 }
        ],
        expensive: [
          { name: "Smart Energi", slug: "smart-energi", averagePrice: "4.99 øre/kWh", averageMonthlyCost: 2450 },
          { name: "Fortum", slug: "fortum", averagePrice: "3.99 øre/kWh", averageMonthlyCost: 2390 },
          { name: "Lyse Energi AS", slug: "lyse-energi-as", averagePrice: "3.50 øre/kWh", averageMonthlyCost: 2350 }
        ]
      };
    }
    
    // Use actual providers from the API
    return {
      cheapest: [
        { 
          name: findProvider("Tibber")?.name || "Tibber", 
          slug: findProvider("Tibber")?.slug || "tibber", 
          averagePrice: "-0.09 øre/kWh", 
          averageMonthlyCost: 1950 
        },
        { 
          name: findProvider("Fjordkraft AS")?.name || "Fjordkraft AS", 
          slug: findProvider("Fjordkraft AS")?.slug || "fjordkraft-as", 
          averagePrice: "-0.05 øre/kWh", 
          averageMonthlyCost: 1980 
        },
        { 
          name: findProvider("Gudbrandsdal Energi AS")?.name || "Gudbrandsdal Energi AS", 
          slug: findProvider("Gudbrandsdal Energi AS")?.slug || "gudbrandsdal-energi-as", 
          averagePrice: "0.00 øre/kWh", 
          averageMonthlyCost: 2010 
        }
      ],
      expensive: [
        { 
          name: findProvider("Smart Energi")?.name || "Smart Energi", 
          slug: findProvider("Smart Energi")?.slug || "smart-energi", 
          averagePrice: "4.99 øre/kWh", 
          averageMonthlyCost: 2450 
        },
        { 
          name: findProvider("Fortum")?.name || "Fortum", 
          slug: findProvider("Fortum")?.slug || "fortum", 
          averagePrice: "3.99 øre/kWh", 
          averageMonthlyCost: 2390 
        },
        { 
          name: findProvider("Lyse Energi AS")?.name || "Lyse Energi AS", 
          slug: findProvider("Lyse Energi AS")?.slug || "lyse-energi-as", 
          averagePrice: "3.50 øre/kWh", 
          averageMonthlyCost: 2350 
        }
      ]
    };
  }, [allProviders]);
  
  // List of other popular providers to check out
  const otherProviders = useMemo(() => {
    if (allProviders.length === 0) {
      // Default values until API data is loaded
      return [
        { name: "Fjordkraft AS", slug: "fjordkraft-as" },
        { name: "Tibber", slug: "tibber" },
        { name: "Fortum", slug: "fortum" },
        { name: "Lyse Energi AS", slug: "lyse-energi-as" }
      ].filter(p => p.name.toLowerCase() !== provider.name.toLowerCase()).slice(0, 3);
    }
    
    // Use actual providers from the API
    const popularProviders = [
      findProvider("Fjordkraft AS") || { name: "Fjordkraft AS", slug: "fjordkraft-as" },
      findProvider("Tibber") || { name: "Tibber", slug: "tibber" },
      findProvider("Fortum") || { name: "Fortum", slug: "fortum" },
      findProvider("Lyse Energi AS") || { name: "Lyse Energi AS", slug: "lyse-energi-as" },
      findProvider("Gudbrandsdal Energi AS") || { name: "Gudbrandsdal Energi AS", slug: "gudbrandsdal-energi-as" }
    ].filter(p => p && p.name.toLowerCase() !== provider.name.toLowerCase());
    
    return popularProviders.slice(0, 3);
  }, [allProviders, provider.name]);
  
  // Find municipality name and area code when postal code changes
  useEffect(() => {
    if (postalCode.length === 4) {
      // First, find the municipality from our local data
      const municipality = municipalities.find((m: Municipality) => 
        m.postalCodes.includes(postalCode)
      );
      
      let localMunicipalityName = '';
      
      if (municipality) {
        localMunicipalityName = municipality.name;
        setMunicipalityName(localMunicipalityName);
        
        // Update debug info with municipality data
        setDebugInfo(prev => ({
          ...prev,
          postalCode,
          municipalityName: localMunicipalityName,
          areaCode: 'Fetching...',
          priceSource: 'Fetching from local-grids API...'
        }));
      } else {
        setMunicipalityName('');
        localMunicipalityName = '';
        
        // Update debug info
        setDebugInfo(prev => ({
          ...prev,
          postalCode,
          municipalityName: 'Not found in local data',
          areaCode: 'Fetching...',
          priceSource: 'Fetching from local-grids API...'
        }));
      }
      
      // Fetch area code for this municipality name
      if (localMunicipalityName) {
        fetchAreaCodeFromLocalGrids(localMunicipalityName);
      } else {
        // If we don't have a municipality name, try with the postal code directly
        fetchLocalGridData(postalCode);
      }
    }
  }, [postalCode]);
  
  // Fetch area code from local grids API based on municipality name
  const fetchAreaCodeFromLocalGrids = async (municipalityName: string) => {
    try {
      const response = await fetch(`/api/local-grids?name=${encodeURIComponent(municipalityName)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch local grid data');
      }
      
      const data = await response.json();
      
      if (data.success && data.data && data.data.length > 0) {
        // Use the area code from the first matching grid
        const grid = data.data[0];
        const areaCode = grid.areaCode;
        const gridName = grid.name;
        
        // Update debug info
        setDebugInfo(prev => ({
          ...prev,
          areaCode: areaCode || 'Not found in local grids API',
          priceSource: `From local grids API (searched by name: ${municipalityName})`,
          gridName: gridName // Add the grid name for debugging
        }));
        
        if (areaCode && areaCode.startsWith('NO')) {
          setElectricityPriceData(prev => ({
            ...prev,
            areaCode: areaCode
          }));
          
          // Fetch electricity price data for this area
          fetchElectricityPrices(areaCode);
        }
      } else {
        // Update debug info
        setDebugInfo(prev => ({
          ...prev,
          areaCode: 'Not found in local grids API',
          priceSource: `Failed to find in local grids API (searched by name: ${municipalityName})`
        }));
        
        // Fallback to searching by postal code
        fetchLocalGridData(postalCode);
      }
    } catch (error) {
      console.error('Error fetching area code from local grids:', error);
      
      // Update debug info
      setDebugInfo(prev => ({
        ...prev,
        areaCode: 'Error fetching from local grids API',
        priceSource: 'API error'
      }));
      
      // Fallback to searching by postal code
      fetchLocalGridData(postalCode);
    }
  };
  
  // Fetch data from local-grids API based on postal code
  const fetchLocalGridData = async (postalCode: string) => {
    try {
      // First, get the grid information for this postal code
      const response = await fetch(`/api/local-grids?postalCode=${postalCode}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch local grid data');
      }
      
      const data = await response.json();
      
      if (data.success && data.data && data.data.length > 0) {
        // Get the first grid that matches
        const grid = data.data[0];
        const gridName = grid.name;
        const areaCode = grid.areaCode;
        
        // Update debug info
        setDebugInfo(prev => ({
          ...prev,
          gridName: gridName, // Keep the original municipality name
          areaCode: areaCode,
          priceSource: `From local-grids API (searched by postal code: ${postalCode})`
        }));
        
        // Don't update municipality name from grid data
        // This keeps the correct municipality name from our local data
        
        // Update electricity price data with the area code
        if (areaCode && areaCode.startsWith('NO')) {
          setElectricityPriceData(prev => ({
            ...prev,
            areaCode: areaCode
          }));
          
          // Fetch electricity prices with this area code
          fetchElectricityPrices(areaCode);
        } else {
          setDebugInfo(prev => ({
            ...prev,
            areaCode: 'Invalid area code from API',
            priceSource: 'Area code format invalid'
          }));
        }
      } else {
        // No grid found for this postal code
        setDebugInfo(prev => ({
          ...prev,
          areaCode: 'Not found in local-grids API',
          priceSource: `No matching grid found for postal code: ${postalCode}`
        }));
        
        // Default to NO1 if we can't find anything
        setElectricityPriceData(prev => ({
          ...prev,
          areaCode: 'NO1'
        }));
        fetchElectricityPrices('NO1');
      }
    } catch (error) {
      console.error('Error fetching from local-grids API:', error);
      
      // Update debug info
      setDebugInfo(prev => ({
        ...prev,
        areaCode: 'Error',
        priceSource: 'API error: ' + (error instanceof Error ? error.message : String(error))
      }));
      
      // Default to NO1 if we can't find anything
      setElectricityPriceData(prev => ({
        ...prev,
        areaCode: 'NO1'
      }));
      fetchElectricityPrices('NO1');
    }
  };
  
  // Fetch electricity prices for a given area code
  const fetchElectricityPrices = async (areaCode: string) => {
    try {
      const response = await fetch(`/api/average-electricity-price?areaCode=${areaCode}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch electricity prices');
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        const currentPrice = data.data.currentPrice;
        const averagePrice = data.data.averagePrice;
        
        setElectricityPriceData({
          currentPrice,
          averagePrice,
          areaCode
        });
        
        // Update debug info
        setDebugInfo(prev => ({
          ...prev,
          currentPrice,
          averagePrice
        }));
      }
    } catch (error) {
      console.error('Error fetching electricity prices:', error);
      
      // Update debug info
      setDebugInfo(prev => ({
        ...prev,
        currentPrice: 0,
        averagePrice: 0,
        priceSource: prev.priceSource + ' (Price fetch failed)'
      }));
    }
  };
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Construct the API URL with query parameters
        const apiUrl = `/api/electricity-deals?postalCode=${postalCode}&consumption=${consumption}`;
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        console.log('API Response:', data);
        
        if (data.success) {
          // Check if data.data.products exists
          if (!data.data || !data.data.products) {
            console.error('Expected data structure not found:', data);
            throw new Error('Invalid data structure from API');
          }
          
          // Filter products to only include those from this provider
          const providerProducts = data.data.products.filter((product: any) => 
            product.provider && 
            product.provider.organizationNumber === provider.organizationNumber
          );
          
          console.log('Provider products found:', providerProducts);
          
          if (providerProducts.length > 0) {
            setProducts(providerProducts);
            setFilteredProducts(providerProducts);
          } else {
            console.log('No products found for this provider');
            setProducts([]);
            setFilteredProducts([]);
          }
        } else {
          throw new Error(data.error || 'Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Kunne ikke hente strømavtaler. Vennligst prøv igjen senere.');
        setProducts([]);
        setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [provider.organizationNumber, postalCode, consumption]);
  
  // Apply filters when productTypeFilter changes
  useEffect(() => {
    if (productTypeFilter === 'all') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product => {
        if (productTypeFilter === 'spot' && product.productType.includes('spot')) {
          return true;
        }
        if (productTypeFilter === 'fixed' && product.productType.includes('fixed')) {
          return true;
        }
        if (productTypeFilter === 'variable' && !product.productType.includes('spot') && !product.productType.includes('fixed')) {
          return true;
        }
        return false;
      });
      setFilteredProducts(filtered);
    }
  }, [products, productTypeFilter]);

  // Helper function to format price display
  const formatPrice = (product: Product, isCheapest: boolean = false) => {
    if (product.productType.includes('spot')) {
      const isDiscount = (product.addonPrice || 0) < 0;
      return (
        <>
          <div className="flex items-baseline">
            <span className={`text-2xl font-bold ${isCheapest ? 'text-green-700' : 'text-gray-800'}`}>
              {isDiscount ? '-' : ''}{Math.abs(product.addonPrice || 0).toFixed(2)}
            </span>
            <span className="text-gray-600 ml-1">øre/kWh</span>
          </div>
          
          <div className="text-sm text-gray-600">
            {isDiscount ? 'Rabatt' : 'Påslag'}
          </div>
          
          {product.totalPricePerKwt && (
            <div className="text-sm text-gray-600 mt-1">
              Totalpris: {product.totalPricePerKwt.toFixed(2)} øre/kWh
            </div>
          )}
          
          {product.monthlyFee > 0 && (
            <div className="text-sm text-gray-600 mt-1">+ {product.monthlyFee} kr/mnd</div>
          )}
        </>
      );
    } else if (product.productType.includes('fixed')) {
      // For fixed price products, check if we have a kwPrice in salesNetworks
      const fixedPrice = product.salesNetworks && product.salesNetworks.length > 0 
        ? product.salesNetworks[0].kwPrice * 100  // Convert from kr/kWh to øre/kWh
        : product.totalPricePerKwt;
      
      return (
        <>
          <div className="flex items-baseline">
            <span className={`text-2xl font-bold ${isCheapest ? 'text-green-700' : 'text-gray-800'}`}>
              {fixedPrice ? fixedPrice.toFixed(2) : '0.00'}
            </span>
            <span className="text-gray-600 ml-1">øre/kWh</span>
          </div>
          
          <div className="text-sm text-gray-600">
            Fastpris
          </div>
          
          {product.monthlyFee > 0 && (
            <div className="text-sm text-gray-600 mt-1">+ {product.monthlyFee} kr/mnd</div>
          )}
        </>
      );
    } else if (product.totalPricePerKwt) {
      return (
        <>
          <div className="flex items-baseline">
            <span className={`text-2xl font-bold ${isCheapest ? 'text-green-700' : 'text-gray-800'}`}>{product.totalPricePerKwt.toFixed(2)}</span>
            <span className="text-gray-600 ml-1">øre/kWh</span>
          </div>
          
          <div className="text-sm text-gray-600">
            Totalpris
          </div>
          
          {product.monthlyFee > 0 && (
            <div className="text-sm text-gray-600 mt-1">+ {product.monthlyFee} kr/mnd</div>
          )}
        </>
      );
    } else {
      const isDiscount = (product.addonPrice || 0) < 0;
      return (
        <>
          <div className="flex items-baseline">
            <span className={`text-2xl font-bold ${isCheapest ? 'text-green-700' : 'text-gray-800'}`}>
              {isDiscount ? '-' : ''}{Math.abs(product.addonPrice || 0).toFixed(2)}
            </span>
            <span className="text-gray-600 ml-1">øre/kWh</span>
          </div>
          
          <div className="text-sm text-gray-600">
            {isDiscount ? 'Rabatt' : 'Påslag'}
          </div>
          
          {product.monthlyFee > 0 && (
            <div className="text-sm text-gray-600 mt-1">+ {product.monthlyFee} kr/mnd</div>
          )}
        </>
      );
    }
  };

  // Helper function to get product features
  const getProductFeatures = (product: Product) => {
    const features: string[] = [];
    
    if (product.productType.includes('spot')) {
      features.push('Strøm til spotpris');
    } else if (product.productType.includes('fixed')) {
      features.push('Fastpris på strøm');
    } else {
      features.push('Variabel pris på strøm');
    }
    
    if (product.monthlyFee === 0) {
      features.push('Ingen fastbeløp');
    }
    
    if (product.applicableToCustomerType === 'newCustomers') {
      features.push('Kun for nye kunder');
    }
    
    if (product.otherConditions) {
      features.push(product.otherConditions);
    }
    
    return features;
  };

  // Helper function to determine product type
  const getProductType = (productType: string): 'spot' | 'fixed' | 'variable' => {
    if (productType.includes('spot')) return 'spot';
    if (productType.includes('fixed')) return 'fixed';
    return 'variable';
  };
  
  // Helper function to calculate monthly cost with spot price
  const calculateMonthlyCost = (product: Product) => {
    if (product.calculatedMonthlyPrice) {
      return product.calculatedMonthlyPrice;
    }
    
    // Get the percentage for the current month
    const monthlyPercentage = monthlyDistribution[currentMonth as keyof typeof monthlyDistribution];
    
    // Calculate monthly consumption based on the distribution profile
    const monthlyConsumption = consumption * monthlyPercentage;
    
    // Start with the monthly fee
    let monthlyCost = product.monthlyFee;
    
    if (product.productType.includes('spot')) {
      // For spot price products, use the average electricity price + addon price
      // Convert from øre/kWh to kr/kWh
      const spotPriceKr = (electricityPriceData.averagePrice || 0) / 100;
      const addonPriceKr = (product.addonPrice || 0) / 100;
      
      // Calculate the total cost
      monthlyCost += (spotPriceKr + addonPriceKr) * monthlyConsumption;
    } else if (product.productType.includes('fixed')) {
      // For fixed price products, check if we have a kwPrice in salesNetworks
      let fixedPriceKr = 0;
      
      if (product.salesNetworks && product.salesNetworks.length > 0) {
        fixedPriceKr = product.salesNetworks[0].kwPrice;
      } else if (product.totalPricePerKwt) {
        fixedPriceKr = product.totalPricePerKwt / 100;
      }
      
      // Calculate the total cost
      monthlyCost += fixedPriceKr * monthlyConsumption;
    } else if (product.totalPricePerKwt) {
      // For products with totalPricePerKwt, use that
      // Convert from øre/kWh to kr/kWh
      monthlyCost += (product.totalPricePerKwt / 100) * monthlyConsumption;
    } else {
      // For other products, use the addon price as a fallback
      // Convert from øre/kWh to kr/kWh
      monthlyCost += ((product.addonPrice || 0) / 100) * monthlyConsumption;
    }
    
    return monthlyCost;
  };
  
  // Handle postal code change
  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 4 && /^\d*$/.test(value)) {
      setPostalCode(value);
    }
  };
  
  // Handle consumption change
  const handleConsumptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      setConsumption(value);
    }
  };

  // Helper function to calculate price breakdown details
  const getPriceBreakdown = (product: Product) => {
    // Get the percentage for the current month
    const monthlyPercentage = monthlyDistribution[currentMonth as keyof typeof monthlyDistribution];
    
    // Calculate monthly consumption based on the distribution profile
    const monthlyConsumption = consumption * monthlyPercentage;
    
    // Format the consumption with thousand separators
    const formattedConsumption = Math.round(monthlyConsumption).toLocaleString();
    
    // Initialize breakdown object
    const breakdown = {
      monthlyFee: product.monthlyFee,
      energyPrice: 0,
      energyPriceDetails: '',
      totalCost: 0,
      monthlyConsumption: monthlyConsumption,
      formattedConsumption
    };
    
    if (product.productType.includes('spot')) {
      // For spot price products
      const spotPriceKr = (electricityPriceData.averagePrice || 0) / 100;
      const addonPriceKr = (product.addonPrice || 0) / 100;
      
      const spotCost = spotPriceKr * monthlyConsumption;
      const addonCost = addonPriceKr * monthlyConsumption;
      
      breakdown.energyPrice = spotCost + addonCost;
      breakdown.energyPriceDetails = `
        Spotpris: ${(spotPriceKr * 100).toFixed(2)} øre/kWh × ${formattedConsumption} kWh = ${Math.round(spotCost)} kr
        ${addonPriceKr >= 0 ? 'Påslag' : 'Rabatt'}: ${Math.abs(addonPriceKr * 100).toFixed(2)} øre/kWh × ${formattedConsumption} kWh = ${Math.round(Math.abs(addonCost))} kr
      `;
    } else if (product.productType.includes('fixed')) {
      // For fixed price products
      let fixedPriceKr = 0;
      
      if (product.salesNetworks && product.salesNetworks.length > 0) {
        fixedPriceKr = product.salesNetworks[0].kwPrice;
      } else if (product.totalPricePerKwt) {
        fixedPriceKr = product.totalPricePerKwt / 100;
      }
      
      const energyCost = fixedPriceKr * monthlyConsumption;
      
      breakdown.energyPrice = energyCost;
      breakdown.energyPriceDetails = `
        Fastpris: ${(fixedPriceKr * 100).toFixed(2)} øre/kWh × ${formattedConsumption} kWh = ${Math.round(energyCost)} kr
      `;
    } else if (product.totalPricePerKwt) {
      // For products with totalPricePerKwt
      const priceKr = product.totalPricePerKwt / 100;
      const energyCost = priceKr * monthlyConsumption;
      
      breakdown.energyPrice = energyCost;
      breakdown.energyPriceDetails = `
        Totalpris: ${product.totalPricePerKwt.toFixed(2)} øre/kWh × ${formattedConsumption} kWh = ${Math.round(energyCost)} kr
      `;
    } else {
      // For other products
      const addonPriceKr = (product.addonPrice || 0) / 100;
      const energyCost = addonPriceKr * monthlyConsumption;
      
      breakdown.energyPrice = energyCost;
      breakdown.energyPriceDetails = `
        ${addonPriceKr >= 0 ? 'Påslag' : 'Rabatt'}: ${Math.abs(addonPriceKr * 100).toFixed(2)} øre/kWh × ${formattedConsumption} kWh = ${Math.round(Math.abs(energyCost))} kr
      `;
    }
    
    breakdown.totalCost = breakdown.monthlyFee + breakdown.energyPrice;
    
    return breakdown;
  };

  // Function to handle order button click
  const handleOrderClick = (product: Product) => {
    // Store selected product information in sessionStorage
    const selectedProduct = {
      id: product.id,
      name: product.name,
      providerName: provider.name,
      providerOrganizationNumber: provider.organizationNumber,
      productType: product.productType,
      addonPrice: product.addonPrice,
      monthlyFee: product.monthlyFee,
      totalPricePerKwt: product.totalPricePerKwt,
      orderUrl: product.orderUrl,
      estimatedMonthlyCost: Math.round(calculateMonthlyCost(product)),
      consumption: consumption,
      postalCode: postalCode,
      municipality: municipalityName,
      areaCode: debugInfo.areaCode,
      currentMonth: currentMonth,
      electricityPrice: electricityPriceData.averagePrice
    };
    
    // Store in sessionStorage so it persists across page navigation but clears when browser is closed
    sessionStorage.setItem('selectedProduct', JSON.stringify(selectedProduct));
    
    // Navigate to the /tilbud page
    router.push('/tilbud');
  };

  // Calculate average prices for this provider
  const calculateProviderAverages = () => {
    if (!filteredProducts || filteredProducts.length === 0) return null;
    
    // Calculate average monthly fee
    const totalMonthlyFee = filteredProducts.reduce((sum, product) => sum + product.monthlyFee, 0);
    const averageMonthlyFee = totalMonthlyFee / filteredProducts.length;
    
    // Calculate average addon price for spot products
    const spotProducts = filteredProducts.filter(p => p.productType.includes('spot'));
    let averageAddonPrice = 0;
    
    if (spotProducts.length > 0) {
      const totalAddonPrice = spotProducts.reduce((sum, product) => sum + (product.addonPrice || 0), 0);
      averageAddonPrice = totalAddonPrice / spotProducts.length;
    }
    
    // Calculate average estimated monthly cost
    const totalMonthlyCost = filteredProducts.reduce((sum, product) => sum + calculateMonthlyCost(product), 0);
    const averageMonthlyCost = totalMonthlyCost / filteredProducts.length;
    
    return {
      averageMonthlyFee,
      averageAddonPrice,
      averageMonthlyCost
    };
  };
  
  const providerAverages = calculateProviderAverages();
  
  // Function to find the cheapest product based on monthly cost
  const findCheapestProduct = (products: Product[]) => {
    if (!products || products.length === 0) return null;
    
    return products.reduce((cheapest, current) => {
      const cheapestCost = calculateMonthlyCost(cheapest);
      const currentCost = calculateMonthlyCost(current);
      return currentCost < cheapestCost ? current : cheapest;
    }, products[0]);
  };
  
  // Get the cheapest product
  const cheapestProduct = findCheapestProduct(filteredProducts);

  // Add this function to get provider logo URL
  const getProviderLogoUrl = (organizationNumber) => {
    if (organizationNumber && providerLogoUrls[organizationNumber]) {
      return providerLogoUrls[organizationNumber];
    }
    return null;
  };

  // Add this helper function to generate the same slug as in your product page
  function generateProductSlug(product: any): string {
    const providerName = product.provider.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    const productName = product.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    return `${providerName}-${productName}`;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <Link href="/stromleverandorer" className="text-blue-600 hover:text-blue-800 flex items-center">
              <svg className="h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Tilbake til strømleverandører
            </Link>
          </div>
          
          <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                {getProviderLogoUrl(provider.organizationNumber) ? (
                  <div className="flex-shrink-0 mr-4">
                    <Image 
                      src={getProviderLogoUrl(provider.organizationNumber)} 
                      alt={provider.name} 
                      width={100} 
                      height={100}
                      className="h-25 w-25 object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex-shrink-0 mr-4 h-25 w-25 flex items-center justify-center bg-gray-100 rounded-md border border-gray-200">
                    <span className="text-gray-400 text-2xl text-center px-2">
                      {provider.name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{provider.name}</h1>
                  <p className="text-sm text-gray-500">Org.nr: {provider.organizationNumber}</p>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-gray-700 mb-4">
                    Her finner du alle strømavtaler fra {provider.name}. Sammenlign priser og vilkår for å finne den beste avtalen for ditt forbruk.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Filter and calculation section */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Tilpass søket ditt</h2>
            </div>
            
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
                    Postnummer
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="postalCode"
                      value={postalCode}
                      onChange={handlePostalCodeChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full px-4 py-3 sm:text-sm border-gray-300 rounded-md bg-white"
                      placeholder="0001"
                      maxLength={4}
                    />
                    {postalCode.length === 4 && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-sm text-gray-500">{municipalityName}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="productType" className="block text-sm font-medium text-gray-700 mb-2">
                    Avtale type
                  </label>
                  <div className="relative">
                    <select
                      id="productType"
                      value={productTypeFilter}
                      onChange={(e) => setProductTypeFilter(e.target.value)}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full px-4 py-3 sm:text-sm border-gray-300 rounded-md bg-white appearance-none"
                    >
                      <option value="all">Alle avtaler</option>
                      <option value="spot">Spotpris</option>
                      <option value="fixed">Fastpris</option>
                      <option value="variable">Variabel pris</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="consumption" className="block text-sm font-medium text-gray-700 mb-2">
                    Forbruk per år: <span className="font-semibold">{consumption.toLocaleString()} kWh</span>
                  </label>
                  <input
                    type="range"
                    id="consumption"
                    min="1000"
                    max="50000"
                    step="1000"
                    value={consumption}
                    onChange={handleConsumptionChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>1 000 kWh</span>
                    <span>25 000 kWh</span>
                    <span>50 000 kWh</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Strømavtaler fra {provider.name}</h2>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Ingen strømavtaler funnet for {provider.name} med valgte filtre. Prøv å endre filtrene eller besøk leverandørens nettside for mer informasjon.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {filteredProducts.map((product) => {
                const isCheapest = cheapestProduct && product.id === cheapestProduct.id;
                
                return (
                  <div 
                    key={product.id} 
                    className={`bg-white shadow-md rounded-lg border ${isCheapest ? 'border-green-500' : 'border-gray-200'} 
                      hover:shadow-lg transition-shadow duration-300 relative flex flex-col h-full
                      ${isCheapest ? 'ring-2 ring-green-500' : ''}`}
                  >
                    {/* Add a "Billigst" badge for the cheapest product */}
                    {isCheapest && (
                      <div className="absolute -top-3 -right-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md z-10">
                        Billigst
                      </div>
                    )}
                    
                    <div className={`px-6 py-4 border-b ${isCheapest ? 'border-green-200 bg-green-50' : 'border-gray-200'} rounded-t-lg`}>
                      <Link href={`/stromavtaler/${generateProductSlug(product)}`} className="hover:text-blue-600 transition-colors">
                        <h3 className={`text-lg font-semibold ${isCheapest ? 'text-green-800' : 'text-gray-800'}`}>{product.name}</h3>
                      </Link>
                      <p className="text-gray-600 text-sm">
                        {getProductType(product.productType) === 'spot' ? 'Spotpris' : 
                         getProductType(product.productType) === 'fixed' ? 'Fastpris' : 'Variabel pris'}
                      </p>
                    </div>
                    
                    <div className={`px-6 py-4 flex-grow ${isCheapest ? 'bg-green-50' : ''}`}>
                      <div className="mb-4">
                        {formatPrice(product, isCheapest)}
                      </div>
                      
                      <div className={`mb-4 p-3 ${isCheapest ? 'bg-green-100' : 'bg-blue-50'} rounded-md relative`}>
                        <p className="text-sm text-gray-700">Estimert kostnad for {getMonthName(currentMonth)}:</p>
                        <div className="flex items-center">
                          <p className={`text-xl font-bold ${isCheapest ? 'text-green-700' : 'text-gray-900'}`}>
                            {Math.round(calculateMonthlyCost(product))} kr
                          </p>
                          <button 
                            onClick={() => setShowBreakdown(showBreakdown === product.id ? null : product.id)}
                            className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                            aria-label="Vis prisdetaljer"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                        <p className="text-xs text-gray-500">
                          Basert på {consumption.toLocaleString()} kWh/år
                          {product.productType.includes('spot') && electricityPriceData.averagePrice && (
                            <> og {electricityPriceData.averagePrice.toFixed(2)} øre/kWh spotpris</>
                          )}
                        </p>
                        
                        {/* Price breakdown popup */}
                        {showBreakdown === product.id && (
                          <div className="absolute left-0 mt-2 bg-white rounded-md shadow-lg z-20 p-4 border border-gray-200 w-72">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-semibold text-gray-800">Prisdetaljer for {getMonthName(currentMonth)}</h4>
                              <button 
                                onClick={() => setShowBreakdown(null)}
                                className="text-gray-500 hover:text-gray-700"
                                aria-label="Lukk"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                            
                            {(() => {
                              const breakdown = getPriceBreakdown(product);
                              return (
                                <div className="text-sm">
                                  <p className="mb-1">Forbruk i {getMonthName(currentMonth)}: <span className="font-medium">{breakdown.formattedConsumption} kWh</span></p>
                                  <p className="mb-1">({monthlyDistribution[currentMonth as keyof typeof monthlyDistribution] * 100}% av årsforbruket)</p>
                                  
                                  <div className="border-t border-gray-200 my-2 pt-2">
                                    {breakdown.energyPriceDetails.split('\n').map((line, i) => (
                                      <p key={i} className="mb-1">{line.trim()}</p>
                                    ))}
                                  </div>
                                  
                                  {breakdown.monthlyFee > 0 && (
                                    <div className="border-t border-gray-200 my-2 pt-2">
                                      <p className="mb-1">Fastbeløp: {breakdown.monthlyFee} kr/mnd</p>
                                    </div>
                                  )}
                                  
                                  <div className="border-t border-gray-200 my-2 pt-2">
                                    <p className="font-semibold">Totalt: {Math.round(breakdown.totalCost)} kr</p>
                                  </div>
                                  
                                  <p className="text-xs text-gray-500 mt-2">
                                    Merk: Dette er et estimat basert på gjennomsnittlige priser og forbruksmønster.
                                  </p>
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                      
                      <ul className="space-y-2 mb-4">
                        {getProductFeatures(product).map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <svg className={`h-5 w-5 ${isCheapest ? 'text-green-600' : 'text-green-500'} mr-2 mt-0.5`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                            </svg>
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Button container at the bottom */}
                    <div className={`px-6 py-4 mt-auto ${isCheapest ? 'bg-green-50' : ''}`}>
                      <button 
                        onClick={() => handleOrderClick(product)}
                        className={`w-full px-4 py-2 ${isCheapest 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-md font-medium transition-colors duration-300`}
                      >
                        {isCheapest ? 'Bestill billigste avtale' : 'Bestill avtale'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Om {provider.name}</h2>
            </div>
            <div className="px-6 py-4">
              <p className="text-gray-700 mb-4">
                {provider.name} er en strømleverandør i det norske markedet. De tilbyr ulike strømavtaler 
                tilpasset forskjellige behov og forbruksmønstre.
              </p>
              <p className="text-gray-700">
                For mer detaljert informasjon om deres avtaler og vilkår, besøk deres nettside eller 
                kontakt dem direkte for et tilbud tilpasset ditt forbruk.
              </p>
            </div>
          </div>
          
          {/* New section for price comparison and other providers */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Prissammenligning og alternativer</h2>
            </div>
            <div className="px-6 py-4">
              {providerAverages ? (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-3">Gjennomsnittspriser for {provider.name}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Gjennomsnittlig månedlig kostnad</p>
                      <p className="text-xl font-bold text-gray-900">{Math.round(providerAverages.averageMonthlyCost)} kr</p>
                      <p className="text-xs text-gray-500">Basert på {consumption.toLocaleString()} kWh/år</p>
                    </div>
                    
                    {providerAverages.averageAddonPrice !== 0 && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Gjennomsnittlig påslag (spotpris)</p>
                        <p className="text-xl font-bold text-gray-900">{providerAverages.averageAddonPrice.toFixed(2)} øre/kWh</p>
                      </div>
                    )}
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Gjennomsnittlig fastbeløp</p>
                      <p className="text-xl font-bold text-gray-900">{Math.round(providerAverages.averageMonthlyFee)} kr/mnd</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 mb-4">
                  Prissammenligning er ikke tilgjengelig for denne leverandøren.
                </p>
              )}
              
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-3">Andre populære strømleverandører</h3>
                <p className="text-gray-700 mb-4">
                  Det kan lønne seg å sammenligne priser fra flere leverandører før du bestemmer deg. 
                  Her er noen andre populære strømleverandører du kan sjekke ut:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {otherProviders.map((otherProvider) => (
                    <Link 
                      key={otherProvider.slug}
                      href={`/stromleverandorer/${otherProvider.slug}`}
                      className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg flex items-center justify-center transition-colors duration-300"
                    >
                      <span className="font-medium text-blue-700">{otherProvider.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* New section for Norway's cheapest and most expensive providers */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Norges billigste og dyreste strømleverandører</h2>
            </div>
            <div className="px-6 py-4">
              <p className="text-gray-700 mb-6">
                Strømprisene varierer betydelig mellom ulike leverandører. Her er en oversikt over de billigste og dyreste 
                strømleverandørene i Norge basert på gjennomsnittlige spotpriser og månedlige kostnader for en husholdning 
                med {consumption.toLocaleString()} kWh/år.
              </p>
              
              <div className="flex flex-col md:flex-row gap-8">
                {/* Cheapest providers - Left column */}
                <div className="md:w-1/2">
                  <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Billigste strømleverandører
                  </h3>
                  
                  <div className="space-y-3">
                    {norwayProviderComparison.cheapest.map((cheapProvider, index) => (
                      <Link 
                        key={index}
                        href={`/stromleverandorer/${cheapProvider.slug}`}
                        className="block bg-green-50 hover:bg-green-100 p-4 rounded-lg transition-colors duration-300"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900">{cheapProvider.name}</p>
                            <p className="text-sm text-gray-600">Påslag: {cheapProvider.averagePrice}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">{cheapProvider.averageMonthlyCost} kr/mnd</p>
                            <p className="text-xs text-gray-500">Estimert kostnad</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  
                </div>
                
                {/* Most expensive providers - Right column */}
                <div className="md:w-1/2">
                  <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                    <svg className="h-5 w-5 text-red-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    Dyreste strømleverandører
                  </h3>
                  
                  <div className="space-y-3">
                    {norwayProviderComparison.expensive.map((expensiveProvider, index) => (
                      <Link 
                        key={index}
                        href={`/stromleverandorer/${expensiveProvider.slug}`}
                        className="block bg-red-50 hover:bg-red-100 p-4 rounded-lg transition-colors duration-300"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900">{expensiveProvider.name}</p>
                            <p className="text-sm text-gray-600">Påslag: {expensiveProvider.averagePrice}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">{expensiveProvider.averageMonthlyCost} kr/mnd</p>
                            <p className="text-xs text-gray-500">Estimert kostnad</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-500 mt-6">
                Merk: Prisene er basert på gjennomsnittlige spotpriser og kan variere avhengig av forbruksmønster, 
                geografisk område og markedsforhold. Prisene er oppdatert per {new Date().toLocaleDateString('no-NO', { year: 'numeric', month: 'long' })}.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <StickyProviderCta />
      <Footer />
    </div>
  );
}

// Helper function to get month name in Norwegian
function getMonthName(monthNumber: number): string {
  const monthNames = [
    'januar', 'februar', 'mars', 'april', 'mai', 'juni',
    'juli', 'august', 'september', 'oktober', 'november', 'desember'
  ];
  
  return monthNames[monthNumber - 1];
} 