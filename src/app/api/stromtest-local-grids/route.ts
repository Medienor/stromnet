import { NextRequest, NextResponse } from 'next/server';

// Authentication credentials
const CLIENT_ID = "66cc3e36-2a6d-416d-8d83-b5f788d08d18";
const CLIENT_SECRET = "7cab0439ca041e09b2d23fcb63b9f5c7c9c9fdc70aa32002600cac319dc42b7c4985ce4802e5eb5c79145e3e23c6d1cbb40295cef8525eb896cc5d367feeb403";
const AUTH_URL = "https://strom-api.forbrukerradet.no/auth/token";

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
      throw new Error(`Authentication failed: ${response.status}`);
    }

    const data = await response.json();
    return data.accessToken;
  } catch (error) {
    console.error('Error getting auth token:', error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get JWT token first
    const token = await getAuthToken();
    console.log('Successfully obtained auth token');
    
    const response = await fetch('https://strom-api.forbrukerradet.no/local_grids', {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    // Get the raw response text
    const rawBody = await response.text();
    console.log('LOCAL GRIDS BODY =', rawBody);
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    // Parse the raw text as JSON
    const data = JSON.parse(rawBody);
    
    // Ensure we're returning an array
    if (!Array.isArray(data)) {
      throw new Error('Expected array of local grids');
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in stromtest-local-grids:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 