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
  title: `Beste og billigste strømavtaler for bedrift (${getCurrentMonthYear()}) | Strømnet.no`,
  description: "Finn billigste og beste strømavtale for din bedrift. Sammenlign priser og få uforpliktende tilbud fra flere strømleverandører.",
};

export default function BedriftLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 