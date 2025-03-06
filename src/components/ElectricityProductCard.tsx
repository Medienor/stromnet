'use client';

import { useState } from 'react';
import { 
  fieldTranslations, 
  fieldDescriptions, 
  fieldGroups,
  getFormattedFieldValue,
  calculateMonthlyCost
} from '../utils/electricityFields';

interface ElectricityProductCardProps {
  product: any;
  consumption?: number;
  showDetails?: boolean;
}

export default function ElectricityProductCard({ 
  product, 
  consumption = 16000,
  showDetails = false
}: ElectricityProductCardProps) {
  const [isExpanded, setIsExpanded] = useState(showDetails);
  
  // Calculate estimated monthly cost
  const monthlyCost = calculateMonthlyCost(product, consumption);
  
  // Calculate yearly cost
  const yearlyCost = monthlyCost * 12;
  
  return (
    <div className="border border-gray-200 rounded-lg shadow-sm bg-white overflow-hidden">
      {/* Product header */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
            <p className="text-sm text-gray-600">
              {product.provider?.name || 'Ukjent leverandør'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-blue-600">
              {monthlyCost.toFixed(2)} kr<span className="text-sm font-normal text-gray-500">/mnd</span>
            </div>
            <div className="text-sm text-gray-500">
              {yearlyCost.toFixed(2)} kr/år ved {consumption} kWh
            </div>
          </div>
        </div>
      </div>
      
      {/* Product summary */}
      <div className="p-4 border-b">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">{fieldTranslations.productType}</p>
            <p className="font-medium">{getFormattedFieldValue('productType', product.productType, product)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{fieldTranslations.addonPrice}</p>
            <p className="font-medium">{getFormattedFieldValue('addonPrice', product.addonPrice, product)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{fieldTranslations.monthlyFee}</p>
            <p className="font-medium">{getFormattedFieldValue('monthlyFee', product.monthlyFee, product)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{fieldTranslations.agreementTime}</p>
            <p className="font-medium">{getFormattedFieldValue('agreementTime', product.agreementTime, product)}</p>
          </div>
        </div>
        
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium focus:outline-none"
        >
          {isExpanded ? 'Skjul detaljer' : 'Vis flere detaljer'}
        </button>
      </div>
      
      {/* Product details (expandable) */}
      {isExpanded && (
        <div className="p-4 bg-gray-50">
          {Object.keys(fieldGroups).map(groupKey => {
            const group = fieldGroups[groupKey];
            const relevantFields = group.fields.filter(field => 
              product[field] !== undefined || field === 'provider'
            );
            
            if (relevantFields.length === 0) return null;
            
            return (
              <div key={groupKey} className="mb-6 last:mb-0">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">{group.title}</h4>
                <div className="bg-white border border-gray-200 rounded-md">
                  {relevantFields.map((field, index) => (
                    <div 
                      key={field}
                      className={`px-4 py-3 flex flex-col sm:flex-row sm:justify-between ${
                        index !== relevantFields.length - 1 ? 'border-b border-gray-200' : ''
                      }`}
                    >
                      <div className="sm:w-1/2">
                        <p className="text-sm font-medium text-gray-700">{fieldTranslations[field]}</p>
                        <p className="text-xs text-gray-500 mt-1">{fieldDescriptions[field]}</p>
                      </div>
                      <div className="sm:w-1/2 mt-2 sm:mt-0 sm:text-right">
                        <p className="font-medium text-gray-900">
                          {getFormattedFieldValue(field, product[field], product)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          
          {product.orderUrl && (
            <div className="mt-4">
              <a 
                href={product.orderUrl} 
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Bestill hos {product.provider?.name || 'leverandør'}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 