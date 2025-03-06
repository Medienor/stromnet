import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Beste strømavtale til borettslag og sameier (2025) | Strømnet',
  description: 'Sammenlign og finn billigste strømavtale for borettslag og sameier. Få uforpliktende tilbud fra flere strømleverandører og spar penger på strøm.',
  keywords: 'strømavtale borettslag, strøm til borettslag, strømavtale sameie, billig strøm borettslag, strømpris borettslag, strømstøtte borettslag',
  openGraph: {
    title: 'Beste strømavtale til borettslag og sameier (2025)',
    description: 'Sammenlign og finn billigste strømavtale for borettslag og sameier. Få uforpliktende tilbud fra flere strømleverandører.',
    url: 'https://www.stromnet.no/borettslag',
    siteName: 'Strømnet',
    images: [
      {
        url: 'https://www.stromnet.no/og-image-borettslag.jpg',
        width: 1200,
        height: 630,
        alt: 'Strømavtale til borettslag',
      },
    ],
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Beste strømavtale til borettslag og sameier (2025)',
    description: 'Sammenlign og finn billigste strømavtale for borettslag og sameier.',
    images: ['https://www.stromnet.no/og-image-borettslag.jpg'],
  },
  alternates: {
    canonical: 'https://www.stromnet.no/borettslag',
  },
};

export default function BorettslagLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
} 