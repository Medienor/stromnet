import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TableOfContents from './TableOfContents';
import RelatedArticles from './RelatedArticles';
import fs from 'fs';
import path from 'path';

// Add revalidation
export const revalidate = 3600; // Revalidate every hour

// Generate metadata for the page
export async function generateMetadata({ params }) {
  // Properly handle params by using destructuring with await
  const { slug } = await Promise.resolve(params);
  
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

// Generate static params
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
export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const { data: article } = await supabase
    .from('articles')
    .select('*')
    .eq('Slug', params.slug)
    .eq('Status', 'publish')
    .single();

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
          {article["Image URL"] && (
            <div className="mb-8">
              <div className="relative w-full md:w-1/2 h-64 md:h-80 rounded-xl overflow-hidden shadow-lg">
                <Image 
                  src={article["Image URL"]} 
                  alt={article["Image Alt Text"] || article.Title} 
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          )}
          
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
      
      <Footer />
    </div>
  );
}

// Function to get article by slug
async function getArticleBySlug(slug) {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('Slug', slug)
      .eq('Status', 'publish')
      .single();
    
    if (error) {
      console.error('Error fetching article:', error);
      return null;
    }
    
    // Always check for local images, regardless of whether there's an existing Image URL
    if (data) {
      // Check for different image formats
      const possibleExtensions = ['png', 'webp', 'jpg', 'jpeg'];
      let foundImagePath = null;
      
      for (const ext of possibleExtensions) {
        // Define the expected image path
        const imagePath = `/images/${data.ID}.${ext}`;
        
        // Check if the image exists in the public folder
        const fullImagePath = path.join(process.cwd(), 'public', imagePath);
        
        if (fs.existsSync(fullImagePath)) {
          foundImagePath = imagePath;
          break;
        }
      }
      
      // Override the Image URL if a local image is found
      if (foundImagePath) {
        data["Image URL"] = foundImagePath;
      }
    }
    
    return data;
  } catch (error) {
    console.error('Unexpected error:', error);
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
    
    // Always check for local images for each related article
    const articlesWithImages = data.map(article => {
      // Check for different image formats
      const possibleExtensions = ['png', 'webp', 'jpg', 'jpeg'];
      let foundImagePath = null;
      
      for (const ext of possibleExtensions) {
        // Define the expected image path
        const imagePath = `/images/${article.ID}.${ext}`;
        
        // Check if the image exists in the public folder
        const fullImagePath = path.join(process.cwd(), 'public', imagePath);
        
        if (fs.existsSync(fullImagePath)) {
          foundImagePath = imagePath;
          break;
        }
      }
      
      // Override the Image URL if a local image is found
      if (foundImagePath) {
        return {
          ...article,
          "Image URL": foundImagePath
        };
      }
      
      return article;
    });
    
    return articlesWithImages;
  } catch (error) {
    console.error('Unexpected error:', error);
    return [];
  }
} 