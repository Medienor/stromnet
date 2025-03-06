import { NextResponse } from 'next/server';

// Define types for the hydropower data
interface Konsesjon {
  KdbID: number;
  Tittel: string;
}

interface HydroPowerPlant {
  VannKraftverkID: number;
  Navn: string;
  VannKVType: string;
  VannKVTypeID: string;
  HovedEier: string;
  HovedEier_OrgNr: number;
  Fylke: string;
  FylkesNr: number;
  Kommune: string;
  ForsteUtnyttelseAvFalletDato: number;
  DatoForEldsteKraftproduserendeDel: number;
  MaksYtelse: number;
  MidProd_91_20: number;
  BruttoFallhoyde_M: number;
  Slukeevne: number;
  EnEkv: number;
  ElspotomraadeNummer: number;
  RegineNr: string;
  ErIDrift: boolean;
  IDriftDato: string;
  Konsesjoner: Konsesjon[];
  Kraftverkstatus: string;
  NVEOmraadeID: number | null;
  NVEOmraadeNavn: string | null;
  Nedborsfeltnavn: string;
  SPPunkt: string;
  SPSone: string;
  UnderBygging: boolean;
  UteAvDrift: boolean | null;
  VassdragsOmraadeID: number;
  VassdragsOmraadeNavn: string;
}

// Function to fetch hydropower plants in operation from NVE API
async function fetchHydroPowerPlantsInOperation() {
  try {
    const response = await fetch('https://api.nve.no/web/Powerplant/GetHydroPowerPlantsInOperation');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch hydropower data: ${response.status} ${response.statusText}`);
    }
    
    const data: HydroPowerPlant[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching hydropower data:', error);
    throw error;
  }
}

// Function to process and summarize the hydropower data
function processHydroPowerData(plants: HydroPowerPlant[]) {
  // Calculate total capacity and production by price area
  const priceAreaSummary = plants.reduce((acc, plant) => {
    const areaNumber = plant.ElspotomraadeNummer;
    if (!areaNumber) return acc;
    
    if (!acc[areaNumber]) {
      acc[areaNumber] = {
        totalCapacity: 0,
        totalProduction: 0,
        plantCount: 0,
        areaName: getPriceAreaName(areaNumber)
      };
    }
    
    acc[areaNumber].totalCapacity += plant.MaksYtelse || 0;
    acc[areaNumber].totalProduction += plant.MidProd_91_20 || 0;
    acc[areaNumber].plantCount += 1;
    
    return acc;
  }, {} as Record<number, { totalCapacity: number, totalProduction: number, plantCount: number, areaName: string }>);
  
  // Get the largest plants by capacity
  const largestPlants = [...plants]
    .sort((a, b) => (b.MaksYtelse || 0) - (a.MaksYtelse || 0))
    .slice(0, 10)
    .map(plant => ({
      id: plant.VannKraftverkID,
      name: plant.Navn,
      owner: plant.HovedEier,
      capacity: plant.MaksYtelse,
      production: plant.MidProd_91_20,
      priceArea: plant.ElspotomraadeNummer,
      county: plant.Fylke,
      municipality: plant.Kommune
    }));
  
  // Calculate total national capacity and production
  const nationalSummary = {
    totalCapacity: plants.reduce((sum, plant) => sum + (plant.MaksYtelse || 0), 0),
    totalProduction: plants.reduce((sum, plant) => sum + (plant.MidProd_91_20 || 0), 0),
    totalPlants: plants.length
  };
  
  return {
    nationalSummary,
    priceAreaSummary,
    largestPlants
  };
}

// Helper function to get price area name from number
function getPriceAreaName(areaNumber: number): string {
  const areaNames: Record<number, string> = {
    1: 'Sørøst-Norge (NO1)',
    2: 'Sørvest-Norge (NO2)',
    3: 'Midt-Norge (NO3)',
    4: 'Nord-Norge (NO4)',
    5: 'Vest-Norge (NO5)'
  };
  
  return areaNames[areaNumber] || `Prisområde ${areaNumber}`;
}

export async function GET() {
  try {
    // Fetch hydropower plants data
    const plants = await fetchHydroPowerPlantsInOperation();
    
    // Process and summarize the data
    const processedData = processHydroPowerData(plants);
    
    // Return the processed data
    return NextResponse.json({
      success: true,
      data: processedData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in hydropower API route:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch hydropower data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 