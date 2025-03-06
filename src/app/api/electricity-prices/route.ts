import { NextResponse } from 'next/server';
import { getAllAreaPrices } from '../../../utils/electricityPrices';

export async function GET(request: Request) {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const days = parseInt(url.searchParams.get('days') || '10', 10);
    
    // Validate days parameter
    if (isNaN(days) || days < 1 || days > 30) {
      return NextResponse.json(
        { success: false, error: 'Days parameter must be between 1 and 30' },
        { status: 400 }
      );
    }
    
    // Fetch price data
    const priceData = await getAllAreaPrices(days);
    
    return NextResponse.json({
      success: true,
      data: priceData
    });
  } catch (error) {
    console.error('Error fetching electricity prices:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch electricity prices' },
      { status: 500 }
    );
  }
} 