/**
 * Utility functions and mappings for electricity product fields
 * Provides Norwegian translations, explanations, and formatting
 */

// Import the enhanced calculation function
import { calculateEnhancedMonthlyCost } from './electricityPrices';

// Field name translations (English to Norwegian)
export const fieldTranslations = {
  // Product information
  name: 'Produktnavn',
  productType: 'Produkttype',
  id: 'Produkt-ID',
  productId: 'Produkt-ID (intern)',
  
  // Price information
  addonPrice: 'Påslag',
  addonPriceMinimumFixedFor: 'Påslag fast periode',
  addonPriceMinimumFixedForUnit: 'Påslag fast periode enhet',
  monthlyFee: 'Månedlig fastbeløp',
  elCertificatePrice: 'Elsertifikatpris',
  feePostalLetter: 'Gebyr for papirfaktura',
  feePostalLetterApplied: 'Papirfaktura gebyr pålagt',
  
  // Agreement details
  agreementTime: 'Bindingstid',
  agreementTimeUnit: 'Bindingstid enhet',
  applicableToCustomerType: 'Gjelder for kundetype',
  billingFrequency: 'Faktureringsfrekvens',
  billingFrequencyUnit: 'Faktureringsfrekvens enhet',
  
  // Purchase and payment
  paymentType: 'Betalingstype',
  feeMandatoryType: 'Obligatorisk gebyrtype',
  purchaseAddonPrice: 'Innkjøpspåslag',
  
  // Additional features and conditions
  cabinProduct: 'Fritidsbolig-produkt',
  maxKwhPerYear: 'Maksimalt kWh per år',
  otherConditions: 'Andre betingelser',
  standardAlert: 'Standard varsling',
  vatExemption: 'MVA-fritak',
  
  // Sales and ordering
  salesNetworks: 'Salgsnettverk',
  orderUrl: 'Bestillingslenke',
  associations: 'Tilknyttede foreninger',
  
  // Dates and timestamps
  createdAt: 'Opprettet dato',
  updatedAt: 'Oppdatert dato',
  priceChangedAt: 'Pris endret dato',
  expiredAt: 'Utløpsdato',
  deletedAt: 'Slettet dato',
  
  // Provider information
  provider: 'Leverandør',
};

// Detailed descriptions for each field (in Norwegian)
export const fieldDescriptions = {
  name: 'Navnet på strømproduktet som tilbys av leverandøren.',
  productType: 'Type strømprodukt, for eksempel spot eller fastpris.',
  id: 'Unik identifikator for produktet i systemet.',
  productId: 'Intern identifikator brukt av leverandøren.',
  
  addonPrice: 'Påslag per kWh i tillegg til spotpris (i NOK).',
  addonPriceMinimumFixedFor: 'Periode hvor påslaget er garantert uendret.',
  addonPriceMinimumFixedForUnit: 'Enhet for den garanterte perioden (dag, måned, år).',
  monthlyFee: 'Fast månedlig beløp som faktureres uavhengig av forbruk (i NOK).',
  elCertificatePrice: 'Pris for elsertifikater per kWh (i NOK).',
  feePostalLetter: 'Gebyr for å motta papirfaktura (i NOK).',
  feePostalLetterApplied: 'Angir om gebyr for papirfaktura pålegges eller ikke.',
  
  agreementTime: 'Bindingstidens lengde for avtalen.',
  agreementTimeUnit: 'Enhet for bindingstiden (dag, måned, år).',
  applicableToCustomerType: 'Hvilken type kunder produktet er tilgjengelig for.',
  billingFrequency: 'Hvor ofte kunden faktureres.',
  billingFrequencyUnit: 'Enhet for faktureringsfrekvens (dag, måned, år).',
  
  paymentType: 'Om betaling skjer før eller etter strømforbruk.',
  feeMandatoryType: 'Type obligatoriske gebyrer som pålegges.',
  purchaseAddonPrice: 'Påslag leverandøren tar på innkjøpsprisen (i NOK).',
  
  cabinProduct: 'Om produktet er spesielt tilpasset fritidsboliger.',
  maxKwhPerYear: 'Maksimalt strømforbruk i kWh per år som avtalen gjelder for. 0 betyr ingen grense.',
  otherConditions: 'Andre betingelser eller vilkår for produktet.',
  standardAlert: 'Standard varslingsmetode for produktet.',
  vatExemption: 'Om produktet er fritatt for merverdiavgift (MVA).',
  
  salesNetworks: 'Områder hvor produktet selges, med tilhørende priser.',
  orderUrl: 'Nettadresse hvor produktet kan bestilles.',
  associations: 'Foreninger eller medlemsorganisasjoner tilknyttet tilbudet.',
  
  createdAt: 'Dato og tidspunkt da produktet ble opprettet i systemet.',
  updatedAt: 'Dato og tidspunkt for siste oppdatering av produktinformasjonen.',
  priceChangedAt: 'Dato og tidspunkt da prisen sist ble endret.',
  expiredAt: 'Dato og tidspunkt da produktet utløper eller ikke lenger tilbys.',
  deletedAt: 'Dato og tidspunkt da produktet ble slettet fra systemet.',
  
  provider: 'Strømleverandøren som tilbyr produktet.',
};

