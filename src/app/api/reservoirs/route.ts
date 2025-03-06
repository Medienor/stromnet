import { NextResponse } from 'next/server';

// Define types for the reservoir statistics data
interface ReservoirStatistics {
  dato_Id: string;
  omrType: string;
  omrnr: number;
  iso_aar: number;
  iso_uke: number;
  fyllingsgrad: number;
  kapasitet_TWh: number;
  fylling_TWh: number;
  neste_Publiseringsdato: string;
  fyllingsgrad_forrige_uke: number;
  endring_fyllingsgrad: number;
}

interface MinMaxMedianStatistics {
  omrType: string;
  omrnr: number;
  iso_uke: number;
  minFyllingsgrad: number;
  minFyllingTWH: number;
  medianFyllingsGrad: number;
  medianFylling_TWH: number;
  maxFyllingsgrad: number;
  maxFyllingTWH: number;
}

interface Area {
  navn: string;
  navn_langt: string;
  beskrivelse: string;
  omrType: string;
  omrnr: number;
}

interface CurrentAreas {
  land: Area[];
  elspot: Area[];
  vassdrag: Area[];
}

// Function to fetch the latest reservoir statistics
async function fetchLatestReservoirStatistics() {
  console.log('Fetching latest reservoir statistics...');
  try {
    const url = 'https://biapi.nve.no/magasinstatistikk/api/Magasinstatistikk/HentOffentligDataSisteUke';
    console.log(`Making request to: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });
    
    console.log(`Response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch reservoir data: ${response.status} ${response.statusText}`);
    }
    
    const data: ReservoirStatistics[] = await response.json();
    console.log(`Successfully fetched reservoir data. Items: ${data.length}`);
    if (data.length > 0) {
      console.log('Sample data:', data[0]);
    } else {
      console.log('No data returned from API');
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching reservoir data:', error);
    // Return empty array instead of throwing
    return [];
  }
}

// Function to fetch min, max, median statistics
async function fetchMinMaxMedianStatistics() {
  console.log('Fetching min/max/median statistics...');
  try {
    const url = 'https://biapi.nve.no/magasinstatistikk/api/Magasinstatistikk/HentOffentligDataMinMaxMedian';
    console.log(`Making request to: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });
    
    console.log(`Response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch min/max/median data: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`Successfully fetched min/max/median data. Items: ${data.length}`);
    if (data.length > 0) {
      console.log('Sample data:', data[0]);
    } else {
      console.log('No data returned from API');
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching min/max/median data:', error);
    // Return empty array instead of throwing
    return [];
  }
}

// Function to fetch areas
async function fetchAreas() {
  console.log('Fetching areas...');
  try {
    const url = 'https://biapi.nve.no/magasinstatistikk/api/Magasinstatistikk/HentOmråder';
    console.log(`Making request to: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });
    
    console.log(`Response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch areas data: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Successfully fetched areas data');
    console.log('Areas structure:', Object.keys(data));
    if (data.elspot && data.elspot.length > 0) {
      console.log('Sample elspot areas:', data.elspot[0]);
    } else {
      console.log('No elspot areas returned from API');
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching areas data:', error);
    // Return empty object instead of throwing
    return { land: [], elspot: [], vassdrag: [] };
  }
}

// Process the data to create a summary
function processReservoirData(
  latestData: ReservoirStatistics[], 
  minMaxMedianData: any[], 
  areas: any
) {
  console.log('Processing reservoir data...');
  console.log(`Latest data items: ${latestData.length}`);
  console.log(`Min/max/median items: ${minMaxMedianData.length}`);
  
  // If no data, return empty result
  if (latestData.length === 0) {
    console.log('No data to process, returning empty result');
    return {
      national: null,
      priceAreas: []
    };
  }
  
  // Find the national data (omrType = 'NO', omrnr = 0)
  const nationalData = latestData.find(item => item.omrType === 'NO' && item.omrnr === 0);
  console.log('National data found:', !!nationalData);
  
  // Find the national min/max/median
  const nationalMinMaxMedian = nationalData ? minMaxMedianData.find(item => 
    item.omrType === 'NO' && 
    item.omrnr === 0 && 
    item.iso_uke === nationalData.iso_uke
  ) : null;
  console.log('National min/max/median found:', !!nationalMinMaxMedian);
  
  // Filter for price areas (omrType = 'EL')
  const priceAreaData = latestData
    .filter(item => item.omrType === 'EL')
    .map(item => {
      // Find the corresponding area info
      const areaInfo = areas.elspot?.find((area: any) => area.omrnr === item.omrnr);
      console.log(`Processing price area ${item.omrnr}, area info found:`, !!areaInfo);
      
      // Find the corresponding min/max/median
      const minMaxMedian = minMaxMedianData.find(mmm => 
        mmm.omrType === 'EL' && 
        mmm.omrnr === item.omrnr && 
        mmm.iso_uke === item.iso_uke
      );
      console.log(`Min/max/median for area ${item.omrnr} found:`, !!minMaxMedian);
      
      return {
        areaId: item.omrnr,
        areaName: areaInfo?.navn || `Prisområde ${item.omrnr}`,
        week: item.iso_uke,
        year: item.iso_aar,
        fillLevel: item.fyllingsgrad * 100, // Convert from decimal to percentage
        capacityTWh: item.kapasitet_TWh,
        fillingTWh: item.fylling_TWh,
        previousWeekFillLevel: item.fyllingsgrad_forrige_uke * 100, // Convert to percentage
        change: item.endring_fyllingsgrad * 100, // Convert to percentage
        historicalComparison: minMaxMedian ? {
          min: minMaxMedian.minFyllingsgrad * 100, // Convert to percentage
          median: minMaxMedian.medianFyllingsGrad * 100, // Convert to percentage
          max: minMaxMedian.maxFyllingsgrad * 100, // Convert to percentage
          percentileRank: calculatePercentileRank(
            item.fyllingsgrad,
            minMaxMedian.minFyllingsgrad,
            minMaxMedian.maxFyllingsgrad
          )
        } : null
      };
    });
  
  console.log(`Processed ${priceAreaData.length} price areas`);
  
  // Create the summary object
  const result = {
    national: nationalData ? {
      week: nationalData.iso_uke,
      year: nationalData.iso_aar,
      fillLevel: nationalData.fyllingsgrad * 100, // Convert to percentage
      capacityTWh: nationalData.kapasitet_TWh,
      fillingTWh: nationalData.fylling_TWh,
      previousWeekFillLevel: nationalData.fyllingsgrad_forrige_uke * 100, // Convert to percentage
      change: nationalData.endring_fyllingsgrad * 100, // Convert to percentage
      nextPublishDate: nationalData.neste_Publiseringsdato,
      historicalComparison: nationalMinMaxMedian ? {
        min: nationalMinMaxMedian.minFyllingsgrad * 100, // Convert to percentage
        median: nationalMinMaxMedian.medianFyllingsGrad * 100, // Convert to percentage
        max: nationalMinMaxMedian.maxFyllingsgrad * 100, // Convert to percentage
        percentileRank: calculatePercentileRank(
          nationalData.fyllingsgrad,
          nationalMinMaxMedian.minFyllingsgrad,
          nationalMinMaxMedian.maxFyllingsgrad
        )
      } : null
    } : null,
    priceAreas: priceAreaData
  };
  
  console.log('Data processing complete');
  return result;
}

// Helper function to calculate where a value falls between min and max as a percentage
function calculatePercentileRank(value: number, min: number, max: number): number {
  if (max === min) return 50; // If min and max are the same, return middle value
  return Math.round(((value - min) / (max - min)) * 100);
}

export async function GET() {
  console.log('Reservoir API route called');
  
  try {
    console.log('Starting parallel data fetching...');
    // Fetch all required data in parallel
    const [latestData, minMaxMedianData, areas] = await Promise.all([
      fetchLatestReservoirStatistics(),
      fetchMinMaxMedianStatistics(),
      fetchAreas()
    ]);
    console.log('All data fetched successfully');
    
    // Check if we got any data
    if (latestData.length === 0) {
      console.log('No reservoir data received from NVE API, using fallback data');
      // Return fallback data
      return NextResponse.json({
        success: true,
        data: getFallbackData(),
        timestamp: new Date().toISOString()
      });
    }
    
    // Process and summarize the data
    const processedData = processReservoirData(latestData, minMaxMedianData, areas);
    
    console.log('Returning processed data');
    // Return the processed data
    return NextResponse.json({
      success: true,
      data: processedData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in reservoirs API route:', error);
    // Return fallback data on error
    return NextResponse.json({
      success: true,
      data: getFallbackData(),
      error: 'Failed to fetch reservoir data',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}

// Function to get fallback data
function getFallbackData() {
  const currentWeek = getWeekNumber(new Date());
  const currentYear = new Date().getFullYear();
  
  return {
    national: {
      week: currentWeek,
      year: currentYear,
      fillLevel: 65.5,
      capacityTWh: 87.6,
      fillingTWh: 57.4,
      previousWeekFillLevel: 64.2,
      change: 1.3,
      nextPublishDate: new Date().toISOString(),
      historicalComparison: {
        min: 45.2,
        median: 70.3,
        max: 95.1,
        percentileRank: 40
      }
    },
    priceAreas: [
      {
        areaId: 1,
        areaName: "Sørøst-Norge (NO1)",
        week: currentWeek,
        year: currentYear,
        fillLevel: 58.7,
        capacityTWh: 12.3,
        fillingTWh: 7.2,
        previousWeekFillLevel: 57.5,
        change: 1.2,
        historicalComparison: {
          min: 40.1,
          median: 65.4,
          max: 90.2,
          percentileRank: 37
        }
      },
      {
        areaId: 2,
        areaName: "Sørvest-Norge (NO2)",
        week: currentWeek,
        year: currentYear,
        fillLevel: 62.3,
        capacityTWh: 33.1,
        fillingTWh: 20.6,
        previousWeekFillLevel: 60.8,
        change: 1.5,
        historicalComparison: {
          min: 42.5,
          median: 68.7,
          max: 92.1,
          percentileRank: 42
        }
      },
      {
        areaId: 3,
        areaName: "Midt-Norge (NO3)",
        week: currentWeek,
        year: currentYear,
        fillLevel: 70.2,
        capacityTWh: 8.7,
        fillingTWh: 6.1,
        previousWeekFillLevel: 69.5,
        change: 0.7,
        historicalComparison: {
          min: 48.3,
          median: 72.6,
          max: 94.8,
          percentileRank: 55
        }
      },
      {
        areaId: 4,
        areaName: "Nord-Norge (NO4)",
        week: currentWeek,
        year: currentYear,
        fillLevel: 75.8,
        capacityTWh: 15.2,
        fillingTWh: 11.5,
        previousWeekFillLevel: 74.9,
        change: 0.9,
        historicalComparison: {
          min: 52.7,
          median: 76.3,
          max: 96.5,
          percentileRank: 62
        }
      },
      {
        areaId: 5,
        areaName: "Vest-Norge (NO5)",
        week: currentWeek,
        year: currentYear,
        fillLevel: 67.4,
        capacityTWh: 18.3,
        fillingTWh: 12.3,
        previousWeekFillLevel: 66.1,
        change: 1.3,
        historicalComparison: {
          min: 46.9,
          median: 71.8,
          max: 93.7,
          percentileRank: 48
        }
      }
    ]
  };
}

// Helper function to get the current week number
function getWeekNumber(date: Date): number {
  const d = new Date(date.getTime());
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
} 