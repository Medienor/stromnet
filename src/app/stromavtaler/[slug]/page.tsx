import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductClient from './ProductClient';
import { Metadata } from 'next';

// Add these type definitions at the top of the file
interface Provider {
  name: string;
  organizationNumber: string;
  pricelistUrl?: string;
}

interface Product {
  id: string;
  name: string;
  productType: 'hourly_spot' | 'fixed' | 'variable' | string;
  provider: Provider;
  monthlyFee: number;
  addonPrice: number;
  elCertificatePrice: number;
  agreementTime: number;
  agreementTimeUnit?: 'day' | 'month' | 'year' | string;
  billingFrequency?: number;
  billingFrequencyUnit?: 'month' | 'year' | string;
  paymentType?: 'after' | 'before' | string;
  fixedPrice?: number;
  variablePrice?: number;
  markup?: number;
  maxKwhPerYear?: number;
  feeMandatoryType?: string;
  cabinProduct?: boolean;
  vatExemption?: boolean;
  salesNetworks?: Array<{
    name: string;
    type: string;
    kwPrice?: number;
  }>;
  associations?: string[];
  otherConditions?: string;
  standardAlert?: 'email' | 'sms' | string;
}

// Helper function to generate slug with type
function generateSlug(product: Product): string {
  const providerName = product.provider.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  const productName = product.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  return `${providerName}-${productName}`;
}

// Generate static paths at build time
export async function generateStaticParams() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/electricity-deals`);
    
    if (!response.ok) {
      console.error('Failed to fetch products for static generation');
      return [];
    }
    
    const data = await response.json();
    
    if (!data.success || !data.data || !data.data.products) {
      console.error('Invalid data format from API');
      return [];
    }
    
    return data.data.products.map((product: Product) => ({
      slug: generateSlug(product)
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Generate dynamic metadata for Next.js
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = params;
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/electricity-deals`, { next: { revalidate: 86400 } });
    
    if (!response.ok) {
      return {
        title: 'Strømavtale',
        description: 'Strømavtale detaljer',
      };
    }
    
    const data = await response.json();
    
    if (!data.success || !data.data || !data.data.products) {
      return {
        title: 'Strømavtale',
        description: 'Strømavtale detaljer',
      };
    }
    
    const product = data.data.products.find((p: Product) => generateSlug(p) === slug);
    
    if (!product) {
      return {
        title: 'Strømavtale',
        description: 'Strømavtale detaljer',
      };
    }
    
    // Format the agreement time text
    const getAgreementTimeText = (product: Product): string => {
      if (!product || !product.agreementTime || product.agreementTime === 0) {
        return 'Ingen bindingstid';
      }
      
      const unit = product.agreementTimeUnit === 'year' ? 'år' : 
                   product.agreementTimeUnit === 'month' ? 'måneder' : 
                   product.agreementTimeUnit === 'day' ? 'dager' : product.agreementTimeUnit;
                   
      return `${product.agreementTime} ${unit} bindingstid`;
    };
    
    // Generate the same title format as in React Helmet
    return {
      title: `${product.provider.name} - ${product.name} - ${getAgreementTimeText(product)} (Priser og omtaler)`,
      description: `${product.name} fra ${product.provider.name}. ${getAgreementTimeText(product)}. ${product.productType === 'hourly_spot' ? 'Spotprisavtale' : product.productType === 'fixed' ? 'Fastprisavtale' : 'Strømavtale'} med ${product.monthlyFee} kr i månedsgebyr og ${(product.addonPrice * 100).toFixed(2)} øre/kWh i påslag.`,
      openGraph: {
        title: `${product.provider.name} - ${product.name} - ${getAgreementTimeText(product)} (Priser og omtaler)`,
        description: `${product.name} fra ${product.provider.name}. ${getAgreementTimeText(product)}. Sammenlign strømavtaler og finn den beste strømavtalen for deg.`,
        type: 'website'
      }
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Strømavtale',
      description: 'Strømavtale detaljer',
    };
  }
}

// This is the correct typing for a Next.js App Router page component
export default async function Page({ params }: { params: { slug: string } }) {
  const { slug } = params;
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/electricity-deals`, { next: { revalidate: 86400 } });
    
    if (!response.ok) {
      return notFound();
    }
    
    const data = await response.json();
    
    if (!data.success || !data.data || !data.data.products) {
      return notFound();
    }
    
    const product = data.data.products.find((p: Product) => generateSlug(p) === slug);
    
    if (!product) {
      return notFound();
    }
    
    const otherProviderProducts = data.data.products.filter((p: Product) => 
      p.provider.organizationNumber === product.provider.organizationNumber && 
      p.id !== product.id
    ).slice(0, 4);
    
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main>
          <ProductClient 
            initialProduct={product} 
            initialOtherProducts={otherProviderProducts} 
          />
        </main>
        <Footer />
      </div>
    );
  } catch (error) {
    console.error('Error fetching product data:', error);
    return notFound();
  }
} 