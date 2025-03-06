import React from 'react';
import { Metadata } from 'next';

// Get current month and year in Norwegian
const getCurrentMonthYear = () => {
  const months = [
    'januar', 'februar', 'mars', 'april', 'mai', 'juni',
    'juli', 'august', 'september', 'oktober', 'november', 'desember'
  ];
  const date = new Date();
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
};

export const metadata: Metadata = {
  title: `Billigste fastpris strømavtaler (${getCurrentMonthYear()}) | Strømnet.no`,
  description: "Sammenlign og finn de billigste fastprisavtalene på strøm. Se hvilke strømleverandører som tilbyr de beste fastprisavtalene akkurat nå.",
};

export default function FastprisStromLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 