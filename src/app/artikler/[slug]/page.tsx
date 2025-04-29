import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StickyCtaBanner from '@/components/StickyCtaBanner';
import TableOfContents from './TableOfContents';
import RelatedArticles from './RelatedArticles';
import { promises as fs } from 'fs';
import path from 'path';

// Use ISR for individual articles too
export const revalidate = 3600;

// Generate metadata for the page
export async function generateMetadata({ params }: { params: { slug: string } }) {
  // Simpler slug extraction
  const { slug } = params;

  const article = await getArticleBySlug(slug);
  
  if (!article) {
    return {
      title: 'Artikkel ikke funnet | Strømnet.no',
      description: 'Beklager, vi kunne ikke finne artikkelen du leter etter.'
    };
  }
  
  return {
    title: `${article.Title} | Strømnet.no`,
    description: article.Excerpt?.replace(/<[^>]*>/g, '').substring(0, 160) || 
      'Les mer om strøm, strømavtaler og strømleverandører på Strømnet.no'
  };
}

// Generate static paths at build time for SEO
export async function generateStaticParams() {
  const { data: articles } = await supabase
    .from('articles')
    .select('Slug')
    .eq('Status', 'publish');

  return articles?.map(({ Slug }) => ({
    slug: Slug,
  })) || [];
}

// Add dynamic route handling
export const dynamic = 'force-dynamic';
export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await getArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }
  
  // Get related articles
  const relatedArticles = await getRelatedArticles(article.ID, 3);
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Breadcrumbs */}
          <nav className="mb-6">
            <ol className="flex items-center space-x-2 text-sm text-gray-600">
              <li>
                <Link href="/" className="hover:text-indigo-600 transition-colors">
                  Hjem
                </Link>
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 mx-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </li>
              <li>
                <Link href="/artikler" className="hover:text-indigo-600 transition-colors">
                  Artikler
                </Link>
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 mx-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </li>
              <li className="text-gray-900 font-medium truncate max-w-xs">
                {article.Title}
              </li>
            </ol>
          </nav>
          
          {/* Article Header - Updated styling */}
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-3 leading-tight font-inter">
              {article.Title}
            </h1>
            {article.Date && (
              <p className="text-gray-600 text-base">
                Publisert: {new Date(article.Date).toLocaleDateString('nb-NO', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            )}
          </div>
          
          {/* Featured Image - Updated styling */}
          <div className="relative w-full aspect-[16/9] mb-8">
            <Image 
              src={`/images/${article.ID}.${article.imageExtension || 'jpg'}`}
              alt={article.Title}
              fill
              className="object-cover rounded-lg"
              priority
            />
          </div>
          
          {/* Two-column layout */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main content column - 70% */}
            <div className="lg:w-[70%]">
              {/* Table of Contents - only visible on mobile */}
              <div className="lg:hidden mb-8">
                <TableOfContents content={article.Content || ''} />
              </div>
              
              {/* Article Content */}
              <div 
                className="prose prose-lg max-w-none article-content"
                dangerouslySetInnerHTML={{ __html: article.Content || '' }}
              />
              
              {/* Back to Articles */}
              <div className="mt-16 pt-6 border-t border-gray-200">
                <Link 
                  href="/artikler" 
                  className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                  </svg>
                  Tilbake til alle artikler
                </Link>
              </div>
            </div>
            
            {/* Sidebar column - 30% */}
            <div className="lg:w-[30%]">
              {/* Table of Contents - hidden on mobile */}
              <div className="hidden lg:block sticky top-24">
                <TableOfContents content={article.Content || ''} />
                
                {/* Related Articles */}
                <div className="bg-white rounded-xl shadow-md p-5 mt-8">
                  <h3 className="font-semibold text-lg text-gray-900 mb-4">Relaterte artikler</h3>
                  <RelatedArticles articles={relatedArticles} />
                </div>
              </div>
            </div>
          </div>
          
          {/* Related Articles - only visible on mobile */}
          <div className="lg:hidden mt-12">
            <div className="bg-white rounded-xl shadow-md p-5">
              <h3 className="font-semibold text-lg text-gray-900 mb-4">Relaterte artikler</h3>
              <RelatedArticles articles={relatedArticles} />
            </div>
          </div>
        </div>
      </main>
      
      <StickyCtaBanner />
      <Footer />
    </div>
  );
}

// Function to get article by slug
async function getArticleBySlug(slug: string) {
  // Check if slug is valid before querying
  if (!slug) {
    console.error('getArticleBySlug called with invalid slug:', slug);
    return null;
  }
  // Add detailed logging for the specific slug causing issues
  console.log(`[getArticleBySlug] Attempting to fetch article with slug: ${slug}`);
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      // Use the slug string directly in the query
      .eq('Slug', slug)
      .eq('Status', 'publish')
      .single();

    if (error) {
      // Log the specific Supabase error
      console.error(`[getArticleBySlug] Supabase error fetching article by slug '${slug}':`, error);
      // Handle specific errors like 'PGRST116' (No rows found) gracefully
      if (error.code === 'PGRST116') {
        console.log(`[getArticleBySlug] Article with slug '${slug}' not found or not published.`);
        return null; // Not found is not an unexpected error
      }
      throw error; // Re-throw other errors
    }

    if (data) {
      console.log(`[getArticleBySlug] Successfully fetched article data for slug '${slug}'. ID: ${data.ID}`);
      // Default extension if none is found
      let foundExtension = 'webp';
      
      // Check which extension exists
      const extensions = ['jpg', 'png', 'jpeg', 'webp'];
      const publicDir = path.join(process.cwd(), 'public', 'images');
      
      for (const ext of extensions) {
        const filePath = path.join(publicDir, `${data.ID}.${ext}`);
        try {
          await fs.access(filePath);
          foundExtension = ext;
          console.log(`[getArticleBySlug] Found image file for ID ${data.ID} with extension: ${ext}`);
          break;
        } catch {
          // console.log(`[getArticleBySlug] Image file ${data.ID}.${ext} not found.`); // Optional: uncomment for very detailed debugging
          continue;
        }
      }
      
      // Always set an extension, even if we didn't find the file
      data.imageExtension = foundExtension;
      console.log(`[getArticleBySlug] Set imageExtension to '${foundExtension}' for article ID ${data.ID}`);
    } else {
      // This case should technically be covered by error.code === 'PGRST116', but log just in case
      console.log(`[getArticleBySlug] No data returned for slug '${slug}', but no Supabase error reported.`);
    }
    
    return data;
  } catch (error) {
    // Log the caught error
    console.error(`[getArticleBySlug] Unexpected error fetching article with slug '${slug}':`, error);
    return null;
  }
}

// Function to get related articles
async function getRelatedArticles(currentArticleId, limit = 3) {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('ID, Title, Slug, "Image URL", "Image Alt Text", Excerpt')
      .eq('Status', 'publish')
      .neq('ID', currentArticleId)
      .order('Date', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching related articles:', error);
      return [];
    }
    
    // Map articles and preserve their image extensions
    const articlesWithImages = data.map(article => {
      let extension = 'webp'; // default
      if (article["Image URL"]) {
        const match = article["Image URL"].match(/\.(png|webp|jpg|jpeg)$/i);
        if (match) {
          extension = match[1].toLowerCase();
        }
      }
      
      return {
        ...article,
        "Image URL": `/images/${article.ID}.${extension}`
      };
    });
    
    return articlesWithImages;
  } catch (error) {
    console.error('Unexpected error:', error);
    return [];
  }
} 