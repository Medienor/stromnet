import React from 'react';
import StromavtalerClient from './StromavtalerClient';
import { Metadata } from 'next';

// Define metadata for SEO
export const metadata: Metadata = {
  title: 'Sammenlign strømavtaler - Finn beste strømavtale for deg',
  description: 'Sammenlign strømavtaler fra ulike leverandører. Finn den beste strømavtalen for deg og spar penger på strømregningen.',
};

// This is a Server Component that can be statically generated
export default async function StromavtalerPage() {
  // Fetch data at build time
  try {
    // Use the correct API endpoint - your internal API route
    const response = await fetch('http://localhost:3000/api/electricity-deals', {
      next: { revalidate: 3600 } // Revalidate every hour
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch electricity deals: ${response.status} ${response.statusText}`);
      // Return client component with empty initial data
      return <StromavtalerClient initialProducts={[]} />;
    }
    
    const data = await response.json();
    console.log('Successfully fetched data from API:', data.success);
    
    // Make sure we're accessing the correct property path
    const products = data.data?.products || [];
    console.log(`Found ${products.length} products`);
    
    // Pass the pre-fetched data to the client component
    return <StromavtalerClient initialProducts={products} />;
  } catch (error) {
    console.error('Error in StromavtalerPage:', error);
    // Return client component with empty initial data on error
    return <StromavtalerClient initialProducts={[]} />;
  }
} 