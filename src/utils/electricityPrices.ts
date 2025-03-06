/**
 * Utilities for fetching and processing electricity price data
 */

// Define price areas in Norway
export const PRICE_AREAS = [
  { code: 'NO1', name: 'Oslo / Øst-Norge' },
  { code: 'NO2', name: 'Kristiansand / Sør-Norge' },
  { code: 'NO3', name: 'Trondheim / Midt-Norge' },
  { code: 'NO4', name: 'Tromsø / Nord-Norge' },
  { code: 'NO5', name: 'Bergen / Vest-Norge' }
];

// Interface for price data from API
interface PriceData {
  NOK_per_kWh: number;
  EUR_per_kWh: number;
  EXR: number;
  time_start: string;
  time_end: string;
}

// Interface for processed daily price data
interface DailyPriceData {
  date: string;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  prices: PriceData[];
}

// Interface for area price data
interface AreaPriceData {
  areaCode: string;
  areaName: string;
  days: DailyPriceData[];
  averagePrice: number;
}

// Monthly consumption distribution based on NVE data
export const MONTHLY_CONSUMPTION_DISTRIBUTION = {
  0: 12.51, // January
  1: 11.02, // February
  2: 10.77, // March
  3: 8.58,  // April
  4: 6.66,  // May
  5: 4.97,  // June
  6: 4.63,  // July
  7: 4.96,  // August
  8: 5.98,  // September
  9: 7.85,  // October
  10: 9.91, // November
  11: 12.15 // December
};

// Get current month's consumption percentage
export function getCurrentMonthConsumptionPercentage(): number {
  const currentMonth = new Date().getMonth();
  return MONTHLY_CONSUMPTION_DISTRIBUTION[currentMonth];
}

// Calculate consumption for a specific month
export function getMonthlyConsumption(annualConsumption: number, month?: number): number {
  const targetMonth = month !== undefined ? month : new Date().getMonth();
  const percentage = MONTHLY_CONSUMPTION_DISTRIBUTION[targetMonth];
  return (annualConsumption * percentage) / 100;
}

// Generates an array of dates for the past n days
function getPastDates(days: number): string[] {
  const dates: string[] = [];
  const today = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Format as YYYY/MM-DD
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    dates.push(`${year}/${month}-${day}`);
  }
  
  return dates;
}

