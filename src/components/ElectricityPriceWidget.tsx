'use client';

import { useState, useEffect } from 'react';
import { PRICE_AREAS } from '../utils/electricityPrices';

export default function ElectricityPriceWidget() {
  const [priceData, setPriceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedArea, setSelectedArea] = useState('national');
  
  useEffect(() => {
    async function fetchPrices() {
      try {
        setLoading(true);
        const response = await fetch('/api/electricity-prices?days=10');
        const result = await response.json();
        
        if (result.success) {
          setPriceData(result.data);
        } else {
          setError(result.error || 'Kunne ikke hente strømpriser');
        }
      } catch (err) {
        setError('Kunne ikke hente strømpriser');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchPrices();
  }, []);
  
  // Get the selected area data or national average
  const getSelectedData = () => {
    if (!priceData) return null;
    
    if (selectedArea === 'national') {
      return {
        name: 'Landsgjennomsnitt',
        averagePrice: priceData.nationalAverage
      };
    }
    
    return priceData.areas.find(area => area.areaCode === selectedArea);
  };
  
  const selectedData = getSelectedData();
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Gjennomsnittlig strømpris</h3>
      <p className="text-sm text-gray-600 mb-4">Siste 10 dager (NOK per kWh eks. mva)</p>
      
      {loading ? (
        <div className="py-6 text-center text-gray-500">Laster strømpriser...</div>
      ) : error ? (
        <div className="py-4 text-center text-red-500">{error}</div>
      ) : (
        <>
          <div className="mb-4">
            <label htmlFor="area-select" className="block text-sm font-medium text-gray-700 mb-1">
              Velg prisområde:
            </label>
            <select 
              id="area-select"
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="national">Landsgjennomsnitt</option>
              {PRICE_AREAS.map(area => (
                <option key={area.code} value={area.code}>
                  {area.name}
                </option>
              ))}
            </select>
          </div>
          
          {selectedData && (
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700 mb-1">{selectedData.name}</p>
              <p className="text-3xl font-bold text-blue-800">
                {selectedData.averagePrice.toFixed(2)} kr/kWh
              </p>
            </div>
          )}
          
          {selectedArea !== 'national' && priceData && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold mb-2">Daglige priser:</h4>
              <div className="h-40 overflow-y-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-3 text-left">Dato</th>
                      <th className="py-2 px-3 text-right">Gjennomsnitt</th>
                      <th className="py-2 px-3 text-right">Min</th>
                      <th className="py-2 px-3 text-right">Maks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {priceData.areas
                      .find(area => area.areaCode === selectedArea)?.days
                      .map(day => (
                        <tr key={day.date} className="border-b border-gray-200">
                          <td className="py-2 px-3">{new Date(day.date).toLocaleDateString('nb-NO')}</td>
                          <td className="py-2 px-3 text-right">{day.averagePrice.toFixed(2)} kr</td>
                          <td className="py-2 px-3 text-right">{day.minPrice.toFixed(2)} kr</td>
                          <td className="py-2 px-3 text-right">{day.maxPrice.toFixed(2)} kr</td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          <div className="mt-4 text-xs text-gray-500 text-center">
            <p>
              Strømpriser levert av{' '}
              <a 
                href="https://www.hvakosterstrommen.no" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Hva koster strømmen.no
              </a>
            </p>
          </div>
        </>
      )}
    </div>
  );
} 