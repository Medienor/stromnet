import React from 'react';
import { Metadata } from 'next';
import ProviderDetailClient from './ProviderDetailClient';
import { notFound } from 'next/navigation';

// Helper function to create consistent slugs
function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export async function generateMetadata({ params }: { params: { provider: string } }): Promise<Metadata> {
  const providerSlug = params.provider;
  
  // Get current month and year in Norwegian
  const currentDate = new Date();
  const monthNames = [
    'januar', 'februar', 'mars', 'april', 'mai', 'juni',
    'juli', 'august', 'september', 'oktober', 'november', 'desember'
  ];
  const currentMonth = monthNames[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();
  
  try {
    // Fetch provider data from our API
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/providers`, { next: { revalidate: 3600 } });
    if (!response.ok) throw new Error('Failed to fetch providers');
    
    const data = await response.json();
    if (!data.success || !data.data) throw new Error('Invalid response format');
    
    // Find the provider by slug - using our helper function for consistency
    const provider = data.data.find((p: any) => createSlug(p.name) === providerSlug);
    
    if (!provider) {
      console.error(`Provider not found with slug: ${providerSlug}`);
      console.log('Available providers:', data.data.map((p: any) => ({ name: p.name, slug: createSlug(p.name) })));
      return {
        title: 'Strømleverandør ikke funnet',
        description: 'Vi kunne ikke finne den forespurte strømleverandøren.'
      };
    }
    
    return {
      title: `${provider.name} | Strømavtaler og priser ${currentMonth} ${currentYear}`,
      description: `Se alle strømavtaler og priser fra ${provider.name}. Sammenlign tilbud og finn den beste strømavtalen for ditt forbruk.`
    };
  } catch (error) {
    console.error('Error fetching provider data:', error);
    return {
      title: 'Strømleverandør - Stromnet.no',
      description: 'Informasjon om strømleverandører i Norge'
    };
  }
}

// Generate static paths for all providers
export async function generateStaticParams() {
  try {
    // Fetch provider data from our API
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/providers`, { next: { revalidate: 3600 } });
    if (!response.ok) throw new Error('Failed to fetch providers');
    
    const data = await response.json();
    if (!data.success || !data.data) throw new Error('Invalid response format');
    
    // Create URL-friendly paths for each provider
    return data.data.map((provider: any) => ({
      provider: createSlug(provider.name)
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export default async function ProviderDetailPage({ params }: { params: { provider: string } }) {
  const providerSlug = params.provider;
  
  try {
    // Fetch provider data from our API
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/providers`, { next: { revalidate: 3600 } });
    if (!response.ok) throw new Error('Failed to fetch providers');
    
    const data = await response.json();
    if (!data.success || !data.data) throw new Error('Invalid response format');
    
    // Find the provider by slug - using our helper function for consistency
    const provider = data.data.find((p: any) => createSlug(p.name) === providerSlug);
    
    if (!provider) {
      console.error(`Provider not found with slug: ${providerSlug}`);
      console.log('Available providers:', data.data.map((p: any) => ({ name: p.name, slug: createSlug(p.name) })));
      notFound();
    }
    
    // Pre-fetch additional data for SEO
    // Fetch electricity deals
    const dealsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/electricity-deals`, { next: { revalidate: 3600 } });
    const dealsData = await dealsResponse.json();
    
    let initialDeals = [];
    if (dealsData.success && dealsData.data && dealsData.data.products) {
      initialDeals = dealsData.data.products;
    }
    
    // Fetch spot price (default to NO1 area code)
    const spotPriceResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/average-electricity-price?areaCode=NO1`, { next: { revalidate: 3600 } });
    const spotPriceData = await spotPriceResponse.json();
    
    let spotPrice = 1.0;
    if (spotPriceData.success && spotPriceData.data) {
      spotPrice = spotPriceData.data.averagePrice / 100; // Convert from øre to NOK
    }
    
    return (
      <div className="min-h-screen bg-gray-50">
        <ProviderDetailClient 
          provider={provider} 
          initialDeals={initialDeals}
          initialSpotPrice={spotPrice}
        />
      </div>
    );
  } catch (error) {
    console.error('Error fetching provider data:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Noe gikk galt</h1>
          <p className="text-gray-600">Vi kunne ikke hente informasjon om denne strømleverandøren.</p>
        </div>
      </div>
    );
  }
}

// Add this export to enable ISR (Incremental Static Regeneration)
export const revalidate = 43200; // Revalidate every 12 hours 