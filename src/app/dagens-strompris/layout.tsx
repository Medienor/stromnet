import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Dagens strømpris time for time - Sammenlign nå | Strømnet.no",
  description: "Se dagens strømpriser time for time i ditt område. Finn ut når strømmen er billigst og dyrest, og sammenlign strømavtaler for å spare penger.",
};

export default function DagensStromprisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 