import { NextResponse } from 'next/server';

// Function to get current spot price
// In a real implementation, this would fetch from an external API
async function getCurrentSpotPrice() {
  try {
    // You would replace this with an actual API call to get real spot prices
    // For example, from Nord Pool or another electricity market data provider
    
    // For now, we'll return a simulated spot price
    const basePrice = 1.25; // Base price in NOK/kWh
    const randomVariation = (Math.random() * 0.2) - 0.1; // Random variation between -0.1 and +0.1
    
    return basePrice + randomVariation;
  } catch (error) {
    console.error('Error getting spot price:', error);
    throw error;
  }
}

export async function GET() {
  try {
    const spotPrice = await getCurrentSpotPrice();
    
    return NextResponse.json({
      success: true,
      price: spotPrice,
      unit: 'NOK/kWh',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch spot price: ' + error.message },
      { status: 500 }
    );
  }
} 