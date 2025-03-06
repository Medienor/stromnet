

import { NextRequest, NextResponse } from 'next/server';

interface PriceData {
  NOK_per_kWh: number;
  EUR_per_kWh: number;
  EXR: number;
  time_start: string;
  time_end: string;
}

interface DebugDateInfo {
  status: number | string;
  count: number;
  error?: string;
}

interface AreaDebugInfo {
  dates: Record<string, DebugDateInfo>;
  totalHours: number;
  rawPrices: Array<{
    NOK_per_kWh: number;
    time_start: string;
  }>;
}

export async function GET(_request: NextRequest) {
  console.log('KingAverage API called');
  
  try {
    // Get all price areas
    const priceAreas = ['NO1', 'NO2', 'NO3', 'NO4', 'NO5'];
    const areaResults: Record<string, number> = {};
    const debugInfo: Record<string, AreaDebugInfo> = {};
    
    // Calculate dates for the last 10 days
    const dates: string[] = [];
    for (let i = 0; i < 10; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      dates.push(`${year}/${month}-${day}`);
    }
    
    console.log('Dates to fetch:', dates);
    
    // Fetch data for all areas in parallel
    const areaPromises = priceAreas.map(async (area) => {
      try {
        console.log(`Processing area ${area}`);
        debugInfo[area] = { dates: {}, totalHours: 0, rawPrices: [] };
        
        // Fetch data for all dates in this area
        const datePromises = dates.map(dateStr => {
          const url = `https://www.hvakosterstrommen.no/api/v1/prices/${dateStr}_${area}.json`;
          console.log(`Fetching ${url}`);
          
          return fetch(url)
            .then(res => {
              if (!res.ok) {
                console.log(`No data for ${dateStr}_${area}, status: ${res.status}`);
                debugInfo[area].dates[dateStr] = { status: res.status, count: 0 };
                return [];
              }
              return res.json().then(data => {
                debugInfo[area].dates[dateStr] = { status: res.status, count: data.length };
                return data;
              });
            })
            .catch(err => {
              console.error(`Error fetching ${dateStr}_${area}:`, err);
              debugInfo[area].dates[dateStr] = { status: 'error', count: 0, error: err.message };
              return [];
            });
        });
        
        const dateResults = await Promise.all(datePromises);
        
        // Flatten the array of arrays and filter out any empty results
        const allPrices: PriceData[] = dateResults.flat();
        debugInfo[area].totalHours = allPrices.length;
        
        // Store a sample of raw prices for debugging
        debugInfo[area].rawPrices = allPrices.slice(0, 5).map(p => ({
          NOK_per_kWh: p.NOK_per_kWh,
          time_start: p.time_start
        }));
        
        if (allPrices.length === 0) {
          console.log(`No prices found for ${area}`);
          areaResults[area] = 0;
          return;
        }
        
        // Calculate average price over all available data (in øre/kWh)
        const totalPrice = allPrices.reduce((sum, price) => sum + price.NOK_per_kWh, 0);
        const averagePrice = (totalPrice / allPrices.length) * 100; // Convert to øre/kWh
        
        console.log(`${area} average price: ${averagePrice.toFixed(2)} øre/kWh from ${allPrices.length} hours`);
        console.log(`${area} sample prices (NOK/kWh):`, allPrices.slice(0, 3).map(p => p.NOK_per_kWh));
        
        // Store the result
        areaResults[area] = averagePrice;
      } catch (error) {
        console.error(`Error processing ${area}:`, error);
        areaResults[area] = 0;
      }
    });
    
    // Wait for all area calculations to complete
    await Promise.all(areaPromises);
    
    // Calculate national average from areas that have data
    const validAreas = Object.entries(areaResults).filter(([, price]) => price > 0);
    let nationalAverage = 0;
    
    if (validAreas.length > 0) {
      const sum = validAreas.reduce((acc, [, price]) => acc + price, 0);
      nationalAverage = sum / validAreas.length;
      console.log('National average:', nationalAverage.toFixed(2), 'øre/kWh');
    } else {
      // Fallback if no areas have data
      nationalAverage = 75;
      console.log('Using fallback national average:', nationalAverage, 'øre/kWh');
    }
    
    const result = {
      success: true,
      data: {
        NO1: areaResults.NO1 || 0,
        NO2: areaResults.NO2 || 0,
        NO3: areaResults.NO3 || 0,
        NO4: areaResults.NO4 || 0,
        NO5: areaResults.NO5 || 0,
        national: nationalAverage,
        source: 'Hva koster strømmen.no',
        calculatedAt: new Date().toISOString(),
        debug: debugInfo
      }
    };
    
    console.log('KingAverage API result:', JSON.stringify(result.data, null, 2));
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Error calculating king average:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to calculate electricity price averages',
      errorDetails: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 