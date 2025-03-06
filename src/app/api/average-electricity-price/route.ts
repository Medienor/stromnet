import { NextRequest, NextResponse } from 'next/server';

interface PriceData {
  NOK_per_kWh: number;
  EUR_per_kWh: number;
  EXR: number;
  time_start: string;
  time_end: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const areaCode = searchParams.get('areaCode') || 'NO1';
    
    // Calculate dates for the last 10 days
    const dates = [];
    for (let i = 0; i < 10; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      dates.push(`${year}/${month}-${day}_${areaCode}.json`);
    }
    
    // Fetch data for all dates in parallel
    const pricePromises = dates.map(dateStr => 
      fetch(`https://www.hvakosterstrommen.no/api/v1/prices/${dateStr}`)
        .then(res => {
          if (!res.ok) {
            // If we can't get data for a specific day, just return an empty array
            // This can happen for future dates or very old dates
            return [];
          }
          return res.json();
        })
        .catch(() => []) // Handle any errors by returning an empty array
    );
    
    const priceResults = await Promise.all(pricePromises);
    
    // Flatten the array of arrays and filter out any empty results
    const allPrices: PriceData[] = priceResults.flat();
    
    if (allPrices.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No price data available for the specified area code'
      }, { status: 404 });
    }
    
    // Calculate current price (most recent hour)
    const now = new Date();
    const currentHourPrices = allPrices.filter(price => {
      const priceDate = new Date(price.time_start);
      return priceDate <= now && new Date(price.time_end) > now;
    });
    
    const currentPrice = currentHourPrices.length > 0 
      ? currentHourPrices[0].NOK_per_kWh * 100 // Convert to øre/kWh
      : allPrices[0].NOK_per_kWh * 100; // Use the most recent price if current hour not found
    
    // Calculate average price over all available data
    const totalPrice = allPrices.reduce((sum, price) => sum + price.NOK_per_kWh, 0);
    const averagePrice = (totalPrice / allPrices.length) * 100; // Convert to øre/kWh
    
    return NextResponse.json({
      success: true,
      data: {
        currentPrice,
        averagePrice,
        areaCode,
        daysIncluded: priceResults.filter(result => result.length > 0).length,
        totalHoursIncluded: allPrices.length,
        source: 'Hva koster strømmen.no'
      }
    });
    
  } catch (error) {
    console.error('Error fetching electricity prices:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch electricity prices'
    }, { status: 500 });
  }
} 