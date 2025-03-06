'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MultiStepForm from '@/components/MultiStepForm';

export default function BorettslagPage() {
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
                    Beste og billigste strømavtale til borettslag og sameier (mars 2025)
                  </h1>
                  <p className="text-xl mb-8">
                    Sammenlign strømavtaler og finn den beste løsningen for ditt borettslag eller sameie.
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
        
        {/* How to Compare Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center">
                Slik sammenligner du strømavtaler til borettslag
              </h2>
              
              <p className="text-gray-600 mb-8 text-center">
                Hos oss kan du enkelt sammenligne og finne billigste strømavtale for borettslag og sameier. 
                Det gjør du ved å følge denne prosessen:
              </p>
              
              <div className="grid md:grid-cols-4 gap-6 mb-12">
                <div className="bg-blue-50 rounded-lg p-6 text-center">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
                  <h3 className="font-medium text-gray-800 mb-2">Kom i gang</h3>
                  <p className="text-sm text-gray-600">Kom i gang ved å følge lenken i toppen av artikkelen.</p>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-6 text-center">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
                  <h3 className="font-medium text-gray-800 mb-2">Fyll ut skjema</h3>
                  <p className="text-sm text-gray-600">Fyll ut et skjema – det tar 30 sekunder.</p>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-6 text-center">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
                  <h3 className="font-medium text-gray-800 mb-2">Motta tilbud</h3>
                  <p className="text-sm text-gray-600">Vent på uforpliktende tilbud fra flere strømleverandører som leverer strømavtaler til borettslag i ditt område.</p>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-6 text-center">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">4</div>
                  <h3 className="font-medium text-gray-800 mb-2">Velg tilbud</h3>
                  <p className="text-sm text-gray-600">Velg beste tilbud, eller avslå alle. Valget er ditt.</p>
                </div>
              </div>
              
              <div className="relative h-[300px] w-full mb-12 rounded-lg overflow-hidden">
                <Image
                  src="/compare.png"
                  alt="Strøm til borettslag"
                  fill
                  style={{ objectFit: 'cover', objectPosition: 'center' }}
                  className="rounded-lg"
                  priority
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="text-white text-2xl font-bold bg-black bg-opacity-50 px-6 py-3 rounded-lg">Strøm til borettslag</h3>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Best Agreement Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center">
                Hvilken strømavtale er best for borettslaget?
              </h2>
              
              <p className="text-gray-600 mb-8 text-center">
                Valg av strømavtale for et borettslag eller sameie avhenger av flere faktorer, som størrelsen på arealene 
                strømmen skal dekke, hvor mye strøm som brukes og hva slags strømavtale som vil gi mest forutsigbarhet og minst risiko.
              </p>
              
              <p className="text-gray-600 mb-8 text-center">
                Videre vil vi se på fordeler og ulemper med følgende strømavtaler for sameier og borettslag.
              </p>
              
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-blue-600 mb-4">Spotpris</h3>
                  <p className="text-gray-600 mb-4">
                    Dette er en avtale der strømprisen følger markedet og kan variere fra time til time. Dette kan gi en lavere 
                    pris enn fastprisavtaler i perioder med lav etterspørsel, men kan også gi høyere priser i perioder med høy 
                    etterspørsel. Spotprisavtaler er best for borettslag og sameier som ønsker å følge med på markedet og ta 
                    risiko for prissvingninger.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-blue-600 mb-4">Fastpris</h3>
                  <p className="text-gray-600 mb-4">
                    Dette er en avtale der strømprisen er fast i en avtalt periode, vanligvis ett til to år. Dette gir 
                    forutsigbarhet for strømregningen, men kan være dyrere enn spotprisavtaler hvis strømprisen i markedet 
                    går ned. Fastprisavtaler er best for borettslag og sameier som ønsker forutsigbarhet i strømregningen 
                    og enklere budsjettering.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-blue-600 mb-4">Variabel avtale</h3>
                  <p className="text-gray-600 mb-4">
                    Dette er en avtale der strømprisen varierer med markedsprisen, men med en takgrense på prisen. Dette gir 
                    en viss grad av forutsigbarhet, samtidig som det er muligheter for lavere priser enn fastprisavtaler. 
                    Variabel avtale kan være egnet for borettslag og sameier som ønsker å balansere forutsigbarhet og 
                    muligheten for lavere priser.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-blue-600 mb-4">Forvaltningsstrøm</h3>
                  <p className="text-gray-600 mb-4">
                    Dette er en avtale der en strømforvalter kjøper strøm på vegne av kunden og forsøker å oppnå lavere 
                    priser enn spotpris. Strømforvalteren tar en avgift for tjenesten, og det er vanligvis en avtale med 
                    bindingstid. Forvaltningsstrøm kan være egnet for borettslag og sameier som ønsker å ha en strømforvalter 
                    til å ta seg av innkjøp av strøm og som ønsker å minimere risikoen for prissvingninger.
                  </p>
                </div>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-lg mb-12">
                <p className="text-gray-700">
                  Vi i strømnet vil alltid anbefale dere å sammenligne flere tilbud når du er på jakt etter beste strømavtale 
                  for borettslaget ditt. Ved hjelp av å klikke på lenken nedenfor kan du enkelt får uforpliktende tilbud fra 
                  flere strømleverandører som leverer strømavtaler til boligselskap.
                </p>
                
                <div className="text-center mt-6">
                  <Link 
                    href="/tilbud" 
                    className="inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-blue-700 transition-colors duration-300 shadow-md"
                  >
                    Klar? Finn billigste strøm til borettslag nå
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Nettleie Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
                    Betaler borettslag nettleie?
                  </h2>
                  
                  <p className="text-gray-600 mb-6">
                    Borettslag og sameier betaler i utgangspunktet nettleie på lik linje med ordinære forbrukere og andre 
                    bedrifter og organisasjoner. For øvrig er borettslag og sameier fritatt for nettleie på egenprodusert 
                    strøm. Dette medfører store besparelser for borettslag som har valgt å investere i solceller på taket.
                  </p>
                </div>
                
                <div className="relative h-[300px] w-full rounded-lg overflow-hidden">
                  <Image
                    src="/compare.png"
                    alt="Strømavtale borettslag"
                    fill
                    style={{ objectFit: 'cover', objectPosition: 'center' }}
                    className="rounded-lg"
                    priority
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h3 className="text-white text-2xl font-bold bg-black bg-opacity-50 px-6 py-3 rounded-lg">Strømavtale borettslag</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Strømstøtte Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center">
                Slik fungerer strømstøtte til borettslag og sameier
              </h2>
              
              <div className="bg-white p-8 rounded-lg shadow-md mb-12">
                <p className="text-gray-600 mb-6">
                  Borettslag og sameier har krav på strømstøtte tilsvarende private husholdninger. Dette i henhold til loven 
                  om strømstønad. Borettslaget vil kunne motta strømstøtte for opp til 5000 kWh per bolig. I tillegg kan 
                  borettslaget motta støtte for elbillading.
                </p>
              </div>
              
              <div className="bg-blue-50 p-8 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                  Velg billigste strømavtale til ditt sameie eller borettslag
                </h3>
                
                <p className="text-gray-600 mb-6 text-center">
                  Avslutningsvis vil vi anbefale deg å alltid velge billigste strømavtale til borettslaget. Det er store 
                  forskjeller i strømpriser mellom de ulike strømleverandørene. Derfor bør du alltid sammenligne ulike 
                  tilbud og bruke litt tid på å finne billigste og beste strømavtale for borettslag.
                </p>
                
                <div className="text-center">
                  <Link 
                    href="/tilbud" 
                    className="inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-blue-700 transition-colors duration-300 shadow-md"
                  >
                    Finn beste strømavtale til borettslag nå
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Sources Section */}
        <section className="py-8 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Kilder</h3>
              <ul className="text-gray-600 space-y-2">
                <li>
                  <a href="https://www.nrk.no" className="text-blue-600 hover:underline">NRK</a>
                </li>
                <li>
                  <a href="https://lovdata.no" className="text-blue-600 hover:underline">Lovdata</a>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
} 