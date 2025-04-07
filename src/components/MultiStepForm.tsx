'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

type CustomerType = 'private' | 'housing' | 'business';
type HousingType = 'enebolig' | 'leilighet' | 'tomannsbolig' | 'rekkehus' | 'hytte' | 'annet';
type ContractType = 'all' | 'fixed' | 'spot' | 'other';
type KnowsConsumption = 'yes' | 'no';

export default function MultiStepForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    customerType: 'private' as CustomerType,
    housingType: 'enebolig' as HousingType,
    address: '',
    houseNumber: '',
    postalCode: '',
    name: '',
    email: '',
    phone: '',
    acceptTerms: false,
    // Housing association specific fields
    contractType: 'all' as ContractType,
    knowsConsumption: 'no' as KnowsConsumption,
    annualConsumption: '',
    housingAssociationName: '',
    // Business specific fields
    businessContractType: '',
    propertySize: '',
    businessKnowsConsumption: '',
    businessAnnualConsumption: '',
    companyName: '',
    businessContactName: '',
    businessEmail: '',
    businessPhone: '',
    businessAcceptTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [isStepValid, setIsStepValid] = useState(false);
  const [totalSteps, setTotalSteps] = useState(3);
  const [isVisible, setIsVisible] = useState(false);

  // Add visibility effect on mount
  useEffect(() => {
    // Small delay to ensure the animation is noticeable
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Update total steps when customer type changes
  useEffect(() => {
    if (formData.customerType === 'housing') {
      setTotalSteps(4);
    } else if (formData.customerType === 'business') {
      setTotalSteps(4);
    } else {
      setTotalSteps(3);
    }
  }, [formData.customerType]);

  // Memoize the checkStepValidity function
  const checkStepValidity = useCallback((currentStep: number) => {
    let valid = false;
    
    if (formData.customerType === 'business') {
      // Business customer flow
      if (currentStep === 1) {
        valid = !!formData.customerType && !!formData.businessContractType;
      } else if (currentStep === 2) {
        valid = !!formData.propertySize.trim();
        if (formData.businessKnowsConsumption === 'yes') {
          valid = valid && !!formData.businessAnnualConsumption.trim();
        } else if (formData.businessKnowsConsumption === 'no') {
          valid = true;
        } else {
          valid = false;
        }
      } else if (currentStep === 3) {
        valid = !!formData.companyName.trim();
      } else if (currentStep === 4) {
        valid = !!formData.businessContactName.trim() && 
                !!formData.businessEmail.trim() && 
                /\S+@\S+\.\S+/.test(formData.businessEmail) && 
                !!formData.businessPhone.trim() && 
                /^\d{8}$/.test(formData.businessPhone) && 
                formData.businessAcceptTerms;
      }
    } else if (formData.customerType === 'housing') {
      // Housing association flow
      if (currentStep === 1) {
        valid = !!formData.customerType && !!formData.contractType;
      } else if (currentStep === 2) {
        valid = !!formData.knowsConsumption;
        if (formData.knowsConsumption === 'yes') {
          valid = valid && !!formData.annualConsumption.trim();
        }
      } else if (currentStep === 3) {
        valid = !!formData.housingAssociationName.trim();
      } else if (currentStep === 4) {
        valid = !!formData.name.trim() && 
                !!formData.email.trim() && 
                /\S+@\S+\.\S+/.test(formData.email) && 
                !!formData.phone.trim() && 
                /^\d{8}$/.test(formData.phone) && 
                formData.acceptTerms;
      }
    } else {
      // Regular private customer flow
      if (currentStep === 1) {
        valid = !!formData.customerType && !!formData.housingType;
      } else if (currentStep === 2) {
        valid = !!formData.address.trim() && 
                !!formData.houseNumber.trim() && 
                !!formData.postalCode.trim() && 
                /^\d{4}$/.test(formData.postalCode);
      } else if (currentStep === 3) {
        valid = !!formData.name.trim() && 
                !!formData.email.trim() && 
                /\S+@\S+\.\S+/.test(formData.email) && 
                !!formData.phone.trim() && 
                /^\d{8}$/.test(formData.phone) && 
                formData.acceptTerms;
      }
    }
    
    setIsStepValid(valid);
    return valid;
  }, [formData]);

  // Check if current step is valid whenever form data changes
  useEffect(() => {
    checkStepValidity(step);
  }, [formData, step, checkStepValidity]);

  // Add some debugging to see what's happening
  useEffect(() => {
    console.log('Current step:', step);
    console.log('Customer type:', formData.customerType);
    console.log('Is step valid:', isStepValid);
  }, [step, formData.customerType, isStepValid]);

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {};
    
    if (formData.customerType === 'business') {
      // Business flow validation
      if (currentStep === 1) {
        if (!formData.businessContractType) {
          newErrors.businessContractType = 'Vennligst velg ønsket strømavtale';
        }
      } else if (currentStep === 2) {
        if (!formData.propertySize.trim()) {
          newErrors.propertySize = 'Vennligst oppgi eiendommens størrelse';
        }
        if (!formData.businessKnowsConsumption) {
          newErrors.businessKnowsConsumption = 'Vennligst velg et alternativ';
        }
        if (formData.businessKnowsConsumption === 'yes' && !formData.businessAnnualConsumption.trim()) {
          newErrors.businessAnnualConsumption = 'Vennligst oppgi årsforbruk';
        }
      } else if (currentStep === 3) {
        if (!formData.companyName.trim()) {
          newErrors.companyName = 'Vennligst oppgi firmanavn';
        }
      } else if (currentStep === 4) {
        // Contact info validation
        if (!formData.businessContactName.trim()) {
          newErrors.businessContactName = 'Vennligst oppgi kontaktperson';
        }
        if (!formData.businessEmail.trim()) {
          newErrors.businessEmail = 'Vennligst oppgi e-post';
        } else if (!/\S+@\S+\.\S+/.test(formData.businessEmail)) {
          newErrors.businessEmail = 'Vennligst oppgi en gyldig e-post';
        }
        if (!formData.businessPhone.trim()) {
          newErrors.businessPhone = 'Vennligst oppgi telefonnummer';
        } else if (!/^\d{8}$/.test(formData.businessPhone)) {
          newErrors.businessPhone = 'Telefonnummer må bestå av 8 siffer';
        }
        if (!formData.businessAcceptTerms) {
          newErrors.businessAcceptTerms = 'Du må godta vilkårene for å fortsette';
        }
      }
    } else if (formData.customerType === 'housing') {
      // Housing association flow validation
      if (currentStep === 1) {
        if (!formData.contractType) {
          newErrors.contractType = 'Vennligst velg ønsket strømavtale';
        }
      } else if (currentStep === 2) {
        if (!formData.knowsConsumption) {
          newErrors.knowsConsumption = 'Vennligst velg et alternativ';
        }
        if (formData.knowsConsumption === 'yes' && !formData.annualConsumption.trim()) {
          newErrors.annualConsumption = 'Vennligst oppgi årsforbruk';
        }
      } else if (currentStep === 3) {
        if (!formData.housingAssociationName.trim()) {
          newErrors.housingAssociationName = 'Vennligst oppgi navn på borettslag/sameie';
        }
      } else if (currentStep === 4) {
        // Contact info validation (same as private)
        if (!formData.name.trim()) {
          newErrors.name = 'Vennligst oppgi navn';
        }
        if (!formData.email.trim()) {
          newErrors.email = 'Vennligst oppgi e-post';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'Vennligst oppgi en gyldig e-post';
        }
        if (!formData.phone.trim()) {
          newErrors.phone = 'Vennligst oppgi telefonnummer';
        } else if (!/^\d{8}$/.test(formData.phone)) {
          newErrors.phone = 'Telefonnummer må bestå av 8 siffer';
        }
        if (!formData.acceptTerms) {
          newErrors.acceptTerms = 'Du må godta vilkårene for å fortsette';
        }
      }
    } else {
      // Regular private customer flow validation
      if (currentStep === 1) {
        if (!formData.customerType) {
          newErrors.customerType = 'Vennligst velg kundetype';
        }
        if (!formData.housingType) {
          newErrors.housingType = 'Vennligst velg boligtype';
        }
      } else if (currentStep === 2) {
        if (!formData.address.trim()) {
          newErrors.address = 'Vennligst oppgi adresse';
        }
        if (!formData.houseNumber.trim()) {
          newErrors.houseNumber = 'Vennligst oppgi gatenummer';
        }
        if (!formData.postalCode.trim()) {
          newErrors.postalCode = 'Vennligst oppgi postnummer';
        } else if (!/^\d{4}$/.test(formData.postalCode)) {
          newErrors.postalCode = 'Postnummer må bestå av 4 siffer';
        }
      } else if (currentStep === 3) {
        if (!formData.name.trim()) {
          newErrors.name = 'Vennligst oppgi navn';
        }
        if (!formData.email.trim()) {
          newErrors.email = 'Vennligst oppgi e-post';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'Vennligst oppgi en gyldig e-post';
        }
        if (!formData.phone.trim()) {
          newErrors.phone = 'Vennligst oppgi telefonnummer';
        } else if (!/^\d{8}$/.test(formData.phone)) {
          newErrors.phone = 'Telefonnummer må bestå av 8 siffer';
        }
        if (!formData.acceptTerms) {
          newErrors.acceptTerms = 'Du må godta vilkårene for å fortsette';
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    console.log('handleNext called, current step:', step);
    
    // If we're on step 1, redirect to the /tilbud page instead of directly to the affiliate
    if (step === 1) {
      router.push('/tilbud');
      return;
    }
    
    // Original code for other steps
    if (validateStep(step)) {
      console.log('Step validated, moving to next step');
      if (step < totalSteps) {
        setStep(step + 1);
      }
    } else {
      console.log('Step validation failed');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleCustomerTypeSelect = (type: CustomerType) => {
    setFormData(prev => ({ ...prev, customerType: type }));
    if (errors.customerType) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.customerType;
        return newErrors;
      });
    }
  };

  const handleContractTypeSelect = (type: ContractType) => {
    setFormData(prev => ({ ...prev, contractType: type }));
    if (errors.contractType) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.contractType;
        return newErrors;
      });
    }
  };

  const handleKnowsConsumptionSelect = (value: KnowsConsumption) => {
    setFormData(prev => ({ ...prev, knowsConsumption: value }));
    if (errors.knowsConsumption) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.knowsConsumption;
        return newErrors;
      });
    }
  };

  const handleBusinessKnowsConsumptionSelect = (value: 'yes' | 'no') => {
    setFormData(prev => ({
      ...prev,
      businessKnowsConsumption: value,
      businessAnnualConsumption: value === 'no' ? '' : prev.businessAnnualConsumption
    }));
    
    if (errors.businessKnowsConsumption) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.businessKnowsConsumption;
        return newErrors;
      });
    }
  };

  const handleSubmit = async () => {
    const finalStep = formData.customerType === 'housing' ? 4 : 3;
    if (validateStep(finalStep)) {
      setLoading(true);
      
      try {
        // Format the form data for the message
        let formattedMessage = '';
        
        if (formData.customerType === 'housing') {
          formattedMessage = `
🔔 *Ny strømforespørsel - Borettslag/Sameie*

*Kundetype:* Borettslag/Sameie
*Navn på borettslag/sameie:* ${formData.housingAssociationName}
*Ønsket strømavtale:* ${formData.contractType === 'all' ? 'Alle avtaler aktuelle' : 
                        formData.contractType === 'fixed' ? 'Fastpris' : 
                        formData.contractType === 'spot' ? 'Spotpris' : 'Annen avtale / Vet ikke'}
*Vet årsforbruk:* ${formData.knowsConsumption === 'yes' ? 'Ja' : 'Nei'}
${formData.knowsConsumption === 'yes' ? `*Årsforbruk:* ${formData.annualConsumption} kWh` : ''}
*Kontaktperson:* ${formData.name}
*E-post:* ${formData.email}
*Telefon:* ${formData.phone}
          `;
        } else {
          formattedMessage = `
🔔 *Ny strømforespørsel*

*Kundetype:* ${formData.customerType}
*Boligtype:* ${formData.housingType}
*Adresse:* ${formData.address} ${formData.houseNumber}, ${formData.postalCode}
*Navn:* ${formData.name}
*E-post:* ${formData.email}
*Telefon:* ${formData.phone}
          `;
        }
        
        // Send to Telegram
        const telegramToken = '7586081939:AAF7vI0ytn1Bt_2ZfYuI0wbcgjRXjwYSfc4';
        const chatId = '-1002297602606'; // Strømnet.no Leads group chat ID
        
        const telegramResponse = await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: formattedMessage,
            parse_mode: 'Markdown'
          })
        });
        
        if (!telegramResponse.ok) {
          console.error('Failed to send Telegram message:', await telegramResponse.text());
        }
        
        // Simulate API call with timeout
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Redirect to thank you page
        router.push('/takk');
      } catch (error) {
        console.error('Error submitting form:', error);
        setErrors(prev => ({
          ...prev,
          submit: 'Det oppstod en feil ved innsending. Vennligst prøv igjen.'
        }));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBusinessSubmit = async () => {
    if (validateStep(4)) {
      setLoading(true);
      
      try {
        // Format the form data for the message
        const formattedMessage = `
🔔 *Ny strømforespørsel - Bedrift*

*Firmanavn:* ${formData.companyName}
*Kontaktperson:* ${formData.businessContactName}
*E-post:* ${formData.businessEmail}
*Telefon:* ${formData.businessPhone}

*Eiendommens størrelse:* ${formData.propertySize} m²
*Vet årsforbruk:* ${formData.businessKnowsConsumption === 'yes' ? 'Ja' : 'Nei'}
${formData.businessKnowsConsumption === 'yes' ? `*Årsforbruk:* ${formData.businessAnnualConsumption} kWh` : ''}
        `;
        
        // Send to Telegram instead of using the API endpoint
        const telegramToken = '7586081939:AAF7vI0ytn1Bt_2ZfYuI0wbcgjRXjwYSfc4';
        const chatId = '-1002297602606'; // Strømnet.no Leads group chat ID
        
        const telegramResponse = await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: formattedMessage,
            parse_mode: 'Markdown'
          })
        });
        
        if (!telegramResponse.ok) {
          throw new Error('Failed to send Telegram message: ' + await telegramResponse.text());
        }
        
        // Simulate API call with timeout
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Redirect to thank you page
        router.push('/takk');
      } catch (error) {
        console.error('Error submitting form:', error);
        setErrors(prev => ({
          ...prev,
          submit: 'Det oppstod en feil ved innsending. Vennligst prøv igjen.'
        }));
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div 
      className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-700 ease-out ${
        isVisible 
          ? 'opacity-100 transform translate-y-0' 
          : 'opacity-0 transform translate-y-10'
      }`}
    >
      <div className="p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Finn en bedre og billigere strømavtale i ditt område
        </h2>
        
        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-xl font-medium text-gray-800 mb-4">Hva gjelder henvendelsen?</h3>
            
            <div className="flex justify-center space-x-3 mb-6 w-full">
              <button
                type="button"
                onClick={() => handleCustomerTypeSelect('private')}
                className={`flex-1 py-2 px-3 rounded-lg border-2 transition-colors text-sm ${
                  formData.customerType === 'private'
                    ? 'bg-blue-600 text-white border-blue-700'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Privat
              </button>
              <button
                type="button"
                onClick={() => handleCustomerTypeSelect('housing')}
                className={`flex-1 py-2 px-3 rounded-lg border-2 transition-colors text-sm ${
                  formData.customerType === 'housing'
                    ? 'bg-blue-600 text-white border-blue-700'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Borettslag
              </button>
              <button
                type="button"
                onClick={() => handleCustomerTypeSelect('business')}
                className={`flex-1 py-2 px-3 rounded-lg border-2 transition-colors text-sm ${
                  formData.customerType === 'business'
                    ? 'bg-blue-600 text-white border-blue-700'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Bedrift
              </button>
            </div>
            {errors.customerType && <p className="text-red-500 text-sm mt-1">{errors.customerType}</p>}
            
            {formData.customerType === 'housing' && (
              <div className="mt-6">
                <p className="text-gray-700 mb-4">
                  Dette valget gjelder kun om du ønsker tilbud på strøm til fellesarealer eller samtlige enheter i et borettslag/sameie. 
                  Om du kun ønsker tilbud til din enhet, velger du "Privat".
                </p>
                
                <label className="block text-gray-700 font-medium mb-2">
                  Hvilken type strømavtale ønsker dere? <span className="text-red-500">*</span>
                </label>
                
                <select
                  name="contractType"
                  value={formData.contractType}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700"
                  required
                >
                  <option value="all">Alle strømavtaler er aktuelle</option>
                  <option value="fixed">Fastpris</option>
                  <option value="spot">Spotpris</option>
                  <option value="other">Annen avtale / Vet ikke</option>
                </select>
                {errors.contractType && <p className="text-red-500 text-sm mt-1">{errors.contractType}</p>}
              </div>
            )}
            
            {formData.customerType === 'private' && (
              <div className="mt-6">
                <label className="block text-gray-700 font-medium mb-2">
                  Hvilken boligtype har du? <span className="text-red-500">*</span>
                </label>
                
                <select
                  name="housingType"
                  value={formData.housingType}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700"
                  required
                >
                  <option value="enebolig">Enebolig</option>
                  <option value="leilighet">Leilighet</option>
                  <option value="tomannsbolig">Tomannsbolig</option>
                  <option value="rekkehus">Rekkehus</option>
                  <option value="hytte">Hytte</option>
                  <option value="annet">Annet</option>
                </select>
                {errors.housingType && <p className="text-red-500 text-sm mt-1">{errors.housingType}</p>}
              </div>
            )}
            
            {formData.customerType === 'business' && (
              <div className="mt-6">
                <label className="block text-gray-700 font-medium mb-2">
                  Hvilken type strømavtale ønsker dere? <span className="text-red-500">*</span>
                </label>
                
                <select
                  name="businessContractType"
                  value={formData.businessContractType || ''}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700"
                  required
                >
                  <option value="">Velg avtale</option>
                  <option value="all">Alle strømavtaler er aktuelle</option>
                  <option value="fixed">Fastpris</option>
                  <option value="spot">Spotpris</option>
                  <option value="management">Kraftforvaltning</option>
                  <option value="other">Annen avtale / Vet ikke</option>
                </select>
                {errors.businessContractType && <p className="text-red-500 text-sm mt-1">{errors.businessContractType}</p>}
              </div>
            )}
            
            <div className="mt-6">
              <button
                onClick={() => handleNext()}
                disabled={!isStepValid}
                className={`w-full font-bold py-3 px-4 rounded-lg transition duration-200 ${
                  isStepValid 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Gå videre
              </button>
            </div>
            
            <p className="text-xs text-gray-500 text-center mt-4">
              Personvernet ditt ivaretas: Vi behandler alle data etter personvernforordningen (GDPR).
            </p>
          </div>
        )}
        
        {step === 2 && formData.customerType === 'housing' && (
          <div className="space-y-6">
            <h3 className="text-xl font-medium text-gray-800 mb-4">Strømforbruk</h3>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Vet du omtrentlig årsforbruk? (kWh) <span className="text-red-500">*</span>
              </label>
              
              <div className="flex flex-row gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => handleKnowsConsumptionSelect('yes')}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                    formData.knowsConsumption === 'yes'
                      ? 'bg-blue-600 text-white border-blue-700'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Ja
                </button>
                <button
                  type="button"
                  onClick={() => handleKnowsConsumptionSelect('no')}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                    formData.knowsConsumption === 'no'
                      ? 'bg-blue-600 text-white border-blue-700'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Nei
                </button>
              </div>
              {errors.knowsConsumption && <p className="text-red-500 text-sm mt-1">{errors.knowsConsumption}</p>}
            </div>
            
            {formData.knowsConsumption === 'yes' && (
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Ca. hvor stort er årsforbruket? <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="annualConsumption"
                  value={formData.annualConsumption}
                  onChange={handleChange}
                  placeholder="F.eks. 20000"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  required
                />
                {errors.annualConsumption && <p className="text-red-500 text-sm mt-1">{errors.annualConsumption}</p>}
              </div>
            )}
            
            <div className="flex space-x-4">
              <button
                onClick={handleBack}
                className="w-1/2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg transition duration-200"
              >
                Tilbake
              </button>
              <button
                onClick={() => handleNext()}
                disabled={!isStepValid}
                className={`w-1/2 font-bold py-3 px-4 rounded-lg transition duration-200 ${
                  isStepValid 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Gå videre
              </button>
            </div>
            
            <p className="text-xs text-gray-500 text-center mt-4">
              Personvernet ditt ivaretas: Vi behandler alle data etter personvernforordningen (GDPR).
            </p>
          </div>
        )}
        
        {step === 2 && formData.customerType === 'private' && (
          <div className="space-y-6">
            <h3 className="text-xl font-medium text-gray-800 mb-4">Ditt område</h3>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Adresse (der du bruker strøm) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Gateadresse"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                required
              />
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Gatenr. <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="houseNumber"
                value={formData.houseNumber}
                onChange={handleChange}
                placeholder="F.eks. 12B"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                required
              />
              {errors.houseNumber && <p className="text-red-500 text-sm mt-1">{errors.houseNumber}</p>}
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Postnummer <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                placeholder="F.eks. 0123"
                maxLength={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                required
              />
              {errors.postalCode && <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>}
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={handleBack}
                className="w-1/2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg transition duration-200"
              >
                Tilbake
              </button>
              <button
                onClick={() => handleNext()}
                disabled={!isStepValid}
                className={`w-1/2 font-bold py-3 px-4 rounded-lg transition duration-200 ${
                  isStepValid 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Gå videre
              </button>
            </div>
            
            <p className="text-xs text-gray-500 text-center mt-4">
              Personvernet ditt ivaretas: Vi behandler alle data etter personvernforordningen (GDPR).
            </p>
          </div>
        )}
        
        {step === 3 && formData.customerType === 'housing' && (
          <div className="space-y-6">
            <h3 className="text-xl font-medium text-gray-800 mb-4">Informasjon om borettslaget/sameiet</h3>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Navn på borettslag/sameie <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="housingAssociationName"
                value={formData.housingAssociationName}
                onChange={handleChange}
                placeholder="F.eks. Solsiden Borettslag"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                required
              />
              {errors.housingAssociationName && <p className="text-red-500 text-sm mt-1">{errors.housingAssociationName}</p>}
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={handleBack}
                className="w-1/2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg transition duration-200"
              >
                Tilbake
              </button>
              <button
                onClick={() => handleNext()}
                disabled={!isStepValid}
                className={`w-1/2 font-bold py-3 px-4 rounded-lg transition duration-200 ${
                  isStepValid 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Gå videre
              </button>
            </div>
            
            <p className="text-xs text-gray-500 text-center mt-4">
              Personvernet ditt ivaretas: Vi behandler alle data etter personvernforordningen (GDPR).
            </p>
          </div>
        )}
        {/* Contact information step - for private and housing */}
        {((step === 3 && formData.customerType === 'private') || (step === 4 && formData.customerType === 'housing')) && (
          <div className="space-y-6">
            <h3 className="text-xl font-medium text-gray-800 mb-4">Dine kontaktopplysninger</h3>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                {formData.customerType === 'housing' ? 'Kontaktperson' : 'Ditt navn'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ola Nordmann"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                required
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                E-post <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="navn@domene.no"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                required
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Telefon <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="12345678"
                maxLength={8}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                required
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>
            
            <div className="mt-4">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  required
                />
                <span className="ml-2 text-sm text-gray-600">
                  Jeg samtykker til at personopplysningene behandles av Strøm.no og videreformidles til inntil tre relevante leverandører. 
                  Tilbudene gis via telefon, e-post eller sms, uavhengig av reservasjonsregisteret. Samtykket trekkes tilbake ved å skrive til data@netsure.ai
                </span>
              </label>
              {errors.acceptTerms && <p className="text-red-500 text-sm mt-1">{errors.acceptTerms}</p>}
            </div>
            
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {errors.submit}
              </div>
            )}
            
            <div className="flex space-x-4">
              <button
                onClick={handleBack}
                className="w-1/2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg transition duration-200"
                disabled={loading}
              >
                Tilbake
              </button>
              <button
                onClick={handleSubmit}
                disabled={!isStepValid || loading}
                className={`w-1/2 font-bold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center ${
                  isStepValid && !loading
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sender...
                  </>
                ) : (
                  'Send inn'
                )}
              </button>
            </div>
          </div>
        )}

        {/* New step 2 for business customers */}
        {step === 2 && formData.customerType === 'business' && (
          <div className="space-y-6">
            <h3 className="text-xl font-medium text-gray-800 mb-4">Eiendomsinformasjon</h3>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Eiendommens størrelse (m²) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="propertySize"
                value={formData.propertySize || ''}
                onChange={handleChange}
                placeholder="F.eks. 500"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                required
              />
              {errors.propertySize && <p className="text-red-500 text-sm mt-1">{errors.propertySize}</p>}
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Vet du bedriftens omtrentlige årsforbruk? (kWh) <span className="text-red-500">*</span>
              </label>
              
              <div className="flex flex-row gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => handleBusinessKnowsConsumptionSelect('yes')}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                    formData.businessKnowsConsumption === 'yes'
                      ? 'bg-blue-600 text-white border-blue-700'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Ja
                </button>
                <button
                  type="button"
                  onClick={() => handleBusinessKnowsConsumptionSelect('no')}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                    formData.businessKnowsConsumption === 'no'
                      ? 'bg-blue-600 text-white border-blue-700'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Nei
                </button>
              </div>
              {errors.businessKnowsConsumption && <p className="text-red-500 text-sm mt-1">{errors.businessKnowsConsumption}</p>}
            </div>
            
            {formData.businessKnowsConsumption === 'yes' && (
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Ca. hvor stort er årsforbruket? <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="businessAnnualConsumption"
                  value={formData.businessAnnualConsumption || ''}
                  onChange={handleChange}
                  placeholder="F.eks. 50000"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  required
                />
                {errors.businessAnnualConsumption && <p className="text-red-500 text-sm mt-1">{errors.businessAnnualConsumption}</p>}
              </div>
            )}
            
            <div className="flex space-x-4">
              <button
                onClick={handleBack}
                className="w-1/2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg transition duration-200"
              >
                Tilbake
              </button>
              <button
                onClick={() => handleNext()}
                disabled={!isStepValid}
                className={`w-1/2 font-bold py-3 px-4 rounded-lg transition duration-200 ${
                  isStepValid 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Gå videre
              </button>
            </div>
            
            <p className="text-xs text-gray-500 text-center mt-4">
              Personvernet ditt ivaretas: Vi behandler alle data etter personvernforordningen (GDPR).
            </p>
          </div>
        )}

        {/* Step 3 for business customers */}
        {step === 3 && formData.customerType === 'business' && (
          <div className="space-y-6">
            <h3 className="text-xl font-medium text-gray-800 mb-4">Firma</h3>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Firmanavn <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName || ''}
                onChange={handleChange}
                placeholder="Firmanavn AS"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                required
              />
              {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={handleBack}
                className="w-1/2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg transition duration-200"
              >
                Tilbake
              </button>
              <button
                onClick={() => handleNext()}
                disabled={!isStepValid}
                className={`w-1/2 font-bold py-3 px-4 rounded-lg transition duration-200 ${
                  isStepValid 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Gå videre
              </button>
            </div>
            
            <p className="text-xs text-gray-500 text-center mt-4">
              Personvernet ditt ivaretas: Vi behandler alle data etter personvernforordningen (GDPR).
            </p>
          </div>
        )}

        {/* Step 4 for business customers - Contact Information */}
        {step === 4 && formData.customerType === 'business' && (
          <div className="space-y-6">
            <h3 className="text-xl font-medium text-gray-800 mb-4">Kontaktinformasjon</h3>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Kontaktperson <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="businessContactName"
                value={formData.businessContactName || ''}
                onChange={handleChange}
                placeholder="Ola Nordmann"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                required
              />
              {errors.businessContactName && <p className="text-red-500 text-sm mt-1">{errors.businessContactName}</p>}
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                E-post <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="businessEmail"
                value={formData.businessEmail || ''}
                onChange={handleChange}
                placeholder="navn@bedrift.no"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                required
              />
              {errors.businessEmail && <p className="text-red-500 text-sm mt-1">{errors.businessEmail}</p>}
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Telefon <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="businessPhone"
                value={formData.businessPhone || ''}
                onChange={handleChange}
                placeholder="12345678"
                maxLength={8}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                required
              />
              {errors.businessPhone && <p className="text-red-500 text-sm mt-1">{errors.businessPhone}</p>}
            </div>
            
            <div className="mt-4">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  name="businessAcceptTerms"
                  checked={formData.businessAcceptTerms || false}
                  onChange={handleChange}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  required
                />
                <span className="ml-2 text-sm text-gray-600">
                  Jeg samtykker til at personopplysningene behandles av Strøm.no og videreformidles til inntil tre relevante leverandører. 
                  Tilbudene gis via telefon, e-post eller sms, uavhengig av reservasjonsregisteret. Samtykket trekkes tilbake ved å skrive til data@netsure.ai
                </span>
              </label>
              {errors.businessAcceptTerms && <p className="text-red-500 text-sm mt-1">{errors.businessAcceptTerms}</p>}
            </div>
            
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {errors.submit}
              </div>
            )}
            
            <div className="flex space-x-4">
              <button
                onClick={handleBack}
                className="w-1/2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg transition duration-200"
                disabled={loading}
              >
                Tilbake
              </button>
              <button
                onClick={handleBusinessSubmit}
                disabled={!isStepValid || loading}
                className={`w-1/2 font-bold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center ${
                  isStepValid && !loading
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sender...
                  </>
                ) : (
                  'Send inn'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step indicator at the bottom - OUTSIDE of any step conditional rendering */}
        <div className="flex justify-center space-x-3 mt-8 mb-4">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index + 1 === step ? 'bg-blue-600' : 'bg-gray-300'
              }`}
              style={{ minWidth: '8px', minHeight: '8px' }}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 