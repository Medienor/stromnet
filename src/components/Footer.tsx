import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white py-12 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="inline-block mb-6">
              <div className="text-4xl font-bold">
                <span className="text-indigo-900">Strøm</span>
                <span className="text-indigo-700">net</span>
              </div>
            </Link>
          </div>
          
          <div>
            <h3 className="text-gray-600 uppercase text-sm font-medium tracking-wider mb-4">SNARVEIER</h3>
            <ul className="space-y-2">
              <li><Link href="/artikler" className="text-gray-700 hover:text-indigo-700">Artikler</Link></li>
              <li><Link href="/borettslag" className="text-gray-700 hover:text-indigo-700">Borettslag</Link></li>
              <li><Link href="/stromleverandorer" className="text-gray-700 hover:text-indigo-700">Strømleverandører</Link></li>
              <li><Link href="/dagens-strompris" className="text-gray-700 hover:text-indigo-700">Dagens strømpris</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-gray-600 uppercase text-sm font-medium tracking-wider mb-4">OMRÅDER</h3>
            <ul className="space-y-2">
              <li><Link href="/kommuner/oslo" className="text-gray-700 hover:text-indigo-700">Oslo</Link></li>
              <li><Link href="/kommuner/bergen" className="text-gray-700 hover:text-indigo-700">Bergen</Link></li>
              <li><Link href="/kommuner/trondheim" className="text-gray-700 hover:text-indigo-700">Trondheim</Link></li>
              <li><Link href="/kommuner/stavanger" className="text-gray-700 hover:text-indigo-700">Stavanger</Link></li>
              <li><Link href="/kommuner" className="text-gray-700 hover:text-indigo-700">Alle kommuner</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-gray-600 uppercase text-sm font-medium tracking-wider mb-4">NYTTIG</h3>
            <ul className="space-y-2">
              <li><Link href="/om-oss" className="text-gray-700 hover:text-indigo-700">Om oss</Link></li>
              <li><Link href="/personvern" className="text-gray-700 hover:text-indigo-700">Personvern</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 text-gray-600 text-sm">
          <p>2025 © Stromnet.no | <a href="mailto:post@stromnet.no" className="hover:text-indigo-700">post@stromnet.no</a></p>
        </div>
      </div>
    </footer>
  );
} 