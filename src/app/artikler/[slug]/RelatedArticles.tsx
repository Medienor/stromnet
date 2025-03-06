import Link from 'next/link';

export default function RelatedArticles({ articles }) {
  if (!articles || articles.length === 0) {
    return (
      <p className="text-gray-500 italic">Ingen relaterte artikler funnet.</p>
    );
  }
  
  return (
    <div className="space-y-3">
      <ul className="space-y-3">
        {articles.map(article => (
          <li key={article.ID}>
            <Link 
              href={`/artikler/${article.Slug}`}
              className="block group"
            >
              <h4 className="text-gray-900 font-medium group-hover:text-blue-700 transition-colors">
                {article.Title}
              </h4>
              <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                {article.Excerpt ? article.Excerpt.replace(/<[^>]*>/g, '') : 'Les mer'}
              </p>
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