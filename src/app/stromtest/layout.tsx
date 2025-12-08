import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Strømtest kalkulator | Se om du overbetaler',
  description: 'Test din strømavtale og se om du betaler for mye. Sammenlign din nåværende strømavtale med dagens markedspriser og finn ut hvor mye du kan spare.',
  openGraph: {
    title: 'Strømtest kalkulator | Se om du overbetaler',
    description: 'Test din strømavtale og se om du betaler for mye. Sammenlign din nåværende strømavtale med dagens markedspriser.',
    type: 'website',
    locale: 'nb_NO',
  },
};

export default function StromTestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 