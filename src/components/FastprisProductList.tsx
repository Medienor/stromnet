import React, { useState } from 'react';
import Link from 'next/link';
import { 
  calculateEnhancedMonthlyCost, 
  getPriceBreakdown 
} from '../utils/electricityPrices';

interface FastprisProductListProps {
  deals: any[];
  priceData: any;
  annualConsumption: number;
  expandedDeal: string | null;
  toggleDealExpansion: (dealId: string) => void;
  providerLogoUrls: Record<string, string>;
  providers: any[];
  formatPrice: (price: number) => string;
  formatMonthlyCost: (cost: number) => string;
  formatConsumption: (consumption: number) => string;
  getProductTypeNorwegian: (type: string) => string;
  getCurrentMonthName: () => string;
  getCurrentDate: () => string;
}

const priceAreas = [
  { id: 'NO', name: 'Hele Norge' },
  { id: 'NO1', name: 'Øst-Norge (NO1)' },
  { id: 'NO2', name: 'Sør-Norge (NO2)' },
  { id: 'NO3', name: 'Midt-Norge (NO3)' },
  { id: 'NO4', name: 'Nord-Norge (NO4)' },
  { id: 'NO5', name: 'Vest-Norge (NO5)' }
];

const FastprisProductList: React.FC<FastprisProductListProps> = ({
  deals,
  priceData,
  annualConsumption,
  expandedDeal,
  toggleDealExpansion,
  providerLogoUrls,
  providers,
  formatPrice,
  formatMonthlyCost,
  formatConsumption,
  getProductTypeNorwegian,
  getCurrentMonthName,
  getCurrentDate
}) => {
  const [selectedPriceArea, setSelectedPriceArea] = useState('NO');

  // Filter for fixed price deals only
  const fastprisDeals = deals
    .filter(deal => deal.productType === 'fixed' || deal.productType === 'FIXED')
    .filter(deal => {
      // Filter by price area
      if (!deal.salesNetworks || deal.salesNetworks.length === 0) return false;
      
      // If NO is selected, show all deals
      if (selectedPriceArea === 'NO') return true;
      
      // Otherwise, check if the deal is available in the selected area
      return deal.salesNetworks.some(network => network.id === selectedPriceArea);
    })
    .map(deal => {
      // Find the price for the selected area
      const networkPrice = deal.salesNetworks.find(network => 
        network.id === selectedPriceArea || network.id === 'NO'
      );
      
      const fixedPrice = networkPrice?.kwPrice || 0;
      
      return {
        ...deal,
        fixedPrice,
        calculatedMonthlyPrice: calculateEnhancedMonthlyCost(
          { ...deal, fixedPrice },
          annualConsumption,
          fixedPrice || priceData?.nationalAverage || 75
        )
      };
    })
    .sort((a, b) => a.calculatedMonthlyPrice - b.calculatedMonthlyPrice)
    .slice(0, 5);

  // If no fixed price deals are available, show a helpful message
  if (!fastprisDeals.length) {
    return (
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <label htmlFor="priceArea" className="block text-sm font-medium text-gray-700">
              Velg prisområde:
            </label>
            <select
              id="priceArea"
              name="priceArea"
              className="mt-1 block w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={selectedPriceArea}
              onChange={(e) => setSelectedPriceArea(e.target.value)}
            >
              {priceAreas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">Ingen fastprisavtaler tilgjengelig</h3>
          <p className="mt-1 text-sm text-gray-500">
            For øyeblikket har vi ingen fastprisavtaler i {priceAreas.find(area => area.id === selectedPriceArea)?.name} i vår database. 
            Dette kan skyldes at leverandørene ikke tilbyr fastprisavtaler i dette området for tiden.
          </p>
          <div className="mt-6">
            <Link href="/spot-strom" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Se spotprisavtaler i stedet
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden rounded-lg">
      {/* Price Area Selector */}
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <label htmlFor="priceArea" className="block text-sm font-medium text-gray-700">
            Velg prisområde:
          </label>
          <select
            id="priceArea"
            name="priceArea"
            className="mt-1 block w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={selectedPriceArea}
            onChange={(e) => setSelectedPriceArea(e.target.value)}
          >
            {priceAreas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Mobile view - card layout */}
      <div className="md:hidden">
        {fastprisDeals.map((deal, index) => {
          const isExpanded = expandedDeal === `fastpris-${deal.id}`;
          const priceBreakdown = getPriceBreakdown(
            { ...deal, fixedPrice: deal.fixedPrice }, 
            annualConsumption, 
            deal.fixedPrice
          );
          
          return (
            <div key={`fastpris-${deal.id}`} className={`p-4 border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
              <div className="flex items-center mb-3">
                {deal.provider?.organizationNumber && providerLogoUrls[deal.provider.organizationNumber] ? (
                  <div className="mr-3">
                    <img 
                      src={providerLogoUrls[deal.provider.organizationNumber]} 
                      alt={`${deal.provider?.name || 'Ukjent leverandør'} logo`}
                      className="h-12 w-12 object-contain"
                    />
                  </div>
                ) : (
                  <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-xl font-bold text-blue-600">
                      {(deal.provider?.name || 'U').charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <div className="font-medium text-gray-900">{deal.provider?.name || 'Ukjent leverandør'}</div>
                  <div className="text-sm text-gray-700">{deal.name}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-gray-50 p-2 rounded">
                  <div className="text-xs text-gray-500">Fast pris per kWh</div>
                  <div className="font-medium">
                    {formatPrice(deal.fixedPrice)} øre
                  </div>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <div className="text-xs text-gray-500">Månedlig kostnad</div>
                  <div className="font-medium">{formatMonthlyCost(deal.calculatedMonthlyPrice)} kr</div>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <div className="text-xs text-gray-500">Bindingstid</div>
                  <div className="font-medium">
                    {deal.agreementTime} {deal.agreementTimeUnit === 'year' ? 'år' : 'mnd'}
                  </div>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <div className="text-xs text-gray-500">Prisområde</div>
                  <div className="font-medium">
                    {priceAreas.find(area => area.id === selectedPriceArea)?.name || 'Alle'}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <button
                  onClick={() => toggleDealExpansion(`fastpris-${deal.id}`)}
                  className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                >
                  {isExpanded ? 'Skjul detaljer' : 'Vis detaljer'}
                </button>
                
                <Link 
                  href={deal.orderUrl || "/tilbud"}
                  className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Få tilbud
                </Link>
              </div>
              
              {/* Expanded Detail View */}
              {isExpanded && priceBreakdown && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Prisdetaljer</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Fast pris</span>
                          <span className="font-medium">{formatPrice(deal.fixedPrice)} øre/kWt</span>
                        </div>
                        {priceBreakdown.monthlyFee > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Fast månedsbeløp</span>
                            <span className="font-medium">{formatMonthlyCost(priceBreakdown.monthlyFee)} kr</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Ditt ca. forbruk {formatConsumption(priceBreakdown.monthlyConsumption)} kWt * {formatPrice(deal.fixedPrice)} øre</span>
                          <span className="font-medium">{formatMonthlyCost(priceBreakdown.energyCost)} kr</span>
                        </div>
                        <div className="flex justify-between text-base font-bold border-t border-blue-200 pt-2">
                          <span>Beregnet strømutgift for {getCurrentMonthName()}</span>
                          <span>{formatMonthlyCost(priceBreakdown.totalMonthlyCost)} kr</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Om avtalen</h3>
                      <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">Avtaletype</dt>
                          <dd className="mt-1 text-sm text-gray-900">Fastpris</dd>
                        </div>
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">Bindingstid</dt>
                          <dd className="mt-1 text-sm text-gray-900">{deal.agreementTime} {deal.agreementTimeUnit === 'year' ? 'år' : 'måneder'}</dd>
                        </div>
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">Prisområde</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {priceAreas.find(area => area.id === selectedPriceArea)?.name || 'Alle områder'}
                          </dd>
                        </div>
                        {deal.cancellationFee > 0 && (
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Bruddgebyr</dt>
                            <dd className="mt-1 text-sm text-gray-900">{formatMonthlyCost(deal.cancellationFee)} kr</dd>
                          </div>
                        )}
                      </dl>
                      
                      {deal.description && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-500">Beskrivelse</h4>
                          <p className="mt-1 text-sm text-gray-900">{deal.description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Desktop view - table layout */}
      <div className="hidden md:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Leverandør
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avtale
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pris per kWh
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Månedlig kostnad
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Detaljer
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {fastprisDeals.map((deal, index) => {
              const isExpanded = expandedDeal === `fastpris-${deal.id}`;
              const priceBreakdown = getPriceBreakdown(
                { ...deal, fixedPrice: deal.fixedPrice }, 
                annualConsumption, 
                deal.fixedPrice
              );
              
              return (
                <React.Fragment key={`fastpris-${deal.id}`}>
                  <tr className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {deal.provider?.organizationNumber && providerLogoUrls[deal.provider.organizationNumber] ? (
                          <div className="flex-shrink-0 h-10 w-10">
                            <img 
                              src={providerLogoUrls[deal.provider.organizationNumber]} 
                              alt={`${deal.provider?.name || 'Ukjent leverandør'} logo`}
                              className="h-10 w-10 object-contain"
                            />
                          </div>
                        ) : (
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-lg font-medium text-blue-600">
                              {(deal.provider?.name || 'U').charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{deal.provider?.name || 'Ukjent leverandør'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{deal.name}</div>
                      <div className="text-xs text-gray-500">
                        {deal.agreementTime} {deal.agreementTimeUnit === 'year' ? 'års' : 'måneders'} bindingstid
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatPrice(deal.fixedPrice)} øre
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatMonthlyCost(deal.calculatedMonthlyPrice)} kr
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => toggleDealExpansion(`fastpris-${deal.id}`)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        {isExpanded ? 'Skjul detaljer' : 'Vis detaljer'}
                      </button>
                    </td>
                  </tr>
                  
                  {/* Expanded Detail View */}
                  {isExpanded && priceBreakdown && (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 bg-blue-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Prisdetaljer</h3>
                            <div className="space-y-3">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Fast pris</span>
                                <span className="font-medium">{formatPrice(deal.fixedPrice)} øre/kWt</span>
                              </div>
                              {priceBreakdown.monthlyFee > 0 && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Fast månedsbeløp</span>
                                  <span className="font-medium">{formatMonthlyCost(priceBreakdown.monthlyFee)} kr</span>
                                </div>
                              )}
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Ditt ca. forbruk {formatConsumption(priceBreakdown.monthlyConsumption)} kWt * {formatPrice(deal.fixedPrice)} øre</span>
                                <span className="font-medium">{formatMonthlyCost(priceBreakdown.energyCost)} kr</span>
                              </div>
                              <div className="flex justify-between text-base font-bold border-t border-blue-200 pt-2">
                                <span>Beregnet strømutgift for {getCurrentMonthName()}</span>
                                <span>{formatMonthlyCost(priceBreakdown.totalMonthlyCost)} kr</span>
                              </div>
                            </div>
                            
                            <div className="mt-6">
                              <Link 
                                href={deal.orderUrl || "/tilbud"}
                                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                              >
                                Få tilbud
                              </Link>
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Om avtalen</h3>
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                              <div className="sm:col-span-1">
                                <dt className="text-sm font-medium text-gray-500">Avtaletype</dt>
                                <dd className="mt-1 text-sm text-gray-900">Fastpris</dd>
                              </div>
                              <div className="sm:col-span-1">
                                <dt className="text-sm font-medium text-gray-500">Bindingstid</dt>
                                <dd className="mt-1 text-sm text-gray-900">{deal.agreementTime} {deal.agreementTimeUnit === 'year' ? 'år' : 'måneder'}</dd>
                              </div>
                              <div className="sm:col-span-1">
                                <dt className="text-sm font-medium text-gray-500">Prisområde</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                  {priceAreas.find(area => area.id === selectedPriceArea)?.name || 'Alle områder'}
                                </dd>
                              </div>
                              {deal.cancellationFee > 0 && (
                                <div className="sm:col-span-1">
                                  <dt className="text-sm font-medium text-gray-500">Bruddgebyr</dt>
                                  <dd className="mt-1 text-sm text-gray-900">{formatMonthlyCost(deal.cancellationFee)} kr</dd>
                                </div>
                              )}
                            </dl>
                            
                            {deal.description && (
                              <div className="mt-4">
                                <h4 className="text-sm font-medium text-gray-500">Beskrivelse</h4>
                                <p className="mt-1 text-sm text-gray-900">{deal.description}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="bg-gray-50 px-6 py-4">
        <p className="text-sm text-gray-600">
          Den billigste fastprisavtalen i {priceAreas.find(area => area.id === selectedPriceArea)?.name} per {getCurrentDate()} er {fastprisDeals[0]?.name} fra {fastprisDeals[0]?.provider?.name}. 
          Denne strømavtalen har en fast pris på {formatPrice(fastprisDeals[0]?.fixedPrice)} øre per kWh og en estimert månedspris på {formatMonthlyCost(fastprisDeals[0]?.calculatedMonthlyPrice)} kr ved et årlig forbruk på {formatConsumption(annualConsumption)} kilowattimer.
        </p>
        <div className="mt-4 text-center">
          <Link href="/fastpris-strom" className="text-blue-600 hover:text-blue-800 font-medium">
            Se alle fastprisavtaler på strøm
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FastprisProductList; 