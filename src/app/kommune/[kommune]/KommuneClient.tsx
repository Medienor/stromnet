'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import Link from 'next/link';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import Image from 'next/image';
import providerLogoUrls from '../../data/providerLogoUrls';
// Import the MultiStepForm component
import MultiStepForm from '../../../components/MultiStepForm';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Correct the import path - adjust based on your actual file structure
import municipalitiesRawData from '../../data/municipalities.json';

// Simple SVG icons to replace Heroicons
const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const ChevronUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
);

const InformationCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// Add new icons for validation
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// Completely reworked ConsumptionSlider component with debugging
function ConsumptionSlider({ value, onChange, onChangeComplete }: { 
  value: number, 
  onChange: (value: number) => void,
  onChangeComplete: (value: number) => void
}) {
  // Keep track of the displayed value separately from the actual value
  const [displayValue, setDisplayValue] = useState(value);
  const [isDragging, setIsDragging] = useState(false);
  
  // For debugging
  console.log("Slider render - displayValue:", displayValue, "value:", value, "isDragging:", isDragging);
  
  // Update display value when the actual value changes (but not during drag)
  useEffect(() => {
    if (!isDragging) {
      console.log("Updating display value to match actual value:", value);
      setDisplayValue(value);
    }
  }, [value, isDragging]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    console.log("Slider change:", newValue);
    setDisplayValue(newValue);
    // Just update the UI, don't trigger API calls
    onChange(newValue);
  };
  
  const handleDragStart = () => {
    console.log("Drag started");
    setIsDragging(true);
  };
  
  const handleDragEnd = () => {
    console.log("Drag ended, final value:", displayValue);
    setIsDragging(false);
    // Only now do we update the actual value and trigger API calls
    onChangeComplete(displayValue);
  };
  
  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>5 000 kWh</span>
        <span>{displayValue.toLocaleString()} kWh</span>
        <span>30 000 kWh</span>
      </div>
      <input
        type="range"
        min="5000"
        max="30000"
        step="1000"
        value={displayValue}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        onChange={handleChange}
        onMouseDown={handleDragStart}
        onMouseUp={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchEnd={handleDragEnd}
        // Add these to handle cases where the mouse/touch moves outside the slider
        onBlur={handleDragEnd}
      />
    </div>
  );
}

// Define types for our data
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
  areaCode: string;
  municipalityNumber: number;
  vatExemption: boolean;
  elCertificateExemption: boolean;
}

interface PostalCodeValidation {
  isValid: boolean;
  cityName: string | null;
  municipalityNumber?: number;
  areaCode?: string;
}

// Add interface for electricity deals
interface ElectricityDeal {
  id: number;
  productId: number;
  name: string;
  description?: string; // Add this property
  agreementTime: number;
  agreementTimeUnit: string;
  billingFrequency: number;
  billingFrequencyUnit: string;
  addonPriceMinimumFixedFor: number;
  addonPriceMinimumFixedForUnit: string;
  productType: string;
  paymentType: string;
  monthlyFee: number;
  addonPrice: number;
  elCertificatePrice: number;
  maxKwhPerYear: number;
  feeMandatoryType: string;
  feePostalLetter: number;
  feePostalLetterApplied: boolean;
  otherConditions: string;
  orderUrl: string;
  applicableToCustomerType: string;
  standardAlert: string;
  cabinProduct: boolean;
  priceChangedAt: string;
  purchaseAddonPrice: number;
  expiredAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  salesNetworks: Array<{
    id: string;
    type: string;
    name: string;
    kwPrice: number;
    purchaseKwPrice: number;
  }>;
  associations: any[];
  vatExemption: boolean;
  provider: {
    name: string;
    organizationNumber: number;
    pricelistUrl: string;
    url?: string;
    logo?: string;
  };
  // Calculated fields
  baseSpotPrice?: number;
  totalPricePerKwt?: number;
  calculatedMonthlyPrice?: number;
  isNewCustomerOnly?: boolean;
}

// Add this type definition
type HourlyPrice = {
  NOK_per_kWh: number;
  EUR_per_kWh: number;
  EXR: number;
  time_start: string;
  time_end: string;
};

// Add or update these type definitions
interface KommuneData {
  name: string;
  areaCode: string;
  vatExemption: boolean;
  elCertificateExemption: boolean;
  [key: string]: any; // For any additional properties
}

interface MunicipalityMapData {
  name: string;
  postalCodes?: string[];
  [key: string]: any;
}

// Update the ref type to match the actual structure
interface MunicipalityMap {
  municipalities: Record<string, MunicipalityMapData>;
  [key: string]: any;
}

