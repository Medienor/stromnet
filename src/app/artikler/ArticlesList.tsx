'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export function ArticlesList({ allArticles }) {
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 9;
  
  // Calculate pagination
  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = allArticles.slice(indexOfFirstArticle, indexOfLastArticle);
  const totalPages = Math.ceil(allArticles.length / articlesPerPage);
  
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Alle artikler</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {currentArticles.map(article => (
          <div key={article.ID} className="bg-white rounded-xl shadow-md overflow-hidden">
            <Link href={`/artikler/${article.Slug}`}>
              <div className="relative h-40 w-full">
                {article["Image URL"] ? (
                  <Image 
                    src={article["Image URL"]} 
                    alt={article["Image Alt Text"] || article.Title} 
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="bg-gray-200 h-full w-full flex items-center justify-center">
                    <span className="text-gray-500">Ingen bilde</span>
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-2 text-gray-900">{article.Title}</h3>
                <p className="text-gray-600">
                  {article.Excerpt ? article.Excerpt.replace(/<[^>]*>/g, '').substring(0, 100) + '...' : 'Les mer om denne artikkelen'}
                </p>
              </div>
            </Link>
          </div>
        ))}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-12">
          <div className="inline-flex rounded-md shadow-sm">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-l-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Forrige
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 border border-gray-300 ${
                  currentPage === page
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-r-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Neste
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 