// Options for dropdown/select fields with Norwegian translations
export const fieldOptions = {
  productType: {
    'hourly_spot': 'Spot time-for-time',
    'monthly_spot': 'Spot månedssnitt',
    'variable': 'Variabel pris',
    'fixed': 'Fastpris',
    'fixed_percent_spot': 'Fast prosent av spot',
    'max_price': 'Makspris',
    'spot_ceiling': 'Spot med tak',
  },
  
  applicableToCustomerType: {
    'allCustomers': 'Alle kunder',
    'privateOnly': 'Bare privatkunder',
    'businessOnly': 'Bare bedriftskunder',
  },
  
  agreementTimeUnit: {
    'day': 'dag(er)',
    'month': 'måned(er)',
    'year': 'år',
  },
  
  billingFrequencyUnit: {
    'day': 'dag(er)',
    'month': 'måned(er)',
    'year': 'år',
  },
  
  addonPriceMinimumFixedForUnit: {
    'day': 'dag(er)',
    'month': 'måned(er)',
    'year': 'år',
  },
  
  paymentType: {
    'before': 'Forskuddsbetaling',
    'after': 'Etterskuddsbetaling',
  },
  
  feeMandatoryType: {
    'none': 'Ingen obligatoriske gebyrer',
    'electronic': 'Elektronisk faktura',
    'paperInvoice': 'Papirfaktura',
    'directDebit': 'Avtalegiro',
  },
  
  standardAlert: {
    'email': 'E-post',
    'sms': 'SMS',
    'both': 'Både e-post og SMS',
    'none': 'Ingen varsling',
  },
};

