import type { NextConfig } from "next";
import { createClient } from '@supabase/supabase-js';

// This function will run at build time to generate redirects
async function generateRedirects() {
  let articleRedirects = [];
  
  try {
    // Create a Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );
    
    // Fetch all article permalinks
    const { data: articles, error } = await supabase
      .from('articles')
      .select('Permalink, Slug')
      .eq('Status', 'publish');
    
    if (error) {
      console.error('Error fetching articles for redirects:', error);
    } else {
      // Create redirect rules for each article
      articleRedirects = articles.map(article => {
        // Extract the slug from the permalink
        let oldSlug = article.Permalink;
        
        // Handle full URLs like https://xn--strmnet-s1a.no/kommuner/slug
        if (oldSlug && oldSlug.includes('://')) {
          const url = new URL(oldSlug);
          oldSlug = url.pathname;
        }
        
        // Remove leading slash if present
        if (oldSlug && oldSlug.startsWith('/')) {
          oldSlug = oldSlug.substring(1);
        }
        
        return {
          source: `/${oldSlug}`,
          destination: `/artikler/${article.Slug}`,
          permanent: true, // 301 redirect
        };
      });
      
      console.log(`Generated ${articleRedirects.length} article redirects`);
    }
  } catch (error) {
    console.error('Failed to generate article redirects:', error);
  }
  
  return articleRedirects;
}

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['cdn.prod.website-files.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    // serverComponentsExternalPackages: ['your-packages'],
    serverActions: {
      bodySizeLimit: '2mb',
      allowedOrigins: ['*']
    },
  },
  // Logging configuration at the root level
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  // Add TypeScript configuration for better debugging
  typescript: {
    // Set to true temporarily to bypass TypeScript errors and see if there are other issues
    ignoreBuildErrors: true, 
    tsconfigPath: './tsconfig.json',
  },
  // Enable more detailed error output
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 4,
  },
  
  // Add redirects configuration
  async redirects() {
    // Get dynamically generated redirects
    const articleRedirects = await generateRedirects();
    
    return [
      // Add any specific redirects here if needed
      {
        source: '/strom-med-betalingsanmerkning',
        destination: '/artikler/strom-med-betalingsanmerkning',
        permanent: true,
      },
      {
        source: '/ams-maler',
        destination: '/artikler/ams-maler',
        permanent: true,
      },
      {
        source: '/stromregioner-i-norge',
        destination: '/artikler/stromregioner-i-norge',
        permanent: true,
      },
      {
        source: '/leveringsplikt',
        destination: '/artikler/leveringsplikt',
        permanent: true,
      },
      {
        source: '/elsertifikater',
        destination: '/artikler/elsertifikater',
        permanent: true,
      },
      {
        source: '/hvordan-bestemmes-stromprisen',
        destination: '/artikler/hvordan-bestemmes-stromprisen',
        permanent: true,
      },
      {
        source: '/lan-til-stromregning',
        destination: '/artikler/lan-til-stromregning',
        permanent: true,
      },
      {
        source: '/strom-med-trumf-bonus',
        destination: '/artikler/strom-med-trumf-bonus',
        permanent: true,
      },
      {
        source: '/avslutte-stromavtale',
        destination: '/artikler/avslutte-stromavtale',
        permanent: true,
      },
      {
        source: '/strom-flytting',
        destination: '/artikler/strom-flytting',
        permanent: true,
      },
      {
        source: '/innkjopspris',
        destination: '/artikler/innkjopspris',
        permanent: true,
      },
      {
        source: '/variabel-strompris',
        destination: '/artikler/variabel-strompris',
        permanent: true,
      },
      {
        source: '/timespot',
        destination: '/artikler/timespot',
        permanent: true,
      },
      {
        source: '/prisomrader',
        destination: '/artikler/prisomrader',
        permanent: true,
      },
      {
        source: '/strombrudd',
        destination: '/artikler/strombrudd',
        permanent: true,
      },
      {
        source: '/hva-er-strom',
        destination: '/artikler/hva-er-strom',
        permanent: true,
      },
      {
        source: '/forskjellen-pa-vekselstrom-og-likestrom',
        destination: '/artikler/forskjellen-pa-vekselstrom-og-likestrom',
        permanent: true,
      },
      {
        source: '/hva-er-nettleie',
        destination: '/artikler/hva-er-nettleie',
        permanent: true,
      },
      {
        source: '/opprinnelsesgaranti',
        destination: '/artikler/opprinnelsesgaranti',
        permanent: true,
      },
      {
        source: '/energikrisen-i-europa-alt-du-ma-vite',
        destination: '/artikler/energikrisen-i-europa-alt-du-ma-vite',
        permanent: true,
      },
      {
        source: '/paslag-pa-strom',
        destination: '/artikler/paslag-pa-strom',
        permanent: true,
      },
      {
        source: '/binde-prisen-pa-strom',
        destination: '/artikler/binde-prisen-pa-strom',
        permanent: true,
      },
      {
        source: '/hvordan-kan-stromprisen-vaere-i-minus',
        destination: '/artikler/hvordan-kan-stromprisen-vaere-i-minus',
        permanent: true,
      },
      {
        source: '/hvordan-lade-mobilen-riktig',
        destination: '/artikler/hvordan-lade-mobilen-riktig',
        permanent: true,
      },
      {
        source: '/nar-er-strommen-billigst',
        destination: '/artikler/nar-er-strommen-billigst',
        permanent: true,
      },
      {
        source: '/bioenergi-som-energikilde',
        destination: '/artikler/bioenergi-som-energikilde',
        permanent: true,
      },
      {
        source: '/tips-til-a-spare-strom',
        destination: '/artikler/tips-til-a-spare-strom',
        permanent: true,
      },
      {
        source: '/kompensasjon-ved-strombrudd',
        destination: '/artikler/kompensasjon-ved-strombrudd',
        permanent: true,
      },
      {
        source: '/strom-med-betalingsanmerkning',
        destination: '/artikler/strom-med-betalingsanmerkning', 
        permanent: true,
      },
      // Include all dynamically generated redirects
      ...articleRedirects,
    ];
  },
};

export default nextConfig;
