import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function OmOss() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Om oss</h1>
            
            <div className="prose prose-lg max-w-none">
              <p>
                Strømnet.no er en tjeneste levert av Netsure AS, som hjelper norske forbrukere og 
                bedrifter med å finne de beste strømavtalene i markedet.
              </p>
              
              <p>
                Vårt mål er å gjøre strømmarkedet mer transparent og tilgjengelig for alle. 
                Vi sammenligner strømavtaler fra ulike leverandører slik at du enkelt kan finne 
                den avtalen som passer best for ditt forbruk og dine preferanser.
              </p>
              
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Vår visjon</h2>
              <p>
                Vi ønsker å skape et mer åpent og forbrukerorientert strømmarked. Gjennom vår 
                tjeneste kan strømleverandører konkurrere om å tilby de beste avtalene, 
                noe som gir deg som forbruker bedre priser og vilkår.
              </p>
              
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Selskapet bak</h2>
              <p>
                Strømnet.no drives av Netsure AS, et norsk selskap som spesialiserer seg på 
                digitale tjenester innen energi- og forbrukersektoren.
              </p>
              
              <ul className="mt-4">
                <li><strong>Organisasjonsnummer:</strong> 834 762 102</li>
                <li><strong>E-post:</strong> post@netsure.ai</li>
                <li><strong>Adresse:</strong> Føllingstads veg 28, 2819 Gjøvik</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
} 