// Update the component props type
export default function KommuneClient({ kommuneNavn, initialData }: { 
  kommuneNavn: string;
  initialData?: {
    areaCode: string;
    deals: ElectricityDeal[];
    spotPrice: number;
    averagePrice: number | null;
    hourlyPrices: HourlyPrice[];
  }
}) {
  const [loadingInitial, setLoadingInitial] = useState(!initialData);
  const [loadingDeals, setLoadingDeals] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kommuneData, setKommuneData] = useState<any>(initialData ? {
    name: kommuneNavn,
    areaCode: initialData.areaCode,
    vatExemption: false,
    elCertificateExemption: false
  } : null);
  const [deals, setDeals] = useState<ElectricityDeal[]>(initialData?.deals || []);
  const [consumption, setConsumption] = useState(15000);
  const [sliderValue, setSliderValue] = useState(15000);
  const [postalCode, setPostalCode] = useState('');
  const [municipalitiesData, setMunicipalitiesData] = useState<Municipality[]>([]);
  const [postalCodeValidation, setPostalCodeValidation] = useState<PostalCodeValidation>({ 
    isValid: true, 
    cityName: null 
  });
  const [localGridsData, setLocalGridsData] = useState<LocalGrid[]>([]);
  const postalInputRef = useRef<HTMLInputElement>(null);
  
  // Spot price state
  const [spotPrice, setSpotPrice] = useState<number>(initialData?.spotPrice || 1.0);
  const [averagePrice, setAveragePrice] = useState<number | null>(initialData?.averagePrice || null);
  
  // Hourly prices state
  const [hourlyPrices, setHourlyPrices] = useState<HourlyPrice[]>(initialData?.hourlyPrices || []);
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [priceError, setPriceError] = useState<string | null>(null);
  
  // Collapsible sections state
  const [openSections, setOpenSections] = useState({
    postnummer: true,
    forbruk: true,
    avtaletype: true,
    korteAvtaler: true,
    betalingsform: true,
    betalingsmetode: true,
    varsler: true,
    annet: true
  });
  
  // Filter states - initialize with empty arrays instead of pre-selected values
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [showCampaigns, setShowCampaigns] = useState(false);
  const [paymentForms, setPaymentForms] = useState<string[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [notificationMethods, setNotificationMethods] = useState<string[]>([]);
  
  // Create a postal code lookup map for faster validation
  const postalCodeMap = useRef<Record<string, { 
    name: string, 
    municipalityNumber: number 
  }>>({});
  
  // Create a separate ref for the municipality data
  const municipalityToAreaCodeMap = useRef<Record<number, string>>({});
  const municipalityDataRef = useRef<MunicipalityMap | null>(null);
  
  // Initialize the postal code map
  useEffect(() => {
    const map: Record<string, { name: string, municipalityNumber: number }> = {};
    
    // Type assertion to help TypeScript understand the structure
    const municipalitiesData = municipalitiesRawData as Municipality[];
    
    // Build the lookup map
    municipalitiesData.forEach(municipality => {
      if (municipality.postalCodes && Array.isArray(municipality.postalCodes)) {
        municipality.postalCodes.forEach(postalCode => {
          map[postalCode] = {
            name: municipality.name,
            municipalityNumber: municipality.number
          };
        });
      }
    });
    
    postalCodeMap.current = map;
    console.log(`Initialized postal code map with ${Object.keys(map).length} entries`);
  }, []);
  
  // Update the useEffect that fetches local grids data
  useEffect(() => {
    async function fetchLocalGrids() {
      try {
        console.log('Fetching local grids data...');
        const response = await fetch('/api/local-grids');
        if (!response.ok) {
          throw new Error('Failed to fetch local grids data');
        }
        
        const data = await response.json();
        console.log('Local grids API response:', data);
        
        if (data.success && Array.isArray(data.data)) {
          setLocalGridsData(data.data);
          
          // Build municipality number to area code map
          const areaCodeMap: Record<number, string> = {};
          data.data.forEach((grid: LocalGrid) => {
            if (grid.municipalityNumber && grid.areaCode) {
              areaCodeMap[grid.municipalityNumber] = grid.areaCode;
            }
          });
          
          municipalityToAreaCodeMap.current = areaCodeMap;
          console.log('Area code map built:', municipalityToAreaCodeMap.current);
          console.log(`Initialized area code map with ${Object.keys(areaCodeMap).length} entries`);
        } else {
          console.error('Invalid response format from local-grids API:', data);
        }
      } catch (error) {
        console.error('Error fetching local grids:', error);
      }
    }
    
    fetchLocalGrids();
  }, []);
  
  // Update the validatePostalCode function with more logging
  const validatePostalCode = (code: string) => {
    if (code.length !== 4) {
      return { isValid: true, cityName: null };
    }
    
    console.log(`Validating postal code: ${code}`);
    
    // Look up the postal code in our map
    const municipalityInfo = postalCodeMap.current[code];
    console.log('Municipality info for postal code:', municipalityInfo);
    
    if (municipalityInfo) {
      // Get the correct area code from the local grids data
      const municipalityNumber = municipalityInfo.municipalityNumber;
      console.log('Looking up area code for municipality number:', municipalityNumber);
      console.log('Available area codes:', municipalityToAreaCodeMap.current);
      
      const areaCode = municipalityToAreaCodeMap.current[municipalityNumber] || 'NO1';
      console.log(`Area code for municipality ${municipalityNumber}: ${areaCode}`);
      
      return {
        isValid: true,
        cityName: municipalityInfo.name,
        municipalityNumber: municipalityNumber,
        areaCode: areaCode
      };
    } else {
      return { isValid: false, cityName: null };
    }
  };
  
  // Update the handlePostalCodeChange function to set the area code
  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numbers and limit to 4 digits
    const sanitizedValue = e.target.value.replace(/\D/g, '').slice(0, 4);
    setPostalCode(sanitizedValue);
    
    // Validate postal code
    if (sanitizedValue.length === 4) {
      const validation = validatePostalCode(sanitizedValue);
      console.log('Validation result:', validation);
      setPostalCodeValidation(validation);
      
      // If valid and municipality is different from current, redirect to that municipality
      if (validation.isValid && validation.municipalityNumber && 
          validation.cityName && 
          validation.cityName.toLowerCase() !== kommuneNavn.toLowerCase()) {
        
        // Convert city name to URL-friendly format
        const cityNameForUrl = validation.cityName
          .toLowerCase()
          .replace(/\s+/g, '-')
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, ''); // Remove diacritics
        
        // Redirect to the new municipality page
        window.location.href = `/kommuner/${cityNameForUrl}`;
        return;
      }
      
      // Update kommune data with the area code if valid
      if (validation.isValid && validation.areaCode) {
        setKommuneData((prevData: KommuneData | null) => ({
          ...prevData,
          areaCode: validation.areaCode
        }));
        setCurrentPage(1); // Reset pagination
      }
    } else if (sanitizedValue.length === 0) {
      setPostalCodeValidation({ isValid: true, cityName: null });
    }
    
    // Schedule focus restoration after state update and re-render
    setTimeout(() => {
      if (postalInputRef.current) {
        const length = postalInputRef.current.value.length;
        postalInputRef.current.focus();
        postalInputRef.current.setSelectionRange(length, length);
      }
    }, 0);
  };
  
  // Load initial data only once
  useEffect(() => {
    async function fetchInitialData() {
      // Skip fetching if we have initialData
      if (initialData) {
        setLoadingInitial(false);
        return;
      }
      
      setLoadingInitial(true);
      setError(null);
      
      try {
        // Fetch municipality data
        const kommuneInfo = { 
          name: kommuneNavn,
          areaCode: 'NO1', // Default area code, will be updated when postal code is entered
          vatExemption: false,
          elCertificateExemption: false 
        };
        setKommuneData(kommuneInfo);
        
        // Find the first postal code for this municipality and set it
        if (municipalityDataRef.current && municipalityDataRef.current.municipalities) {
          // Find the municipality for the current kommune name
          const municipalityEntries = Object.entries(municipalityDataRef.current.municipalities);
          
          // Use type assertion to help TypeScript understand the structure
          const municipalityEntry = municipalityEntries.find(([_, municipality]) => {
            // Type assertion to tell TypeScript this is a MunicipalityMapData
            const typedMunicipality = municipality as MunicipalityMapData;
            return typedMunicipality.name.toLowerCase() === decodeURIComponent(kommuneNavn).toLowerCase();
          });
          
          if (municipalityEntry) {
            // Type assertion for the found entry
            const typedMunicipality = municipalityEntry[1] as MunicipalityMapData;
            
            if (typedMunicipality.postalCodes && 
                Array.isArray(typedMunicipality.postalCodes) && 
                typedMunicipality.postalCodes.length > 0) {
              // Set the first postal code from the list
              const firstPostalCode = typedMunicipality.postalCodes[0];
              setPostalCode(firstPostalCode);
              
              // Validate it to get city name and area code
              const validation = validatePostalCode(firstPostalCode);
              if (validation.isValid) {
                setPostalCodeValidation(validation);
                
                // Update kommune data with the area code
                if (validation.areaCode) {
                  setKommuneData((prevData: KommuneData | null) => ({
                    ...prevData,
                    areaCode: validation.areaCode
                  }));
                }
              }
            }
          }
        }
        
        setLoadingInitial(false);
      } catch (err: any) {
        console.error('Error fetching initial data:', err);
        setError(err.message || 'An error occurred while fetching data');
        setLoadingInitial(false);
      }
    }
    
    fetchInitialData();
  }, [kommuneNavn, initialData]);
  
  // Modify the spot price fetch to check for initialData
  useEffect(() => {
    // Skip fetching if we already have spot price from initialData
    if (initialData?.spotPrice) {
      return;
    }
    
    async function fetchSpotPrice() {
      if (!kommuneData?.areaCode) {
        console.log('No area code available, skipping spot price fetch');
        return;
      }
      
      try {
        console.log(`Fetching average electricity price for area code: ${kommuneData.areaCode}`);
        
        // Use the average-electricity-price API with the area code from postal code
        const response = await fetch(`/api/average-electricity-price?areaCode=${kommuneData.areaCode}`);
        
        if (!response.ok) {
          throw new Error(`API returned status ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
          // Use the average price from the API (already in øre/kWh)
          const priceInNOK = data.data.averagePrice / 100; // Convert from øre to NOK
          setSpotPrice(priceInNOK);
          setAveragePrice(data.data.averagePrice);
          
          // Log the average price for this area
          console.log(`Average electricity price in ${kommuneData.areaCode}: ${data.data.averagePrice.toFixed(2)} øre/kWh`);
          console.log(`Current electricity price in ${kommuneData.areaCode}: ${data.data.currentPrice.toFixed(2)} øre/kWh`);
          console.log(`Data includes ${data.data.daysIncluded} days and ${data.data.totalHoursIncluded} hours`);
        } else {
          throw new Error(data.error || 'Invalid API response format');
        }
      } catch (error) {
        console.error('Error fetching average electricity price:', error);
      }
    }
    
    fetchSpotPrice();
  }, [kommuneData?.areaCode, initialData]);
  
  // Modify the deals calculation to check for initialData
  const calculateDeals = useCallback(async () => {
    // If we have initialData and this is the first calculation, use those deals
    if (initialData?.deals && deals.length === 0) {
      setDeals(initialData.deals);
      return;
    }
    
    console.log("Calculating deals with consumption:", consumption);
    if (!kommuneData?.areaCode) {
      return;
    }
    
    setLoadingDeals(true);
    
    try {
      // Use the existing API endpoint
      const response = await fetch('/api/electricity-deals');
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }
      
      const apiResponse = await response.json();
      
      if (!apiResponse.success || !apiResponse.data || !apiResponse.data.products) {
        throw new Error('Invalid API response format');
      }
      
      // Extract the products from the API response
      const allDeals: ElectricityDeal[] = apiResponse.data.products;
      
      // Filter deals based on area code
      const areaCode = kommuneData.areaCode;
      const filteredDeals = allDeals.filter(deal => {
        // Check if the deal is available nationwide (NO) or in the specific area code
        return deal.salesNetworks && deal.salesNetworks.some(network => 
          network.id === 'NO' || network.id === areaCode
        );
      });
      
      // Apply product type filters
      let filteredByType = filteredDeals;
      if (selectedTypes.length > 0) {
        filteredByType = filteredDeals.filter(deal => 
          selectedTypes.includes(deal.productType)
        );
      }
      
      // Calculate prices for each deal
      const calculatedDeals = filteredByType.map(deal => {
        // Base spot price in øre/kWh (already in øre/kWh from the API)
        const baseSpotPrice = spotPrice;
        
        // Calculate total price per kWh in øre
        const addonPrice = deal.addonPrice || 0; // Already in øre
        const elCertificatePrice = deal.elCertificatePrice || 0; // Already in øre
        
        // Total price per kWh in øre
        const totalPricePerKwt = baseSpotPrice + addonPrice + elCertificatePrice;
        
        // Calculate monthly price
        const monthlyConsumption = consumption / 12; // kWh per month
        const energyCost = (totalPricePerKwt / 100) * monthlyConsumption; // Convert øre to NOK for calculation
        const monthlyFee = deal.monthlyFee || 0; // NOK per month
        
        // Total monthly price in NOK
        const calculatedMonthlyPrice = energyCost + monthlyFee;
        
        return {
          ...deal,
          baseSpotPrice,
          totalPricePerKwt,
          calculatedMonthlyPrice,
          isNewCustomerOnly: deal.applicableToCustomerType === 'newCustomers'
        };
      });
      
      // Sort by monthly price
      const sortedDeals = calculatedDeals.sort((a, b) => 
        (a.calculatedMonthlyPrice || 0) - (b.calculatedMonthlyPrice || 0)
      );
      
      setDeals(sortedDeals);
    } catch (error) {
      console.error('Error calculating deals:', error);
      setDeals([]);
    } finally {
      setLoadingDeals(false);
    }
  }, [consumption, kommuneData, selectedTypes, spotPrice, initialData, deals.length]);
  
  // Update deals when filters change
  useEffect(() => {
    if (kommuneData?.areaCode) {
      calculateDeals();
    }
  }, [kommuneData, consumption, selectedTypes, calculateDeals]);
  
  // Handle slider value change (visual only)
  const handleSliderChange = (value: number) => {
    setSliderValue(value);
  };
  
  // Handle slider release - update actual consumption
  const handleSliderComplete = (value: number) => {
    setConsumption(value);
    setCurrentPage(1); // Reset to first page when consumption changes
  };
  
  // Format price with two decimal places and add safety check
  function formatPrice(price: number | undefined | null) {
    if (price === undefined || price === null) {
      return "0.00";
    }
    return price.toFixed(2);
  }
  
  // Capitalize kommune name for display
  function capitalizeWords(str: string) {
    // First decode any URL-encoded characters
    const decodedStr = decodeURIComponent(str);
    
    return decodedStr
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
  
  // Filter component for collapsible sections
  const FilterSection = ({ 
    title, 
    sectionKey, 
    children, 
    info 
  }: { 
    title: string, 
    sectionKey: string, 
    children: React.ReactNode,
    info?: string 
  }) => {
    const isOpen = openSections[sectionKey as keyof typeof openSections];
    
    return (
      <div className="border-b border-gray-200 py-4">
        <button 
          className="flex w-full items-center justify-between text-left"
          onClick={() => toggleSection(sectionKey)}
        >
          <div className="flex items-center">
            <span className="text-base font-medium text-gray-900">{title}</span>
            {info && (
              <span className="ml-2 text-gray-400 hover:text-gray-600 cursor-help" title={info}>
                <InformationCircleIcon />
              </span>
            )}
          </div>
          {isOpen ? (
            <ChevronUpIcon />
          ) : (
            <ChevronDownIcon />
          )}
        </button>
        
        {isOpen && (
          <div className="mt-3 space-y-2">
            {children}
          </div>
        )}
      </div>
    );
  };
  
  // Checkbox component for consistent styling
  const Checkbox = ({ 
    id, 
    label, 
    checked, 
    onChange 
  }: { 
    id: string, 
    label: string, 
    checked: boolean, 
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void 
  }) => {
    return (
      <div className="flex items-center">
        <input
          id={id}
          type="checkbox"
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          checked={checked}
          onChange={onChange}
        />
        <label htmlFor={id} className="ml-2 block text-sm text-gray-700 cursor-pointer">
          {label}
        </label>
      </div>
    );
  };
  
  // Toggle section collapse state
  const toggleSection = (section: string) => {
    setOpenSections({
      ...openSections,
      [section]: !openSections[section as keyof typeof openSections]
    });
  };
  
  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  
  // Calculate pagination values
  const indexOfLastDeal = currentPage * itemsPerPage;
  const indexOfFirstDeal = indexOfLastDeal - itemsPerPage;
  const currentDeals = deals.slice(indexOfFirstDeal, indexOfLastDeal);
  const totalPages = Math.ceil(deals.length / itemsPerPage);
  
  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // Scroll to top of results when changing page
    window.scrollTo({
      top: document.getElementById('results-heading')?.offsetTop || 0,
      behavior: 'smooth'
    });
  };
  
  // Pagination component
  const Pagination = () => {
    if (totalPages <= 1) return null;
    
    // Show limited number of page buttons
    const getPageNumbers = () => {
      const maxPagesToShow = 5;
      let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
      const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
      
      // Adjust if we're near the end
      if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }
      
      return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
    };
    
    return (
      <div className="flex justify-center mt-6">
        <nav className="inline-flex rounded-md shadow">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
              currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Forrige
          </button>
          
          {getPageNumbers().map(number => (
            <button
              key={number}
              onClick={() => handlePageChange(number)}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                currentPage === number
                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {number}
            </button>
          ))}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
              currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Neste
          </button>
        </nav>
      </div>
    );
  };
  
  // Make sure expandedDeals is defined
  const [expandedDeals, setExpandedDeals] = useState<number[]>([]);
  
  // Add the toggle function if it doesn't exist
  const toggleDealExpansion = (dealId: number) => {
    setExpandedDeals(prevExpandedDeals => {
      if (prevExpandedDeals.includes(dealId)) {
        return prevExpandedDeals.filter(id => id !== dealId);
      } else {
        return [...prevExpandedDeals, dealId];
      }
    });
  };
  
  // Function to get price breakdown for a deal
  const getPriceBreakdown = (deal: ElectricityDeal, annualConsumption: number, basePrice: number) => {
    const monthlyConsumption = annualConsumption / 12;
    const totalKwhPrice = basePrice + (deal.addonPrice * 100) + ((deal.elCertificatePrice || 0) * 100);
    const energyCost = (totalKwhPrice / 100) * monthlyConsumption;
    const monthlyFee = deal.monthlyFee || 0;
    
    return {
      totalKwhPrice,
      monthlyConsumption,
      energyCost,
      monthlyFee,
      totalMonthlyCost: energyCost + monthlyFee
    };
  };
  
  // Helper function to format consumption with safety check
  const formatConsumption = (value: number | undefined | null) => {
    if (value === undefined || value === null) {
      return "0";
    }
    return Math.round(value).toLocaleString();
  };
  
  // Helper function to format monthly cost with safety check
  const formatMonthlyCost = (value: number | undefined | null) => {
    if (value === undefined || value === null) {
      return "0";
    }
    return Math.round(value).toLocaleString();
  };
  
  // Helper function to get current month name
  const getCurrentMonthName = () => {
    const months = [
      'januar', 'februar', 'mars', 'april', 'mai', 'juni', 
      'juli', 'august', 'september', 'oktober', 'november', 'desember'
    ];
    return months[new Date().getMonth()];
  };
  
  // Helper function to get current date
  const getCurrentDate = () => {
    const now = new Date();
    return `${now.getDate()}. ${getCurrentMonthName()} ${now.getFullYear()}`;
  };
  
  // Add these helper functions to get top deals by category
  const getTopCheapestDeals = (dealsArray: ElectricityDeal[], count: number = 10) => {
    return [...dealsArray]
      .sort((a, b) => (a.calculatedMonthlyPrice || 0) - (b.calculatedMonthlyPrice || 0))
      .slice(0, count);
  };

  const getTopDealsByType = (dealsArray: ElectricityDeal[], type: string, count: number = 5) => {
    return [...dealsArray]
      .filter(deal => deal.productType === type)
      .sort((a, b) => (a.calculatedMonthlyPrice || 0) - (b.calculatedMonthlyPrice || 0))
      .slice(0, count);
  };
  
  // Add this function to calculate appliance costs
  const calculateApplianceCost = (kwh: number, pricePerKwh: number) => {
    if (pricePerKwh === undefined || pricePerKwh === null) {
      return 0;
    }
    // Convert øre to NOK for calculation
    const priceInNOK = pricePerKwh / 100;
    return kwh * priceInNOK;
  };
  
  // Update the filter handlers to reset pagination
  const handleTypeFilterChange = (type: string, isChecked: boolean) => {
    let newSelectedTypes;
    if (isChecked) {
      newSelectedTypes = [...selectedTypes, type];
    } else {
      newSelectedTypes = selectedTypes.filter(t => t !== type);
    }
    setSelectedTypes(newSelectedTypes);
    setCurrentPage(1); // Reset to first page when filter changes
  };
  
  // Add these refs at the component level, outside any hooks
  const prevAreaCodeRef = useRef<string | null>(null);
  const isFetchingRef = useRef(false);
  
  // Modify the hourly prices fetch to check for initialData
  useEffect(() => {
    // Skip fetching if we already have hourly prices from initialData
    if (initialData?.hourlyPrices && hourlyPrices.length > 0) {
      return;
    }
    
    // Only proceed if we have an area code and it's different from the previous one
    // ... existing hourly prices fetch code ...
  }, [kommuneData, initialData, hourlyPrices.length]);
  
  // Add this helper function to format time
  const formatHourFromTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.getHours().toString().padStart(2, '0') + ':00';
  };
  
  // Add this function to prepare chart data
  const prepareChartData = () => {
    const labels = hourlyPrices.map(price => formatHourFromTimestamp(price.time_start));
    const prices = hourlyPrices.map(price => parseFloat((price.NOK_per_kWh * 100).toFixed(2))); // Convert to øre
    
    // Find current hour for highlighting
    const currentHour = new Date().getHours();
    
    // Calculate average price
    const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    
    // Prepare background colors - highlight current hour
    const backgroundColor = prices.map((_, index) => 
      index === currentHour ? 'rgba(59, 130, 246, 0.5)' : 'rgba(59, 130, 246, 0.2)'
    );
    
    // Prepare border colors - highlight current hour
    const borderColor = prices.map((_, index) => 
      index === currentHour ? 'rgb(37, 99, 235)' : 'rgb(59, 130, 246)'
    );
    
    return {
      labels,
      datasets: [
        {
          label: 'Strømpris (øre/kWh)',
          data: prices,
          fill: true,
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: 'rgb(59, 130, 246)',
          tension: 0.3,
          pointBackgroundColor: borderColor,
          pointBorderColor: '#fff',
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        {
          label: 'Gjennomsnitt',
          data: Array(24).fill(averagePrice),
          fill: false,
          borderColor: 'rgba(220, 53, 69, 0.7)',
          borderDash: [5, 5],
          pointRadius: 0,
        }
      ]
    };
  };
  
  // Add chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${context.raw} øre/kWh`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Pris (øre/kWh)'
        },
        ticks: {
          callback: function(value: any) {
            return value + ' øre';
          }
        }
      },
      x: {
        title: {
          display: true,
          text: 'Time'
        }
      }
    }
  };
  
  // Add this state variable near your other state declarations
  const [bestTimeToUse, setBestTimeToUse] = useState<{ startHour: string | null; endHour: string | null }>({
    startHour: null,
    endHour: null
  });
  
  // Keep the getBestTimeToUseElectricity function
  const getBestTimeToUseElectricity = (prices: HourlyPrice[]) => {
    if (!prices || prices.length === 0) return { startHour: null, endHour: null };
    
    // Find the 4 consecutive hours with the lowest average price
    let lowestAvgPrice = Infinity;
    let bestStartIndex = 0;
    
    for (let i = 0; i <= prices.length - 4; i++) {
      const avgPrice = (
        prices[i].NOK_per_kWh + 
        prices[i + 1].NOK_per_kWh + 
        prices[i + 2].NOK_per_kWh + 
        prices[i + 3].NOK_per_kWh
      ) / 4;
      
      if (avgPrice < lowestAvgPrice) {
        lowestAvgPrice = avgPrice;
        bestStartIndex = i;
      }
    }
    
    // Extract the start and end hours from the time_start property
    const startTime = new Date(prices[bestStartIndex].time_start);
    const endTime = new Date(prices[bestStartIndex + 3].time_end);
    
    // Format hours with leading zeros if needed
    const startHour = startTime.getHours().toString().padStart(2, '0');
    const endHour = endTime.getHours().toString().padStart(2, '0');
    
    return { startHour, endHour };
  };
  
  // Update the useEffect that processes hourly prices to calculate the best time
  useEffect(() => {
    if (hourlyPrices && hourlyPrices.length > 0) {
      // Calculate best time to use electricity
      const bestTime = getBestTimeToUseElectricity(hourlyPrices);
      setBestTimeToUse(bestTime);
    }
  }, [hourlyPrices]);
  
  // Then in your JSX where you display the price information:
  // (This should be in the section where you display the hourly prices chart)
  <div className="text-sm text-gray-700 mt-2">
    <p>
      <strong>Beste tidspunkt å bruke strøm:</strong>{' '}
      {bestTimeToUse.startHour !== null && bestTimeToUse.endHour !== null
        ? `${bestTimeToUse.startHour}:00 - ${bestTimeToUse.endHour}:00`
        : 'Ikke tilgjengelig'}
    </p>
  </div>
  
  // Add this function to your component, wrapped in useCallback
  const logAllProviders = useCallback(() => {
    console.log('=== ALL ELECTRICITY PROVIDERS ===');
    
    // Create a map to store unique providers by organization number
    const uniqueProviders = new Map();
    
    deals.forEach(deal => {
      if (deal.provider && deal.provider.organizationNumber) {
        // Only add if not already in the map
        if (!uniqueProviders.has(deal.provider.organizationNumber)) {
          uniqueProviders.set(deal.provider.organizationNumber, deal.provider);
        }
      }
    });
    
    // Convert map values to array and sort by name
    const sortedProviders = Array.from(uniqueProviders.values())
      .sort((a, b) => a.name.localeCompare(b.name));
  
    
    // Create a formatted list for easy copying
    const formattedList = sortedProviders.map(provider => {
      return {
        name: provider.name,
        organizationNumber: provider.organizationNumber,
        pricelistUrl: provider.pricelistUrl || null
      };
    });
    
  }, [deals]); // Add deals as a dependency
  
  // Add a useEffect to log providers when deals are loaded
  useEffect(() => {
    if (deals.length > 0) {
      logAllProviders();
    }
  }, [deals, logAllProviders]);
  
  // Add this function to get provider logo URL
  const getProviderLogoUrl = (organizationNumber: number): string => {
    // Convert number to string for lookup
    const orgNumberStr = organizationNumber.toString();
    
    // Use type assertion to tell TypeScript this is a valid key
    if (orgNumberStr in providerLogoUrls) {
      // Use type assertion to access the property safely
      return (providerLogoUrls as Record<string, string>)[orgNumberStr];
    }
    
    // Return a default image URL instead of null
    return '/images/default-provider-logo.png'; // Make sure this file exists in your public folder
  };
  
  // Add this function to map product types to user-friendly names
  const getProductTypeName = (productType: string): string => {
    const productTypeMap: Record<string, string> = {
      'spot': 'Spotpris',
      'hourly_spot': 'Timesspot',
      'fixed': 'Fastpris',
      'variable': 'Variabel pris',
      'purchase': 'Innkjøpspris',
      'plus': 'Pluss',
      'other': 'Annen type'
    };
    
    return productTypeMap[productType] || productType;
  };
  
  // Add this new useEffect that watches the postalCode state
  useEffect(() => {
    // Only proceed if we have a 4-digit postal code
    if (postalCode.length !== 4) {
      return;
    }

    console.log(`Processing postal code ${postalCode} to find area code`);

    // Step 1: Find the municipality number for this postal code from municipalities.json
    const findMunicipalityNumber = () => {
      // Type assertion to help TypeScript understand the structure
      const municipalities = municipalitiesRawData as Municipality[];
      
      for (const municipality of municipalities) {
        if (municipality.postalCodes && municipality.postalCodes.includes(postalCode)) {
          console.log(`Found municipality for postal code ${postalCode}:`, municipality.name);
          console.log(`Municipality number:`, municipality.number);
          return municipality.number;
        }
      }
      
      console.log(`No municipality found for postal code ${postalCode}`);
      return null;
    };

    const municipalityNumber = findMunicipalityNumber();
    
    // If we couldn't find a municipality, stop here
    if (!municipalityNumber) {
      return;
    }

    // Step 2: Find the area code for this municipality number from local grids
    const findAreaCode = async () => {
      try {
        console.log(`Fetching local grids to find area code for municipality ${municipalityNumber}`);
        
        const response = await fetch('/api/local-grids');
        if (!response.ok) {
          throw new Error(`Failed to fetch local grids: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success || !Array.isArray(data.data)) {
          throw new Error('Invalid response from local-grids API');
        }
        
        // Find the grid entry for this municipality
        const grid = data.data.find((g: any) => g.municipalityNumber === municipalityNumber);
        
        if (grid && grid.areaCode) {
          console.log(`Found area code for municipality ${municipalityNumber}: ${grid.areaCode}`);
          
          // Update the kommune data with the area code
          setKommuneData(prevData => ({
            ...prevData,
            areaCode: grid.areaCode,
            name: prevData?.name || kommuneNavn // Keep the current kommune name
          }));
          
          console.log(`Updated kommune data with area code: ${grid.areaCode}`);
        } else {
          console.log(`No area code found for municipality ${municipalityNumber}, using default NO1`);
          
          // Use default area code
          setKommuneData(prevData => ({
            ...prevData,
            areaCode: 'NO1',
            name: prevData?.name || kommuneNavn // Keep the current kommune name
          }));
        }
      } catch (error) {
        console.error('Error finding area code:', error);
      }
    };

    findAreaCode();
  }, [postalCode, kommuneNavn]); // This effect runs whenever postalCode changes
  
  // Add this new useEffect that gets area code from kommune name in URL
  useEffect(() => {
    // Remove the early return that was skipping the lookup
    console.log(`Looking up area code for kommune: ${kommuneNavn}`);

    // Step 1: Find the municipality number for this kommune name
    const findMunicipalityNumber = () => {
      // Type assertion to help TypeScript understand the structure
      const municipalities = municipalitiesRawData as Municipality[];
      
      // Normalize the kommune name for comparison (lowercase, remove special chars)
      const normalizedKommuneNavn = kommuneNavn
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/-/g, ' ');
      
      console.log(`Normalized kommune name for lookup: "${normalizedKommuneNavn}"`);
      
      for (const municipality of municipalities) {
        // Normalize the municipality name for comparison
        const normalizedMunicipalityName = municipality.name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');
      
        if (normalizedMunicipalityName === normalizedKommuneNavn) {
          console.log(`Found municipality for kommune ${kommuneNavn}:`, municipality.name);
          console.log(`Municipality number:`, municipality.number);
          return municipality.number;
        }
      }
      
      console.log(`No municipality found for kommune ${kommuneNavn}`);
      return null;
    };

    const municipalityNumber = findMunicipalityNumber();
    
    // If we couldn't find a municipality, use default area code but log it clearly
    if (!municipalityNumber) {
      console.log(`WARNING: Could not find municipality number for kommune ${kommuneNavn}`);
      console.log(`Using default area code NO1 for kommune ${kommuneNavn}`);
      setKommuneData(prevData => ({
        ...prevData,
        areaCode: 'NO1',
        name: kommuneNavn
      }));
      return;
    }

    // Step 2: Find the area code for this municipality number from local grids
    const findAreaCode = async () => {
      try {
        console.log(`Fetching local grids to find area code for municipality ${municipalityNumber}`);
        
        const response = await fetch('/api/local-grids');
        if (!response.ok) {
          throw new Error(`Failed to fetch local grids: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success || !Array.isArray(data.data)) {
          throw new Error('Invalid response from local-grids API');
        }
        
        console.log(`Searching for municipality number ${municipalityNumber} in ${data.data.length} local grid entries`);
        
        // Find the grid entry for this municipality
        const grid = data.data.find((g: any) => g.municipalityNumber === municipalityNumber);
        
        if (grid && grid.areaCode) {
          console.log(`Found area code for municipality ${municipalityNumber}: ${grid.areaCode}`);
          
          // Update the kommune data with the area code
          setKommuneData(prevData => ({
            ...prevData,
            areaCode: grid.areaCode,
            name: kommuneNavn
          }));
          
          console.log(`Updated kommune data with area code: ${grid.areaCode}`);
        } else {
          console.log(`No area code found for municipality ${municipalityNumber}, using default NO1`);
          
          // Use default area code
          setKommuneData(prevData => ({
            ...prevData,
            areaCode: 'NO1',
            name: kommuneNavn
          }));
        }
      } catch (error) {
        console.error('Error finding area code:', error);
      }
    };

    findAreaCode();
  }, [kommuneNavn]); // Only depend on kommuneNavn, not on kommuneData.areaCode
  
  // Main component render
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Add Hero Section with imported MultiStepForm */}
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
                  Strømpriser i {capitalizeWords(kommuneNavn)}
                </h1>
                <p className="text-xl mb-8">
                  Sammenlign strømavtaler og finn den beste strømavtalen for deg i {capitalizeWords(kommuneNavn)}.
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
              </div>
              
              {/* Add the imported MultiStepForm in the right column */}
              <div className="md:col-span-2">
                <MultiStepForm />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6">
            {loadingInitial ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="text-center text-red-500 p-4">
                <p>Beklager, det oppstod en feil:</p>
                <p>{error}</p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <Link href="/kommuner" className="text-blue-500 hover:text-blue-700 flex items-center">
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Tilbake til alle kommuner
                  </Link>
                </div>
                
                <h1 className="text-2xl font-bold text-gray-900 mb-6">
                  Strømpriser i {capitalizeWords(kommuneNavn)}
                </h1>
                
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Left column - Filters (with max-width to make it narrower) */}
                  <div className="lg:col-span-1 lg:max-w-xs">
                    <div className="bg-gray-50 rounded-lg border border-gray-200">
                      <div className="p-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold">Filtre strømavtaler</h2>
                      </div>
                      
                      <div className="p-4 space-y-4">
                        <FilterSection 
                          title="Forbruk" 
                          sectionKey="forbruk"
                          info="Anslått årlig strømforbruk i kWh"
                        >
                          <ConsumptionSlider 
                            value={consumption}
                            onChange={(value) => {
                              // Just update UI, no API calls
                              console.log("Slider onChange:", value);
                            }}
                            onChangeComplete={(value) => {
                              // Update state and trigger API call only when dragging ends
                              console.log("Slider onChangeComplete:", value);
                              setConsumption(value);
                              // The calculateDeals will be called via useEffect that depends on consumption
                            }}
                          />
                        </FilterSection>
                        
                        <FilterSection 
                          title="Avtaletype" 
                          sectionKey="avtaletype"
                          info="Velg hvilke type strømavtaler du er interessert i"
                        >
                          <Checkbox
                            id="filter-hourly_spot"
                            label="Spotpris (time)"
                            checked={selectedTypes.includes('hourly_spot')}
                            onChange={(e) => handleTypeFilterChange('hourly_spot', e.target.checked)}
                          />
                          <Checkbox
                            id="filter-spot"
                            label="Spotpris"
                            checked={selectedTypes.includes('spot')}
                            onChange={(e) => handleTypeFilterChange('spot', e.target.checked)}
                          />
                          <Checkbox
                            id="filter-fixed"
                            label="Fastpris"
                            checked={selectedTypes.includes('fixed')}
                            onChange={(e) => handleTypeFilterChange('fixed', e.target.checked)}
                          />
                          <Checkbox
                            id="filter-variable"
                            label="Variabel pris"
                            checked={selectedTypes.includes('variable')}
                            onChange={(e) => handleTypeFilterChange('variable', e.target.checked)}
                          />
                          <Checkbox
                            id="filter-plus"
                            label="Plussavtale"
                            checked={selectedTypes.includes('plus')}
                            onChange={(e) => handleTypeFilterChange('plus', e.target.checked)}
                          />
                          <Checkbox
                            id="filter-other"
                            label="Andre prismodeller"
                            checked={selectedTypes.includes('other')}
                            onChange={(e) => handleTypeFilterChange('other', e.target.checked)}
                          />
                        </FilterSection>
                        
                        <FilterSection 
                          title="Korte avtaler" 
                          sectionKey="korteAvtaler"
                          info="Vis kampanjer og tidsbegrensede avtaler"
                        >
                          <Checkbox
                            id="filter-kampanjer"
                            label="Vis kampanjer og begrensede avtaler"
                            checked={showCampaigns}
                            onChange={(e) => setShowCampaigns(e.target.checked)}
                          />
                        </FilterSection>
                        
                        <FilterSection 
                          title="Betalingsform" 
                          sectionKey="betalingsform"
                        >
                          <Checkbox
                            id="filter-forskuddsvis"
                            label="Forskuddsvis"
                            checked={paymentForms.includes('forskuddsvis')}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setPaymentForms([...paymentForms, 'forskuddsvis']);
                              } else {
                                setPaymentForms(paymentForms.filter(f => f !== 'forskuddsvis'));
                              }
                            }}
                          />
                          <Checkbox
                            id="filter-etterskuddsvis"
                            label="Etterskuddsvis"
                            checked={paymentForms.includes('etterskuddsvis')}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setPaymentForms([...paymentForms, 'etterskuddsvis']);
                              } else {
                                setPaymentForms(paymentForms.filter(f => f !== 'etterskuddsvis'));
                              }
                            }}
                          />
                          <Checkbox
                            id="filter-annet-betalingsform"
                            label="Annet"
                            checked={paymentForms.includes('annet')}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setPaymentForms([...paymentForms, 'annet']);
                              } else {
                                setPaymentForms(paymentForms.filter(f => f !== 'annet'));
                              }
                            }}
                          />
                        </FilterSection>
                        
                        <FilterSection 
                          title="Betalingsmetode" 
                          sectionKey="betalingsmetode"
                        >
                          <Checkbox
                            id="filter-ingen-pakrevd"
                            label="Ingen påkrevd betalingsmetode"
                            checked={paymentMethods.includes('ingen_pakrevd')}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setPaymentMethods([...paymentMethods, 'ingen_pakrevd']);
                              } else {
                                setPaymentMethods(paymentMethods.filter(m => m !== 'ingen_pakrevd'));
                              }
                            }}
                          />
                          <Checkbox
                            id="filter-avtalegiro-efaktura"
                            label="Avtalegiro og eFaktura"
                            checked={paymentMethods.includes('avtalegiro_efaktura')}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setPaymentMethods([...paymentMethods, 'avtalegiro_efaktura']);
                              } else {
                                setPaymentMethods(paymentMethods.filter(m => m !== 'avtalegiro_efaktura'));
                              }
                            }}
                          />
                          <Checkbox
                            id="filter-efaktura"
                            label="eFaktura"
                            checked={paymentMethods.includes('efaktura')}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setPaymentMethods([...paymentMethods, 'efaktura']);
                              } else {
                                setPaymentMethods(paymentMethods.filter(m => m !== 'efaktura'));
                              }
                            }}
                          />
                          <Checkbox
                            id="filter-avtalegiro"
                            label="Avtalegiro"
                            checked={paymentMethods.includes('avtalegiro')}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setPaymentMethods([...paymentMethods, 'avtalegiro']);
                              } else {
                                setPaymentMethods(paymentMethods.filter(m => m !== 'avtalegiro'));
                              }
                            }}
                          />
                        </FilterSection>
                        
                        <FilterSection 
                          title="Varsler" 
                          sectionKey="varsler"
                        >
                          <Checkbox
                            id="filter-nettside"
                            label="Nettside"
                            checked={notificationMethods.includes('nettside')}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNotificationMethods([...notificationMethods, 'nettside']);
                              } else {
                                setNotificationMethods(notificationMethods.filter(m => m !== 'nettside'));
                              }
                            }}
                          />
                          <Checkbox
                            id="filter-sms"
                            label="SMS"
                            checked={notificationMethods.includes('sms')}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNotificationMethods([...notificationMethods, 'sms']);
                              } else {
                                setNotificationMethods(notificationMethods.filter(m => m !== 'sms'));
                              }
                            }}
                          />
                          <Checkbox
                            id="filter-post"
                            label="Post"
                            checked={notificationMethods.includes('post')}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNotificationMethods([...notificationMethods, 'post']);
                              } else {
                                setNotificationMethods(notificationMethods.filter(m => m !== 'post'));
                              }
                            }}
                          />
                          <Checkbox
                            id="filter-email"
                            label="Email"
                            checked={notificationMethods.includes('email')}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNotificationMethods([...notificationMethods, 'email']);
                              } else {
                                setNotificationMethods(notificationMethods.filter(m => m !== 'email'));
                              }
                            }}
                          />
                          <Checkbox
                            id="filter-nettside-innlogging"
                            label="Nettside med innlogging"
                            checked={notificationMethods.includes('nettside_innlogging')}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNotificationMethods([...notificationMethods, 'nettside_innlogging']);
                              } else {
                                setNotificationMethods(notificationMethods.filter(m => m !== 'nettside_innlogging'));
                              }
                            }}
                          />
                        </FilterSection>
                        
                        <FilterSection 
                          title="Annet" 
                          sectionKey="annet"
                        >
                          <Checkbox
                            id="filter-medlemskap"
                            label="Forutsetter medlemskap"
                            checked={false}
                            onChange={() => {}}
                          />
                        </FilterSection>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right column - Deals */}
                  <div className="lg:col-span-3">
                    <h2 id="results-heading" className="text-xl font-semibold mb-4">
                      Strømavtaler i {capitalizeWords(kommuneNavn)}
                    </h2>
                    
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden w-full">
                      {loadingDeals ? (
                        <div className="flex justify-center items-center h-32">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                      ) : (
                        <>
                          {/* Desktop table - hidden on mobile */}
                          <div className="hidden md:block overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Leverandør
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Avtale
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Pris
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Månedlig kostnad
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Handling
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {currentDeals.length > 0 ? currentDeals.map((deal, index) => (
                                  <React.Fragment key={`desktop-${deal.id}`}>
                                    <tr className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                      <td className="px-6 py-4">
                                        <div className="flex items-center justify-center">
                                          {deal.provider && deal.provider.organizationNumber && (
                                            <div className="flex-shrink-0">
                                              <Image 
                                                src={getProviderLogoUrl(deal.provider.organizationNumber)}
                                                alt={deal.provider.name} 
                                                width={100} 
                                                height={100}
                                                className="h-20 w-20 object-contain"
                                              />
                                            </div>
                                          )}
                                        </div>
                                      </td>
                                      
                                      <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{deal.name}</div>
                                        <div className="text-xs text-gray-600 mt-1">{getProductTypeName(deal.productType)}</div>
                                      </td>
                                      
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{formatPrice(deal.totalPricePerKwt)} øre/kWh</div>
                                      </td>
                                      
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{formatPrice(deal.calculatedMonthlyPrice)} kr</div>
                                      </td>
                                      
                                      <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="flex flex-col items-center space-y-2">
                                          <a
                                            href="/tilbud"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full justify-center"
                                          >
                                            Bestill
                                          </a>
                                          
                                          <button
                                            onClick={() => toggleDealExpansion(deal.id)}
                                            className="text-blue-600 hover:text-blue-900 text-sm"
                                          >
                                            {expandedDeals.includes(deal.id) ? 'Skjul detaljer' : 'Vis mer'}
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                    
                                    {/* Desktop expanded row */}
                                    {expandedDeals.includes(deal.id) && (
                                      <tr className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td colSpan={5} className="px-6 py-4">
                                          {/* Expanded content for desktop */}
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                              <h4 className="text-sm font-medium text-gray-900 mb-2">Beskrivelse</h4>
                                              <p className="text-sm text-gray-700">{deal.description || 'Ingen beskrivelse tilgjengelig'}</p>
                                              
                                              {deal.otherConditions && (
                                                <div className="mt-4">
                                                  <h4 className="text-sm font-medium text-gray-900 mb-2">Andre betingelser</h4>
                                                  <p className="text-sm text-gray-700">{deal.otherConditions}</p>
                                                </div>
                                              )}
                                            </div>
                                            
                                            <div>
                                              {deal.salesNetworks && deal.salesNetworks.length > 0 && (
                                                <div>
                                                  <h4 className="text-sm font-medium text-gray-900 mb-2">Nettselskap og priser</h4>
                                                  <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
                                                    {deal.salesNetworks.map((network, idx) => (
                                                      <li key={idx}>
                                                        {network.name}: {formatPrice(network.kwPrice)} øre/kWh
                                                      </li>
                                                    ))}
                                                  </ul>
                                                </div>
                                              )}
                                              
                                              {/* Additional details */}
                                              <div className="mt-4">
                                                <h4 className="text-sm font-medium text-gray-900 mb-2">Detaljer</h4>
                                                <div className="grid grid-cols-2 gap-4">
                                                  <div>
                                                    <p className="text-xs text-gray-500">Avtale ID</p>
                                                    <p className="text-sm text-gray-700">{deal.id}</p>
                                                  </div>
                                                  <div>
                                                    <p className="text-xs text-gray-500">Produkttype</p>
                                                    <p className="text-sm text-gray-700">{getProductTypeName(deal.productType)}</p>
                                                  </div>
                                                  <div>
                                                    <p className="text-xs text-gray-500">Månedlig avgift</p>
                                                    <p className="text-sm text-gray-700">{deal.monthlyFee ? `${deal.monthlyFee} kr` : 'Ingen'}</p>
                                                  </div>
                                                  <div>
                                                    <p className="text-xs text-gray-500">Tilleggspris</p>
                                                    <p className="text-sm text-gray-700">{deal.addonPrice ? `${deal.addonPrice} øre/kWh` : 'Ingen'}</p>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </td>
                                      </tr>
                                    )}
                                  </React.Fragment>
                                )) : (
                                  <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                      Ingen strømavtaler funnet for {capitalizeWords(kommuneNavn)}.
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                          
                          {/* Mobile card view - visible only on mobile */}
                          <div className="md:hidden space-y-4">
                            {currentDeals.length > 0 ? currentDeals.map((deal) => (
                              <div key={`mobile-${deal.id}`} className="bg-white rounded-lg shadow-md overflow-hidden">
                                {/* Logo and name section */}
                                <div className="p-4 flex flex-col items-center border-b border-gray-200">
                                  {deal.provider && deal.provider.organizationNumber && (
                                    <div className="mb-3">
                                      <Image 
                                        src={getProviderLogoUrl(deal.provider.organizationNumber)}
                                        alt={deal.provider.name} 
                                        width={120} 
                                        height={120}
                                        className="h-28 w-28 object-contain"
                                      />
                                    </div>
                                  )}
                                  <h3 className="text-lg font-medium text-gray-900 text-center">{deal.name}</h3>
                                  <p className="text-sm text-gray-600 mt-1">{getProductTypeName(deal.productType)}</p>
                                </div>
                                
                                {/* Price section */}
                                <div className="p-4 bg-gray-50 flex justify-between items-center border-b border-gray-200">
                                  <div>
                                    <p className="text-sm text-gray-500">Pris per kWh</p>
                                    <p className="text-lg font-bold text-gray-900">{formatPrice(deal.totalPricePerKwt)} øre</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Månedlig kostnad</p>
                                    <p className="text-lg font-bold text-gray-900">{formatPrice(deal.calculatedMonthlyPrice)} kr</p>
                                  </div>
                                </div>
                                
                                {/* Action buttons */}
                                <div className="p-4 flex flex-col space-y-3">
                                  <a
                                    href="/tilbud"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full justify-center"
                                  >
                                    Bestill nå
                                  </a>
                                  
                                  <button
                                    onClick={() => toggleDealExpansion(deal.id)}
                                    className="text-blue-600 hover:text-blue-900 text-sm font-medium text-center"
                                  >
                                    {expandedDeals.includes(deal.id) ? 'Skjul detaljer' : 'Vis detaljer'}
                                  </button>
                                </div>
                                
                                {/* Expanded details for mobile */}
                                {expandedDeals.includes(deal.id) && (
                                  <div className="p-4 bg-gray-50 border-t border-gray-200">
                                    {/* Mobile expanded content - Copy the content from your existing expanded section */}
                                    <div className="grid grid-cols-1 gap-4">
                                      <div>
                                        <h4 className="text-sm font-medium text-gray-900 mb-1">Beskrivelse</h4>
                                        <p className="text-sm text-gray-700">{deal.description || 'Ingen beskrivelse tilgjengelig'}</p>
                                      </div>
                                      
                                      {deal.salesNetworks && deal.salesNetworks.length > 0 && (
                                        <div>
                                          <h4 className="text-sm font-medium text-gray-900 mb-1">Nettselskap og priser</h4>
                                          <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
                                            {deal.salesNetworks.map((network, idx) => (
                                              <li key={idx}>
                                                {network.name}: {formatPrice(network.kwPrice)} øre/kWh
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                      
                                      {deal.otherConditions && (
                                        <div>
                                          <h4 className="text-sm font-medium text-gray-900 mb-1">Andre betingelser</h4>
                                          <p className="text-sm text-gray-700">{deal.otherConditions}</p>
                                        </div>
                                      )}
                                      
                                      {/* Add any other details you want to show in the expanded section */}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )) : (
                              <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
                                Ingen strømavtaler funnet for {capitalizeWords(kommuneNavn)}.
                              </div>
                            )}
                          </div>
                          
                          {deals.length > 0 && (
                            <div className="px-6 py-4 border-t border-gray-200">
                              <div className="flex flex-col items-center">
                                <div className="text-sm text-gray-500 mb-3">
                                  Viser {indexOfFirstDeal + 1}-{Math.min(indexOfLastDeal, deals.length)} av {deals.length} avtaler
                                </div>
                                <Pagination />
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-12 space-y-12">
                  {/* Top 10 Cheapest Deals */}
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h2 className="text-xl font-semibold text-gray-800">De 10 billigste strømavtalene i {capitalizeWords(kommuneNavn)}</h2>
                    </div>
                    
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
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {getTopCheapestDeals(deals, 10).map((deal, index) => (
                            <tr key={`top-${deal.id}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="text-sm font-medium text-gray-900">
                                    {deal.provider?.name}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{deal.name}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{deal.totalPricePerKwt !== undefined ? `${formatPrice(deal.totalPricePerKwt)} øre` : 'N/A'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{deal.calculatedMonthlyPrice !== undefined ? `${formatMonthlyCost(deal.calculatedMonthlyPrice)} kr` : 'N/A'}</div>
                              </td>
                              <td className="px-6 py-4 text-right whitespace-nowrap">
                                <a 
                                  href="/tilbud" 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-900 text-sm"
                                >
                                  Bestill
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="bg-gray-50 px-6 py-4">
                      <p className="text-sm text-gray-600">
                        Den billigste strømavtalen i {capitalizeWords(kommuneNavn)} per {getCurrentDate()} er {getTopCheapestDeals(deals, 1)[0]?.name || 'N/A'} fra {getTopCheapestDeals(deals, 1)[0]?.provider?.name || 'N/A'}. 
                        {getTopCheapestDeals(deals, 1)[0]?.totalPricePerKwt !== undefined ? 
                          `Denne strømavtalen koster ${formatPrice(getTopCheapestDeals(deals, 1)[0]?.totalPricePerKwt)} øre per kWh og har en estimert månedspris på ${formatMonthlyCost(getTopCheapestDeals(deals, 1)[0]?.calculatedMonthlyPrice)} kr ved et årlig forbruk på ${formatConsumption(consumption)} kilowattimer.` : 
                          'Prisdetaljer er ikke tilgjengelige for øyeblikket.'}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Data levert av Forbrukerportalen
                      </p>
                    </div>
                  </div>
                  
                  {/* Top 5 Spot Price Deals */}
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h2 className="text-xl font-semibold text-gray-800">Topp 5 billigste spotprisavtaler</h2>
                    </div>
                    
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
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {getTopDealsByType(deals, 'hourly_spot', 5).map((deal, index) => (
                            <tr key={`spot-${deal.id}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="text-sm font-medium text-gray-900">
                                    {deal.provider?.name}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{deal.name}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{deal.totalPricePerKwt !== undefined ? `${formatPrice(deal.totalPricePerKwt)} øre` : 'N/A'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{deal.calculatedMonthlyPrice !== undefined ? `${formatMonthlyCost(deal.calculatedMonthlyPrice)} kr` : 'N/A'}</div>
                              </td>
                              <td className="px-6 py-4 text-right whitespace-nowrap">
                                <a 
                                  href="/tilbud" 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-900 text-sm"
                                >
                                  Bestill
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="bg-gray-50 px-6 py-4">
                      {getTopDealsByType(deals, 'hourly_spot', 1).length > 0 ? (
                        <p className="text-sm text-gray-600">
                          Den billigste strømavtalen med timespot i {capitalizeWords(kommuneNavn)} per {getCurrentDate()} er {getTopDealsByType(deals, 'hourly_spot', 1)[0]?.name || 'N/A'} fra {getTopDealsByType(deals, 'hourly_spot', 1)[0]?.provider?.name || 'N/A'}. 
                          {getTopDealsByType(deals, 'hourly_spot', 1)[0]?.totalPricePerKwt !== undefined ? 
                            `Denne strømavtalen koster ${formatPrice(getTopDealsByType(deals, 'hourly_spot', 1)[0]?.totalPricePerKwt)} øre per kWh og har en estimert månedspris på ${formatMonthlyCost(getTopDealsByType(deals, 'hourly_spot', 1)[0]?.calculatedMonthlyPrice)} kr ved et årlig forbruk på ${formatConsumption(consumption)} kilowattimer.` : 
                            'Prisdetaljer er ikke tilgjengelige for øyeblikket.'}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-600">
                          Det er for øyeblikket ingen spotprisavtaler tilgjengelig.
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        Data levert av Forbrukerportalen
                      </p>
                    </div>
                  </div>
                  
                  {/* Top 5 Fixed Price Deals */}
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h2 className="text-xl font-semibold text-gray-800">Topp 5 billigste fastprisavtaler</h2>
                    </div>
                    
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
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {getTopDealsByType(deals, 'fixed', 5).map((deal, index) => (
                            <tr key={`fixed-${deal.id}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="text-sm font-medium text-gray-900">
                                    {deal.provider?.name}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{deal.name}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{deal.totalPricePerKwt !== undefined ? `${formatPrice(deal.totalPricePerKwt)} øre` : 'N/A'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{deal.calculatedMonthlyPrice !== undefined ? `${formatMonthlyCost(deal.calculatedMonthlyPrice)} kr` : 'N/A'}</div>
                              </td>
                              <td className="px-6 py-4 text-right whitespace-nowrap">
                                <a 
                                  href="/tilbud"
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-900 text-sm"
                                >
                                  Bestill
                                </a>
                              </td>
                            </tr>
                          ))}
                          {getTopDealsByType(deals, 'fixed', 1).length === 0 && (
                            <tr>
                              <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                Ingen fastprisavtaler tilgjengelig for øyeblikket.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="bg-gray-50 px-6 py-4">
                      {getTopDealsByType(deals, 'fixed', 1).length > 0 ? (
                        <p className="text-sm text-gray-600">
                          Den billigste strømavtalen med fastpris i {capitalizeWords(kommuneNavn)} per {getCurrentDate()} er {getTopDealsByType(deals, 'fixed', 1)[0]?.name || 'N/A'} fra {getTopDealsByType(deals, 'fixed', 1)[0]?.provider?.name || 'N/A'}. 
                          {getTopDealsByType(deals, 'fixed', 1)[0]?.totalPricePerKwt !== undefined ? 
                            `Denne strømavtalen koster ${formatPrice(getTopDealsByType(deals, 'fixed', 1)[0]?.totalPricePerKwt)} øre per kWh og har en estimert månedspris på ${formatMonthlyCost(getTopDealsByType(deals, 'fixed', 1)[0]?.calculatedMonthlyPrice)} kr ved et årlig forbruk på ${formatConsumption(consumption)} kilowattimer.` : 
                            'Prisdetaljer er ikke tilgjengelige for øyeblikket.'}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-600">
                          Det er for øyeblikket ingen fastprisavtaler tilgjengelig.
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        Data levert av Forbrukerportalen
                      </p>
                    </div>
                  </div>
                  
                  {/* Current Electricity Price Info */}
                  <div className="bg-white rounded-lg shadow overflow-hidden mt-6">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h2 className="text-xl font-semibold text-gray-800">Strømpris i {capitalizeWords(kommuneNavn)} i dag</h2>
                    </div>
                    
                    <div className="px-6 py-4">
                      {loadingPrices ? (
                        <div className="flex justify-center items-center h-64">
                          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                      ) : priceError ? (
                        <div className="text-center text-red-500 p-4">
                          <p>{priceError}</p>
                        </div>
                      ) : hourlyPrices.length > 0 ? (
                        <>
                          <div className="h-80 mb-4">
                            <Line data={prepareChartData()} options={chartOptions} />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <h3 className="text-md font-medium text-gray-800 mb-2">Dagens gjennomsnittspris</h3>
                              <p className="text-2xl font-bold text-blue-600">
                                {(hourlyPrices.reduce((sum, price) => sum + price.NOK_per_kWh, 0) / hourlyPrices.length * 100).toFixed(2)} øre/kWh
                              </p>
                            </div>
                            
                            <div className="bg-green-50 p-4 rounded-lg">
                              <h3 className="text-md font-medium text-gray-800 mb-2">Beste tidspunkt å bruke strøm</h3>
                              <p className="text-2xl font-bold text-green-600">
                                {bestTimeToUse.startHour !== null && bestTimeToUse.endHour !== null
                                  ? `${bestTimeToUse.startHour}:00 - ${bestTimeToUse.endHour}:00`
                                  : 'Ikke tilgjengelig'}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {(hourlyPrices.reduce((min, price) => 
                                  price.NOK_per_kWh < min ? price.NOK_per_kWh : min, Infinity
                                ) * 100).toFixed(2)} øre/kWh
                              </p>
                            </div>
                          </div>
                          
                          <div className="mt-4 text-sm text-gray-600">
                            <p>Prisene er hentet fra hvakosterstrommen.no og viser spotprisen time for time i {capitalizeWords(kommuneNavn)} i dag. 
                            Prisene inkluderer ikke nettleie, avgifter eller påslag fra strømleverandøren.</p>
                          </div>
                        </>
                      ) : (
                        <div className="text-center text-gray-500 p-4">
                          <p>Ingen prisdata tilgjengelig for i dag</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* How to find the best deal */}
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h2 className="text-xl font-semibold text-gray-800">Slik finner du billigste strømleverandør i {capitalizeWords(kommuneNavn)}</h2>
                    </div>
                    
                    <div className="px-6 py-4">
                      <p className="text-base text-gray-700">
                        Når man er på jakt etter billigste eller beste strømleverandør i {capitalizeWords(kommuneNavn)} er det noen grep du kan gjøre for å sikre deg en billigst mulig strømavtale.
                      </p>
                      
                      <p className="text-base text-gray-700 mt-4">
                        Vi anbefaler alltid at du ber om tilbud fra flere strømleverandører. På den måte vil strømselskapene måtte konkurrere om ditt kundeforhold og dermed tilby deg sin absolutt beste strømavtale.
                      </p>
                      
                      <div className="mt-6">
                        <Link 
                          href="/tilbud" 
                          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Motta uforpliktende tilbud fra strømleverandører
                        </Link>
                      </div>
                    </div>
                  </div>
                  
                  {/* Add this section after the "How to find the best deal" section and before the "Household Appliance Cost Section" */}
                  <div className="bg-white rounded-lg shadow overflow-hidden mt-6">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h2 className="text-xl font-semibold text-gray-800">Strømstøtteordningen i {capitalizeWords(kommuneNavn)}</h2>
                    </div>
                    
                    <div className="px-6 py-4">
                      <p className="text-base text-gray-700 mb-4">
                        Fra 2024 er strømstøtteordningen oppdatert med nye beregningsmetoder. Staten dekker nå 90% av strømprisen som overstiger 91,3 øre/kWh (inkl. mva) for enkelttimer hvor prisen går over denne grensen.
                      </p>
                      
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                        <p className="text-sm text-blue-700">
                          <strong>Viktig endring:</strong> Tidligere ble strømstøtten beregnet basert på månedlige gjennomsnitt, men nå beregnes støtten time for time. Dette gir en jevnere strømpris selv i perioder med høye pristopper.
                        </p>
                      </div>
                      
                      <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">Hvordan fungerer strømstøtten?</h3>
                      
                      <p className="text-base text-gray-700 mb-3">
                        Strømstøtten aktiveres automatisk når timeprisen i din strømregion overstiger terskelverdien på 91,3 øre/kWh (inkl. mva). Ordningen dekker opptil 5000 kWh forbruk per måned.
                      </p>
                      
                      <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <h4 className="text-md font-medium text-gray-800 mb-2">Eksempel på beregning:</h4>
                        <p className="text-sm text-gray-700">
                          La oss si at strømprisen i en bestemt time er 150 øre/kWh:
                        </p>
                        <ul className="list-disc pl-5 mt-2 text-sm text-gray-700 space-y-1">
                          <li>Terskelverdi: 91,3 øre/kWh</li>
                          <li>Overskytende beløp: 150 - 91,3 = 58,7 øre/kWh</li>
                          <li>Staten dekker 90% av overskytende: 58,7 × 0,9 = 52,8 øre/kWh</li>
                          <li>Din andel av overskytende: 58,7 × 0,1 = 5,9 øre/kWh</li>
                          <li>Din faktiske kostnad: 91,3 + 5,9 = 97,2 øre/kWh</li>
                        </ul>
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-4">
                        Dette betyr at selv om strømprisen skulle stige betydelig i enkelttimer, vil din faktiske kostnad være begrenset takket være strømstøtteordningen. Dette gir forutsigbarhet i strømregningen, spesielt i perioder med høye strømpriser.
                      </p>
                      
                      <p className="text-xs text-gray-500 mt-4 italic">
                        Merk: Strømstøtten gjelder kun for private husholdninger og fritidsboliger, ikke for næringsvirksomhet. Støtten beregnes automatisk og trekkes fra på strømregningen din.
                      </p>
                    </div>
                  </div>
                  
                  {/* Household Appliance Cost Section */}
                  <div className="bg-white rounded-lg shadow overflow-hidden mt-12">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h2 className="text-xl font-semibold text-gray-800">Hva koster det å bruke strøm i {capitalizeWords(kommuneNavn)}?</h2>
                    </div>
                    
                    <div className="px-6 py-4">
                      <p className="text-base text-gray-700 mb-4">
                        Basert på dagens strømpris på {formatPrice(spotPrice * 100)} øre per kWh i {capitalizeWords(kommuneNavn)}, 
                        her er hva det koster å bruke vanlige husholdningsapparater:
                      </p>
                      
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Aktivitet
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Strømforbruk
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Kostnad per gang
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Kostnad per måned
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            <tr>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="text-sm font-medium text-gray-900">
                                    10 minutters dusj
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">1.5 kWh</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {calculateApplianceCost(1.5, spotPrice * 100).toFixed(2)} kr
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {calculateApplianceCost(1.5 * 30, spotPrice * 100).toFixed(2)} kr
                                </div>
                              </td>
                            </tr>
                            <tr className="bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="text-sm font-medium text-gray-900">
                                    Vaskemaskin (60°C)
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">1.2 kWh</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {calculateApplianceCost(1.2, spotPrice * 100).toFixed(2)} kr
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {calculateApplianceCost(1.2 * 15, spotPrice * 100).toFixed(2)} kr
                                </div>
                              </td>
                            </tr>
                            <tr>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="text-sm font-medium text-gray-900">
                                    Tørketrommel
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">2.5 kWh</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {calculateApplianceCost(2.5, spotPrice * 100).toFixed(2)} kr
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {calculateApplianceCost(2.5 * 12, spotPrice * 100).toFixed(2)} kr
                                </div>
                              </td>
                            </tr>
                            <tr className="bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="text-sm font-medium text-gray-900">
                                    Oppvaskmaskin
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">1.0 kWh</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {calculateApplianceCost(1.0, spotPrice * 100).toFixed(2)} kr
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {calculateApplianceCost(1.0 * 20, spotPrice * 100).toFixed(2)} kr
                                </div>
                              </td>
                            </tr>
                            <tr>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="text-sm font-medium text-gray-900">
                                    Stekeovn (1 time)
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">1.5 kWh</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {calculateApplianceCost(1.5, spotPrice * 100).toFixed(2)} kr
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {calculateApplianceCost(1.5 * 15, spotPrice * 100).toFixed(2)} kr
                                </div>
                              </td>
                            </tr>
                            <tr className="bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="text-sm font-medium text-gray-900">
                                    TV (4 timer)
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">0.4 kWh</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {calculateApplianceCost(0.4, spotPrice * 100).toFixed(2)} kr
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {calculateApplianceCost(0.4 * 30, spotPrice * 100).toFixed(2)} kr
                                </div>
                              </td>
                            </tr>
                            <tr>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="text-sm font-medium text-gray-900">
                                    Kjøleskap (24 timer)
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">0.8 kWh</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {calculateApplianceCost(0.8, spotPrice * 100).toFixed(2)} kr
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {calculateApplianceCost(0.8 * 30, spotPrice * 100).toFixed(2)} kr
                                </div>
                              </td>
                            </tr>
                            <tr className="bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="text-sm font-medium text-gray-900">
                                    Varmeovn (1000W, 8 timer)
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">8.0 kWh</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {calculateApplianceCost(8.0, spotPrice * 100).toFixed(2)} kr
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {calculateApplianceCost(8.0 * 30, spotPrice * 100).toFixed(2)} kr
                                </div>
                              </td>
                            </tr>
                            <tr>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="text-sm font-medium text-gray-900">
                                    Elbil (full lading)
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">60.0 kWh</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {calculateApplianceCost(60.0, spotPrice * 100).toFixed(2)} kr
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {calculateApplianceCost(60.0 * 4, spotPrice * 100).toFixed(2)} kr
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      
                      <div className="mt-4 text-sm text-gray-600">
                        <p><strong>Merk:</strong> Disse beregningene er basert på gjennomsnittlige forbruksverdier og dagens strømpris. 
                        Faktisk forbruk kan variere basert på apparatets effektivitet, bruksmønster og andre faktorer. 
                        Prisene inkluderer ikke nettleie eller avgifter.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
} 