// Format functions for different field types
export const formatters = {
  // Format currency values in NOK
  currency: (value: number): string => {
    return `${value.toFixed(2)} kr`;
  },
  
  // Format percentage values
  percentage: (value: number): string => {
    return `${(value * 100).toFixed(2)}%`;
  },
  
  // Format dates in Norwegian format
  date: (dateString: string): string => {
    if (!dateString) return 'Ikke angitt';
    const date = new Date(dateString);
    return date.toLocaleDateString('nb-NO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  },
  
  // Format time periods with correct Norwegian units
  timePeriod: (value: number, unit: string): string => {
    if (value === 0) return 'Ingen';
    
    const unitTranslation = 
      unit === 'day' ? (value === 1 ? 'dag' : 'dager') :
      unit === 'month' ? (value === 1 ? 'måned' : 'måneder') :
      unit === 'year' ? (value === 1 ? 'år' : 'år') : unit;
    
    return `${value} ${unitTranslation}`;
  },
  
  // Format boolean values
  boolean: (value: boolean): string => {
    return value ? 'Ja' : 'Nei';
  },
  
  // Get readable value for enum/option fields
  optionValue: (field: string, value: string): string => {
    if (!fieldOptions[field] || !fieldOptions[field][value]) {
      return value;
    }
    return fieldOptions[field][value];
  },
};

// Group related fields for better display organization
export const fieldGroups = {
  basicInfo: {
    title: 'Grunnleggende informasjon',
    fields: ['name', 'productType', 'id', 'productId', 'provider']
  },
  pricing: {
    title: 'Prisinformasjon',
    fields: ['addonPrice', 'monthlyFee', 'elCertificatePrice', 'feePostalLetter', 'addonPriceMinimumFixedFor', 'addonPriceMinimumFixedForUnit']
  },
  agreement: {
    title: 'Avtaledetaljer',
    fields: ['agreementTime', 'agreementTimeUnit', 'billingFrequency', 'billingFrequencyUnit', 'applicableToCustomerType', 'paymentType']
  },
  features: {
    title: 'Tilleggsfunksjoner',
    fields: ['cabinProduct', 'maxKwhPerYear', 'vatExemption', 'standardAlert', 'otherConditions']
  },
  sales: {
    title: 'Salgs- og bestillingsinformasjon',
    fields: ['salesNetworks', 'orderUrl', 'associations']
  },
  dates: {
    title: 'Datoer',
    fields: ['createdAt', 'updatedAt', 'priceChangedAt', 'expiredAt']
  }
};

// Export the enhanced calculation function
export { calculateEnhancedMonthlyCost };

// Update the original calculation function to use the enhanced one if price data is available
export function calculateMonthlyCost(
  product: any, 
  consumption: number = 16000, 
  basePrice?: number
): number {
  if (basePrice !== undefined) {
    return calculateEnhancedMonthlyCost(product, consumption, basePrice);
  }
  
  // Fall back to the simplified calculation
  const monthlyConsumption = consumption / 12;
  const addonPrice = (product.addonPrice || 0) * 100; // Convert from NOK to øre
  const monthlyFee = product.monthlyFee || 0;
  const elCertificatePrice = product.elCertificatePrice || 0;
  
  return (monthlyConsumption * (addonPrice + elCertificatePrice)) + monthlyFee;
}

// Helper to get a formatted field value using the appropriate formatter
export function getFormattedFieldValue(field: string, value: any, product: any): string {
  if (value === undefined || value === null) {
    return 'Ikke angitt';
  }
  
  // Choose the appropriate formatter based on the field type
  switch (field) {
    case 'addonPrice':
    case 'elCertificatePrice':
    case 'feePostalLetter':
    case 'monthlyFee':
    case 'purchaseAddonPrice':
      return formatters.currency(value);
      
    case 'agreementTime':
      return formatters.timePeriod(value, product.agreementTimeUnit || 'month');
      
    case 'addonPriceMinimumFixedFor':
      return formatters.timePeriod(value, product.addonPriceMinimumFixedForUnit || 'month');
      
    case 'billingFrequency':
      return formatters.timePeriod(value, product.billingFrequencyUnit || 'month');
      
    case 'createdAt':
    case 'updatedAt':
    case 'priceChangedAt':
    case 'expiredAt':
    case 'deletedAt':
      return formatters.date(value);
      
    case 'cabinProduct':
    case 'feePostalLetterApplied':
    case 'vatExemption':
      return formatters.boolean(value);
      
    case 'productType':
    case 'applicableToCustomerType':
    case 'paymentType':
    case 'feeMandatoryType':
    case 'standardAlert':
      return formatters.optionValue(field, value);
      
    case 'provider':
      return typeof value === 'object' ? value.name : value;
      
    case 'salesNetworks':
      if (Array.isArray(value) && value.length > 0) {
        return value.map(network => network.name).join(', ');
      }
      return 'Ingen nettverk angitt';
      
    case 'associations':
      if (Array.isArray(value) && value.length > 0) {
        return value.map(assoc => assoc.name).join(', ');
      }
      return 'Ingen foreninger angitt';
      
    default:
      return String(value);
  }
} 