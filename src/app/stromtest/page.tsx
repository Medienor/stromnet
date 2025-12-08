import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ElectricityDealTester from '@/components/ElectricityDealTester';

export default function StromTest() {
  return (
    <div className="min-h-screen flex flex-col font-inter bg-gray-50">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold tracking-wide uppercase mb-4">
              Gratis sjekk
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
              Betaler du for mye for strømmen?
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Test din strømavtale mot markedet på 1-2-3. Vi analyserer tusenvis av avtaler for å se om du kan spare penger ved å bytte.
            </p>
          </div>
          
          <ElectricityDealTester />
          
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto text-center">
            <div className="p-6">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Helt gratis</h3>
              <p className="text-gray-500">Tjenesten er 100% gratis og uforpliktende å bruke for alle.</p>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Lynrask sjekk</h3>
              <p className="text-gray-500">Det tar under 30 sekunder å sjekke om du har en god avtale.</p>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Markedsdata</h3>
              <p className="text-gray-500">Vi sammenligner mot dagens faktiske priser i markedet.</p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}