import { Metadata } from 'next';
import KommuneClient from './KommuneClient';
import municipalitiesRawData from '../../data/municipalities.json';

// Define the types for our props
interface KommunePageProps {
  params: {
    kommune: string;
  };
}

// Generate metadata for SEO
export async function generateMetadata({ params }: KommunePageProps): Promise<Metadata> {
  const kommuneNavn = params.kommune
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  return {
    title: `Strømpriser i ${kommuneNavn} | Finn beste strømavtale`,
    description: `Sammenlign strømpriser og finn de beste strømavtalene i ${kommuneNavn}. Sjekk dagens spotpris og spar penger på strømregningen.`,
  };
}

// This is the server component that will be pre-rendered
export default async function KommunePage({ params }: KommunePageProps) {
  const kommuneNavn = params.kommune
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  // Pre-fetch data for this kommune
  const initialData = await fetchKommuneData(params.kommune);
  
  return <KommuneClient kommuneNavn={kommuneNavn} initialData={initialData} />;
}

// Generate static paths for all municipalities
export async function generateStaticParams() {
  // Extract all municipality names from the data
  const municipalities = municipalitiesRawData as any[];
  
  // Create URL-friendly paths for each municipality
  return municipalities.map(municipality => {
    // Convert municipality name to URL-friendly format
    const kommuneNavn = municipality.name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // Remove diacritics
    
    return {
      kommune: kommuneNavn
    };
  });
}

// Helper function to fetch data for a specific kommune
async function fetchKommuneData(kommuneSlug: string) {
  try {
    // Step 1: Find the municipality number for this kommune name
    const findMunicipalityNumber = () => {
      const municipalities = municipalitiesRawData as any[];
      
      // Normalize the kommune name for comparison
      const normalizedKommuneNavn = kommuneSlug
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/-/g, ' ');
      
      for (const municipality of municipalities) {
        // Normalize the municipality name for comparison
        const normalizedMunicipalityName = municipality.name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');
      
        if (normalizedMunicipalityName === normalizedKommuneNavn) {
          return municipality.number;
        }
      }
      
      return null;
    };

    const municipalityNumber = findMunicipalityNumber();
    
    // Default area code if we can't find a specific one
    let areaCode = 'NO1';
    
    // Step 2: Find the area code for this municipality number
    if (municipalityNumber) {
      // For server components in App Router, we need absolute URLs for fetch
      // You can use process.env.NEXT_PUBLIC_API_URL or a relative URL with the full URL in production
      const localGridsResponse = await fetch(new URL('/api/local-grids', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'));
      const localGridsData = await localGridsResponse.json();
      
      if (localGridsData.success && Array.isArray(localGridsData.data)) {
        // Find the grid entry for this municipality
        const grid = localGridsData.data.find((g: any) => g.municipalityNumber === municipalityNumber);
        
        if (grid && grid.areaCode) {
          areaCode = grid.areaCode;
        }
      }
    }
    
    // Step 3: Fetch spot price for this area code
    const spotPriceResponse = await fetch(new URL(`/api/average-electricity-price?areaCode=${areaCode}`, process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'));
    const spotPriceData = await spotPriceResponse.json();
    
    let spotPrice = 1.0;
    let averagePrice = null;
    
    if (spotPriceData.success && spotPriceData.data) {
      spotPrice = spotPriceData.data.averagePrice / 100; // Convert from øre to NOK
      averagePrice = spotPriceData.data.averagePrice;
    }
    
    // Step 4: Fetch hourly prices
    const today = new Date().toISOString().split('T')[0];
    const hourlyPricesResponse = await fetch(new URL(`/api/hourly-prices?date=${today}&areaCode=${areaCode}`, process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'));
    const hourlyPricesData = await hourlyPricesResponse.json();
    
    let hourlyPrices = [];
    
    if (hourlyPricesData.success && hourlyPricesData.data) {
      hourlyPrices = hourlyPricesData.data;
    }
    
    // Step 5: Fetch electricity deals
    const dealsResponse = await fetch(new URL('/api/electricity-deals', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'));
    const dealsData = await dealsResponse.json();
    
    let deals = [];
    
    if (dealsData.success && dealsData.data && dealsData.data.products) {
      // Extract the products from the API response
      const allDeals = dealsData.data.products;
      
      // Filter deals based on area code
      deals = allDeals.filter((deal: any) => {
        // Check if the deal is available nationwide (NO) or in the specific area code
        return deal.salesNetworks && deal.salesNetworks.some((network: any) => 
          network.id === 'NO' || network.id === areaCode
        );
      });
      
      // Calculate prices for each deal
      deals = deals.map((deal: any) => {
        // Base spot price in øre/kWh
        const baseSpotPrice = spotPrice;
        
        // Calculate total price per kWh in øre
        const addonPrice = deal.addonPrice || 0;
        const elCertificatePrice = deal.elCertificatePrice || 0;
        
        // Total price per kWh in øre
        const totalPricePerKwt = baseSpotPrice + addonPrice + elCertificatePrice;
        
        // Calculate monthly price for default consumption (15000 kWh)
        const monthlyConsumption = 15000 / 12; // kWh per month
        const energyCost = (totalPricePerKwt / 100) * monthlyConsumption; // Convert øre to NOK
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
      deals = deals.sort((a: any, b: any) => 
        (a.calculatedMonthlyPrice || 0) - (b.calculatedMonthlyPrice || 0)
      );
    }
    
    // Return the pre-fetched data
    return {
      areaCode,
      deals,
      spotPrice,
      averagePrice,
      hourlyPrices
    };
  } catch (error) {
    console.error(`Error fetching data for ${kommuneSlug}:`, error);
    
    // Return minimal data with default values
    return {
      areaCode: 'NO1',
      deals: [],
      spotPrice: 1.0,
      averagePrice: null,
      hourlyPrices: []
    };
  }
}

// Add this export to enable ISR (Incremental Static Regeneration)
export const revalidate = 43200; // Revalidate every 12 hours (12 * 60 * 60 seconds) 