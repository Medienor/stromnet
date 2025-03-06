'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Image from 'next/image';
import providerLogoUrls from '../data/providerLogoUrls';

interface Provider {
  name: string;
  organizationNumber: number;
  pricelistUrl: string | null;
  slug: string;
}

export default function ProvidersClient() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await fetch('/api/providers');
        if (!response.ok) {
          throw new Error('Failed to fetch providers');
        }
        
        const data = await response.json();
        if (data.success && data.data) {
          setProviders(data.data);
        } else {
          throw new Error(data.error || 'Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching providers:', err);
        setError('Kunne ikke hente strømleverandører. Vennligst prøv igjen senere.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProviders();
  }, []);
  
  // Function to get provider logo URL
  const getProviderLogoUrl = (organizationNumber) => {
    if (organizationNumber && providerLogoUrls[organizationNumber]) {
      return providerLogoUrls[organizationNumber];
    }
    return null;
  };
  
  // Filter providers based on search term
  const filteredProviders = providers.filter(provider => 
    provider.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Strømleverandører i Norge</h1>
          
          <div className="mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Søk etter strømleverandør..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">
                  {filteredProviders.length} strømleverandører funnet
                </h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {filteredProviders.map((provider) => (
                  <div key={provider.organizationNumber} className="px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 mr-4">
                        {getProviderLogoUrl(provider.organizationNumber) ? (
                          <Image 
                            src={getProviderLogoUrl(provider.organizationNumber)} 
                            alt={provider.name} 
                            width={100} 
                            height={100}
                            className="h-25 w-25 object-contain"
                          />
                        ) : (
                          <div className="h-25 w-25 flex items-center justify-center bg-gray-100 rounded-md border border-gray-200">
                            <span className="text-gray-400 text-sm text-center px-2">
                              {provider.name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{provider.name}</h3>
                        <p className="text-sm text-gray-500">Org.nr: {provider.organizationNumber}</p>
                      </div>
                    </div>
                    
                    <div className="mt-2 md:mt-0 flex space-x-2">
                      <Link 
                        href={`/stromleverandorer/${provider.slug}`}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Se strømavtaler
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-8 bg-white shadow-md rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Om strømleverandører i Norge</h2>
            </div>
            <div className="px-6 py-4">
              <p className="text-gray-700 mb-4">
                I Norge har forbrukere mulighet til å velge fritt mellom ulike strømleverandører. 
                Dette gir deg som kunde mulighet til å finne den beste strømavtalen for ditt forbruk og behov.
              </p>
              <p className="text-gray-700 mb-4">
                Strømleverandørene tilbyr ulike typer avtaler, som spotprisavtaler, fastprisavtaler og variable avtaler. 
                Det kan være store prisforskjeller mellom de ulike leverandørene, så det lønner seg å sammenligne priser.
              </p>
              <p className="text-gray-700">
                På denne siden finner du en oversikt over alle strømleverandører i Norge, med lenker til deres prislister 
                der dette er tilgjengelig. Dette gjør det enklere for deg å sammenligne og finne den beste strømavtalen.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 