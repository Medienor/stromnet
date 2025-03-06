import { NextResponse } from 'next/server';

// Authentication credentials
const CLIENT_ID = "66cc3e36-2a6d-416d-8d83-b5f788d08d18";
const CLIENT_SECRET = "7cab0439ca041e09b2d23fcb63b9f5c7c9c9fdc70aa32002600cac319dc42b7c4985ce4802e5eb5c79145e3e23c6d1cbb40295cef8525eb896cc5d367feeb403";
const AUTH_URL = "https://strom-api.forbrukerradet.no/auth/token";
const API_BASE_URL = "https://strom-api.forbrukerradet.no";

// Function to get JWT token
async function getAuthToken() {
  try {
    const response = await fetch(AUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grantType: 'client_credentials',
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Authentication failed:', errorText);
      throw new Error(`Authentication failed: ${errorText}`);
    }

    const data = await response.json();
    console.log('Auth response:', data);
    return data.accessToken; // Changed from access_token to match API response format
  } catch (error) {
    console.error('Error getting auth token:', error);
    throw error;
  }
}

// Function to fetch electricity deals
async function fetchElectricityDeals(token: string) {
  try {
    // Using the correct endpoint format based on the Swagger docs
    const response = await fetch(`${API_BASE_URL}/feed/today`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch electricity deals:', errorText);
      throw new Error(`Failed to fetch electricity deals: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching electricity deals:', error);
    throw error;
  }
}

// Process the data to make it more usable for our frontend
function processElectricityData(data) {
  // Create a flattened list of products with their provider information
  const products = [];
  
  // If data is an array of providers
  if (Array.isArray(data)) {
    data.forEach(provider => {
      if (provider.products && Array.isArray(provider.products)) {
        provider.products.forEach(product => {
          products.push({
            ...product,
            provider: {
              name: provider.name,
              organizationNumber: provider.organizationNumber,
              url: provider.url,
              pricelistUrl: provider.pricelistUrl,
            }
          });
        });
      }
    });
  }
  
  // Return processed data
  return {
    date: new Date().toISOString().split('T')[0],
    products: products,
    rawData: data // Including raw data for debugging
  };
}

// Function to analyze the structure of a product object
function analyzeProductStructure(products) {
  // Skip if no products
  if (!products || products.length === 0) {
    console.log('No products to analyze');
    return null;
  }
  
  // Get a sample of products to analyze
  const sampleSize = Math.min(20, products.length);
  const sampleProducts = products.slice(0, sampleSize);
  
  // Create a set of all found keys
  const allKeys = new Set();
  
  // Collect all keys from all sample products
  sampleProducts.forEach(product => {
    Object.keys(product).forEach(key => allKeys.add(key));
  });
  
  // Convert to array and sort alphabetically
  const allKeysArray = Array.from(allKeys).sort();
  
  // Create a structure with all keys and example values
  const structureAnalysis = {
    totalKeys: allKeysArray.length,
    keys: allKeysArray,
    sampleValues: {}
  };
  
  // For each key, find an example value that's not null/undefined
  allKeysArray.forEach(key => {
    const productsWithKey = sampleProducts.filter(p => p[key] !== undefined && p[key] !== null);
    if (productsWithKey.length > 0) {
      const exampleValue = productsWithKey[0][key];
      
      // For objects/arrays, show their structure rather than full content
      if (Array.isArray(exampleValue)) {
        structureAnalysis.sampleValues[key] = `Array[${exampleValue.length}] example: ${
          exampleValue.length > 0 
            ? JSON.stringify(exampleValue[0]).substring(0, 100) + (JSON.stringify(exampleValue[0]).length > 100 ? '...' : '')
            : 'empty'
        }`;
      } else if (typeof exampleValue === 'object' && exampleValue !== null) {
        structureAnalysis.sampleValues[key] = `Object keys: ${Object.keys(exampleValue).join(', ')}`;
      } else {
        structureAnalysis.sampleValues[key] = exampleValue;
      }
    } else {
      structureAnalysis.sampleValues[key] = 'All null/undefined in sample';
    }
  });
  
  return structureAnalysis;
}

// Main API handler
export async function GET() {
  try {
    // Get JWT token
    const token = await getAuthToken();
    console.log('Successfully obtained auth token');
    
    // Fetch electricity deals with the token
    const deals = await fetchElectricityDeals(token);
    console.log('Data fetched successfully');
    
    // Process the data
    const processedData = processElectricityData(deals);
    
    // Analyze the product structure
    const structureAnalysis = analyzeProductStructure(processedData.products);
    console.log('Product Structure Analysis:', JSON.stringify(structureAnalysis, null, 2));
    
    // Log the first 20 products for analysis
    if (processedData.products && processedData.products.length > 0) {
      console.log(`Total products: ${processedData.products.length}`);
      console.log('First 20 products:');
      processedData.products.slice(0, 20).forEach((product, index) => {
        console.log(`Product ${index + 1}:`, JSON.stringify(product, null, 2));
      });
    } else {
      console.log('No products found in the response');
      console.log('Raw response:', JSON.stringify(deals, null, 2));
    }
    
    // Return the processed data with structure analysis
    return NextResponse.json({ 
      success: true, 
      data: processedData,
      structureAnalysis
    });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch electricity deals: ' + error.message },
      { status: 500 }
    );
  }
} 