// Fetches price data for a specific date and area
export async function fetchPriceData(date: string, areaCode: string): Promise<PriceData[]> {
  try {
    const response = await fetch(`https://www.hvakosterstrommen.no/api/v1/prices/${date}_${areaCode}.json`);
    
    if (!response.ok) {
      console.error(`Failed to fetch price data for ${date} in ${areaCode}: ${response.status} ${response.statusText}`);
      return [];
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching price data for ${date} in ${areaCode}:`, error);
    return [];
  }
}

// Calculates daily average from hourly prices
function calculateDailyAverage(prices: PriceData[]): DailyPriceData | null {
  if (!prices || prices.length === 0) {
    return null;
  }
  
  const sum = prices.reduce((acc, price) => acc + price.NOK_per_kWh, 0);
  const average = sum / prices.length;
  
  const min = Math.min(...prices.map(price => price.NOK_per_kWh));
  const max = Math.max(...prices.map(price => price.NOK_per_kWh));
  
  // Extract date from the first price's time_start
  const dateStr = prices[0]?.time_start.split('T')[0] || '';
  
  return {
    date: dateStr,
    averagePrice: average,
    minPrice: min,
    maxPrice: max,
    prices
  };
}

// Fetches and calculates average prices for the past n days for a specific area
export async function getAreaPriceData(areaCode: string, days: number = 10): Promise<AreaPriceData> {
  const dates = getPastDates(days);
  const areaName = PRICE_AREAS.find(area => area.code === areaCode)?.name || areaCode;
  
  const dailyData: DailyPriceData[] = [];
  
  // Fetch data for each date
  for (const date of dates) {
    const prices = await fetchPriceData(date, areaCode);
    const dailyAverage = calculateDailyAverage(prices);
    
    if (dailyAverage) {
      dailyData.push(dailyAverage);
    }
  }
  
  // Calculate overall average for the area
  const totalAverage = dailyData.length > 0
    ? dailyData.reduce((acc, day) => acc + day.averagePrice, 0) / dailyData.length
    : 0;
  
  return {
    areaCode,
    areaName,
    days: dailyData,
    averagePrice: totalAverage
  };
}

// Fetches and calculates average prices for all areas
export async function getAllAreaPrices(days: number = 10): Promise<{
  areas: AreaPriceData[],
  nationalAverage: number
}> {
  const areas: AreaPriceData[] = [];
  
  // Fetch data for each area in parallel
  const promises = PRICE_AREAS.map(area => getAreaPriceData(area.code, days));
  const results = await Promise.all(promises);
  
  areas.push(...results);
  
  // Calculate national average
  const nationalAverage = areas.length > 0
    ? areas.reduce((acc, area) => acc + area.averagePrice, 0) / areas.length
    : 0;
  
  return {
    areas,
    nationalAverage
  };
}

// Enhanced calculation of monthly cost using real price data and monthly distribution
export function calculateEnhancedMonthlyCost(
  product: any, 
  consumption: number = 16000,
  basePrice: number = 0.4, // Default if no price data available
  month?: number
): number {
  // Get consumption for the specific month based on distribution
  const monthlyConsumption = getMonthlyConsumption(consumption, month);
  
  // Get the addon price (påslag)
  const addonPrice = product.addonPrice || 0;
  
  // Get the monthly fee
  const monthlyFee = product.monthlyFee || 0;
  
  // Get the electricity certificate price
  const elCertificatePrice = product.elCertificatePrice || 0;
  
  // Paper invoice fee (if applied)
  const paperInvoiceFee = product.feePostalLetterApplied ? (product.feePostalLetter || 0) : 0;
  
  // Use the real spot price or the provided default
  const spotPrice = basePrice;
  
  // Calculate the total monthly cost
  // (consumption * (spot price + addon price + el certificate price)) + monthly fee + paper invoice fee
  const totalMonthly = (monthlyConsumption * (spotPrice + addonPrice + elCertificatePrice)) + 
                       monthlyFee + (paperInvoiceFee / 12); // Divide by 12 as it's usually per invoice
  
  return totalMonthly;
}

// Get detailed price breakdown for a product
export function getPriceBreakdown(
  product: any,
  consumption: number = 16000,
  basePrice: number = 0.4,
  month?: number
) {
  // Get consumption for the specific month based on distribution
  const monthlyConsumption = getMonthlyConsumption(consumption, month);
  
  // Get the product details
  const addonPrice = product.addonPrice || 0;
  const monthlyFee = product.monthlyFee || 0;
  const elCertificatePrice = product.elCertificatePrice || 0;
  const paperInvoiceFee = product.feePostalLetterApplied ? (product.feePostalLetter || 0) : 0;
  
  // Calculate components
  const spotPriceCost = basePrice;
  const totalKwhPrice = spotPriceCost + addonPrice + elCertificatePrice;
  const energyCost = monthlyConsumption * totalKwhPrice;
  const totalMonthlyCost = energyCost + monthlyFee + (paperInvoiceFee / 12);
  
  return {
    spotPrice: spotPriceCost,
    addonPrice: addonPrice,
    elCertificatePrice: elCertificatePrice,
    totalKwhPrice: totalKwhPrice,
    monthlyConsumption: monthlyConsumption,
    energyCost: energyCost,
    monthlyFee: monthlyFee,
    paperInvoiceFee: paperInvoiceFee / 12,
    totalMonthlyCost: totalMonthlyCost
  };
} 