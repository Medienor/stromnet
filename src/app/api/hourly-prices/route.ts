import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const date = url.searchParams.get('date');
    const areaCode = url.searchParams.get('areaCode');
    
    console.log('API route called with params:', { date, areaCode });
    
    // Validate required parameters
    if (!date || !areaCode) {
      console.log('Missing required parameters');
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: date and areaCode' },
        { status: 400 }
      );
    }
    
    // Format the date as YYYY/MM-DD for the API
    const dateParts = date.split('-');
    if (dateParts.length !== 3) {
      return NextResponse.json(
        { success: false, error: 'Invalid date format. Expected YYYY-MM-DD' },
        { status: 400 }
      );
    }
    
    const year = dateParts[0];
    const month = dateParts[1];
    const day = dateParts[2];
    const formattedDate = `${year}/${month}-${day}`;
    
    console.log('Formatted date for API:', formattedDate);
    
    // Check if the date is in the future (beyond today)
    const requestDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let apiUrl;
    
    if (requestDate > today) {
      console.log('Requested future date, using today instead');
      // Use today's date instead
      const todayYear = today.getFullYear();
      const todayMonth = String(today.getMonth() + 1).padStart(2, '0');
      const todayDay = String(today.getDate()).padStart(2, '0');
      
      // Format as YYYY/MM-DD for the API
      const todayFormatted = `${todayYear}/${todayMonth}-${todayDay}`;
      
      // Fetch price data from hvakosterstrommen.no
      apiUrl = `https://www.hvakosterstrommen.no/api/v1/prices/${todayFormatted}_${areaCode}.json`;
    } else {
      // Fetch price data from hvakosterstrommen.no
      apiUrl = `https://www.hvakosterstrommen.no/api/v1/prices/${formattedDate}_${areaCode}.json`;
    }
    
    console.log('Fetching from external API:', apiUrl);
    
    const response = await fetch(apiUrl, { 
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    console.log('External API response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`External API responded with status: ${response.status}`);
    }
    
    const priceData = await response.json();
    console.log('Successfully fetched price data, count:', priceData.length);
    
    return NextResponse.json({
      success: true,
      data: priceData
    });
  } catch (error) {
    console.error('Error in hourly-prices API route:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: `Failed to fetch hourly electricity prices: ${error.message}` 
      },
      { status: 500 }
    );
  }
} 