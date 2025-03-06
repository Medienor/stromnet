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
    
    return (
      <div className="min-h-screen bg-gray-50">
        <ProviderDetailClient provider={provider} />
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