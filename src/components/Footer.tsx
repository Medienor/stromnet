import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-white font-inter border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link href="/" className="inline-block transition-opacity hover:opacity-80">
              <div className="relative h-10 w-40">
                <Image 
                  src="/images/stromnetwhite.svg" 
                  alt="Strømnet Logo" 
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Strømnet er Norges ledende sammenligningstjeneste for strømavtaler. Vi hjelper deg å finne den beste og billigste strømavtalen for ditt forbruk.
            </p>
            <div className="flex space-x-4 pt-2">
              {/* Social placeholders */}
              {['facebook', 'twitter', 'linkedin', 'instagram'].map((social) => (
                <a key={social} href="#" className="text-slate-500 hover:text-white transition-colors duration-200" aria-label={`Follow on ${social}`}>
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 transition-colors">
                    <span className="sr-only">{social}</span>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                  </div>
                </a>
              ))}
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-white text-xs font-bold uppercase tracking-widest mb-6 border-b border-slate-800 pb-2 inline-block">Snarveier</h3>
            <ul className="space-y-3">
              {[
                { label: 'Artikler & Guider', href: '/artikler' },
                { label: 'For Borettslag', href: '/borettslag' },
                { label: 'Alle Strømleverandører', href: '/stromleverandorer' },
                { label: 'Dagens strømpris', href: '/dagens-strompris' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-slate-400 hover:text-blue-400 hover:translate-x-1 transition-all duration-200 inline-block text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Areas */}
          <div>
            <h3 className="text-white text-xs font-bold uppercase tracking-widest mb-6 border-b border-slate-800 pb-2 inline-block">Områder</h3>
            <ul className="space-y-3">
              {[
                { label: 'Oslo', href: '/kommune/oslo' },
                { label: 'Bergen', href: '/kommune/bergen' },
                { label: 'Trondheim', href: '/kommune/trondheim' },
                { label: 'Stavanger', href: '/kommune/stavanger' },
                { label: 'Se alle kommuner', href: '/kommune' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-slate-400 hover:text-blue-400 hover:translate-x-1 transition-all duration-200 inline-block text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Useful Info */}
          <div>
            <h3 className="text-white text-xs font-bold uppercase tracking-widest mb-6 border-b border-slate-800 pb-2 inline-block">Informasjon</h3>
            <ul className="space-y-3">
              {[
                { label: 'Om oss', href: '/om-oss' },
                { label: 'Personvern', href: '/personvern' },
                { label: 'Brukervilkår', href: '/brukervilkar' },
                { label: 'Kontakt oss', href: 'mailto:post@stromnet.no' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-slate-400 hover:text-blue-400 hover:translate-x-1 transition-all duration-200 inline-block text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
          <p>© {currentYear} Netsure AS. Alle rettigheter reservert.</p>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <span className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
              Tjenesten er gratis å bruke
            </span>
            <span>MVA 834 762 102</span>
          </div>
        </div>
      </div>
    </footer>
  );
}