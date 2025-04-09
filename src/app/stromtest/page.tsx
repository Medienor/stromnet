import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ElectricityDealTester from '@/components/ElectricityDealTester';

export default function StromTest() {
  return (
    <div className="min-h-screen flex flex-col font-inter">
      <Navbar />
      <main className="flex-grow bg-gray-50">
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Test din strømavtale</h1>
            <p className="text-lg text-gray-600 mb-2">
              Finn ut om du kan spare penger på strømregningen din ved å bytte leverandør
            </p>
            <p className="text-sm text-gray-500">
              Vi sammenligner din nåværende avtale med dagens markedspriser og viser deg potensielle besparelser
            </p>
          </div>
          
          <ElectricityDealTester />
        </div>
      </main>
      <Footer />
    </div>
  );
} 