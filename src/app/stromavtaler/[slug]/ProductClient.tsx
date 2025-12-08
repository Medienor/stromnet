'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import providerLogoUrls from '@/app/data/providerLogoUrls';
import { 
  HiOutlineBuildingOffice2, 
  HiOutlineCurrencyDollar, 
  HiOutlineGift,
  HiOutlineSparkles,
  HiOutlineArrowRight,
  HiOutlineHome,
  HiOutlineSun,
  HiOutlineCloud,
  HiOutlineMapPin,
  HiOutlineUser,
  HiOutlineUsers,
  HiOutlineFire,
  HiOutlineBolt,
  HiOutlineChartBarSquare,
  HiOutlineScale,
  HiOutlineMagnifyingGlass,
  HiOutlineQuestionMarkCircle
} from 'react-icons/hi2';

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
  // New fields from API
  orderUrl?: string;
  addonPriceMinimumFixedFor?: number;
  addonPriceMinimumFixedForUnit?: 'day' | 'month' | 'year' | string;
  addonPriceMinimumFixedForConfirmed?: boolean;
  feeMandatoryUpdated?: boolean;
  feeContractBreach?: number;
  applicableToCustomerType?: number;
  priceType?: 'spot' | 'fixed' | 'variable' | string;
  publishedAt?: string;
  priceChangedAt?: string;
  purchaseAddonPrice?: number;
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
  const [averageSpotPrice, setAverageSpotPrice] = useState<number>(0);
  const [spotPriceLoading, setSpotPriceLoading] = useState(true);
  const [openFaqItems, setOpenFaqItems] = useState<Set<number>>(new Set());
  const [showStickyBanner, setShowStickyBanner] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [bannerClosed, setBannerClosed] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');

  // Toggle FAQ accordion items
  const toggleFaqItem = (index: number) => {
    setOpenFaqItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // Scroll to section function
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -80; // Account for sticky header
      const yPosition = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({
        top: yPosition,
        behavior: 'smooth'
      });
      setActiveSection(sectionId);
    }
  };

  // Helper function to calculate total cost for any consumption level
  const calculateTotalCost = (consumptionKwh: number) => {
    let totalCost = product.monthlyFee * 12;
    totalCost += product.addonPrice * consumptionKwh;
    if (product.elCertificatePrice > 0) totalCost += product.elCertificatePrice * consumptionKwh;
    if ((product.productType === 'hourly_spot' || product.productType === 'plus') && averageSpotPrice > 0) {
      totalCost += (averageSpotPrice / 100) * consumptionKwh;
    }
    return totalCost;
  };

  // Fetch average spot price on component mount
  useEffect(() => {
    const fetchAverageSpotPrice = async () => {
      try {
        const response = await fetch('/api/average-electricity-price?areaCode=NO1');
        const data = await response.json();
        
        if (data.success && data.data.averagePrice) {
          setAverageSpotPrice(data.data.averagePrice); // Already in øre/kWh
        }
      } catch (error) {
        console.error('Error fetching average spot price:', error);
        // Use a fallback price if API fails (around 80 øre/kWh as a reasonable estimate)
        setAverageSpotPrice(80);
      } finally {
        setSpotPriceLoading(false);
      }
    };

    fetchAverageSpotPrice();
  }, []);

  // Scroll detection for sticky banner and section tracking
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Only show banner if not closed and scrolled down past 300px
      if (!bannerClosed && currentScrollY > 300) {
        // Show when scrolling down, hide when scrolling up
        if (currentScrollY > lastScrollY) {
          setShowStickyBanner(true);
        } else {
          setShowStickyBanner(false);
        }
      } else {
        setShowStickyBanner(false);
      }

      // Track active section based on scroll position
      const sections = ['overview', 'similar-products', 'seo-content', 'faq'];
      const sectionElements = sections.map(id => document.getElementById(id)).filter(Boolean);
      
      let currentSection = 'overview';
      for (const element of sectionElements) {
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100) {
            currentSection = element.id;
          }
        }
      }
      
      setActiveSection(currentSection);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, bannerClosed]);
  
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
  
  // Generate structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "name": product.name,
        "description": `${product.name} er en ${product.productType === 'hourly_spot' ? 'spotpris' : product.productType === 'fixed' ? 'fastpris' : product.productType}avtale fra ${product.provider.name}. Månedsgebyr: ${product.monthlyFee} kr, Påslag: ${(product.addonPrice * 100).toFixed(2)} øre/kWh.`,
        "brand": {
          "@type": "Organization",
          "name": product.provider.name,
          "identifier": product.provider.organizationNumber
        },
        "offers": {
          "@type": "Offer",
          "price": calculateTotalCost(16000).toFixed(2),
          "priceCurrency": "NOK",
          "priceSpecification": {
            "@type": "PriceSpecification",
            "price": calculateTotalCost(16000).toFixed(2),
            "priceCurrency": "NOK",
            "validFrom": product.publishedAt || new Date().toISOString(),
            "unitText": "per year for 16000 kWh"
          },
          "availability": "https://schema.org/InStock",
          "validFrom": product.publishedAt || new Date().toISOString(),
          "seller": {
            "@type": "Organization",
            "name": product.provider.name
          }
        },
        "category": "Electricity Contract",
        "audience": {
          "@type": "Audience",
          "geographicArea": "Norway"
        }
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": `Hva koster ${product.name} i måneden?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `For en norsk familie med 16.000 kWh årlig forbruk koster ${product.name} ca. ${(calculateTotalCost(16000) / 12).toFixed(0)} kr per måned. Dette inkluderer månedsgebyr på ${product.monthlyFee} kr og påslag på ${(product.addonPrice * 100).toFixed(2)} øre/kWh.`
            }
          },
          {
            "@type": "Question", 
            "name": `Hvor lang bindingstid har ${product.name}?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": product.agreementTime > 0 
                ? `${product.name} har ${product.agreementTime} ${product.agreementTimeUnit === 'year' ? 'år' : product.agreementTimeUnit === 'month' ? 'måneder' : product.agreementTimeUnit} bindingstid.`
                : `${product.name} har ingen bindingstid, noe som gir deg full fleksibilitet til å bytte leverandør når du ønsker det.`
            }
          },
          {
            "@type": "Question",
            "name": `Er ${product.name} den billigste strømavtalen i Norge?`,
            "acceptedAnswer": {
              "@type": "Answer", 
              "text": (() => {
                const productCost = calculateTotalCost(16000);
                const averageCost = 1052;
                const difference = productCost - averageCost;
                if (difference < 0) {
                  return `Ja, ${product.name} er ${Math.abs(difference).toFixed(0)} kr billigere per år enn gjennomsnittlig strømavtale i Norge.`;
                } else {
                  return `${product.name} koster ${difference.toFixed(0)} kr mer per år enn gjennomsnittlig strømavtale i Norge.`;
                }
              })()
            }
          }
        ]
      },
      {
        "@type": "Organization",
        "name": product.provider.name,
        "identifier": product.provider.organizationNumber,
        "url": product.provider.pricelistUrl || undefined,
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "customer service",
          "areaServed": "NO"
        }
      }
    ]
  };

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      {/* Breadcrumbs - Hidden on mobile */}
      <nav className="hidden md:block bg-gray-100 py-3">
        <div className="container mx-auto px-4">
          <div className="max-w-[1000px] mx-auto">
            <div className="flex items-center space-x-2 text-sm">
              <Link href="/" className="text-gray-600 hover:text-blue-600 transition-colors">
                Hjem
              </Link>
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
              </svg>
              <Link href="/stromavtaler" className="text-gray-600 hover:text-blue-600 transition-colors">
                Strømavtaler
              </Link>
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
              </svg>
              <Link href={`/stromleverandorer/${product.provider.name.toLowerCase().replace(/\s+/g, '-')}`} className="text-gray-600 hover:text-blue-600 transition-colors">
                {product.provider.name}
              </Link>
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
              </svg>
              <span className="text-gray-900 font-medium truncate">
                {product.name}
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-blue-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-[1000px] mx-auto">
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

      {/* Sticky Navigation Tabs - Desktop Only */}
      <div className="hidden lg:block sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="max-w-[1000px] mx-auto">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', label: 'Oversikt', icon: HiOutlineChartBarSquare },
                { id: 'similar-products', label: 'Lignende produkter', icon: HiOutlineMagnifyingGlass },
                { id: 'seo-content', label: 'Kostnadsanalyse', icon: HiOutlineCurrencyDollar },
                { id: 'faq', label: 'Spørsmål & svar', icon: HiOutlineQuestionMarkCircle }
              ].map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeSection === section.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <section.icon className="w-5 h-5" />
                  {section.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>
      
      {/* Product Overview Section */}
      <section id="overview" className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-[1000px] mx-auto">
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
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800">Detaljert produktinformasjon</h3>
                  <a
                    href="/tilbud"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    Få tilbud på strøm
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
                
                {/* Key Information Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-900">Månedsgebyr</h4>
                        <p className="text-2xl font-bold text-blue-800">{product.monthlyFee} kr</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-green-900">Bindingstid</h4>
                        <p className="text-lg font-bold text-green-800">
                          {product.agreementTime > 0 
                            ? `${product.agreementTime} ${product.agreementTimeUnit === 'year' ? 'år' : 
                               product.agreementTimeUnit === 'month' ? 'mnd' : 
                               product.agreementTimeUnit === 'day' ? 'dager' : product.agreementTimeUnit}`
                            : 'Ingen'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-purple-900">Produkttype</h4>
                        <div className="flex items-center gap-2">
                          <p className="text-lg font-bold text-purple-800">
                            {product.productType === 'hourly_spot' ? 'Spotpris' : 
                             product.productType === 'fixed' ? 'Fastpris' : 
                             product.productType === 'variable' ? 'Variabel' :
                             product.productType === 'plus' ? 'Plus-avtale' : product.productType}
                          </p>
                          {product.priceType && product.priceType !== product.productType && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full border border-purple-200 shadow-sm">
                              {product.priceType}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Product Details */}
                  <div className="bg-gray-50 rounded-xl p-5">
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                      </svg>
                      Produktdetaljer
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Produktnavn</p>
                        <p className="font-medium text-gray-800">{product.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Faktureringsfrekvens</p>
                        <p className="font-medium text-gray-800">
                          {product.billingFrequency && `${product.billingFrequency} ${
                            product.billingFrequencyUnit === 'month' ? 'måned' + (product.billingFrequency > 1 ? 'er' : '') : 
                            product.billingFrequencyUnit === 'year' ? 'år' : 
                            product.billingFrequencyUnit
                          }` || 'Ikke spesifisert'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Betalingstype</p>
                        <p className="font-medium text-gray-800">
                          {product.paymentType === 'after' ? 'Etterskudd' : 
                           product.paymentType === 'before' ? 'Forskudd' : 
                           product.paymentType || 'Ikke spesifisert'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Pricing Details */}
                  <div className="bg-gray-50 rounded-xl p-5">
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                      </svg>
                      Priser
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Påslag</p>
                        <p className="font-medium text-gray-800">{(product.addonPrice * 100).toFixed(2)} øre/kWh</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Elsertifikat</p>
                        <p className="font-medium text-gray-800">{(product.elCertificatePrice * 100).toFixed(2)} øre/kWh</p>
                      </div>
                      {product.fixedPrice && (
                        <div>
                          <p className="text-sm text-gray-600">Fastpris</p>
                          <p className="font-medium text-gray-800">{(product.fixedPrice * 100).toFixed(2)} øre/kWh</p>
                        </div>
                      )}
                      {product.purchaseAddonPrice && (
                        <div>
                          <p className="text-sm text-gray-600">Påslag ved salg tilbake</p>
                          <p className="font-medium text-gray-800">{(product.purchaseAddonPrice * 100).toFixed(2)} øre/kWh</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="bg-gray-50 rounded-xl p-5">
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
                      </svg>
                      Øvrig informasjon
                    </h4>
                    <div className="space-y-3">
                      {product.maxKwhPerYear && (
                        <div>
                          <p className="text-sm text-gray-600">Maks forbruk/år</p>
                          <p className="font-medium text-gray-800">{product.maxKwhPerYear.toLocaleString()} kWh</p>
                        </div>
                      )}
                      {product.feePostalLetter && product.feePostalLetter > 0 && product.feePostalLetterApplied && (
                        <div>
                          <p className="text-sm text-gray-600">Gebyr papirfaktura</p>
                          <p className="font-medium text-gray-800">{product.feePostalLetter} kr</p>
                        </div>
                      )}
                      {product.feeContractBreach && product.feeContractBreach > 0 && (
                        <div>
                          <p className="text-sm text-gray-600">Gebyr kontraktsbrudd</p>
                          <p className="font-medium text-gray-800">{product.feeContractBreach} kr</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-600">Hytteprodukt</p>
                        <p className="font-medium text-gray-800">{product.cabinProduct ? 'Ja' : 'Nei'}</p>
                      </div>
                      {product.standardAlert && (
                        <div>
                          <p className="text-sm text-gray-600">Varsling</p>
                          <p className="font-medium text-gray-800">
                            {product.standardAlert === 'email' ? 'E-post' : 
                             product.standardAlert === 'sms' ? 'SMS' : 
                             product.standardAlert === 'postal letter' ? 'Post' :
                             product.standardAlert === 'website' ? 'Nettside' :
                             product.standardAlert === 'phone' ? 'Telefon' : product.standardAlert}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Price Guarantee Section */}
                {product.addonPriceMinimumFixedFor && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="text-sm font-medium text-green-800 mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Prisgaranti
                    </h4>
                    <p className="text-sm text-green-700">
                      Prisene er garantert i minimum {product.addonPriceMinimumFixedFor} {
                        product.addonPriceMinimumFixedForUnit === 'year' ? 'år' : 
                        product.addonPriceMinimumFixedForUnit === 'month' ? 'måneder' : 
                        product.addonPriceMinimumFixedForUnit === 'day' ? 'dager' : product.addonPriceMinimumFixedForUnit
                      }
                      {product.addonPriceMinimumFixedForConfirmed ? ' (bekreftet)' : ' (under vurdering)'}
                    </p>
                  </div>
                )}
                
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

                  {/* Timestamps */}
                  {(product.publishedAt || product.priceChangedAt) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500 mt-4 pt-4 border-t border-gray-200">
                      {product.publishedAt && (
                        <div>
                          <span className="font-medium">Publisert:</span> {new Date(product.publishedAt).toLocaleDateString('no-NO')}
                        </div>
                      )}
                      {product.priceChangedAt && (
                        <div>
                          <span className="font-medium">Sist prisendring:</span> {new Date(product.priceChangedAt).toLocaleDateString('no-NO')}
                        </div>
                      )}
                    </div>
                  )}
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
            
            {/* SEO Content Section - Cost Calculations */}
            <div id="seo-content" className="bg-white border border-gray-200 rounded-lg mb-8">
              <div className="px-6 py-8">
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    Hva vil {product.name} koste for en familie på 4?
                  </h2>
                  <p className="text-gray-600">
                    Detaljerte kostnadsberegninger basert på ulike forbruksmønstre og husholdningsstørrelser
                  </p>
                </div>
                
                {/* Cost Calculation Cards */}
                <div className="space-y-12">
                  
                  {/* Family Cost Overview */}
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <HiOutlineHome className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Forventet årskostnad for norsk familie
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Low Usage */}
                      <div className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium text-gray-900">Lavt forbruk</h4>
                          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">12.000 kWh/år</span>
                        </div>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between text-gray-600">
                            <span>Månedsgebyr</span>
                            <span>{(product.monthlyFee * 12).toLocaleString()} kr/år</span>
                          </div>
                          <div className="flex justify-between text-gray-600">
                            <span>Påslag</span>
                            <span>{(product.addonPrice * 12000).toFixed(0)} kr/år</span>
                          </div>
                          {product.elCertificatePrice > 0 && (
                            <div className="flex justify-between text-gray-600">
                              <span>Elsertifikat</span>
                              <span>{(product.elCertificatePrice * 12000).toFixed(0)} kr/år</span>
                            </div>
                          )}
                          {(product.productType === 'hourly_spot' || product.productType === 'plus') && averageSpotPrice > 0 && (
                            <div className="flex justify-between text-gray-600">
                              <span>Strømpris (snitt)</span>
                              <span>{((averageSpotPrice / 100) * 12000).toFixed(0)} kr/år</span>
                            </div>
                          )}
                          <div className="border-t border-gray-200 pt-3 flex justify-between font-semibold text-gray-900">
                            <span>Total årskostnad</span>
                            <span>{calculateTotalCost(12000).toFixed(0)} kr</span>
                          </div>
                          <div className="text-gray-500 text-xs">
                            {(calculateTotalCost(12000) / 12).toFixed(0)} kr per måned
                          </div>
                        </div>
                      </div>
                      
                      {/* Average Usage */}
                      <div className="border-2 border-blue-200 bg-blue-50 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium text-gray-900">Normalforbruk</h4>
                          <span className="text-sm text-blue-700 bg-blue-100 px-2 py-1 rounded font-medium">16.000 kWh/år</span>
                        </div>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between text-gray-600">
                            <span>Månedsgebyr</span>
                            <span>{(product.monthlyFee * 12).toLocaleString()} kr/år</span>
                          </div>
                          <div className="flex justify-between text-gray-600">
                            <span>Påslag</span>
                            <span>{(product.addonPrice * 16000).toFixed(0)} kr/år</span>
                          </div>
                          {product.elCertificatePrice > 0 && (
                            <div className="flex justify-between text-gray-600">
                              <span>Elsertifikat</span>
                              <span>{(product.elCertificatePrice * 16000).toFixed(0)} kr/år</span>
                            </div>
                          )}
                          {(product.productType === 'hourly_spot' || product.productType === 'plus') && averageSpotPrice > 0 && (
                            <div className="flex justify-between text-gray-600">
                              <span>Strømpris (snitt)</span>
                              <span>{((averageSpotPrice / 100) * 16000).toFixed(0)} kr/år</span>
                            </div>
                          )}
                          <div className="border-t border-blue-200 pt-3 flex justify-between font-semibold text-gray-900">
                            <span>Total årskostnad</span>
                            <span>{calculateTotalCost(16000).toFixed(0)} kr</span>
                          </div>
                          <div className="text-gray-500 text-xs">
                            {(calculateTotalCost(16000) / 12).toFixed(0)} kr per måned
                          </div>
                        </div>
                      </div>
                      
                      {/* High Usage */}
                      <div className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium text-gray-900">Høyt forbruk</h4>
                          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">24.000 kWh/år</span>
                        </div>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between text-gray-600">
                            <span>Månedsgebyr</span>
                            <span>{(product.monthlyFee * 12).toLocaleString()} kr/år</span>
                          </div>
                          <div className="flex justify-between text-gray-600">
                            <span>Påslag</span>
                            <span>{(product.addonPrice * 24000).toFixed(0)} kr/år</span>
                          </div>
                          {product.elCertificatePrice > 0 && (
                            <div className="flex justify-between text-gray-600">
                              <span>Elsertifikat</span>
                              <span>{(product.elCertificatePrice * 24000).toFixed(0)} kr/år</span>
                            </div>
                          )}
                          {(product.productType === 'hourly_spot' || product.productType === 'plus') && averageSpotPrice > 0 && (
                            <div className="flex justify-between text-gray-600">
                              <span>Strømpris (snitt)</span>
                              <span>{((averageSpotPrice / 100) * 24000).toFixed(0)} kr/år</span>
                            </div>
                          )}
                          <div className="border-t border-gray-200 pt-3 flex justify-between font-semibold text-gray-900">
                            <span>Total årskostnad</span>
                            <span>{calculateTotalCost(24000).toFixed(0)} kr</span>
                          </div>
                          <div className="text-gray-500 text-xs">
                            {(calculateTotalCost(24000) / 12).toFixed(0)} kr per måned
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Merknad:</span> En norsk familie på 4 bruker i gjennomsnitt 16.000 kWh per år. 
                        Kostnadene ovenfor inkluderer kun leverandørens gebyrer - i tillegg kommer nettleie og offentlige avgifter.
                      </p>
                    </div>
                  </div>

                  {/* Seasonal Variations */}
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <HiOutlineSun className="w-5 h-5 text-orange-600" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Sesongvariasjoner - Sommer vs Vinter kostnader
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="border border-gray-200 rounded-lg p-6">
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <HiOutlineSun className="w-5 h-5 text-orange-500" />
                            <h4 className="font-medium text-gray-900">Sommermåneder</h4>
                          </div>
                          <p className="text-sm text-gray-500">Mai - September</p>
                        </div>
                        <div className="space-y-4">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-gray-600">Gjennomsnittlig forbruk</span>
                              <span className="text-sm font-medium text-gray-900">800 kWh/mnd</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-900">Månedskostnad</span>
                              <span className="text-lg font-semibold text-gray-900">
                                {(calculateTotalCost(800) / 12).toFixed(0)} kr
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">
                            På sommeren bruker familier mindre strøm til oppvarming, og forbruket går hovedsakelig til varmtvann og husholdningsapparater.
                          </p>
                        </div>
                      </div>
                      
                      <div className="border border-gray-200 rounded-lg p-6">
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <HiOutlineCloud className="w-5 h-5 text-blue-500" />
                            <h4 className="font-medium text-gray-900">Vintermåneder</h4>
                          </div>
                          <p className="text-sm text-gray-500">November - Mars</p>
                        </div>
                        <div className="space-y-4">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-gray-600">Gjennomsnittlig forbruk</span>
                              <span className="text-sm font-medium text-gray-900">2.000 kWh/mnd</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-900">Månedskostnad</span>
                              <span className="text-lg font-semibold text-gray-900">
                                {(calculateTotalCost(2000) / 12).toFixed(0)} kr
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">
                            Vintermånedene krever mye mer strøm til oppvarming, spesielt i desember og januar når temperaturene er lavest.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Regional Differences */}
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <HiOutlineMapPin className="w-5 h-5 text-green-600" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Regionforskjeller - Strømkostnader rundt i Norge
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="border border-gray-200 rounded-lg p-6">
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900">Sørlandet/Vestlandet</h4>
                          <p className="text-sm text-gray-500">Mildere klima, lavere forbruk</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">Årlig forbruk</span>
                            <span className="text-sm font-medium text-gray-900">14.000 kWh</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-900">Årskostnad</span>
                            <span className="text-lg font-semibold text-gray-900">
                              {calculateTotalCost(14000).toFixed(0)} kr
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border border-gray-200 rounded-lg p-6">
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900">Østlandet</h4>
                          <p className="text-sm text-gray-500">Gjennomsnittlig forbruk</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">Årlig forbruk</span>
                            <span className="text-sm font-medium text-gray-900">16.000 kWh</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-900">Årskostnad</span>
                            <span className="text-lg font-semibold text-gray-900">
                              {calculateTotalCost(16000).toFixed(0)} kr
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border border-gray-200 rounded-lg p-6">
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900">Nord-Norge</h4>
                          <p className="text-sm text-gray-500">Kaldt klima, høyere forbruk</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">Årlig forbruk</span>
                            <span className="text-sm font-medium text-gray-900">22.000 kWh</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-900">Årskostnad</span>
                            <span className="text-lg font-semibold text-gray-900">
                              {calculateTotalCost(22000).toFixed(0)} kr
                            </span>
                          </div>
                        </div>
                        {product.elCertificatePrice > 0 && (
                          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-xs text-blue-800">
                              Redusert elsertifikat i Finnmark og Nord-Troms
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Household Size Comparison */}
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <HiOutlineUsers className="w-5 h-5 text-purple-600" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Kostnad etter husholdningsstørrelse
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { size: '1 person', consumption: 8000, icon: HiOutlineUser, color: 'blue' },
                        { size: '2 personer', consumption: 12000, icon: HiOutlineUsers, color: 'green' },
                        { size: '3-4 personer', consumption: 16000, icon: HiOutlineUsers, color: 'orange' },
                        { size: '5+ personer', consumption: 22000, icon: HiOutlineUsers, color: 'purple' }
                      ].map((household, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-5 h-full flex flex-col">
                          <div className="mb-4 flex-shrink-0">
                            <div className="flex flex-col items-center mb-3">
                              <div className={`w-12 h-12 bg-${household.color}-100 rounded-full flex items-center justify-center mb-2`}>
                                <household.icon className={`w-6 h-6 text-${household.color}-600`} />
                              </div>
                              <h4 className="font-medium text-gray-900 text-center">{household.size}</h4>
                            </div>
                            <p className="text-sm text-gray-500 text-center">{household.consumption.toLocaleString()} kWh/år</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4 flex-1 flex flex-col justify-center">
                            <div className="text-center mb-3">
                              <div className="text-2xl font-bold text-gray-900 mb-1">
                                {calculateTotalCost(household.consumption).toFixed(0)}
                              </div>
                              <div className="text-sm text-gray-600 font-medium">kr/år</div>
                            </div>
                            <div className="text-center pt-3 border-t border-gray-200">
                              <div className="text-sm text-gray-600">Per måned</div>
                              <div className="text-lg font-semibold text-gray-900">
                                {(calculateTotalCost(household.consumption) / 12).toFixed(0)} kr
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Heating Source Impact */}
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                        <HiOutlineFire className="w-5 h-5 text-red-600" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Påvirkning av oppvarmingskilde
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="border border-gray-200 rounded-lg p-6">
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                              <HiOutlineFire className="w-4 h-4 text-green-600" />
                            </div>
                            <h4 className="font-medium text-gray-900">Varmepumpe + Elektrisk</h4>
                          </div>
                          <p className="text-sm text-gray-500">Energieffektiv løsning</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">Årlig forbruk</span>
                            <span className="text-sm font-medium text-gray-900">12.000 kWh</span>
                          </div>
                          <div className="flex justify-between items-center mb-3">
                            <span className="font-medium text-gray-900">Årskostnad</span>
                            <span className="text-lg font-semibold text-gray-900">
                              {calculateTotalCost(12000).toFixed(0)} kr
                            </span>
                          </div>
                          <div className="pt-2 border-t border-gray-200">
                            <p className="text-xs text-green-600">
                              Spart: ~{(calculateTotalCost(16000) - calculateTotalCost(12000)).toFixed(0)} kr/år
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border border-gray-200 rounded-lg p-6">
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <HiOutlineBolt className="w-4 h-4 text-blue-600" />
                            </div>
                            <h4 className="font-medium text-gray-900">Kun elektrisk oppvarming</h4>
                          </div>
                          <p className="text-sm text-gray-500">Standard løsning</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">Årlig forbruk</span>
                            <span className="text-sm font-medium text-gray-900">16.000 kWh</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-900">Årskostnad</span>
                            <span className="text-lg font-semibold text-gray-900">
                              {calculateTotalCost(16000).toFixed(0)} kr
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border border-gray-200 rounded-lg p-6">
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                              <HiOutlineFire className="w-4 h-4 text-orange-600" />
                            </div>
                            <h4 className="font-medium text-gray-900">Elektrisk gulvvarme</h4>
                          </div>
                          <p className="text-sm text-gray-500">Høyt forbruk</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">Årlig forbruk</span>
                            <span className="text-sm font-medium text-gray-900">22.000 kWh</span>
                          </div>
                          <div className="flex justify-between items-center mb-3">
                            <span className="font-medium text-gray-900">Årskostnad</span>
                            <span className="text-lg font-semibold text-gray-900">
                              {calculateTotalCost(22000).toFixed(0)} kr
                            </span>
                          </div>
                          <div className="pt-2 border-t border-gray-200">
                            <p className="text-xs text-red-600">
                              Ekstra: +{(calculateTotalCost(22000) - calculateTotalCost(16000)).toFixed(0)} kr/år
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Comparison with Norwegian Average */}
                  <div className="border-2 border-gray-200 rounded-lg p-6 bg-gray-50">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <HiOutlineChartBarSquare className="w-5 h-5 text-indigo-600" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Sammenligning med norsk gjennomsnitt
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white border border-gray-200 rounded-lg p-5">
                        <h4 className="font-medium text-gray-900 mb-4">{product.name}</h4>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Månedsgebyr</span>
                            <span className="font-medium text-gray-900">{product.monthlyFee} kr</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Påslag</span>
                            <span className="font-medium text-gray-900">{(product.addonPrice * 100).toFixed(2)} øre/kWh</span>
                          </div>
                          <div className="flex justify-between border-t border-gray-200 pt-3">
                            <span className="font-semibold text-gray-900">Årskostnad (16.000 kWh)</span>
                            <span className="font-semibold text-gray-900">
                              {calculateTotalCost(16000).toFixed(0)} kr
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white border border-gray-200 rounded-lg p-5">
                        <h4 className="font-medium text-gray-900 mb-4">Norsk gjennomsnitt 2024</h4>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Månedsgebyr</span>
                            <span className="font-medium text-gray-900">45 kr</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Påslag</span>
                            <span className="font-medium text-gray-900">3.20 øre/kWh</span>
                          </div>
                          <div className="flex justify-between border-t border-gray-200 pt-3">
                            <span className="font-semibold text-gray-900">Årskostnad (16.000 kWh)</span>
                            <span className="font-semibold text-gray-900">1052 kr</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-4 bg-white border border-gray-200 rounded-lg">  
                      <div className="flex items-center gap-2 mb-3">
                        <HiOutlineScale className="w-5 h-5 text-gray-600" />
                        <h4 className="font-medium text-gray-900">Kostnadsanalyse</h4>
                      </div>
                      {(() => {
                        const productCost = calculateTotalCost(16000);
                        const averageCost = 1052;
                        const difference = productCost - averageCost;
                        return (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Forskjell fra gjennomsnitt</span>
                            <span className={`font-semibold ${difference < 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {difference < 0 ? '-' : '+'}
                              {Math.abs(difference).toFixed(0)} kr per år
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* FAQ Accordion for SEO */}
            <div id="faq" className="bg-white border border-gray-200 rounded-lg mb-8">
              <div className="px-6 py-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Ofte stilte spørsmål om {product.name}
                  </h2>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      question: `Hva koster ${product.name} i måneden?`,
                      answer: (
                        <p className="text-gray-600 leading-relaxed">
                          For en norsk familie med 16.000 kWh årlig forbruk koster {product.name} ca. {(calculateTotalCost(16000) / 12).toFixed(0)} kr per måned. 
                          Dette inkluderer månedsgebyr på {product.monthlyFee} kr, påslag på {(product.addonPrice * 100).toFixed(2)} øre/kWh
                          {(product.productType === 'hourly_spot' || product.productType === 'plus') && averageSpotPrice > 0 && 
                            `, pluss gjennomsnittlig strømpris på ${(averageSpotPrice / 100).toFixed(2)} kr/kWh`
                          }.
                        </p>
                      )
                    },
                    {
                      question: `Er ${product.name} den billigste strømavtalen i Norge?`,
                      answer: (
                        <p className="text-gray-600 leading-relaxed">
                          {(() => {
                            const productCost = calculateTotalCost(16000);
                            const averageCost = 1052;
                            const difference = productCost - averageCost;
                            if (difference < 0) {
                              return `Ja, ${product.name} er ${Math.abs(difference).toFixed(0)} kr billigere per år enn gjennomsnittlig strømavtale i Norge. Dette gjør den til et svært konkurransedyktig alternativ for norske husholdninger.`;
                            } else {
                              return `${product.name} koster ${difference.toFixed(0)} kr mer per år enn gjennomsnittlig strømavtale i Norge, men tilbyr spesielle fordeler som kan gjøre den lønnsom for visse forbruksmønstre.`;
                            }
                          })()}
                        </p>
                      )
                    },
                    {
                      question: `Hvor lang bindingstid har ${product.name}?`,
                      answer: (
                        <p className="text-gray-600 leading-relaxed">
                          {product.agreementTime > 0 
                            ? `${product.name} har ${product.agreementTime} ${
                                product.agreementTimeUnit === 'year' ? 'år' : 
                                product.agreementTimeUnit === 'month' ? 'måneder' : 
                                product.agreementTimeUnit
                              } bindingstid. Dette betyr at du er forpliktet til å ha avtalen i denne perioden.`
                            : `${product.name} har ingen bindingstid, noe som gir deg full fleksibilitet til å bytte leverandør når du ønsker det.`
                          }
                        </p>
                      )
                    },
                    {
                      question: `Hvilken type strømavtale er ${product.name}?`,
                      answer: (
                        <p className="text-gray-600 leading-relaxed">
                          {product.name} er en {
                            product.productType === 'hourly_spot' ? 'spotprisavtale som følger strømprisen time for time. Dette betyr at du betaler markedspris for strøm pluss leverandørens påslag.' :
                            product.productType === 'fixed' ? 'fastprisavtale med fast pris per kWh uavhengig av svingninger i strømmarkedet.' :
                            product.productType === 'variable' ? 'variabel prisavtale hvor prisen kan endres av leverandøren.' :
                            product.productType === 'plus' ? 'plussavtale som kombinerer spotpris med ekstra tjenester og fordeler.' :
                            'strømavtale'
                          } Månedsgebyret er {product.monthlyFee} kr og påslaget er {(product.addonPrice * 100).toFixed(2)} øre/kWh.
                        </p>
                      )
                    },
                    {
                      question: `Hvordan kan jeg spare penger på strømregningen med ${product.name}?`,
                      answer: (
                        <div className="text-gray-600 leading-relaxed space-y-2">
                          <p>Det finnes flere måter å spare penger med {product.name}:</p>
                          <ul className="list-disc pl-6 space-y-1">
                            <li>Reduser forbruket ditt - hver kWh mindre sparer deg {(product.addonPrice * 100).toFixed(2)} øre pluss strømprisen</li>
                            <li>Installer varmepumpe - kan redusere oppvarmingskostnadene med opptil 70%</li>
                            {(product.productType === 'hourly_spot' || product.productType === 'plus') && (
                              <li>Flytt strømforbruk til lavpristimer - spotprisen varierer gjennom døgnet</li>
                            )}
                            <li>Isoler boligen bedre for å redusere oppvarmingsbehovet</li>
                            <li>Bruk energieffektive apparater og LED-belysning</li>
                          </ul>
                        </div>
                      )
                    },
                    {
                      question: `Hvem leverer ${product.name} og er de en pålitelig strømleverandør?`,
                      answer: (
                        <p className="text-gray-600 leading-relaxed">
                          {product.name} leveres av {product.provider.name} (org.nr: {product.provider.organizationNumber}), 
                          som er en registrert strømleverandør i Norge. Alle data på denne siden er hentet fra Forbrukerrådets 
                          offisielle strømpriser.no database, som sikrer nøyaktig og oppdatert prisinformasjon.
                        </p>
                      )
                    },
                    {
                      question: `Kan jeg bruke ${product.name} i hele Norge?`,
                      answer: (
                        <p className="text-gray-600 leading-relaxed">
                          Ja, {product.name} kan brukes i hele Norge. Strømavtalen gjelder uavhengig av hvor du bor, 
                          men husk at nettleie og offentlige avgifter varierer mellom ulike nettselskaper og regioner. 
                          I Nord-Norge (Finnmark og Nord-Troms) får du redusert elsertifikatavgift.
                        </p>
                      )
                    },
                    {
                      question: `Hvordan bytter jeg til ${product.name}?`,
                      answer: (
                        <p className="text-gray-600 leading-relaxed">
                          Det er enkelt å bytte til {product.name}. Du kan 
                          {product.orderUrl ? (
                            <>
                              <a href={product.orderUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                                bestille direkte hos leverandøren
                              </a>
                              {' '}eller{' '}
                            </>
                          ) : ''}
                          <a href="/tilbud" className="text-blue-600 hover:text-blue-800 underline">
                            få sammenligning av flere tilbud her
                          </a>. 
                          Leverandørbytte håndteres automatisk og tar vanligvis 2-3 uker. Du trenger ikke å si opp din 
                          nåværende avtale - den nye leverandøren ordner dette for deg.
                        </p>
                      )
                    },
                    {
                      question: `Når er beste tid å bytte til ${product.name}?`,
                      answer: (
                        <p className="text-gray-600 leading-relaxed">
                          Den beste tiden å bytte til {product.name} er når din nåværende avtale utløper, 
                          {(product.productType === 'hourly_spot' || product.productType === 'plus') 
                            ? ' spesielt hvis du ønsker å dra nytte av lave spotpriser. Spotprisavtaler er ofte mest fordelaktige når strømprisene er stabile eller fallende.'
                            : ' eller når du finner en bedre pris enn det du betaler i dag.'
                          } Sjekk bindingstiden på din nåværende avtale for å unngå eventuelle bruddgebyrer.
                        </p>
                      )
                    }
                  ].map((faq, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleFaqItem(index)}
                        className="w-full px-6 py-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors duration-200 flex items-center justify-between group"
                      >
                        <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                          {faq.question}
                        </h3>
                        <div className={`flex-shrink-0 ml-4 transform transition-transform duration-200 ${
                          openFaqItems.has(index) ? 'rotate-180' : 'rotate-0'
                        }`}>
                          <svg className="w-5 h-5 text-gray-500 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>
                      <div className={`transition-all duration-300 ease-in-out ${
                        openFaqItems.has(index) 
                          ? 'max-h-[500px] opacity-100' 
                          : 'max-h-0 opacity-0 overflow-hidden'
                      }`}>
                        <div className="px-6 py-4 bg-white border-t border-gray-200">
                          {faq.answer}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Trust Signals - Compact */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg mb-8">
              <div className="px-4 py-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-700 mb-2">
                      <span className="font-medium text-gray-900">Datakilder:</span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">Forbrukerrådet</span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">Offisielle spotpriser</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-xs text-gray-600">
                        Oppdatert: {new Date().toLocaleDateString('no-NO', { 
                          day: 'numeric', 
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      <span className="inline-flex items-center gap-1">
                        <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                        </svg>
                        <strong>Viktig:</strong>
                      </span>
                      {' '}Prisene inkluderer ikke nettleie, avgifter eller mva. Kontakt leverandøren for endelige vilkår.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Call to Action Card */}
            <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-2xl shadow-xl overflow-hidden mb-8">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <svg className="w-full h-full" fill="currentColor" viewBox="0 0 100 100">
                  <circle cx="20" cy="20" r="2"/>
                  <circle cx="80" cy="20" r="2"/>
                  <circle cx="20" cy="80" r="2"/>
                  <circle cx="80" cy="80" r="2"/>
                  <circle cx="50" cy="50" r="3"/>
                </svg>
              </div>
              
              <div className="relative p-8">
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-4">
                    <HiOutlineSparkles className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Få tilbud på strøm</h3>
                  <p className="text-blue-100 text-lg">Sammenlign priser og spar penger på strømregningen</p>
                </div>

                {/* Benefits Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="flex items-center p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                      <HiOutlineBuildingOffice2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Flere leverandører</p>
                      <p className="text-blue-100 text-sm">Sammenlign alle tilbud</p>
                    </div>
                  </div>

                  <div className="flex items-center p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                      <HiOutlineCurrencyDollar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Spar penger</p>
                      <p className="text-blue-100 text-sm">Lavere strømregning</p>
                    </div>
                  </div>

                  <div className="flex items-center p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                      <HiOutlineGift className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">100% gratis</p>
                      <p className="text-blue-100 text-sm">Ingen forpliktelser</p>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="text-center">
                  <a
                    href="/tilbud"
                    className="inline-flex items-center px-8 py-4 bg-white text-blue-700 font-bold text-lg rounded-xl hover:bg-blue-50 hover:scale-105 transform transition-all duration-200 shadow-lg"
                  >
                    <HiOutlineSparkles className="w-6 h-6 mr-3" />
                    Få gratis tilbud nå
                    <HiOutlineArrowRight className="w-5 h-5 ml-2" />
                  </a>
                </div>

                {/* Trust indicator */}
                <div className="text-center mt-4">
                  <p className="text-blue-200 text-sm">✓ Trygt og sikkert • ✓ Tar kun 2 minutter • ✓ Ingen binding</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Similar Products Section */}
      {otherProviderProducts.length > 0 && (
        <section id="similar-products" className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-[1000px] mx-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Andre strømavtaler fra {product.provider.name}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherProviderProducts.map((similarProduct: Product) => {
                  // Calculate monthly cost for 16,000 kWh/year (1,333 kWh/month)
                  const monthlyKwh = 16000 / 12;
                  
                  // For spot price products, include the average spot price in calculation
                  let monthlyCost = 0;
                  
                  // Check if this is any type of spot-based product
                  const isSpotProduct = similarProduct.productType === 'hourly_spot' || similarProduct.productType === 'plus';
                  
                  if (isSpotProduct) {
                    // Don't calculate until we have the spot price
                    if (!spotPriceLoading && averageSpotPrice > 0) {
                      const totalElectricityPricePerKwh = (averageSpotPrice / 100) + (similarProduct.addonPrice || 0) + ((similarProduct.elCertificatePrice || 0) / 100);
                      monthlyCost = similarProduct.monthlyFee + (monthlyKwh * totalElectricityPricePerKwh);
                    }
                  } else {
                    // For fixed/variable products, calculate normally
                    monthlyCost = similarProduct.monthlyFee + (monthlyKwh * ((similarProduct.addonPrice || 0) + ((similarProduct.elCertificatePrice || 0) / 100)));
                  }
                  
                  return (
                    <div key={similarProduct.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                      <div className="p-6">
                        {/* Product Title */}
                        <div className="mb-4 text-center">
                          <h3 className="font-normal text-base text-gray-800 truncate">{similarProduct.name}</h3>
                          <div className="mt-1">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {similarProduct.productType === 'hourly_spot' ? 'Spotpris' : 
                               similarProduct.productType === 'fixed' ? 'Fastpris' : 
                               similarProduct.productType === 'variable' ? 'Variabel pris' : similarProduct.productType}
                            </span>
                          </div>
                        </div>
                        
                        {/* Monthly Cost Estimate */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                          <div className="text-center">
                            <div className="text-sm text-gray-600 mb-1">Estimert månedskostnad*</div>
                            {(isSpotProduct && spotPriceLoading) ? (
                              <div className="text-2xl font-bold text-green-700">Beregner...</div>
                            ) : (isSpotProduct && monthlyCost === 0) ? (
                              <div className="text-2xl font-bold text-yellow-600">Venter på spotpris</div>
                            ) : (
                              <div className="text-2xl font-bold text-green-700">{Math.round(monthlyCost)} kr/mnd</div>
                            )}
                            <div className="text-xs text-gray-500">
                              *Basert på 16.000 kWh/år
                              {isSpotProduct && !spotPriceLoading && averageSpotPrice > 0 && (
                                <span> (spotpris {averageSpotPrice.toFixed(1)} øre + påslag {(similarProduct.addonPrice * 100).toFixed(1)} øre)</span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Quick Details */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="text-center bg-gray-50 rounded-lg p-2">
                            <div className="text-xs text-gray-600">Månedsgebyr</div>
                            <div className="font-semibold text-gray-800">{similarProduct.monthlyFee} kr</div>
                          </div>
                          <div className="text-center bg-gray-50 rounded-lg p-2">
                            <div className="text-xs text-gray-600">Påslag</div>
                            <div className="font-semibold text-gray-800">{(similarProduct.addonPrice * 100).toFixed(2)} øre/kWh</div>
                          </div>
                        </div>
                        
                        {/* Dropdown for more details */}
                        <details className="mb-4">
                          <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center py-2 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
                            <span>Vis flere detaljer</span>
                            <svg className="ml-2 w-4 h-4 transition-transform" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </summary>
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-2 text-sm">
                            {isSpotProduct && !spotPriceLoading && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Snitt spotpris (10 dager):</span>
                                <span className="font-medium">{averageSpotPrice.toFixed(2)} øre/kWh</span>
                              </div>
                            )}
                            {similarProduct.elCertificatePrice && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Elsertifikat:</span>
                                <span className="font-medium">{(similarProduct.elCertificatePrice * 100).toFixed(2)} øre/kWh</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-gray-600">Bindingstid:</span>
                              <span className="font-medium">
                                {(similarProduct.agreementTime && similarProduct.agreementTime > 0)
                                  ? `${similarProduct.agreementTime} ${similarProduct.agreementTimeUnit === 'year' ? 'år' : 
                                     similarProduct.agreementTimeUnit === 'month' ? 'måneder' : 
                                     similarProduct.agreementTimeUnit === 'day' ? 'dager' : similarProduct.agreementTimeUnit}`
                                  : 'Ingen bindingstid'}
                              </span>
                            </div>
                            {similarProduct.billingFrequency && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Fakturering:</span>
                                <span className="font-medium">
                                  {`${similarProduct.billingFrequency} ${similarProduct.billingFrequencyUnit === 'month' ? 'måneder' : 'år'}`}
                                </span>
                              </div>
                            )}
                            {similarProduct.fixedPrice && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Fastpris:</span>
                                <span className="font-medium">{(similarProduct.fixedPrice * 100).toFixed(2)} øre/kWh</span>
                              </div>
                            )}
                            {similarProduct.purchaseAddonPrice && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Påslag ved salg:</span>
                                <span className="font-medium">{(similarProduct.purchaseAddonPrice * 100).toFixed(2)} øre/kWh</span>
                              </div>
                            )}
                            {similarProduct.maxKwhPerYear && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Maks forbruk/år:</span>
                                <span className="font-medium">{similarProduct.maxKwhPerYear.toLocaleString()} kWh</span>
                              </div>
                            )}
                            {similarProduct.feeContractBreach && similarProduct.feeContractBreach > 0 && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Gebyr brudd:</span>
                                <span className="font-medium">{similarProduct.feeContractBreach} kr</span>
                              </div>
                            )}
                            {similarProduct.addonPriceMinimumFixedFor && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Prisgaranti:</span>
                                <span className="font-medium">
                                  {similarProduct.addonPriceMinimumFixedFor} {
                                    similarProduct.addonPriceMinimumFixedForUnit === 'year' ? 'år' : 
                                    similarProduct.addonPriceMinimumFixedForUnit === 'month' ? 'mnd' : 
                                    similarProduct.addonPriceMinimumFixedForUnit === 'day' ? 'dager' : similarProduct.addonPriceMinimumFixedForUnit
                                  }
                                </span>
                              </div>
                            )}
                          </div>
                        </details>
                        
                        {/* Action Buttons */}
                        <div className="space-y-2">
                          <Link 
                            href={`/stromavtaler/${generateSlug(similarProduct)}`}
                            className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-md transition duration-150 ease-in-out"
                          >
                            Se detaljer
                          </Link>
                          <a
                            href="/tilbud"
                            className="block w-full text-center bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out text-sm"
                          >
                            Få tilbud på strøm
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Sticky Bottom Banner */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out md:hidden ${
        showStickyBanner && !bannerClosed 
          ? 'transform translate-y-0 opacity-100' 
          : 'transform translate-y-full opacity-0 pointer-events-none'
      }`}>
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-sm">Få opptil 3 tilbud på strøm!</p>
                <p className="text-xs text-blue-100">Sammenlign og spar penger</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link 
                href="/tilbud"
                className="bg-white text-blue-600 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-blue-50 transition-colors"
              >
                Se tilbud
              </Link>
              <button
                onClick={() => setBannerClosed(true)}
                className="w-6 h-6 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 