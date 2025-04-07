import Link from 'next/link';
import Image from 'next/image';

export default function RelatedArticles({ articles }) {
  if (!articles || articles.length === 0) {
    return (
      <p className="text-gray-500 italic">Ingen relaterte artikler funnet.</p>
    );
  }
  
  return (
    <div className="space-y-3">
      <ul className="space-y-4">
        {articles.map(article => (
          <li key={article.ID} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
            <Link 
              href={`/artikler/${article.Slug}`}
              className="flex items-start gap-3 group"
            >
              {/* Featured Image */}
              <div className="relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden bg-gray-100">
                {article["Image URL"] ? (
                  <Image 
                    src={article["Image URL"]} 
                    alt={article["Image Alt Text"] || article.Title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-50">
                    <svg className="w-8 h-8 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                )}
              </div>
              
              <div className="flex-grow">
                <h4 className="text-gray-900 font-medium group-hover:text-blue-700 transition-colors line-clamp-2">
                  {article.Title}
                </h4>
                <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                  {article.Excerpt ? article.Excerpt.replace(/<[^>]*>/g, '') : 'Les mer'}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      
      <div className="pt-3 mt-2 border-t border-gray-100">
        <Link 
          href="/artikler" 
          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
        >
          Se alle artikler
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
          </svg>
        </Link>
      </div>
    </div>
  );
} 