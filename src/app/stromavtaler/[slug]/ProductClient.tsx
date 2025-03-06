'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import providerLogoUrls from '@/app/data/providerLogoUrls';

// Add these type definitions at the top of the file
interface Provider {
  name: string;
  organizationNumber: string;
  pricelistUrl?: string;
}

interface SalesNetwork {
  name: string;
  type: string;
  kwPrice?: number;
}

// Add a type for association objects
interface Association {
  id?: string;
  name?: string;
  isCommon?: boolean;
  [key: string]: string | number | boolean | undefined; // More specific than 'any'
}

interface Product {
  id: string;
  name: string;
  productType: 'hourly_spot' | 'fixed' | 'variable' | string;
  provider: Provider;
  monthlyFee: number;
  addonPrice: number;
  elCertificatePrice: number;
  agreementTime: number;
  agreementTimeUnit?: 'day' | 'month' | 'year' | string;
  billingFrequency?: number;
  billingFrequencyUnit?: 'month' | 'year' | string;
  paymentType?: 'after' | 'before' | string;
  fixedPrice?: number;
  variablePrice?: number;
  markup?: number;
  maxKwhPerYear?: number;
  feeMandatoryType?: string;
  cabinProduct?: boolean;
  vatExemption?: boolean;
  salesNetworks?: SalesNetwork[];
  associations?: (string | Association)[]; // Can be either strings or Association objects
  otherConditions?: string;
  standardAlert?: 'email' | 'sms' | string;
  feePostalLetter?: number;
  feePostalLetterApplied?: boolean;
}

interface ProductClientProps {
  initialProduct: Product;
  initialOtherProducts: Product[];
}

// Add a type for the providerLogoUrls object
type ProviderLogoUrls = {
  [key: string]: string;
};

// Type assertion for providerLogoUrls
const typedProviderLogoUrls = providerLogoUrls as ProviderLogoUrls;

// Helper function to generate slug with type
const generateSlug = (product: Product): string => {
  const providerName = product.provider.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  const productName = product.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  return `${providerName}-${productName}`;
};

// Helper function for agreement time text with type
const getAgreementTimeText = (product: Product): string => {
  if (!product || !product.agreementTime || product.agreementTime === 0) {
    return 'Ingen bindingstid';
  }
  
  const unit = product.agreementTimeUnit === 'year' ? 'år' : 
               product.agreementTimeUnit === 'month' ? 'måneder' : 
               product.agreementTimeUnit === 'day' ? 'dager' : product.agreementTimeUnit;
               
  return `${product.agreementTime} ${unit} bindingstid`;
};

