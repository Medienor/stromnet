import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Spotpris Strøm: Finn Norges billigste spotprisavtaler',
  description: 'Sammenlign og finn de billigste spotprisavtalene for strøm i Norge. Få oversikt over dagens spotpriser og spar penger på strømregningen.',
};

export default function SpotprisLayout({
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