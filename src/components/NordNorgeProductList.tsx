import React from 'react';
import Link from 'next/link';
import { 
  calculateEnhancedMonthlyCost, 
  getPriceBreakdown 
} from '../utils/electricityPrices';

interface NordNorgeProductListProps {
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

const NordNorgeProductList: React.FC<NordNorgeProductListProps> = ({
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
  if (!deals.length || !priceData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Ingen strømavtaler tilgjengelig for Nord-Norge for øyeblikket.</p>
      </div>
    );
  }

  // Use the correct Nord-Norge price (NO4 area)
  const nordNorgeSpotPrice = priceData.nordNorgeAverage || priceData.nationalAverage || 65.30; // Fallback to a realistic value
  
  // Filter and sort deals for Nord-Norge
  const nordNorgeDeals = deals
    .map(deal => ({
      ...deal,
      // Recalculate with Nord-Norge prices
      calculatedMonthlyPrice: calculateEnhancedMonthlyCost(
        deal,
        annualConsumption,
        nordNorgeSpotPrice
      )
    }))
    .sort((a, b) => a.calculatedMonthlyPrice - b.calculatedMonthlyPrice)
    .slice(0, 5);

  return (
    <div className="bg-white shadow overflow-hidden rounded-lg">
      {/* Mobile view - card layout */}
      <div className="md:hidden">
        {nordNorgeDeals.map((deal, index) => {
          const isExpanded = expandedDeal === `nordnorge-${deal.id}`;
          const priceBreakdown = getPriceBreakdown(deal, annualConsumption, nordNorgeSpotPrice);
          
          return (
            <div key={`nordnorge-${deal.id}`} className={`p-4 border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
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
                  <div className="text-xs text-gray-500">Pris per kWh</div>
                  <div className="font-medium">
                    {formatPrice(nordNorgeSpotPrice + deal.addonPrice)} øre
                  </div>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <div className="text-xs text-gray-500">Månedlig kostnad</div>
                  <div className="font-medium">{formatMonthlyCost(deal.calculatedMonthlyPrice)} kr</div>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <div className="text-xs text-gray-500">Type</div>
                  <div className="font-medium">{getProductTypeNorwegian(deal.productType)}</div>
                </div>
                {deal.agreementTime > 0 && (
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-xs text-gray-500">Bindingstid</div>
                    <div className="font-medium">
                      {deal.agreementTime} {deal.agreementTimeUnit === 'year' ? 'år' : 'mnd'}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between items-center">
                <button
                  onClick={() => toggleDealExpansion(`nordnorge-${deal.id}`)}
                  className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                >
                  {isExpanded ? 'Skjul detaljer' : 'Vis detaljer'}
                </button>
                
                <Link 
                  href="/tilbud"
                  className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Få tilbud
                </Link>
              </div>
              
              {/* Expanded Detail View */}
              {isExpanded && priceBreakdown && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h3 className="text-md font-medium text-gray-900 mb-3">Prisdetaljer</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nordpool spotpris Nord-Norge (NO4)</span>
                      <span className="font-medium">{formatPrice(priceBreakdown.spotPrice)} øre/kWt</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Påslag</span>
                      <span className="font-medium">{formatPrice(priceBreakdown.addonPrice)} øre/kWt</span>
                    </div>
                    {priceBreakdown.elCertificatePrice > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Elsertifikat</span>
                        <span className="font-medium">{formatPrice(priceBreakdown.elCertificatePrice)} øre/kWt</span>
                      </div>
                    )}
                    <div className="flex justify-between font-medium pt-2 border-t border-gray-200">
                      <span>Total pris per kWh</span>
                      <span>{formatPrice(priceBreakdown.totalKwhPrice)} øre</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Månedlig fastbeløp</span>
                      <span className="font-medium">{formatMonthlyCost(priceBreakdown.monthlyFee)} kr</span>
                    </div>
                    <div className="flex justify-between font-bold pt-2 border-t border-gray-200">
                      <span>Estimert månedspris</span>
                      <span>{formatMonthlyCost(priceBreakdown.totalMonthlyCost)} kr</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h3 className="text-md font-medium text-gray-900 mb-2">Om avtalen</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Avtaletype:</span>
                        <span className="ml-1 font-medium">{getProductTypeNorwegian(deal.productType)}</span>
                      </div>
                      {deal.agreementTime > 0 && (
                        <div>
                          <span className="text-gray-600">Bindingstid:</span>
                          <span className="ml-1 font-medium">
                            {deal.agreementTime} {deal.agreementTimeUnit === 'year' ? 'år' : 'måneder'}
                          </span>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-600">Prisområde:</span>
                        <span className="ml-1 font-medium">Nord-Norge (NO4)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Desktop view - table layout */}
      <div className="hidden md:block overflow-hidden">
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
                Beregnet månedspris
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Detaljer
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {nordNorgeDeals.map((deal, index) => {
              const isExpanded = expandedDeal === `nordnorge-${deal.id}`;
              const priceBreakdown = getPriceBreakdown(deal, annualConsumption, nordNorgeSpotPrice);
              
              return (
                <React.Fragment key={`nordnorge-${deal.id}`}>
                  <tr className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col items-center sm:items-start">
                        {deal.provider?.organizationNumber && providerLogoUrls[deal.provider.organizationNumber] ? (
                          <div className="mb-2">
                            <img 
                              src={providerLogoUrls[deal.provider.organizationNumber]} 
                              alt={`${deal.provider?.name || 'Ukjent leverandør'} logo`}
                              className="h-16 w-16 object-contain"
                            />
                          </div>
                        ) : (
                          <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                            <span className="text-2xl font-bold text-blue-600">
                              {(deal.provider?.name || 'U').charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="font-medium text-gray-900 text-center sm:text-left">
                          {deal.provider?.name || 'Ukjent leverandør'}
                          {deal.provider?.organizationNumber && (
                            <div className="mt-1">
                              <Link 
                                href={`/stromleverandorer/${providers.find(p => p.organizationNumber === deal.provider.organizationNumber)?.slug || ''}`}
                                className="text-xs text-blue-600 hover:text-blue-800"
                              >
                                Se alle avtaler
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{deal.name}</div>
                      {deal.agreementTime > 0 && (
                        <div className="text-xs text-gray-500">
                          {deal.agreementTime} {deal.agreementTimeUnit === 'year' ? 'års' : 'måneders'} bindingstid
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatPrice(nordNorgeSpotPrice + deal.addonPrice)} øre
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatMonthlyCost(deal.calculatedMonthlyPrice)} kr
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => toggleDealExpansion(`nordnorge-${deal.id}`)}
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
                                <span className="text-gray-600">Nordpool spotpris Nord-Norge (NO4)</span>
                                <span className="font-medium">{formatPrice(priceBreakdown.spotPrice)} øre/kWt</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Påslag til {deal.provider?.name}</span>
                                <span className="font-medium">{formatPrice(priceBreakdown.addonPrice)} øre/kWt</span>
                              </div>
                              {priceBreakdown.elCertificatePrice > 0 && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Elsertifikatpris</span>
                                  <span className="font-medium">{formatPrice(priceBreakdown.elCertificatePrice)} øre/kWt</span>
                                </div>
                              )}
                              <div className="flex justify-between text-sm font-medium border-t border-blue-200 pt-2">
                                <span>Total spotpris + påslag</span>
                                <span>{formatPrice(priceBreakdown.totalKwhPrice)} øre/kWt</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Ditt ca. forbruk {formatConsumption(priceBreakdown.monthlyConsumption)} kWt * {formatPrice(priceBreakdown.totalKwhPrice)} øre</span>
                                <span className="font-medium">{formatMonthlyCost(priceBreakdown.energyCost)} kr</span>
                              </div>
                              {priceBreakdown.monthlyFee > 0 && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Fast beløp til {deal.provider?.name} per måned</span>
                                  <span className="font-medium">{formatMonthlyCost(priceBreakdown.monthlyFee)} kr</span>
                                </div>
                              )}
                              <div className="flex justify-between text-base font-bold border-t border-blue-200 pt-2">
                                <span>Beregnet strømutgift for {getCurrentMonthName()}</span>
                                <span>{formatMonthlyCost(priceBreakdown.totalMonthlyCost)} kr</span>
                              </div>
                            </div>
                            
                            <div className="mt-6">
                              <Link 
                                href="/tilbud"
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
                                <dd className="mt-1 text-sm text-gray-900">{getProductTypeNorwegian(deal.productType)}</dd>
                              </div>
                              {deal.agreementTime > 0 && (
                                <div className="sm:col-span-1">
                                  <dt className="text-sm font-medium text-gray-500">Bindingstid</dt>
                                  <dd className="mt-1 text-sm text-gray-900">{deal.agreementTime} {deal.agreementTimeUnit === 'year' ? 'år' : 'måneder'}</dd>
                                </div>
                              )}
                              <div className="sm:col-span-1">
                                <dt className="text-sm font-medium text-gray-500">Prisområde</dt>
                                <dd className="mt-1 text-sm text-gray-900">Nord-Norge (NO4)</dd>
                              </div>
                            </dl>
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
          Den billigste strømavtalen i Nord-Norge per {getCurrentDate()} er {nordNorgeDeals[0]?.name} fra {nordNorgeDeals[0]?.provider?.name}. 
          Denne strømavtalen koster {formatPrice(nordNorgeSpotPrice + nordNorgeDeals[0]?.addonPrice)} øre per kWh og har en estimert månedspris på {formatMonthlyCost(nordNorgeDeals[0]?.calculatedMonthlyPrice)} kr ved et årlig forbruk på {formatConsumption(annualConsumption)} kilowattimer.
        </p>
        <div className="mt-4 text-center">
          <Link href="/fastpris-strom" className="text-blue-600 hover:text-blue-800 font-medium">
            Se billigste fastpris avtaler på strøm
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NordNorgeProductList; 