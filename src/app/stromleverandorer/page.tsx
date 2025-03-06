import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import ProvidersClient from './ProvidersClient';

export const metadata: Metadata = {
  title: 'Strømleverandører i Norge | Strømpriser og Informasjon',
  description: 'Komplett oversikt over alle strømleverandører i Norge. Finn informasjon om strømselskaper, organisasjonsnummer og lenker til prislister.',
};

export default function ProvidersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ProvidersClient />
    </div>
  );
} 