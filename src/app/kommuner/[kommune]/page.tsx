import { Metadata } from 'next';
import KommuneClient from './KommuneClient';
import municipalitiesData from '../../data/municipalities.json';

// Define the params type according to Next.js App Router expectations
type Props = {
  params: { kommune: string };
  searchParams: Record<string, string | string[] | undefined>;
};

// Update the component signature to match Next.js expectations
export default function KommunePage({ params }: any) {
  const kommuneNavn = params.kommune;
  
  return <KommuneClient kommuneNavn={kommuneNavn} />;
}

// Update the generateMetadata function signature
export async function generateMetadata({ params }: any): Promise<Metadata> {
  const kommuneNavn = params.kommune;
  
  // Capitalize the kommune name for better display
  const capitalizedName = kommuneNavn
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  return {
    title: `Strømavtaler i ${capitalizedName} - Sammenlign beste tilbud`,
    description: `Finn de beste strømavtalene i ${capitalizedName}. Sammenlign priser og vilkår fra ledende strømleverandører.`,
  };
}

// Generate static params for all known municipalities
export function generateStaticParams() {
  return municipalitiesData.map((municipality: any) => ({
    kommune: municipality.name.toLowerCase().replace(/\s+/g, '-'),
  }));
} 