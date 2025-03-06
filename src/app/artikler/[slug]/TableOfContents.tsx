'use client';

import { useState, useEffect } from 'react';

export default function TableOfContents({ content }) {
  const [headings, setHeadings] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    // Parse headings from content
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const headingElements = doc.querySelectorAll('h2, h3, h4, h5, h6');
    
    const extractedHeadings = Array.from(headingElements).map((heading, index) => {
      const id = heading.id || `heading-${index}`;
      const level = parseInt(heading.tagName.substring(1));
      return {
        id,
        text: heading.textContent,
        level
      };
    });
    
    setHeadings(extractedHeadings);
    
    // Add IDs to the actual DOM elements after the content is rendered
    setTimeout(() => {
      const articleContent = document.querySelector('.article-content');
      if (articleContent) {
        const renderedHeadings = articleContent.querySelectorAll('h2, h3, h4, h5, h6');
        renderedHeadings.forEach((heading, index) => {
          const id = `heading-${index}`;
          heading.id = id;
        });
      }
    }, 100);
    
    // Set up intersection observer for active heading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '0px 0px -80% 0px' }
    );
    
    setTimeout(() => {
      const articleHeadings = document.querySelectorAll('.article-content h2, .article-content h3, .article-content h4, .article-content h5, .article-content h6');
      articleHeadings.forEach((heading) => {
        observer.observe(heading);
      });
    }, 200);
    
    return () => {
      observer.disconnect();
    };
  }, [content]);
  
  if (headings.length === 0) return null;
  
  return (
    <div className="bg-white rounded-xl shadow-md p-5 mb-10">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full text-left font-semibold text-lg text-gray-900"
      >
        <span>Innholdsfortegnelse</span>
        <svg 
          className={`w-5 h-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
      
      {isOpen && (
        <nav className="mt-4 pt-4 border-t border-gray-100">
          <ul className="space-y-2">
            {headings.map((heading, index) => (
              <li 
                key={index}
                className={`${heading.level === 2 ? '' : 'ml-' + (heading.level - 2) * 4}`}
              >
                <a
                  href={`#${heading.id}`}
                  className={`block py-1 px-2 rounded transition-colors ${
                    activeId === heading.id
                      ? 'bg-indigo-50 text-indigo-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(heading.id)?.scrollIntoView({
                      behavior: 'smooth'
                    });
                  }}
                >
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
} 