export default function ProductClient({ initialProduct, initialOtherProducts }: ProductClientProps) {
  const product = initialProduct;
  const otherProviderProducts = initialOtherProducts;
  
  // Add a safety check for associations
  const renderAssociations = () => {
    if (!product.associations) return null;
    
    return (
      <div>
        <h4 className="text-sm font-medium text-gray-500">Tilknytninger</h4>
        <ul className="list-disc pl-5 text-gray-800">
          {product.associations.map((association, index) => {
            // Check if association is an object or string
            if (typeof association === 'object' && association !== null) {
              // If it's an object, render a meaningful string representation
              return <li key={index}>{association.name || JSON.stringify(association)}</li>;
            }
            // If it's a string, render it directly
            return <li key={index}>{association}</li>;
          })}
        </ul>
      </div>
    );
  };
  
  return (
    <>
      {/* Hero Section */}
      <section className="bg-blue-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-6 md:mb-0">
                {product.provider.organizationNumber && typedProviderLogoUrls[product.provider.organizationNumber] ? (
                  <div className="mb-4 bg-white p-3 inline-block rounded-lg">
                    <Image 
                      src={typedProviderLogoUrls[product.provider.organizationNumber]} 
                      alt={`${product.provider.name} logo`}
                      width={120}
                      height={60}
                      className="object-contain"
                    />
                  </div>
                ) : null}
                <div>
                  <h1 className="text-3xl font-bold mb-1">{product.name}</h1>
                  <p className="text-blue-100 text-lg">{product.provider.name}</p>
                  <div className="mt-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-700 text-white">
                      {product.productType === 'hourly_spot' ? 'Spotprisavtale' : 
                       product.productType === 'fixed' ? 'Fastprisavtale' : 
                       product.productType === 'variable' ? 'Variabel prisavtale' : product.productType}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-start md:items-end">
                <Link 
                  href="/stromavtaler" 
                  className="inline-flex items-center text-blue-100 hover:text-white transition-colors duration-150"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5 mr-2" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M10 19l-7-7m0 0l7-7m-7 7h18" 
                    />
                  </svg>
                  Gå tilbake til alle strømavtaler
                </Link>
                
                <div className="mt-4 bg-blue-700 px-4 py-2 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-blue-100 mr-2">Bindingstid:</span>
                    <span className="font-medium">
                      {product.agreementTime > 0 
                        ? `${product.agreementTime} ${product.agreementTimeUnit === 'year' ? 'år' : 
                           product.agreementTimeUnit === 'month' ? 'måneder' : 
                           product.agreementTimeUnit === 'day' ? 'dager' : product.agreementTimeUnit}`
                        : 'Ingen bindingstid'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Product Overview Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            {/* Product Overview Card */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
              <div className="p-6">
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Månedsgebyr</h3>
                    <p className="text-2xl font-bold text-gray-800">{product.monthlyFee} kr</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Påslag</h3>
                    <p className="text-2xl font-bold text-gray-800">{(product.addonPrice * 100).toFixed(2)} øre/kWh</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Elsertifikat</h3>
                    <p className="text-2xl font-bold text-gray-800">{(product.elCertificatePrice * 100).toFixed(2)} øre/kWh</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Detailed Product Information Card */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Detaljert produktinformasjon</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  {/* Basic Information */}
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Produktnavn</h4>
                      <p className="text-gray-800">{product.name}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Produkttype</h4>
                      <p className="text-gray-800">
                        {product.productType === 'hourly_spot' ? 'Spotpris' : 
                         product.productType === 'fixed' ? 'Fastpris' : 
                         product.productType === 'variable' ? 'Variabel pris' : product.productType}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Bindingstid</h4>
                      <p className="text-gray-800">
                        {product.agreementTime > 0 
                          ? `${product.agreementTime} ${product.agreementTimeUnit === 'year' ? 'år' : 
                             product.agreementTimeUnit === 'month' ? 'måneder' : 
                             product.agreementTimeUnit === 'day' ? 'dager' : product.agreementTimeUnit}`
                          : 'Ingen bindingstid'}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Faktureringsfrekvens</h4>
                      <p className="text-gray-800">
                        {product.billingFrequency && `${product.billingFrequency} ${
                          product.billingFrequencyUnit === 'month' ? 'måned' + (product.billingFrequency > 1 ? 'er' : '') : 
                          product.billingFrequencyUnit === 'year' ? 'år' : 
                          product.billingFrequencyUnit
                        }`}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Betalingstype</h4>
                      <p className="text-gray-800">
                        {product.paymentType === 'after' ? 'Etterskuddsbetaling' : 
                         product.paymentType === 'before' ? 'Forskuddsbetaling' : 
                         product.paymentType}
                      </p>
                    </div>
                  </div>
                  
                  {/* Pricing Information */}
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Månedsgebyr</h4>
                      <p className="text-gray-800">{product.monthlyFee} kr</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Påslag</h4>
                      <p className="text-gray-800">{(product.addonPrice * 100).toFixed(2)} øre/kWh</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Elsertifikat</h4>
                      <p className="text-gray-800">{(product.elCertificatePrice * 100).toFixed(2)} øre/kWh</p>
                    </div>
                    
                    {product.fixedPrice && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Fastpris</h4>
                        <p className="text-gray-800">{(product.fixedPrice * 100).toFixed(2)} øre/kWh</p>
                      </div>
                    )}
                    
                    {product.variablePrice && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Variabel pris</h4>
                        <p className="text-gray-800">{(product.variablePrice * 100).toFixed(2)} øre/kWh</p>
                      </div>
                    )}
                    
                    {product.markup && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Påslag</h4>
                        <p className="text-gray-800">{(product.markup * 100).toFixed(2)} øre/kWh</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Additional Information */}
                <div className="mt-6 space-y-3">
                  {product.maxKwhPerYear && product.maxKwhPerYear > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Maksimalt forbruk per år</h4>
                      <p className="text-gray-800">{product.maxKwhPerYear} kWh</p>
                    </div>
                  )}
                  
                  {product.feeMandatoryType && product.feeMandatoryType !== 'none' && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Obligatorisk gebyrtype</h4>
                      <p className="text-gray-800">{product.feeMandatoryType}</p>
                    </div>
                  )}
                  
                  {product.feePostalLetter && product.feePostalLetter > 0 && product.feePostalLetterApplied && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Gebyr for papirfaktura</h4>
                      <p className="text-gray-800">{product.feePostalLetter} kr</p>
                    </div>
                  )}
                  
                  {product.otherConditions && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Andre betingelser</h4>
                      <p className="text-gray-800">{product.otherConditions}</p>
                    </div>
                  )}
                  
                  {product.standardAlert && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Standard varsling</h4>
                      <p className="text-gray-800">
                        {product.standardAlert === 'email' ? 'E-post' : 
                         product.standardAlert === 'sms' ? 'SMS' : 
                         product.standardAlert}
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Hytteavtale</h4>
                    <p className="text-gray-800">{product.cabinProduct ? 'Ja' : 'Nei'}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Momsfritak</h4>
                    <p className="text-gray-800">{product.vatExemption ? 'Ja' : 'Nei'}</p>
                  </div>
                  
                  {product.salesNetworks && product.salesNetworks.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Salgsnettverk</h4>
                      <ul className="list-disc pl-5 text-gray-800">
                        {product.salesNetworks.map((network, index) => (
                          <li key={index}>
                            {network.name} ({network.type})
                            {network.kwPrice !== undefined && network.kwPrice > 0 && ` - ${(network.kwPrice * 100).toFixed(2)} øre/kWh`}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {product.associations && product.associations.length > 0 && renderAssociations()}
                </div>
                
                {/* Provider Information */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Leverandørinformasjon</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Leverandør</h4>
                      <p className="text-gray-800">{product.provider.name}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Organisasjonsnummer</h4>
                      <p className="text-gray-800">{product.provider.organizationNumber}</p>
                    </div>
                    
                    {product.provider.pricelistUrl && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Prisliste</h4>
                        <a 
                          href={product.provider.pricelistUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          Se leverandørens prisliste
                        </a>
                      </div>
                    )}
                    
                    <div className="pt-2 mt-2 border-t border-gray-200">
                      <p className="text-sm text-gray-500 italic">Data levert av Forbrukerrådet</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Button with Benefits Card */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
              <div className="p-6">
                <a
                  href="https://tjenestetorget.no/stroem/?utm_source=besteitest&utm_medium=cpa&utm_campaign=tt-besteitest-k31-strom&utm_term=tt-besteitest-k31-strom&utm_content=tt-besteitest-k31-strom-besteitest"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-md text-center transition duration-150 ease-in-out flex items-center justify-center w-full"
                >
                  <span className="text-base">Få tilbud på strøm</span>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="ml-2 h-5 w-5" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M14 5l7 7m0 0l-7 7m7-7H3" 
                    />
                  </svg>
                </a>
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center py-1">
                    <svg className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-600">Få tilbud fra flere leverandører</span>
                  </div>
                  <div className="flex items-center py-1">
                    <svg className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-600">Spar penger på strømregningen</span>
                  </div>
                  <div className="flex items-center py-1">
                    <svg className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-600">Helt gratis og uforpliktende</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Similar Products Section */}
      {otherProviderProducts.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Andre strømavtaler fra {product.provider.name}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherProviderProducts.map((similarProduct: Product) => (
                  <div key={similarProduct.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <div className="p-6">
                      {/* Provider Logo */}
                      <div className="flex items-center mb-4">
                        <div className="h-12 w-12 relative mr-3 flex-shrink-0">
                          {similarProduct.provider.organizationNumber && typedProviderLogoUrls[similarProduct.provider.organizationNumber] ? (
                            <Image 
                              src={typedProviderLogoUrls[similarProduct.provider.organizationNumber]} 
                              alt={`${similarProduct.provider.name} logo`}
                              width={48}
                              height={48}
                              className="object-contain"
                            />
                          ) : (
                            <div className="w-12 h-12 flex items-center justify-center bg-blue-100 rounded-full">
                              <span className="text-blue-800 font-bold text-sm">
                                {similarProduct.provider.name.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <h3 className="font-semibold text-lg text-gray-800 truncate">{similarProduct.name}</h3>
                      </div>
                      
                      {/* Product Type Badge */}
                      <div className="mb-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {similarProduct.productType === 'hourly_spot' ? 'Spotpris' : 
                           similarProduct.productType === 'fixed' ? 'Fastpris' : 
                           similarProduct.productType === 'variable' ? 'Variabel pris' : similarProduct.productType}
                        </span>
                      </div>
                      
                      {/* Product Details */}
                      <div className="space-y-2 mb-5">
                        <div className="flex justify-between items-center py-1 border-b border-gray-100">
                          <span className="text-sm text-gray-600">Månedsgebyr:</span>
                          <span className="font-medium text-gray-800">{similarProduct.monthlyFee} kr</span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-gray-100">
                          <span className="text-sm text-gray-600">Påslag:</span>
                          <span className="font-medium text-gray-800">{(similarProduct.addonPrice * 100).toFixed(2)} øre/kWh</span>
                        </div>
                        {similarProduct.elCertificatePrice && (
                          <div className="flex justify-between items-center py-1 border-b border-gray-100">
                            <span className="text-sm text-gray-600">Elsertifikat:</span>
                            <span className="font-medium text-gray-800">{(similarProduct.elCertificatePrice * 100).toFixed(2)} øre/kWh</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Action Button */}
                      <Link 
                        href={`/stromavtaler/${generateSlug(similarProduct)}`}
                        className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-md transition duration-150 ease-in-out"
                      >
                        Se detaljer
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
} 