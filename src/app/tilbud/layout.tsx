import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Få tilbud fra strømleverandører | Strømnet.no",
  description: "Få uforpliktende tilbud fra flere strømleverandører. Sammenlign priser og finn den beste strømavtalen for din bolig helt gratis.",
};

export default function TilbudLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <React.Fragment>{children}</React.Fragment>;
} 