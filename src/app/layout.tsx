import { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';

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
  title: `Beste og billigste strømavtale (${getCurrentMonthYear()}) - Strømnet.no`,
  description: 'Sammenlign strømpriser og finn den beste strømavtalen for din bolig. Spar penger på strømregningen med vår gratis prissammenligning.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="no">
      <head>
      </head>
      <body>{children}</body>
    </html>
  );
}
