import { MetadataRoute } from 'next';
import municipalitiesData from './data/municipalities.json';
import { supabase } from '@/lib/supabase';

// Helper function to create consistent slugs
function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

// Helper function to generate slug for products
function generateProductSlug(product: any): string {
  const providerName = product.provider.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  const productName = product.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  return `${providerName}-${productName}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://xn--strmnet-s1a.no';
  
  // Static pages
  const staticPages = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/artikler`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/stromavtaler`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/stromleverandorer`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/kommuner`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/om-oss`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/personvern`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/kontakt`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Dynamic pages - Municipalities
  const municipalities = municipalitiesData as any[];
  const municipalityPages = municipalities.map(municipality => {
    const kommuneSlug = createSlug(municipality.name);
    return {
      url: `${baseUrl}/kommuner/${kommuneSlug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    };
  });

  // Dynamic pages - Providers
  let providerPages = [];
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/providers`, { next: { revalidate: 3600 } });
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data) {
        providerPages = data.data.map((provider: any) => {
          const providerSlug = createSlug(provider.name);
          return {
            url: `${baseUrl}/stromleverandorer/${providerSlug}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
          };
        });
      }
    }
  } catch (error) {
    console.error('Error fetching providers for sitemap:', error);
  }

  // Dynamic pages - Products
  let productPages = [];
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/electricity-deals`, { next: { revalidate: 3600 } });
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data && data.data.products) {
        productPages = data.data.products.map((product: any) => {
          const productSlug = generateProductSlug(product);
          return {
            url: `${baseUrl}/stromavtaler/${productSlug}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.6,
          };
        });
      }
    }
  } catch (error) {
    console.error('Error fetching products for sitemap:', error);
  }

  // Dynamic pages - Articles
  let articlePages = [];
  try {
    // Direct server-side Supabase call
    const { data: articles, error } = await supabase
      .from('articles')
      .select('Slug, Date')
      .eq('Status', 'publish');
    
    if (error) {
      console.error('Error fetching articles for sitemap:', error);
    } else if (articles && articles.length > 0) {
      console.log(`Found ${articles.length} articles for sitemap`);
      articlePages = articles.map((article: any) => ({
        url: `${baseUrl}/artikler/${article.Slug}`,
        lastModified: article.Date ? new Date(article.Date) : new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }));
    } else {
      console.log('No articles found or articles array is empty');
    }
  } catch (error) {
    console.error('Unexpected error fetching articles for sitemap:', error);
  }

  // Combine all pages
  return [
    ...staticPages,
    ...municipalityPages,
    ...providerPages,
    ...productPages,
    ...articlePages,
  ];
} 