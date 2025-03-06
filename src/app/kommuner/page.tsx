import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import KommunerSearch from '../../components/KommunerSearch';
import municipalitiesData from '../data/municipalities.json';
import { Metadata } from 'next';
import Image from 'next/image';

// Static metadata for the page
export const metadata: Metadata = {
  title: 'Kommuner: Finn beste og billigste strømavtale nær deg',
  description: 'Velg din kommune og finn de billigste strømavtalene i ditt område. Sammenlign priser og spar penger på strømregningen.',
  openGraph: {
    title: 'Kommuner: Finn beste og billigste strømavtale nær deg',
    description: 'Velg din kommune og finn de billigste strømavtalene i ditt område. Sammenlign priser og spar penger på strømregningen.',
    url: 'https://stromnet.no/kommuner',
    siteName: 'StromNet',
    locale: 'nb_NO',
    type: 'website',
  },
};

export default function Kommuner() {
  // Get current date in Norwegian format
  const today = new Date();
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = today.toLocaleDateString('nb-NO', options);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="flex flex-col justify-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Kommuner: Finn beste og billigste strømavtale nær deg</h1>
                <p className="text-gray-600">
                  Finn din kommune for å se de beste strømtilbudene i ditt område. Vi har tilbud for hele Norge.
                </p>
                <p className="mt-4 text-gray-600 italic">
                  Her kan du finne din kommune og se dagens strømpris og billigste og beste strømavtale i nåtid. 
                  Alle strømpriser er oppdatert per {formattedDate}.
                </p>
              </div>
              
              <div className="flex items-center justify-center">
                <div className="relative w-full h-auto max-w-md mx-auto">
                  <Image 
                    src="/mountain.jpg" 
                    alt="Norsk landskap" 
                    width={600} 
                    height={400} 
                    className="rounded-lg object-cover shadow-md"
                  />
                </div>
              </div>
            </div>
            
            <KommunerSearch municipalities={municipalitiesData} />
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
} 