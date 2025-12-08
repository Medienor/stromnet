'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MultiStepForm from '@/components/MultiStepForm';

export default function TilbudLandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar 
        transparent={false} 
        textColor="text-white" 
        hoverColor="hover:text-yellow-300"
        backgroundColor="bg-[#162e7b]"
      />
      
      {/* Hero Section with Form */}
      <section className="relative bg-[#162e7b] overflow-hidden">
        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
              {/* Left side - Hero content */}
              <div className="md:col-span-3 text-center md:text-left">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[50px] font-bold text-white mb-6 leading-tight">
                  Få opptil <span className="text-yellow-400">3 tilbud</span> på strøm
                </h1>
                <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl text-center md:text-left">
                  Sammenlign priser fra Norges ledende strømleverandører og spar tusenvis av kroner i året. Helt gratis og uten forpliktelser.
                </p>
                
                {/* Benefits */}
                <div className="flex flex-col md:flex-row gap-4 mb-8 justify-center md:justify-start">
                  <div className="flex items-center justify-center md:justify-start">
                    <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-white text-sm md:text-base">Helt gratis!</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start">
                    <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-white text-sm md:text-base">Spar tusenvis av kroner!</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start">
                    <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-white text-sm md:text-base">Under 2 minutter!</span>
                  </div>
                </div>
                
                {/* Mobile CTA button */}
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
              
              {/* Right side - Form */}
              <div id="form-section" className="bg-white rounded-xl shadow-xl md:col-span-2">
                <MultiStepForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* USP Section */}
      <section className="bg-[#1d53ff] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* First column - Trust indicator */}
            <div className="text-center md:text-left">
              <h3 className="text-white text-lg font-medium mb-4">
                Derfor bruker forbrukere vår tjeneste
              </h3>
              <div className="flex justify-center md:justify-start space-x-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-7 h-7 text-[#00b67a]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>

            {/* USP 1 */}
            <div className="bg-[#1c4ada] rounded-lg p-6 flex flex-col items-start justify-start gap-6">
              <div className="border-[6px] border-[#ffe797] rounded-full w-[64px] h-[64px] flex items-center justify-center p-[17px]">
                <span className="text-white text-2xl font-bold">1</span>
              </div>
              <div>
                <h4 className="text-white text-lg font-semibold mb-2">Du sparer tid</h4>
                <p className="text-blue-100 text-sm">
                  Med vår tjeneste slipper du å bruke timer på research og telefonsamtaler med ulike strømleverandører.
                </p>
              </div>
            </div>

            {/* USP 2 */}
            <div className="bg-[#1c4ada] rounded-lg p-6 flex flex-col items-start justify-start gap-6">
              <div className="border-[6px] border-[#ffe797] rounded-full w-[64px] h-[64px] flex items-center justify-center p-[17px]">
                <span className="text-white text-2xl font-bold">2</span>
              </div>
              <div>
                <h4 className="text-white text-lg font-semibold mb-2">Du sparer penger</h4>
                <p className="text-blue-100 text-sm">
                  Vi sammenligner tilbud fra flere leverandører og finner de beste prisene tilpasset ditt forbruk.
                </p>
              </div>
            </div>

            {/* USP 3 */}
            <div className="bg-[#1c4ada] rounded-lg p-6 flex flex-col items-start justify-start gap-6">
              <div className="border-[6px] border-[#ffe797] rounded-full w-[64px] h-[64px] flex items-center justify-center p-[17px]">
                <span className="text-white text-2xl font-bold">3</span>
              </div>
              <div>
                <h4 className="text-white text-lg font-semibold mb-2">Trygg og sikker</h4>
                <p className="text-blue-100 text-sm">
                  Vi jobber kun med seriøse, etablerte strømleverandører som er godkjent av norske myndigheter.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Forbrukerrådet Quote Section */}
      <section className="bg-gradient-to-r from-green-50 to-blue-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 border-l-4 border-green-500">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <svg className="w-12 h-12 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                </svg>
              </div>
              <div className="flex-1">
                <blockquote className="text-lg text-gray-700 leading-relaxed mb-4">
                  "Med et årlig forbruk på 20 000 kWh kan du spare over <span className="font-bold text-green-600">4 000 kroner</span> på å bytte fra en ordinær variabel avtale til en spotprisavtale. Hvis du bytter fra den dyreste variable avtalen til den beste spotprisavtalen, blir besparelsen enda større."
                </blockquote>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <div>
                    <cite className="font-semibold text-gray-900">Forbrukerrådet</cite>
                    <p className="text-sm text-gray-500">Norges ledende forbrukerorganisasjon</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Hvorfor velge oss?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Vi har hjulpet tusenvis av nordmenn med å finne billigere strøm
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💰</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Spar penger</h3>
              <p className="text-gray-600">
                Finn de beste prisene og spar tusenvis av kroner årlig på strømregningen din
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Enkelt og raskt</h3>
              <p className="text-gray-600">
                Få tilbud på under 2 minutter - helt uten krøll eller kompliserte skjemaer
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔒</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">100% gratis</h3>
              <p className="text-gray-600">
                Ingen skjulte kostnader eller forpliktelser - sammenlign helt gratis
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-full text-lg shadow-lg transform transition hover:scale-105"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              Få gratis tilbud nå
            </button>
          </div>
        </div>
      </section>

      {/* Additional USP Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Hva bør du se etter når du velger strømleverandør?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Vi hjelper deg å finne den beste løsningen basert på dine behov
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* USP 1 */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-start mb-4">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <span className="text-2xl">⚡</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Store aktører gir flere fordeler</h3>
                  <p className="text-gray-600 mb-4">
                    De største strømleverandørene tilbyr ofte flere tilleggstjenester. Du får gjerne alt på ett sted: strøm, nettleie på samme faktura, kundefordeler, og tilgang til smart-tjenester.
                  </p>
                  <p className="text-sm text-gray-500 font-medium">
                    Velg en stor aktør hvis du ønsker en komplett løsning med flere tjenester samlet.
                  </p>
                </div>
              </div>
            </div>

            {/* USP 2 */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-start mb-4">
                <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <span className="text-2xl">⚡</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Kontroll over forbruket ditt</h3>
                  <p className="text-gray-600 mb-4">
                    Gode strømapper gir deg full oversikt over forbruket time for time. Du kan enkelt følge med på kostnader, sammenligne perioder, og finne ut når du bruker mest strøm.
                  </p>
                  <p className="text-sm text-gray-500 font-medium">
                    Med økt bevissthet rundt eget forbruk kan du spare betydelige summer. Sjekk om leverandøren tilbyr en moderne app uten ekstra kostnad.
                  </p>
                </div>
              </div>
            </div>

            {/* USP 3 */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-start mb-4">
                <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <span className="text-2xl">⚡</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart lading og tilleggstjenester</h3>
                  <p className="text-gray-600 mb-4">
                    Mange leverandører tilbyr nå smarte ladetjenester for elbil, gunstige forsikringsordninger, og løsninger for deg som produserer egen strøm (solceller).
                  </p>
                  <p className="text-sm text-gray-500 font-medium">
                    Vurder hvilke tilleggstjenester som er viktige for deg, og sammenlign tilbudene. Noen inkluderer disse tjenestene gratis, mens andre tar ekstra betalt.
                  </p>
                </div>
              </div>
            </div>

            {/* USP 4 */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-start mb-4">
                <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <span className="text-2xl">⚡</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Sjekk vilkårene nøye</h3>
                  <p className="text-gray-600 mb-4">
                    Les alltid det med liten skrift! Se etter skjulte gebyrer, påslag og binding. De beste leverandørene tilbyr fornøydhetsgaranti og fleksible betalingsløsninger som delbetaling eller utsettelse ved behov.
                  </p>
                  <p className="text-sm text-gray-500 font-medium">
                    Sjekk også kvaliteten på kundeservice – dette er spesielt viktig når strømprisene er høye eller det oppstår problemer.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-full text-lg shadow-lg transform transition hover:scale-105"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              Start sammenligning nå
            </button>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-white mb-2">10,000+</div>
              <div className="text-blue-200">Fornøyde brukere</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">4 000 kr</div>
              <div className="text-blue-200">Gjennomsnittlig årlig besparelse</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">1 min</div>
              <div className="text-blue-200">For å fylle ut skjema</div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust indicators for mobile */}
      <section className="md:hidden bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-600 mb-4">
            Tusenvis av nordmenn har allerede funnet billigere strøm gjennom oss
          </p>
          <div className="flex justify-center items-center space-x-6 text-gray-500">
            <div className="text-xs flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Norsk kundeservice
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
} 