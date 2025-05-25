'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Helmet } from 'react-helmet';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MultiStepForm from '@/components/MultiStepForm';

// Function to get the current month name in Norwegian
const getCurrentMonthName = () => {
  const months = [
    'januar', 'februar', 'mars', 'april', 'mai', 'juni',
    'juli', 'august', 'september', 'oktober', 'november', 'desember'
  ];
  const currentMonth = new Date().getMonth(); // 0-indexed
  return months[currentMonth];
};

export default function BusinessPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Billigste og beste strømavtale bedrift - Strømnet.no</title>
        <meta name="description" content="Finn billigste og beste strømavtale for din bedrift. Sammenlign priser og få uforpliktende tilbud fra flere strømleverandører." />
        <meta name="keywords" content="strømavtale bedrift, billig strøm bedrift, strømleverandør bedrift, sammenlign strømpriser bedrift" />
      </Helmet>
      
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section with Form */}
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
                    Billigste og beste strømavtale bedrift ({getCurrentMonthName()} {new Date().getFullYear()})
                  </h1>
                  <p className="text-xl mb-8">La strømleverandørene konkurrere om å gi din bedrift de beste strømavtalene</p>
                  
                  <div className="flex flex-col md:flex-row gap-4 mb-8 justify-center md:justify-start">
                    <div className="flex items-center justify-center md:justify-start">
                      <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span className="text-white text-sm md:text-base">Helt gratis!</span>
                    </div>
                    <div className="flex items-center justify-center md:justify-start">
                      <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span className="text-white text-sm md:text-base">Spar penger på strøm!</span>
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
                
                <div id="form-section" className="bg-white rounded-xl shadow-xl md:col-span-2">
                  <MultiStepForm />
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Benefits Section */}
        <div className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-start mb-4">
                  <svg className="h-6 w-6 text-green-500 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-800">La strømselskap konkurrere</h3>
                </div>
                <p className="text-gray-600">
                  La strømleverandørene konkurrere om å gi din bedrift sine beste strømavtaler. Gratis og uforpliktende.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-start mb-4">
                  <svg className="h-6 w-6 text-green-500 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-800">Sammenlign strømpriser</h3>
                </div>
                <p className="text-gray-600">
                  Sammenlign og vurder bedriftsabonnement fra forskjellige strømleverandører. Helt gratis og uforpliktende.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-start mb-4">
                  <svg className="h-6 w-6 text-green-500 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-800">Spar penger og tid</h3>
                </div>
                <p className="text-gray-600">
                  Du trenger ikke saumfare internett. Bruk vår guide og få bedre strømpris, eller la være. Valget er ditt.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* How It Works Section with Image */}
        <div className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center">
                Slik finner du beste strømavtale bedrift
              </h2>
              
              <div className="mb-8 flex justify-center">
                <div className="relative w-full max-w-md h-64 md:h-80">
                  <Image 
                    src="/proff.webp" 
                    alt="Profesjonell strømavtale for bedrifter" 
                    fill
                    style={{ objectFit: 'contain' }}
                    className="rounded-lg"
                  />
                </div>
              </div>
              
              <p className="text-gray-600 mb-6">
                Er du ute etter beste strømavtale til bedriften din? I så fall kan du enkelt bruke vår tjeneste som er både gratis og uforpliktende.
              </p>
              
              <ol className="list-decimal pl-5 mb-8 text-gray-600">
                <li className="mb-3">Fyll ut ett skjema – det tar 2 minutter.</li>
                <li className="mb-3">Få uforpliktende tilbud fra flere strømleverandører som leverer strøm til bedrifter.</li>
                <li className="mb-3">Godkjenn beste strømavtale du finner til bedriften din – eller avslå alle. Valget er ditt.</li>
              </ol>
              
              <p className="text-gray-600 mb-8">
                Ved å bruke sammenligningstjenesten vil du enkelt kunne spare både tid og penger.
              </p>
              
              <div className="text-center mb-12">
                <Link 
                  href="/tilbud" 
                  className="inline-block bg-blue-600 text-white font-bold py-4 px-12 rounded-lg text-lg hover:bg-blue-700 transition-colors duration-300 shadow-md"
                >
                  Finn billigste strømavtale for bedrift nå
                </Link>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
                Ulike strømavtaler for bedrifter
              </h2>
              
              <p className="text-gray-600 mb-6">
                Som bedrift har du tilgang på ulike typer strømavtaler. Her kan du lese vår vurdering av:
              </p>
              
              <ul className="list-disc pl-5 mb-8 text-gray-600">
                <li className="mb-2">Spotprisavtaler</li>
                <li className="mb-2">Fastprisavtaler</li>
                <li className="mb-2">Forvaltningsavtaler</li>
                <li className="mb-2">Variabel strømpris</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Agreement Types Section */}
        <div className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center">
                Strømavtaler bedrift
              </h2>
              
              <p className="text-gray-600 mb-8 text-center">
                En bedrift kan velge mellom flere ulike strømavtaler
              </p>
              
              <div id="spotpris" className="mb-8">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Spotpris</h4>
                <p className="text-gray-600 mb-4">
                  Spotprisavtaler er en avtale mellom en bedrift og en strømleverandør der prisen på strømmen varierer i takt med markedsprisen på strøm. Bedriften betaler da kun det strømmen koster på strømbørsen, pluss påslag og avgifter som elsertifikater til strømleverandøren.
                </p>
                <p className="text-gray-600 mb-4">
                  Spotprisavtaler gir bedrifter muligheten til å dra nytte av lave markedspriser på strøm, men prisen kan også variere mye og raskt i perioder med høy etterspørsel. Derfor er spotprisavtaler være mer egnet for bedrifter som har en fleksibel produksjon og kan tilpasse seg endringer i strømprisen.
                </p>
                <p className="text-gray-600">
                  Vi anbefaler å sjekke vilkårene for spotprisavtaler nøye, da påslaget og eventuelle faste kostnader kan variere mellom strømleverandørene. Bedrifter bør også være oppmerksomme på at spotprisavtaler ikke garanterer en fast pris over tid, og at det derfor kan være risiko knyttet til svingende priser på strømmarkedet.
                </p>
              </div>
              
              <div id="fastpris" className="mb-8">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Fastpris</h4>
                <p className="text-gray-600 mb-4">
                  Fastprisavtaler er en avtale mellom en bedrift og en strømleverandør der prisen på strømmen er fast i avtaleperioden. Bedriften betaler da en fast pris per kWh uavhengig av endringer i markedsprisen på strøm i perioden.
                </p>
                <p className="text-gray-600 mb-4">
                  Fastprisavtaler gir bedrifter forutsigbarhet som er en fordel dersom man ønsker å unngå risiko knyttet til svingende strømpriser. Det er viktig å være oppmerksom på at avtaleperioden varierer mellom strømleverandørene.
                </p>
                <p className="text-gray-600">
                  Bedrifter bør også være oppmerksomme på at fastprisavtaler normalt sett har en høyere pris per kWh enn spotprisavtaler, og at man kan gå glipp av eventuelle prisfall på strømmarkedet i avtaleperioden. Vi anbefaler derfor å vurdere bedriftens behov og risikovillighet før man velger å inngå en fastprisavtale.
                </p>
              </div>
              
              <div id="forvaltning" className="mb-8">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Kraftforvaltning</h4>
                <p className="text-gray-600 mb-4">
                  Forvaltningsavtaler er en avtale mellom en bedrift og en forvalter som har ansvar for å kjøpe og selge strøm på vegne av bedriften.
                </p>
                <p className="text-gray-600 mb-4">
                  En forvaltningsavtale gir bedrifter muligheten til å utnytte profesjonell kompetanse og teknologi for å kjøpe og selge strøm på en mest mulig lønnsom måte. Forvalteren bruker sin ekspertise til å overvåke strømmarkedet og ta raske beslutninger basert på endringer i markedsforholdene.
                </p>
                <p className="text-gray-600 mb-4">
                  Forvaltningsavtaler kan være egnet for større bedrifter som har høyt strømforbruk og ønsker å utnytte markedet på en mer aktiv måte.
                </p>
                <p className="text-gray-600">
                  Det er likevel viktig å være oppmerksom på at det det finnes en reell risiko for at forvaltningsavtalen blir dyrere enn spotprisen på sikt.
                </p>
              </div>
              
              <div id="variabel" className="mb-8">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Variabel strømpris</h4>
                <p className="text-gray-600 mb-4">
                  Variable prisavtaler er en avtale mellom en bedrift og en strømleverandør der prisen på strømmen varierer i henhold til leverandørens prisjusteringer. Prisjusteringene er knyttet til endringer i markedsprisen på strøm, endringer i offentlige avgifter eller andre faktorer.
                </p>
                <p className="text-gray-600 mb-4">
                  Variable prisavtaler gir bedrifter muligheten til å dra nytte av prisfall på strømmarkedet, men også økte priser ved eventuelle prisøkninger. Avtaleperioden vil variere mellom strømleverandørene, og vi anbefaler derfor å sjekke vilkårene nøye før man inngår avtaler.
                </p>
                <p className="text-gray-600 mb-4">
                  Bedrifter bør også være oppmerksomme på at variable pris avtaler kan innebærer mer usikkerhet og risiko sammenlignet med fastprisavtaler, og at det kan være utfordrende å budsjettere og planlegge økonomien på lang sikt.
                </p>
                <p className="text-gray-600">
                  Det er derfor lurt å vurdere bedriftens behov og risikovillighet før man velger å inngå en variabel prisavtale.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Comparison Table */}
        <div className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 mt-12">
                Fordeler og ulemper med ulike strømavtaler til bedrift
              </h2>
              
              <div className="overflow-x-auto mb-12">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Strømavtale</th>
                      <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Beskrivelse</th>
                      <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Fordeler</th>
                      <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Ulemper</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-3 px-4 border-b">Spotpris</td>
                      <td className="py-3 px-4 border-b">Pris på strømmen følger markedet</td>
                      <td className="py-3 px-4 border-b">Lav pris når markedet er gunstig, fleksibilitet</td>
                      <td className="py-3 px-4 border-b">Prisøkninger ved høy etterspørsel og knapphet på kraft</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="py-3 px-4 border-b">Fastpris</td>
                      <td className="py-3 px-4 border-b">Fast pris på strømmen i avtaleperioden</td>
                      <td className="py-3 px-4 border-b">Forutsigbarhet, unngå risiko knyttet til svingende priser</td>
                      <td className="py-3 px-4 border-b">Høyere pris enn spotpris, går glipp av eventuelle prisfall</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 border-b">Variabel pris</td>
                      <td className="py-3 px-4 border-b">Pris på strømmen varierer i henhold til leverandørens justeringer</td>
                      <td className="py-3 px-4 border-b">Mulighet for å dra nytte av prisfall, fleksibilitet</td>
                      <td className="py-3 px-4 border-b">Usikkerhet og risiko, utfordrende å budsjettere på lang sikt</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="py-3 px-4 border-b">Forvaltningsstrøm</td>
                      <td className="py-3 px-4 border-b">Profesjonell forvaltning av strømforbruket</td>
                      <td className="py-3 px-4 border-b">Mulighet for å utnytte ekspertise og teknologi, aktiv utnyttelse av markedet</td>
                      <td className="py-3 px-4 border-b">Høyere kostnader, utfordrende å forutsi resultatene på lang sikt</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="text-center mb-12">
                <Link 
                  href="/tilbud" 
                  className="inline-block bg-blue-600 text-white font-bold py-4 px-12 rounded-lg text-lg hover:bg-blue-700 transition-colors duration-300 shadow-md"
                >
                  Kom i gang nå
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Popular Providers Section */}
        <div className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center">
                De mest populære strømleverandører for bedrifter
              </h2>
              
              <p className="text-gray-600 mb-4">
                Noen strømleverandører er mer populære enn andre. Nedenfor lister vi de 3 mest populære strømleverandørene for bedrifter i Norge ifølge Google.
              </p>
              
              <ol className="list-decimal pl-5 mb-6 text-gray-600">
                <li className="mb-2">Fortum strøm (tidligere Hafslund).</li>
                <li className="mb-2">Tibber strøm.</li>
                <li className="mb-2">Lyse strøm.</li>
              </ol>
              
              <p className="text-gray-600 mb-8">
                Det er ikke overraskende for oss i Strømnet at dette er de strømselskapene som er mest søkt etter når du kommer til strømavtaler for bedrifter. Dette ettersom at Fortum og Lyse er noen av landets største strømselskap. Det som er verdt å nevne er at Tibber ikke tilbyr strømavtaler for bedrifter.
              </p>
              
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
                Har bedrifter billigere strøm? (strøm bedrift vs privat)
              </h2>
              
              <p className="text-gray-600 mb-4">
                Bedrifters strømpriser varierer avhengig av flere faktorer, som størrelsen på bedriften og hvor mye strøm de bruker. Når det kommer til om bedrifter har billigere strøm enn forbruker, er dette todelt.
              </p>
              
              <p className="text-gray-600 mb-4">
                På den ene siden kan man si at større bedrifter ofte kan ha lavere strømpriser enn mindre bedrifter og husholdninger.
              </p>
              
              <p className="text-gray-600 mb-4">
                Dette skyldes flere årsaker. For det første kan større bedrifter ha større innkjøpskraft og dermed forhandle frem bedre priser hos strømleverandørene. I tillegg kan større bedrifter også ha mulighet til å forhandle frem bedre betingelser og vilkår i strømavtalene.
              </p>
              
              <p className="text-gray-600 mb-8">
                Når det kommer til små bedrifter er det sjeldent tilfellet at strømprisen er billigere enn for privatpersoner.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                <div className="flex justify-center mb-4">
                  <Image 
                    src="/proff.webp" 
                    alt="Beste strømavtale bedrift" 
                    width={400}
                    height={250}
                    className="rounded-lg"
                  />
                </div>
                <p className="text-center text-gray-600">Beste strømavtale bedrift</p>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
                Hvilke bedrifter får strømstøtte?
              </h2>
              
              <p className="text-gray-600 mb-8">
                For å kunne søke om strømstøtte gjennom Energitilskkuddsordningen fra Enova, måtte bedriften ha en strømintensitet på minst 3 prosent i første halvår av 2022. Strømintensiteten beregnes som andelen av bedriftens totale omsetning som går til strømkostnader i perioden 1. januar til 30. juni 2022.
              </p>
              
              <p className="text-gray-600 mb-8">
                Denne strømstøtten for bedrifter varte litt ut i 2025.
              </p>
              
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
                Har man angrerett på strømavtaler for bedrifter?
              </h2>
              
              <p className="text-gray-600 mb-4">
                Nei, man har ikke angrerett på strømavtaler som er bestilt til en bedrift i Norge.
              </p>
              
              <p className="text-gray-600 mb-4">
                Angreretten for strømavtaler følger av angrerettloven, og gir privatpersoner rett til å angre på avtaler som er inngått utenfor faste forretningslokaler eller på messer og lignende arrangementer.
              </p>
              
              <p className="text-gray-600 mb-4">
                For strømavtaler gjelder dette ofte avtaler som er inngått over telefon eller på nettet. Privatpersoner har normalt 14 dagers angrefrist fra avtalen er inngått, og de kan angre på avtalen ved å gi beskjed til strømleverandøren innen fristen.
              </p>
              
              <p className="text-gray-600 mb-8">
                Angrerettloven omfatter for øvrig ikke bedrifter eller andre organisasjoner.
              </p>
              
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
                Sammenlign tilbud og finn billigste strømavtale for bedrift
              </h2>
              
              <p className="text-gray-600 mb-4">
                For å finne den billigste strømavtalen for bedriften din, kan det være lurt å sammenligne tilbud fra ulike strømleverandører. Her er noen trinn du kan følge:
              </p>
              
              <ol className="list-decimal pl-5 mb-6 text-gray-600">
                <li className="mb-2">Finn ut hva slags strømavtale som passer best for din bedrift (spotpris, fastpris, variabel pris eller forvaltningsstrøm).</li>
                <li className="mb-2">Søk etter strømleverandører som tilbyr den typen avtale du ønsker.</li>
                <li className="mb-2">Sammenlign priser og vilkår fra ulike strømleverandører. Prisene kan variere mye, og du kan spare mye penger ved å velge den billigste avtalen.</li>
                <li className="mb-2">Vurder også andre faktorer som kan påvirke valget, for eksempel hvor lang bindingstid avtalen har, eventuelle tilleggskostnader og kundeservice.</li>
              </ol>
              
              <p className="text-gray-600 mb-8">
                Avslutningsvis kan du gjøre prosessen med å finne billigste strømavtale for bedrift enda lettere for deg ved å få uforpliktende tilbud fra flere strømleverandører ved å bruke vår uforpliktende tjeneste.
              </p>
              
              <div className="text-center">
                <Link 
                  href="/tilbud" 
                  className="inline-block bg-blue-600 text-white font-bold py-4 px-12 rounded-lg text-lg hover:bg-blue-700 transition-colors duration-300 shadow-md"
                >
                  Få tilbud fra flere strømleverandører
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 