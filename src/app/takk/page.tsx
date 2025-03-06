'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import confetti from 'canvas-confetti';

export default function TakkPage() {
  // Trigger confetti effect when the page loads
  useEffect(() => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: NodeJS.Timeout = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      // Since particles fall down, start a bit higher than random
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-8 rounded-xl mb-10 text-center">
          <h1 className="text-4xl font-bold text-blue-800 mb-4">Takk for din henvendelse!</h1>
          <p className="text-xl text-blue-700 mb-2">
            Nå er du ett steg nærmere å spare tusenvis på strømregningen din.
          </p>
          <p className="text-lg text-blue-600">
            Les videre for å få mest mulig ut av strømavtalen din.
          </p>
        </div>

        {/* Introduction */}
        <div className="prose prose-lg max-w-none mb-10 text-center">
          <h2 className="text-2xl font-bold text-blue-800 mb-6">
            Vær forberedt når strømleverandørene kontakter deg
          </h2>
          
          <p className="mb-6 max-w-2xl mx-auto">
            I løpet av kort tid vil du bli kontaktet av strømleverandører via telefon, SMS eller e-post. 
            Mange av våre brukere forteller at de føler seg usikre når de skal velge strømleverandør, 
            ettersom markedet kan virke komplisert og uoversiktlig. For å hjelpe deg med å ta et 
            informert valg, har vi laget en sjekkliste som har hjulpet tusenvis av forbrukere å finne 
            den strømavtalen som passer best til deres behov.
          </p>
        </div>

        {/* Checklist Header with decorative lines */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-2">
            <div className="flex-grow max-w-[100px] h-px bg-gray-300"></div>
            <h3 className="text-sm font-semibold text-gray-500 mx-4 uppercase tracking-wider">
              4 viktige punkter før du velger strømleverandør
            </h3>
            <div className="flex-grow max-w-[100px] h-px bg-gray-300"></div>
          </div>
          <h2 className="text-3xl font-bold text-blue-600 mb-8">Sjekkliste for valg av strømleverandør</h2>
        </div>

        {/* Checklist Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="text-amber-500 mr-3 text-2xl">⚡</div>
              <h3 className="text-xl font-bold text-blue-800">Større leverandører gir flere fordeler</h3>
            </div>
            <p className="text-gray-700 mb-4">
              De største strømleverandørene tilbyr ofte flere tilleggstjenester. Du får gjerne alt samlet: 
              strøm, nettleie på samme faktura, kundefordeler og tilgang til smarte løsninger.
            </p>
            <p className="text-gray-700 font-medium">
              Velg en etablert leverandør hvis du ønsker en helhetlig løsning med flere tjenester samlet.
            </p>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="text-amber-500 mr-3 text-2xl">⚡</div>
              <h3 className="text-xl font-bold text-blue-800">Få kontroll over strømforbruket</h3>
            </div>
            <p className="text-gray-700 mb-4">
              Moderne strømapper gir deg full oversikt over forbruket time for time. Du kan enkelt følge med 
              på kostnader, sammenligne perioder og identifisere når du bruker mest strøm.
            </p>
            <p className="text-gray-700 font-medium">
              Med bedre innsikt i eget forbruk kan du spare betydelige beløp. Sjekk om leverandøren 
              tilbyr en brukervennlig app uten ekstra kostnad.
            </p>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="text-amber-500 mr-3 text-2xl">⚡</div>
              <h3 className="text-xl font-bold text-blue-800">Smarte tilleggstjenester</h3>
            </div>
            <p className="text-gray-700 mb-4">
              Mange leverandører tilbyr nå innovative løsninger som smarte ladetjenester for elbil, 
              gunstige forsikringsordninger og løsninger for deg som produserer egen strøm.
            </p>
            <p className="text-gray-700 font-medium">
              Vurder hvilke tilleggstjenester som er viktige for deg og sammenlign tilbudene. 
              Noen inkluderer disse tjenestene uten ekstra kostnad, mens andre tar betalt for dem.
            </p>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="text-amber-500 mr-3 text-2xl">⚡</div>
              <h3 className="text-xl font-bold text-blue-800">Les vilkårene nøye</h3>
            </div>
            <p className="text-gray-700 mb-4">
              Alltid les det med liten skrift! Se etter skjulte gebyrer, påslag og bindingstid. 
              De beste leverandørene tilbyr fornøydhetsgaranti og fleksible betalingsløsninger.
            </p>
            <p className="text-gray-700 font-medium">
              Undersøk også kvaliteten på kundeservice – dette er spesielt viktig når strømprisene 
              er høye eller hvis det skulle oppstå problemer.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-blue-50 rounded-xl p-8 mb-12 border border-blue-100">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <h4 className="text-lg font-medium text-blue-800 mb-2">Henvendelser formidlet</h4>
              <p className="text-3xl font-bold text-blue-600">10 000+</p>
            </div>
            <div>
              <h4 className="text-lg font-medium text-blue-800 mb-2">Gjennomsnittlig besparelse</h4>
              <p className="text-3xl font-bold text-blue-600">125 kr/mnd</p>
            </div>
            <div>
              <h4 className="text-lg font-medium text-blue-800 mb-2">Svartid på forespørsel</h4>
              <p className="text-3xl font-bold text-blue-600">2-4 timer</p>
            </div>
          </div>
        </div>

        {/* Closing Message */}
        <div className="prose prose-lg max-w-none mb-10 text-center">
          <p className="mb-6">
            Lykke til med valg av strømleverandør! Husk at selv om en avtale kan virke dyrere ved første øyekast, 
            kan den ofte lønne seg i lengden. Gode forbruksapper, samlet faktura, kundeservice og smarte 
            tilleggstjenester kan gi deg både bedre oversikt og lavere totalforbruk over tid. Det handler ikke 
            bare om prisen per kWh, men om den totale pakken du får.
          </p>
          
          <p className="font-medium">
            Vennlig hilsen,<br />
            Teamet hos Strømnet.no
          </p>
        </div>

        {/* CTA Button */}
        <div className="text-center mt-10">
          <Link href="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200">
            Tilbake til forsiden
          </Link>
        </div>
      </div>
      <Footer />
    </>
  );
} 