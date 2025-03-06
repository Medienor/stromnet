import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function Personvern() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Personvern</h1>
            
            <div className="prose prose-lg max-w-none">
              <p>
                Vi i Strømnet setter personvern høyt. Denne siden forklarer hvordan vi samler inn, 
                bruker og beskytter dine personopplysninger når du bruker vår tjeneste.
              </p>
              
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Hvilke opplysninger vi samler inn</h2>
              <p>
                Vi samler inn informasjon som du gir oss når du bruker vår sammenligningstjeneste, 
                inkludert:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Kontaktinformasjon (navn, e-post, telefonnummer)</li>
                <li>Adresse og postnummer</li>
                <li>Informasjon om ditt strømforbruk</li>
                <li>Informasjon om ditt nåværende strømabonnement</li>
              </ul>
              
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Hvordan vi bruker opplysningene</h2>
              <p>
                Vi bruker dine personopplysninger for å:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Gi deg tilpassede tilbud fra strømleverandører</li>
                <li>Kontakte deg angående tjenesten vår</li>
                <li>Forbedre og tilpasse tjenestene våre</li>
                <li>Gjennomføre analyser og statistikk (i anonymisert form)</li>
              </ul>
              
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Deling av informasjon</h2>
              <p>
                Vi deler kun dine personopplysninger med strømleverandører du velger å få tilbud fra. 
                Vi selger ikke dine personopplysninger til tredjeparter.
              </p>
              
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Dine rettigheter</h2>
              <p>
                Du har rett til å:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Få innsyn i hvilke personopplysninger vi har om deg</li>
                <li>Korrigere feilaktige opplysninger</li>
                <li>Be om sletting av dine personopplysninger</li>
                <li>Trekke tilbake samtykke til behandling av dine personopplysninger</li>
              </ul>
              
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Kontakt oss</h2>
              <p>
                Hvis du har spørsmål om vår personvernpraksis eller ønsker å utøve dine rettigheter, 
                vennligst kontakt oss på <a href="mailto:post@stromnet.no" className="text-blue-600 hover:underline">post@stromnet.no</a>
              </p>
              
              <p className="mt-8 text-sm text-gray-600">
                Sist oppdatert: Januar 2025
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
} 