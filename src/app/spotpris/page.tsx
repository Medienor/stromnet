'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  calculateEnhancedMonthlyCost, 
  getPriceBreakdown,
  MONTHLY_CONSUMPTION_DISTRIBUTION
} from '@/utils/electricityPrices';
import { fieldOptions } from '@/utils/electricityFields';
import providerLogoUrls from '../data/providerLogoUrls';
import MultiStepForm from '@/components/MultiStepForm';
import Top50ProductList from '@/components/Top50ProductList';

// Define interfaces at the top of your file, after the imports
interface Provider {
  id: string;
  name: string;
  logo?: string;
  website?: string;
}

interface Deal {
  id: string;
  name: string;
  providerId: string;
  productType: string;
  monthlyFee: number;
  markupPrice: number;
  elCertificatePrice?: number;
  agreementTime?: number;
  agreementTimeUnit?: string;
  cancellationFee?: number;
  feePostalLetter?: number;
  additionalFees?: number;
  description?: string;
  customerType?: string;
  [key: string]: any; // For any additional properties
}

interface PriceData {
  spotPrices: Record<string, number>;
  [key: string]: any;
}

export default function SpotprisPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedDeal, setExpandedDeal] = useState(null);
  const [annualConsumption, setAnnualConsumption] = useState(20000);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  
  // Format price to Norwegian format with 2 decimals
  const formatPrice = (price) => {
    return (price * 100).toFixed(2).replace('.', ',');
  };
  
  // Format monthly cost to Norwegian format
  const formatMonthlyCost = (cost) => {
    return Math.round(cost).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };
  
  // Format consumption to Norwegian format
  const formatConsumption = (consumption) => {
    return Math.round(consumption).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };
  
  // Get product type in Norwegian
  const getProductTypeNorwegian = (type) => {
    return fieldOptions.productType[type] || type;
  };
  
  // Get current date in Norwegian format
  const getCurrentDate = () => {
    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth();
    const year = now.getFullYear();
    
    const months = [
      'januar', 'februar', 'mars', 'april', 'mai', 'juni',
      'juli', 'august', 'september', 'oktober', 'november', 'desember'
    ];
    
    return `${day}. ${months[month]} ${year}`;
  };

  // Function to get the current month name in Norwegian
  const getCurrentMonthName = () => {
    const months = [
      'januar', 'februar', 'mars', 'april', 'mai', 'juni',
      'juli', 'august', 'september', 'oktober', 'november', 'desember'
    ];
    const currentMonth = new Date().getMonth(); // 0-indexed
    return months[currentMonth];
  };

  // Toggle deal expansion
  const toggleDealExpansion = (dealId) => {
    if (expandedDeal === dealId) {
      setExpandedDeal(null);
    } else {
      setExpandedDeal(dealId);
    }
  };

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Fetch all deals
        const dealsResponse = await fetch('/api/electricity-deals');
        const dealsResult = await dealsResponse.json();
        
        // Fetch price data
        const priceResponse = await fetch('/api/electricity-prices');
        const priceResult = await priceResponse.json();
        
        // Fetch providers
        const providersResponse = await fetch('/api/providers');
        const providersResult = await providersResponse.json();
        
        if (dealsResult.success && dealsResult.data && 
            priceResult.success && priceResult.data &&
            providersResult.success && providersResult.data) {
          setDeals(dealsResult.data);
          setPriceData(priceResult.data);
          setProviders(providersResult.data);
          setLoading(false);
        } else {
          throw new Error('Failed to fetch data');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Kunne ikke hente strømavtaler. Vennligst prøv igjen senere.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
          <div className="absolute inset-0 z-0">
            <Image 
              src="/bg-img.jpg"
              alt="Background"
              fill
              className="object-cover opacity-30"
              priority
            />
            <div className="absolute inset-0 bg-black opacity-50"></div>
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-5 gap-12 items-center">
                <div className="text-center md:text-left md:col-span-3">
                  <h1 className="text-4xl md:text-5xl font-bold mb-6">
                    Slik finner du beste og billigste spotpris
                  </h1>
                  <p className="text-xl mb-8">
                    Her viser vi deg Norges billigste spotprisavtale pr {getCurrentMonthName()} {new Date().getFullYear()}.
                  </p>
                  
                  <div className="flex flex-col md:flex-row gap-4 mb-8 justify-center md:justify-start">
                    <div className="flex items-center justify-center md:justify-start">
                      <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span className="text-white text-sm md:text-base">La strømselskap konkurrere</span>
                    </div>
                    <div className="flex items-center justify-center md:justify-start">
                      <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span className="text-white text-sm md:text-base">Sammenlign strømpriser</span>
                    </div>
                    <div className="flex items-center justify-center md:justify-start">
                      <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span className="text-white text-sm md:text-base">Spar penger og tid</span>
                    </div>
                  </div>
                  
                  <button 
                    className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold py-4 px-8 rounded-full text-lg shadow-lg transform transition hover:scale-105 md:hidden"
                    onClick={() => {
                      const formElement = document.getElementById('form-section');
                      formElement?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Få gratis tilbud nå
                  </button>
                </div>
                
                <div className="bg-white rounded-xl shadow-xl md:col-span-2">
                  <MultiStepForm />
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Introduction Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="prose prose-lg mx-auto">
                <p className="text-gray-600 mb-6">
                  Vi i strømnet har sammmenlignet alle spotprisavtaler i Norge. Nedenfor kan du se opplistingen av de billigste per {getCurrentDate()}.
                </p>
                
                <p className="text-gray-600 mb-6">
                  Videre vil vi alltid anbefale forbruker å hente tilbud på spotpris fra flere strømleverandører. Det viser seg nemlig at leverandørene tilbyr ekstra gode priser og vilkår i konkurranse med andre. Bruk gjerne vår tjeneste til å uforpliktende få tilbud fra flere strømleverandører. Kom i gang på 2 minutter ved å klikke på lenken i toppen av denne artikkelen.
                </p>
              </div>
              
              <div className="mt-12 relative h-[300px] w-full rounded-lg overflow-hidden">
                <Image
                  src="/compare.png"
                  alt="Beste spotpris strøm"
                  fill
                  style={{ objectFit: 'cover', objectPosition: 'center' }}
                  className="rounded-lg"
                  priority
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="text-white text-2xl font-bold bg-black bg-opacity-50 px-6 py-3 rounded-lg">Beste spotpris strøm</h3>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Top 20 Deals Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center">
                Topp 20 billigste spotprisavtaler
              </h2>
              
              <p className="text-gray-600 mb-8 text-center">
                I denne oversikten viser Strømnet Norges 20 billigste spotprisavtaler per {getCurrentMonthName()} {new Date().getFullYear()}. 
                Tabellen tar forbehold om Strømregion NO1 og 20.000 kwh i forbruk per år.
              </p>
              
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              ) : (
                <Top50ProductList
                  deals={(deals && Array.isArray(deals)) ? deals.filter(deal => deal.productType === 'spot') : []}
                  priceData={priceData}
                  annualConsumption={annualConsumption}
                  expandedDeal={expandedDeal}
                  toggleDealExpansion={toggleDealExpansion}
                  providerLogoUrls={providerLogoUrls}
                  providers={providers}
                  formatPrice={formatPrice}
                  formatMonthlyCost={formatMonthlyCost}
                  formatConsumption={formatConsumption}
                  getProductTypeNorwegian={getProductTypeNorwegian}
                  getCurrentMonthName={getCurrentMonthName}
                  getCurrentDate={getCurrentDate}
                  pageType="spot"
                />
              )}
              
              <div className="mt-8 text-center">
                <p className="text-gray-600 mb-4">
                  Den billigste strømavtalen med timespot i Norge per {getCurrentDate()} er Agva Spot-Kampanje fra Agva Kraft. 
                  Denne strømavtalen koster 113 øre per kWh og har en estimert månedspris på 1 886 kr ved et årlig forbruk på 20 000 kilowattimer.
                </p>
                <p className="text-sm text-gray-500 italic">Data levert av Forbrukerportalen</p>
                <p className="text-sm text-gray-500">Se også: <Link href="/beste-stromavtale" className="text-blue-600 hover:underline">Billigste og beste strømavtale</Link>.</p>
              </div>
              
              <div className="mt-8 text-center">
                <Link 
                  href="/tilbud" 
                  className="inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-blue-700 transition-colors duration-300 shadow-md"
                >
                  Klar? Finn billigste spotpris nå
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* What is Spot Price Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center">
                Hva er spotpris strøm?
              </h2>
              
              <div className="prose prose-lg mx-auto mb-12">
                <p className="text-gray-600 mb-6">
                  Spotpris strøm er en pris på strøm som fastsettes i nåtid basert på tilbud og etterspørsel på det nordiske kraftmarkedet. 
                  Prisen kan derfor variere fra time til time og fra dag til dag avhengig av tilgangen på og etterspørselen etter strøm.
                </p>
                
                <p className="text-gray-600 mb-6">
                  I Norge er det Nord Pool, som er en nordisk kraftbørs, som fastsetter spotprisen på strøm. 
                  Spotprisen på strøm utgjør en del av den totale strømregningen, og vil typisk utgjøre omtrent halvparten av den totale strømkostnaden.
                </p>
                
                <p className="text-gray-600 mb-6">
                  Mange strømleverandører tilbyr spotprisavtaler til kundene sine. Dette innebærer at kundene betaler den gjeldende spotprisen for strøm i nåtid, 
                  pluss et fast påslag fra strømleverandøren. Slike avtaler kan være gunstige for forbrukere som ønsker å dra nytte av lave spotpriser, 
                  men de kan også være mer risikable, da prisene kan svinge mye fra time til time.
                </p>
                
                <p className="text-gray-600 mb-6">
                  Innenfor spotpris finner man ofte avtaler med to forskjellige begreper:
                </p>
                
                <ul className="list-disc pl-6 mb-6 text-gray-600">
                  <li>Timespotavtaler</li>
                  <li>Strøm til innkjøpspris</li>
                </ul>
                
                <p className="text-gray-600 mb-6">
                  Nå vil vi se på de to variantene og forklare hvordan de fungerer.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="bg-blue-50 p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-blue-600 mb-4">Timespot</h3>
                  <p className="text-gray-600">
                    En timespotavtale er en type strømavtale der kunden betaler den gjeldende spotprisen på strøm på timebasis, 
                    i tillegg til et fast påslag fra strømleverandøren. Dette betyr at prisen på strøm vil variere fra time til time, 
                    avhengig av tilbud og etterspørsel på det nordiske kraftmarkedet.
                  </p>
                  <p className="text-gray-600 mt-4">
                    Timespotavtaler kan være gunstige for forbrukere som har mulighet til å justere sitt strømforbruk etter prisene. 
                    For eksempel kan man velge å bruke mer strøm når prisene er lave og mindre når prisene er høye.
                  </p>
                </div>
                
                <div className="bg-blue-50 p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-blue-600 mb-4">Innkjøpspris</h3>
                  <p className="text-gray-600">
                    Strøm til innkjøpspris og timespotpris er begge priser på strøm som er knyttet til den faktiske markedsprisen på strøm. 
                    Imidlertid er det noen forskjeller mellom de to konseptene.
                  </p>
                  <p className="text-gray-600 mt-4">
                    Mens timespot endrer prisen time for time vil en spotprisavtale av typen "strøm til innkjøpspris" vanligvis regne ut et snitt for inneværende dag. 
                    Det betyr at du som er kunde betaler en fast sum per dag for å bruke strømmen. Dette gjør at man ikke kan tilpasse strømforbruket sitt til timer på døgnet hvor spotprisen er lav.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Advantages and Disadvantages Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">
                Fordeler og ulemper med spotprisavtale
              </h3>
              
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
                  <h4 className="text-lg font-semibold text-green-600 mb-4">Fordeler</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Spotpris gir vanligvis lavere strømpriser enn fastprisavtaler når det er overproduksjon og lav etterspørsel etter strøm.</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Spotprisavtaler gir kundene muligheten til å dra nytte av lave strømpriser når det er overproduksjon og lav etterspørsel etter strøm.</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Avtalen er mer fleksibilitet enn fastprisavtaler, siden kundene kan velge å redusere strømforbruket i perioder med høye priser og øke forbruket i perioder med lave priser.</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Du får en mer direkte kobling til markedet og kan derfor gi kundene en bedre forståelse av de faktiske kostnadene ved strømforbruk.</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
                  <h4 className="text-lg font-semibold text-red-600 mb-4">Ulemper</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                      <span>Spotprisavtaler kan føre til høyere strømpriser når etterspørselen er høyere enn tilbudet, noe som ofte skjer i perioder med høy temperatur og lav nedbør.</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                      <span>Større variasjoner i strømpriser fra time til time og fra dag til dag, noe som kan gjøre det vanskelig for kundene å planlegge strømforbruket.</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                      <span>Spotprisavtaler gir mindre forutsigbarhet enn fastprisavtaler, siden prisene kan endre seg dramatisk fra dag til dag eller fra time til time.</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                      <span>Den er mindre egnet for kunder som ikke har mulighet til å justere strømforbruket sitt i perioder med høye priser, for eksempel for bedrifter eller husholdninger som har høye strømkrav til bestemte tider av døgnet eller året.</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="text-center">
                <Link 
                  href="/tilbud" 
                  className="inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-blue-700 transition-colors duration-300 shadow-md"
                >
                  Klar? Finn beste spotpris nå
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* Current Spot Price Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center">
                Hva er spotprisen nå?
              </h2>
              
              <p className="text-gray-600 mb-8 text-center">
                Norge er delt opp i 5 strømregioner. Nedenfor viser vi deg hva spotprisen er akkurat nå.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-12">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <h3 className="font-medium text-gray-800 mb-2">Region NO1</h3>
                  <p className="text-2xl font-bold text-blue-600">51 øre per kWh</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <h3 className="font-medium text-gray-800 mb-2">Region NO2</h3>
                  <p className="text-2xl font-bold text-blue-600">53 øre per kWh</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <h3 className="font-medium text-gray-800 mb-2">Region NO3</h3>
                  <p className="text-2xl font-bold text-blue-600">7 øre per kWh</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <h3 className="font-medium text-gray-800 mb-2">Region NO4</h3>
                  <p className="text-2xl font-bold text-blue-600">3 øre per kWh</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <h3 className="font-medium text-gray-800 mb-2">Region NO5</h3>
                  <p className="text-2xl font-bold text-blue-600">50 øre per kWh</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* What Affects Spot Price Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center">
                Hva påvirker beregningen av spotpris?
              </h2>
              
              <p className="text-gray-600 mb-8 text-center">
                Beregning av spotpris kan være kompleks, og prisene kan variere betydelig fra time til time og fra dag til dag avhengig av en rekke faktorer. Det er derfor viktig å være oppmerksom på disse faktorene når man velger en spotprisavtale:
              </p>
              
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="md:col-span-2">
                  <div className="relative h-[300px] w-full rounded-lg overflow-hidden">
                    <Image
                      src="/compare.png"
                      alt="Spotprisavtale"
                      fill
                      style={{ objectFit: 'cover', objectPosition: 'center' }}
                      className="rounded-lg"
                      priority
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <h3 className="text-white text-2xl font-bold bg-black bg-opacity-50 px-6 py-3 rounded-lg">Spotprisavtale</h3>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-blue-600 mb-4">Tilbud og etterspørsel</h3>
                  <p className="text-gray-600">
                    Spotprisen bestemmes av forholdet mellom tilbud og etterspørsel etter strøm i markedet. Når etterspørselen er høyere enn tilbudet, vil dette føre til økte priser. Dette kan skje i perioder med lave temperaturer, når det er stor bruk av air condition, eller i perioder med høyt energiforbruk fra industrien. Tilsvarende kan lave etterspørselsperioder føre til lavere spotpriser.
                  </p>
                </div>
                
                <div className="bg-blue-50 p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-blue-600 mb-4">Produksjonskostnader</h3>
                  <p className="text-gray-600">
                    Spotprisen påvirkes også av produksjonskostnadene for strøm. Hvis produksjonskostnadene øker, vil det som regel føre til høyere spotpriser. Produksjonskostnadene kan være påvirket av flere faktorer, inkludert prisene på brensel som olje, gass og kull, samt investeringskostnader i kraftverk.
                  </p>
                </div>
                
                <div className="bg-blue-50 p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-blue-600 mb-4">Vind og vær</h3>
                  <p className="text-gray-600">
                    Værforholdene har en stor innvirkning på både etterspørsel og produksjon av elektrisitet, og dermed spotprisen. Høye vindkraftproduksjoner på grunn av sterke vinder fører til lavere spotpriser. I perioder med tørke kan lave vannstander i vannkraftreservoarer føre til redusert produksjon av elektrisitet fra vannkraft, noe som kan øke spotprisen.
                  </p>
                </div>
                
                <div className="bg-blue-50 p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-blue-600 mb-4">Kraftimport og eksport</h3>
                  <p className="text-gray-600">
                    Tilgangen til elektrisitet fra andre markeder vil påvirke spotprisen. Hvis et marked importerer mer elektrisitet enn det eksporterer, kan dette føre til høyere spotpriser. Hvis et marked eksporterer mer elektrisitet enn det importerer, kan dette føre til lavere spotpriser.
                  </p>
                </div>
                
                <div className="bg-blue-50 p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-blue-600 mb-4">Kraftlagre</h3>
                  <p className="text-gray-600">
                    Tilgjengeligheten av kraftlagre vil også påvirke spotprisen. Hvis kraftlagrene er lave, kan dette føre til høyere spotpriser, siden markedet må bruke mer kostbare metoder for å dekke etterspørselen. Høye lagernivåer kan derimot føre til lavere spotpriser, siden markedet da kan bruke disse lagrene for å dekke etterspørselen.
                  </p>
                </div>
                
                <div className="bg-blue-50 p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-blue-600 mb-4">I tillegg kommer strømleverandørens påslag og mva til staten</h3>
                  <p className="text-gray-600">
                    I tillegg til å betale for selve spotprisen skal strømleverandørene tjene penger. Vanligvis vil de sette et påslag på spotprisen. Dette vil som oftest være noen øre per kwh og eventuelt også ved å sette inn et månedsgebyr.
                  </p>
                  <p className="text-gray-600 mt-2">
                    Man må også betale mva. på strøm – noe som vil øke spotprisen med 25%.
                  </p>
                </div>
              </div>
              
              <div className="mb-12">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Hvordan se morgendagens spotpris?</h3>
                <p className="text-gray-600 mb-4">
                  Dersom du ønsker å vite morgendagens spotpris anbefaler vi deg å sjekke ut EUenergy, som lar deg se morgendagens spotpris for alle land som er tilknyttet EU/EØS.
                </p>
              </div>
              
              <div className="mb-12">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Billigste er som oftest beste spotpris på strøm</h3>
                <p className="text-gray-600 mb-8">
                  Strøm er strøm. Derfor anbefaler vi i Strømnet at du alltid velger å bestille den billigste spotprisavtalen.
                </p>
                
                <div className="text-center">
                  <Link 
                    href="/tilbud" 
                    className="inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-blue-700 transition-colors duration-300 shadow-md"
                  >
                    Finn beste spotpris nå
                  </Link>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Kilder</h3>
                <ul className="list-disc pl-6 text-gray-600">
                  <li className="mb-2">
                    <a href="https://www.nordpoolgroup.com/" className="text-blue-600 hover:underline">Nord Pool</a>
                  </li>
                  <li className="mb-2">
                    <a href="https://www.euenergy.live/" className="text-blue-600 hover:underline">EUenergy</a>
                  </li>
                  <li className="mb-2">
                    <a href="https://www.nrk.no/" className="text-blue-600 hover:underline">NRK</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
} 