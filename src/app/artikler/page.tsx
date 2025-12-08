import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArticlesList } from './ArticlesList';
import fs from 'fs';
import path from 'path';

export const metadata = {
  title: 'Artikler om strøm og strømavtaler | Strømnet.no',
  description: 'Les våre artikler om strøm, strømavtaler, strømleverandører og alt annet du trenger å vite om strømmarkedet i Norge.',
};

export const revalidate = 3600; // Revalidate every hour

// This becomes a Server Component
export default async function ArticlesPage() {
  const { data: articles, error } = await supabase
    .from('articles')
    .select('*')
    .eq('Status', 'publish')
    .order('Date', { ascending: false });
  
  if (error) {
    console.error('Error fetching articles:', error);
    return <div>Error loading articles</div>;
  }
  
  // Check for local images for each article
  const articlesWithImages = articles?.map(article => {
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
  }) || [];
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section with Form */}
        <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
          <div className="absolute inset-0 z-0">
            <Image 
              src="/bg-img.jpg"
              alt="Background"
              fill
              className="object-cover opacity-30"
              priority
            />
            <div className="absolute inset-0 bg-black opacity-50"></div>
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-5 gap-12 items-center">
                <div className="text-center md:text-left md:col-span-3">
                  <h1 className="text-4xl md:text-5xl font-bold mb-6">Artikler om strøm og strømavtaler</h1>
                  <p className="text-xl mb-8">Lær mer om strømmarkedet, strømavtaler og hvordan du kan spare penger på strømregningen</p>
                  
                  <div className="flex flex-col md:flex-row gap-4 mb-8 justify-center md:justify-start">
                    <Link 
                      href="/tilbud" 
                      className="bg-white text-blue-700 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg shadow-md transition-colors duration-300"
                    >
                      Sammenlign strømavtaler
                    </Link>
                    <Link 
                      href="/stromavtaler" 
                      className="bg-transparent hover:bg-blue-700 text-white border-2 border-white font-bold py-3 px-8 rounded-lg transition-colors duration-300"
                    >
                      Se alle strømavtaler
                    </Link>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <div className="bg-white rounded-xl shadow-xl p-6 text-gray-800">
                    <h2 className="text-2xl font-bold mb-4 text-center text-blue-700">Finn beste strømavtale</h2>
                    <p className="text-gray-600 mb-6 text-center">Fyll ut skjemaet og få tilbud fra flere strømleverandører</p>
                    
                    <Link 
                      href="/tilbud" 
                      className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center font-bold py-3 px-4 rounded-lg transition-colors duration-300"
                    >
                      Start sammenligning
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Articles Grid - Made more compact */}
        <section className="py-10 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Alle artikler</h2>
            
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {articlesWithImages.map((article) => (
                  <Link 
                    key={article.ID} 
                    href={`/artikler/${article.Slug}`}
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col h-full"
                  >
                    <div className="relative h-40">
                      {article["Image URL"] ? (
                        <Image
                          src={article["Image URL"]}
                          alt={article["Image Alt Text"] || article.Title}
                          fill
                          className="object-cover rounded-t-lg"
                        />
                      ) : (
                        <div className="w-full h-full bg-blue-100 flex items-center justify-center rounded-t-lg">
                          <svg className="w-12 h-12 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4 flex-grow">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{article.Title}</h3>
                      {article.Excerpt && (
                        <div 
                          className="text-gray-600 text-sm line-clamp-2"
                          dangerouslySetInnerHTML={{ __html: article.Excerpt }}
                        />
                      )}
                    </div>
                    
                    <div className="px-4 pb-4">
                      <div className="flex items-center text-blue-600 font-medium text-sm">
                        <span>Les mer</span>
                        <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 bg-blue-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Klar til å finne den beste strømavtalen?</h2>
              <p className="text-xl text-gray-600 mb-8">
                Sammenlign strømavtaler fra flere leverandører og finn den beste avtalen for ditt forbruk.
              </p>
              <Link 
                href="/tilbud" 
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg shadow-md transition-colors duration-300"
              >
                Sammenlign strømavtaler nå
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}

// Quick Link Component
function QuickLink({ title, slug, isMore = false }) {
  return (
    <Link 
      href={isMore ? "/artikler" : `/artikler/${slug}`}
      className="bg-gray-50 p-4 rounded-lg shadow-sm hover:bg-indigo-50 transition-colors flex items-center justify-between"
    >
      <span className="text-indigo-900 font-medium">{title}</span>
      {isMore ? (
        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
        </svg>
      ) : (
        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
        </svg>
      )}
    </Link>
  );
}

// Move data fetching to a separate function
async function getArticles() {
  try {
    // Fetch articles from Supabase
    const { data: articles, error } = await supabase
      .from('articles')
      .select('*')
      .eq('Status', 'publish')
      .order('Date', { ascending: false });
    
    if (error) {
      console.error('Error fetching articles:', error);
      return {
        featuredArticles: [],
        allArticles: []
      };
    }
    
    // Process articles to handle null values and sanitize content
    const processedArticles = articles.map(article => ({
      ...article,
      Excerpt: article.Excerpt || '',
      Content: article.Content || '',
      "Image URL": article["Image URL"] || null,
      "Image Alt Text": article["Image Alt Text"] || article.Title || '',
    }));
    
    // Get featured articles (first 3)
    const featuredArticles = processedArticles.slice(0, 3);
    
    return {
      featuredArticles,
      allArticles: processedArticles
    };
  } catch (error) {
    console.error('Unexpected error:', error);
    return {
      featuredArticles: [],
      allArticles: []
    };
  }
} 