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
import municipalitiesRawData from '../../../app/data/municipalities.json';

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

// Create a separate component for the consumption slider
function ConsumptionSlider({ value, onChange, onChangeComplete }: { 
  value: number, 
  onChange: (value: number) => void,
  onChangeComplete: (value: number) => void
}) {
  const [isDragging, setIsDragging] = useState(false);
  
  const handleMouseDown = () => {
    setIsDragging(true);
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
    onChangeComplete(value);
  };
  
  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>5 000 kWh</span>
        <span>{value.toLocaleString()} kWh</span>
        <span>30 000 kWh</span>
      </div>
      <input
        type="range"
        min="5000"
        max="30000"
        step="1000"
        value={value}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        onChange={(e) => onChange(parseInt(e.target.value))}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
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
export default function KommuneClient({ kommuneNavn }: { kommuneNavn: string }) {
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingDeals, setLoadingDeals] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kommuneData, setKommuneData] = useState<any>(null);
  const [deals, setDeals] = useState<ElectricityDeal[]>([]);
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
  
  // Fetch local grids data
  useEffect(() => {
    async function fetchLocalGrids() {
      try {
        const response = await fetch('/api/local-grids');
        if (!response.ok) {
          throw new Error('Failed to fetch local grids data');
        }
        
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setLocalGridsData(data.data);
          
          // Build municipality number to area code map
          const areaCodeMap: Record<number, string> = {};
          data.data.forEach((grid: LocalGrid) => {
            areaCodeMap[grid.municipalityNumber] = grid.areaCode;
          });
          
          municipalityToAreaCodeMap.current = areaCodeMap;
          
          // Store municipality data in the separate ref if it exists in the response
          if (data.municipalities) {
            municipalityDataRef.current = {
              municipalities: data.municipalities
            };
          }
          
          console.log(`Initialized area code map with ${Object.keys(areaCodeMap).length} entries`);
        }
      } catch (error) {
        console.error('Error fetching local grids:', error);
      }
    }
    
    fetchLocalGrids();
  }, []);
  
  // Function to validate postal code
  const validatePostalCode = (code: string) => {
    if (code.length !== 4) {
      return { isValid: true, cityName: null };
    }
    
    console.log(`Validating postal code: ${code}`);
    
    // Look up the postal code in our map
    const municipalityInfo = postalCodeMap.current[code];
    
    if (municipalityInfo) {
      // Get the correct area code from the local grids data
      const areaCode = municipalityToAreaCodeMap.current[municipalityInfo.municipalityNumber] || 'NO';
      
      return {
        isValid: true,
        cityName: municipalityInfo.name,
        municipalityNumber: municipalityInfo.municipalityNumber,
        areaCode: areaCode
      };
    } else {
      return { isValid: false, cityName: null };
    }
  };
  
  // Handle postal code change
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
  }, [kommuneNavn]);
  
  // Fetch spot price
  const [spotPrice, setSpotPrice] = useState<number>(1.0); // Default spot price in NOK/kWh
  
  useEffect(() => {
    async function fetchSpotPrice() {
      try {
        // You can replace this with your actual spot price API
        const response = await fetch('/api/spot-price');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.price) {
            setSpotPrice(data.price);
          }
        }
      } catch (error) {
        console.error('Error fetching spot price:', error);
      }
    }
    
    fetchSpotPrice();
  }, []);
  
  // Calculate deals based on real data
  const calculateDeals = useCallback(async () => {
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
        // Base spot price in øre/kWh (convert from NOK/kWh)
        const baseSpotPrice = spotPrice * 100;
        
        // Calculate total price per kWh in øre
        const addonPrice = deal.addonPrice * 100; // Convert from NOK to øre
        const elCertificatePrice = (deal.elCertificatePrice || 0) * 100; // Convert from NOK to øre
        
        // Total price per kWh in øre
        const totalPricePerKwt = baseSpotPrice + addonPrice + elCertificatePrice;
        
        // Calculate monthly price
        const monthlyConsumption = consumption / 12; // kWh per month
        const energyCost = (totalPricePerKwt / 100) * monthlyConsumption; // NOK per month
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
  }, [kommuneData, consumption, selectedTypes, spotPrice]);
  
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
  
  // Add this state in your component
  const [hourlyPrices, setHourlyPrices] = useState<HourlyPrice[]>([]);
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [priceError, setPriceError] = useState<string | null>(null);
  
  // Add these refs at the component level, outside any hooks
  const prevAreaCodeRef = useRef<string | null>(null);
  const isFetchingRef = useRef(false);
  
  // Replace the useEffect with a simpler approach
  useEffect(() => {
    // Only proceed if we have an area code and it's different from the previous one
    // or if this is the first time we're fetching
    if (!kommuneData?.areaCode) {
      console.log('No area code available, skipping fetch');
      return;
    }
    
    if (isFetchingRef.current) {
      console.log('Already fetching, skipping duplicate request');
      return;
    }
    
    if (prevAreaCodeRef.current === kommuneData.areaCode) {
      console.log('Area code unchanged, skipping fetch');
      return;
    }
    
    // Update the ref to the current area code
    prevAreaCodeRef.current = kommuneData.areaCode;
    
    // Define a one-time fetch function
    const fetchOnce = async () => {
      // Set fetching flag to prevent duplicate calls
      isFetchingRef.current = true;
      
      console.log('Starting fetch for area code:', kommuneData.areaCode);
      setLoadingPrices(true);
      setPriceError(null);
      
      try {
        // Use today's date in the correct format (YYYY-MM-DD)
        const today = new Date().toISOString().split('T')[0];
        
        const apiUrl = `/api/hourly-prices?date=${today}&areaCode=${kommuneData.areaCode}`;
        console.log('Fetching from URL:', apiUrl);
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch hourly prices: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
          console.log('Successfully fetched price data');
          setHourlyPrices(data.data);
        } else {
          throw new Error(data.error || 'Failed to fetch hourly prices: Invalid response format');
        }
      } catch (error: unknown) {
        console.error('Error fetching hourly prices:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setPriceError(`Kunne ikke hente timesprisene for i dag: ${errorMessage}`);
      } finally {
        setLoadingPrices(false);
        // Reset fetching flag after a delay to prevent immediate re-fetching
        setTimeout(() => {
          isFetchingRef.current = false;
        }, 5000); // 5 second cooldown
      }
    };
    
    // Execute the fetch once
    fetchOnce();
    
    // No dependencies - this will only run on mount and when kommuneData changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kommuneData]);
  
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
    
    // Log the sorted providers
    console.log('Total unique providers:', sortedProviders.length);
    console.log('Providers list:', sortedProviders);
    
    // Create a formatted list for easy copying
    const formattedList = sortedProviders.map(provider => {
      return {
        name: provider.name,
        organizationNumber: provider.organizationNumber,
        pricelistUrl: provider.pricelistUrl || null
      };
    });
    
    // Log as JSON string for easy copying
    console.log('Formatted JSON for copying:');
    console.log(JSON.stringify(formattedList, null, 2));
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
  
  // Main component render
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
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
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Filters column */}
                  <div className="md:col-span-1">
                    <div className="bg-gray-50 rounded-lg border border-gray-200">
                      <div className="p-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold">Filtre strømavtaler</h2>
                      </div>
                      
                      <div className="p-4 space-y-4">
                        <FilterSection 
                          title="Postnummer" 
                          sectionKey="postnummer"
                          info="Skriv inn postnummer for å se avtaler i ditt område"
                        >
                          <div className="relative">
                            <input
                              ref={postalInputRef}
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              placeholder="F.eks. 0159"
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              value={postalCode}
                              onChange={handlePostalCodeChange}
                            />
                            
                            {postalCode.length === 4 && (
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3 mt-1">
                                {postalCodeValidation.isValid && postalCodeValidation.cityName ? (
                                  <div className="flex items-center">
                                    <span className="text-sm text-green-600 mr-2">
                                      {postalCodeValidation.cityName} 
                                      {postalCodeValidation.areaCode && ` (${postalCodeValidation.areaCode})`}
                                    </span>
                                    <CheckIcon />
                                  </div>
                                ) : (
                                  <div className="flex items-center">
                                    <span className="text-sm text-red-600 mr-2">Feil postnummer</span>
                                    <XIcon />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </FilterSection>
                        
                        <FilterSection 
                          title="Forbruk" 
                          sectionKey="forbruk"
                          info="Anslått årlig strømforbruk i kWh"
                        >
                          <ConsumptionSlider 
                            value={sliderValue}
                            onChange={handleSliderChange}
                            onChangeComplete={handleSliderComplete}
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
                  
                  {/* Results column */}
                  <div className="md:col-span-2">
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
                                        <div className="text-xs text-gray-500 mt-1">{deal.productType}</div>
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
                                                    <p className="text-sm text-gray-700">{deal.productType}</p>
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
                                  <p className="text-sm text-gray-500 mt-1">{deal.productType}</p>
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