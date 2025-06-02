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
    // Heat pump offer fields
    wantHeatPumpOffer: false,
    businessWantHeatPumpOffer: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [isStepValid, setIsStepValid] = useState(false);
  const [totalSteps, setTotalSteps] = useState(2);
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
    if (formData.customerType === 'business') {
      setTotalSteps(2); // Step 1: address, Step 2: contact
    } else {
      setTotalSteps(2); // Step 1: address, Step 2: contact
    }
  }, [formData.customerType]);

  // Memoize the checkStepValidity function
  const checkStepValidity = useCallback((currentStep: number) => {
    let valid = false;
    
    if (formData.customerType === 'business') {
      // Business customer flow
      if (currentStep === 1) {
        valid = !!formData.customerType && 
                !!formData.address.trim() && 
                !!formData.postalCode.trim() && 
                formData.postalCode.length === 4 &&
                /^\d{4}$/.test(formData.postalCode);
      } else if (currentStep === 2) {
        valid = !!formData.businessContactName.trim() && 
                !!formData.businessEmail.trim() && 
                /\S+@\S+\.\S+/.test(formData.businessEmail) && 
                !!formData.businessPhone.trim() && 
                /^\d{8}$/.test(formData.businessPhone) && 
                formData.businessAcceptTerms;
      }
    } else {
      // Regular private customer flow
      if (currentStep === 1) {
        valid = !!formData.customerType && 
                !!formData.address.trim() && 
                !!formData.postalCode.trim() && 
                formData.postalCode.length === 4 &&
                /^\d{4}$/.test(formData.postalCode);
      } else if (currentStep === 2) {
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

  const validateStep = (stepNumber: number) => {
    const newErrors: { [key: string]: string } = {};
    
    if (stepNumber === 1) {
      if (!formData.customerType) {
        newErrors.customerType = 'Vennligst velg kundetypen';
      }
      if (!formData.address?.trim()) {
        newErrors.address = 'Adresse er påkrevd';
      }
      if (!formData.postalCode?.trim()) {
        newErrors.postalCode = 'Postnummer er påkrevd';
      } else if (!/^\d{4}$/.test(formData.postalCode)) {
        newErrors.postalCode = 'Postnummer må være 4 siffer';
      }
    }
    
    if (stepNumber === 2 && formData.customerType === 'private') {
      if (!formData.name?.trim()) {
        newErrors.name = 'Navn er påkrevd';
      }
      if (!formData.email?.trim()) {
        newErrors.email = 'E-post er påkrevd';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Ugyldig e-postadresse';
      }
      if (!formData.phone?.trim()) {
        newErrors.phone = 'Telefonnummer er påkrevd';
      } else if (!/^\d{8}$/.test(formData.phone)) {
        newErrors.phone = 'Telefonnummer må være 8 siffer';
      } else if (!/^[49]/.test(formData.phone)) {
        newErrors.phone = 'Telefonnummer må starte med 4 eller 9';
      }
      if (!formData.acceptTerms) {
        newErrors.acceptTerms = 'Du må akseptere vilkårene';
      }
    }
    
    if (stepNumber === 2 && formData.customerType === 'business') {
      if (!formData.companyName?.trim()) {
        newErrors.companyName = 'Bedriftsnavn er påkrevd';
      }
      if (!formData.businessContactName?.trim()) {
        newErrors.businessContactName = 'Kontaktperson er påkrevd';
      }
      if (!formData.businessEmail?.trim()) {
        newErrors.businessEmail = 'E-post er påkrevd';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.businessEmail)) {
        newErrors.businessEmail = 'Ugyldig e-postadresse';
      }
      if (!formData.businessPhone?.trim()) {
        newErrors.businessPhone = 'Telefonnummer er påkrevd';
      } else if (!/^\d{8}$/.test(formData.businessPhone)) {
        newErrors.businessPhone = 'Telefonnummer må være 8 siffer';
      } else if (!/^[49]/.test(formData.businessPhone)) {
        newErrors.businessPhone = 'Telefonnummer må starte med 4 eller 9';
      }
      if (!formData.businessContractType) {
        newErrors.businessContractType = 'Vennligst velg avtaletypen';
      }
      if (!formData.propertySize?.trim()) {
        newErrors.propertySize = 'Eiendomsstørrelse er påkrevd';
      }
      if (!formData.businessKnowsConsumption) {
        newErrors.businessKnowsConsumption = 'Vennligst oppgi om du vet årsforbruket';
      }
      if (formData.businessKnowsConsumption === 'yes' && !formData.businessAnnualConsumption?.trim()) {
        newErrors.businessAnnualConsumption = 'Årsforbruk er påkrevd';
      }
      if (!formData.businessAcceptTerms) {
        newErrors.businessAcceptTerms = 'Du må akseptere vilkårene';
      }
    }
    
    // ... existing housing validation code ...
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    console.log('handleNext called, current step:', step);
    
    if (validateStep(step)) {
      console.log('Step validated, moving to next step');
      if (step < totalSteps) {
        setStep(step + 1);
      }
    } else {
      console.log('Step validation failed');
      // Force validation to show all errors
      validateStep(step);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle postal code - only allow numbers and max 4 digits
    if (name === 'postalCode') {
      const numericValue = value.replace(/\D/g, '').slice(0, 4);
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
      return;
    }
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
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

  const sendTelegramNotification = async (formData: any, isBusinessCustomer: boolean = false) => {
    try {
      const botToken = '7919021042:AAFJ_v5A75s6dBX8-GeaHREHToY87pOpYII';
      const channelId = '-1002289212462';
      
      let message = '';
      
      if (isBusinessCustomer) {
        message = `🏢 *Ny bedriftskunde!*\n\n` +
          `👤 *Kontaktperson:* ${formData.businessContactName}\n` +
          `📧 *E-post:* ${formData.businessEmail}\n` +
          `📱 *Telefon:* ${formData.businessPhone}\n` +
          `🏢 *Bedrift:* ${formData.companyName || 'Ikke oppgitt'}\n` +
          `📏 *Eiendomsstørrelse:* ${formData.propertySize || 'Ikke oppgitt'}m²\n` +
          `${formData.businessKnowsConsumption === 'yes' ? `📊 *Årsforbruk:* ${formData.businessAnnualConsumption} kWh\n` : ''}` +
          `🔥 *Ønsker varmepumpe:* ${formData.businessWantHeatPumpOffer ? 'Ja' : 'Nei'}\n\n` +
          `🕐 *Tidspunkt:* ${new Date().toLocaleString('no-NO')}`;
      } else {
        message = `🏠 *Ny privatkunde!*\n\n` +
          `👤 *Navn:* ${formData.name}\n` +
          `📧 *E-post:* ${formData.email}\n` +
          `📱 *Telefon:* ${formData.phone}\n` +
          `🏠 *Adresse:* ${formData.address}\n` +
          `📮 *Postnummer:* ${formData.postalCode}\n` +
          `${formData.knowsConsumption === 'yes' ? `📊 *Årsforbruk:* ${formData.annualConsumption} kWh\n` : ''}` +
          `🔥 *Ønsker varmepumpe:* ${formData.wantHeatPumpOffer ? 'Ja' : 'Nei'}\n\n` +
          `🕐 *Tidspunkt:* ${new Date().toLocaleString('no-NO')}`;
      }
      
      const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: channelId,
          text: message,
          parse_mode: 'Markdown'
        })
      });
      
      if (!telegramResponse.ok) {
        console.error('Failed to send Telegram notification:', await telegramResponse.text());
      }
    } catch (error) {
      console.error('Error sending Telegram notification:', error);
    }
  };

  const handleSubmit = async () => {
    const finalStep = formData.customerType === 'housing' ? 4 : 2;
    if (validateStep(finalStep)) {
      setLoading(true);
      
      try {
        // Send to webhook with standardized field names
        const webhookResponse = await fetch('https://hook.eu2.make.com/gpjy6dsd459058g8m53ap6o0ux1t6skg', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            // Standard fields
            street1: formData.address,
            towncity: '', // We don't collect city separately
            county: '', // We don't collect county
            email: formData.email,
            fullname: formData.name,
            phone1: formData.phone,
            optinurl: window.location.href,
            ipaddress: '', // Would need to be collected separately
            source: 'strom-form',
            postcode: formData.postalCode,
            company: formData.customerType === 'housing' ? formData.housingAssociationName : '',
            SID: 21,
            
            // Custom fields for this form
            customerType: formData.customerType,
            housingType: formData.housingType,
            houseNumber: formData.houseNumber,
            contractType: formData.contractType,
            knowsConsumption: formData.knowsConsumption,
            wantHeatPumpOffer: formData.wantHeatPumpOffer || false,
            comment: formData.knowsConsumption === 'yes' ? `Årsforbruk: ${formData.annualConsumption} kWh` : 'Vet ikke årsforbruk',
            
            timestamp: new Date().toISOString()
          })
        });
        
        if (!webhookResponse.ok) {
          throw new Error('Failed to send webhook: ' + await webhookResponse.text());
        }
        
        // Send Telegram notification
        await sendTelegramNotification(formData, false);
        
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
    } else {
      // Force validation to show all errors
      console.log('Validation failed, forcing validation display');
      validateStep(finalStep);
    }
  };

  const handleBusinessSubmit = async () => {
    if (validateStep(2)) {
      setLoading(true);
      
      try {
        // Send to webhook with standardized field names
        const webhookResponse = await fetch('https://hook.eu2.make.com/gpjy6dsd459058g8m53ap6o0ux1t6skg', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            // Standard fields
            street1: '', // Business doesn't collect address
            towncity: '',
            county: '',
            email: formData.businessEmail,
            fullname: formData.businessContactName,
            phone1: formData.businessPhone,
            optinurl: window.location.href,
            ipaddress: '', // Would need to be collected separately
            source: 'strom-form-business',
            postcode: '',
            company: formData.companyName,
            SID: 21,
            
            // Custom fields for business form
            customerType: formData.customerType,
            businessContractType: formData.businessContractType,
            propertySize: formData.propertySize,
            businessKnowsConsumption: formData.businessKnowsConsumption,
            businessWantHeatPumpOffer: formData.businessWantHeatPumpOffer || false,
            comment: formData.businessKnowsConsumption === 'yes' 
              ? `Eiendom: ${formData.propertySize}m², Årsforbruk: ${formData.businessAnnualConsumption} kWh` 
              : `Eiendom: ${formData.propertySize}m², Vet ikke årsforbruk`,
            
            timestamp: new Date().toISOString()
          })
        });
        
        if (!webhookResponse.ok) {
          throw new Error('Failed to send webhook: ' + await webhookResponse.text());
        }
        
        // Send Telegram notification for business customer
        await sendTelegramNotification(formData, true);
        
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
    } else {
      // Force validation to show all errors
      console.log('Business validation failed, forcing validation display');
      validateStep(2);
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
          La oss finne deg en billigere strømavtale 💡
        </h2>
        
        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-xl font-medium text-gray-800 mb-4">Hvem skal ha strøm?</h3>
            
            <div className="flex flex-row gap-2 mb-6">
              <button
                type="button"
                onClick={() => handleCustomerTypeSelect('private')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                  formData.customerType === 'private'
                    ? 'bg-blue-600 text-white border-blue-700'
                    : `bg-white text-gray-700 border-gray-300 hover:bg-gray-50 ${
                        errors.customerType ? 'border-red-300 ring-1 ring-red-300' : ''
                      }`
                }`}
              >
                Privat
              </button>
              <button
                type="button"
                onClick={() => handleCustomerTypeSelect('business')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                  formData.customerType === 'business'
                    ? 'bg-blue-600 text-white border-blue-700'
                    : `bg-white text-gray-700 border-gray-300 hover:bg-gray-50 ${
                        errors.customerType ? 'border-red-300 ring-1 ring-red-300' : ''
                      }`
                }`}
              >
                Bedrift
              </button>
            </div>
            {errors.customerType && (
              <div className="flex items-center text-red-500 text-sm mt-1">
                <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.customerType}
              </div>
            )}
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Adresse <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address || ''}
                onChange={handleChange}
                placeholder="Eksempel: Storgata 1"
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder-gray-500 placeholder:opacity-100 ${
                  errors.address ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'
                }`}
                required
              />
              {errors.address && (
                <div className="flex items-center text-red-500 text-sm mt-1">
                  <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.address}
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Postnummer <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode || ''}
                onChange={handleChange}
                placeholder="0123"
                maxLength={4}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder-gray-500 placeholder:opacity-100 ${
                  errors.postalCode ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'
                }`}
                required
              />
              {errors.postalCode && (
                <div className="flex items-center text-red-500 text-sm mt-1">
                  <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.postalCode}
                </div>
              )}
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={handleNext}
                disabled={loading}
                className={`w-full font-medium py-[15px] px-4 rounded-[25px] transition-all duration-300 ease-in-out flex items-center justify-center gap-2 ${
                  isStepValid && !loading
                    ? 'bg-[#4CAF50] hover:bg-[#45a049] text-white' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Laster...
                  </>
                ) : (
                  <>
                    Neste
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
            
            {/* Show validation message when button is clicked but form is invalid */}
            {!isStepValid && Object.keys(errors).length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
                <div className="flex items-center text-red-700">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">Vennligst fyll ut alle påkrevde felt for å fortsette</span>
                </div>
              </div>
            )}
            
            <p className="text-xs text-gray-500 text-center mt-4">
            Ved å fylle ut skjemaet får du de beste strømtilbudene direkte fra strømleverandørene. Se standard tilbud i prisoversikten.
            </p>
          </div>
        )}
        
        {step === 2 && formData.customerType === 'private' && (
          <div className="space-y-6">
            <h3 className="text-xl font-medium text-gray-800 mb-4">Kontaktinformasjon</h3>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Navn <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                placeholder="Ditt navn"
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder-gray-500 placeholder:opacity-100 ${
                  errors.name ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'
                }`}
                required
              />
              {errors.name && (
                <div className="flex items-center text-red-500 text-sm mt-1">
                  <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.name}
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                E-post <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                placeholder="ola@eksempel.no"
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder-gray-500 placeholder:opacity-100 ${
                  errors.email ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'
                }`}
                required
              />
              {errors.email && (
                <div className="flex items-center text-red-500 text-sm mt-1">
                  <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.email}
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Telefon <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone || ''}
                onChange={handleChange}
                placeholder="12345678"
                maxLength={8}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder-gray-500 placeholder:opacity-100 ${
                  errors.phone ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'
                }`}
                required
              />
              {errors.phone && (
                <div className="flex items-center text-red-500 text-sm mt-1">
                  <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.phone}
                </div>
              )}
            </div>
            
            <div className="mt-4">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms || false}
                  onChange={handleChange}
                  className={`mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                    errors.acceptTerms ? 'border-red-300 ring-1 ring-red-300' : ''
                  }`}
                  required
                />
                <span className="ml-2 text-sm text-gray-600">
                  Jeg aksepterer brukervilkårene, og bekrefter at personopplysningene er korrekte.
                </span>
              </label>
              {errors.acceptTerms && (
                <div className="flex items-center text-red-500 text-sm mt-1">
                  <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.acceptTerms}
                </div>
              )}
            </div>

            {/* Heat pump offer box */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-green-600" viewBox="0 0 512 512" fill="currentColor">
                    <g>
                      <polygon points="403.692,219.077 108.308,219.077 90.585,297.846 421.415,297.846"></polygon>
                    </g>
                    <g>
                      <path d="M467.692,66.462H44.308C19.876,66.462,0,86.338,0,110.769v142.769c0,24.431,19.876,44.308,44.308,44.308h16l21.776-96.78
                        c1.516-6.74,7.501-11.528,14.409-11.528h319.015c6.908,0,12.893,4.788,14.409,11.528l21.776,96.78h16
                        c24.431,0,44.308-19.876,44.308-44.308V110.769C512,86.338,492.124,66.462,467.692,66.462z M334.769,169.846h-19.692
                        c-8.157,0-14.769-6.613-14.769-14.769s6.613-14.769,14.769-14.769h19.692c8.157,0,14.769,6.613,14.769,14.769
                        S342.926,169.846,334.769,169.846z M403.692,169.846H384c-8.157,0-14.769-6.613-14.769-14.769s6.613-14.769,14.769-14.769h19.692
                        c8.157,0,14.769,6.613,14.769,14.769S411.849,169.846,403.692,169.846z"></path>
                    </g>
                    <g>
                      <path d="M265.846,365.125c0-4.113,0.767-5.392,2.818-8.809c2.799-4.664,7.028-11.712,7.028-24.008
                        c0-8.157-6.613-14.769-14.769-14.769s-14.769,6.613-14.769,14.769c0,4.113-0.767,5.392-2.818,8.809
                        c-2.799,4.664-7.028,11.712-7.028,24.008c0,12.296,4.229,19.345,7.027,24.01c2.051,3.419,2.819,4.698,2.819,8.812
                        s-0.767,5.395-2.819,8.812c-2.798,4.665-7.027,11.714-7.027,24.01c0,8.157,6.613,14.769,14.769,14.769s14.769-6.613,14.769-14.769
                        c0-4.115,0.767-5.395,2.819-8.812c2.798-4.664,7.027-11.713,7.027-24.01s-4.229-19.345-7.027-24.01
                        C266.614,370.519,265.846,369.240,265.846,365.125z"></path>
                    </g>
                    <g>
                      <path d="M187.077,365.125c0-4.113,0.767-5.392,2.818-8.809c2.799-4.664,7.028-11.712,7.028-24.008
                        c0-8.157-6.613-14.769-14.769-14.769s-14.769,6.613-14.769,14.769c0,4.113-0.767,5.392-2.818,8.809
                        c-2.799,4.664-7.028,11.712-7.028,24.008c0,12.296,4.229,19.345,7.027,24.01c2.051,3.419,2.819,4.698,2.819,8.812
                        s-0.767,5.395-2.819,8.812c-2.798,4.665-7.027,11.714-7.027,24.01c0,8.157,6.613,14.769,14.769,14.769s14.769-6.613,14.769-14.769
                        c0-4.115,0.767-5.395,2.819-8.812c2.798-4.664,7.027-11.713,7.027-24.01s-4.229-19.345-7.027-24.01
                        C187.845,370.519,187.077,369.240,187.077,365.125z"></path>
                    </g>
                    <g>
                      <path d="M344.615,365.125c0-4.113,0.767-5.392,2.818-8.809c2.799-4.664,7.028-11.712,7.028-24.008
                        c0-8.157-6.613-14.769-14.769-14.769s-14.769,6.613-14.769,14.769c0,4.113-0.767,5.392-2.818,8.809
                        c-2.799,4.664-7.028,11.712-7.028,24.008c0,12.296,4.229,19.345,7.027,24.01c2.051,3.419,2.819,4.698,2.819,8.812
                        s-0.767,5.395-2.819,8.812c-2.798,4.665-7.027,11.714-7.027,24.01c0,8.157,6.613,14.769,14.769,14.769s14.769-6.613,14.769-14.769
                        c0-4.115,0.767-5.395,2.819-8.812c2.798-4.664,7.027-11.713,7.027-24.01s-4.229-19.345-7.027-24.01
                        C345.383,370.519,344.615,369.240,344.615,365.125z"></path>
                    </g>
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-green-800 mb-2">
                    Spar mer med varmepumpe
                  </h4>
                  <p className="text-xs text-green-700 mb-3">
                    En varmepumpe kan redusere oppvarmingskostnadene betydelig. Vi kan også hjelpe deg med tilbud på dette.
                  </p>
                  <div className="mt-3">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="wantHeatPumpOffer"
                        checked={formData.wantHeatPumpOffer || false}
                        onChange={handleChange}
                        className="h-6 w-6 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer"
                      />
                      <span className="ml-4 text-sm text-green-700">
                        <strong>Ja, send meg også tilbud på varmepumpe</strong>
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.submit}
                </div>
              </div>
            )}
            
            {/* Show validation message when submit button is clicked but form is invalid */}
            {!isStepValid && Object.keys(errors).length > 0 && !errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center text-red-700">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">Vennligst fyll ut alle påkrevde felt for å sende inn</span>
                </div>
              </div>
            )}
            
            <div className="flex space-x-4">
              <button
                onClick={handleBack}
                className="w-1/2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-[15px] px-4 rounded-[25px] transition-all duration-300 ease-in-out flex items-center justify-center gap-2"
                disabled={loading}
              >
                Tilbake
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`w-1/2 font-medium py-[15px] px-4 rounded-[25px] transition-all duration-300 ease-in-out flex items-center justify-center gap-2 ${
                  !loading
                    ? 'bg-[#4CAF50] hover:bg-[#45a049] text-white' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sender...
                  </>
                ) : (
                  <>
                    Send inn
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 2 for business customers - Contact Information */}
        {step === 2 && formData.customerType === 'business' && (
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
                placeholder="Kari Hansen"
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder-gray-500 placeholder:opacity-100 ${
                  errors.businessContactName ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'
                }`}
                required
              />
              {errors.businessContactName && (
                <div className="flex items-center text-red-500 text-sm mt-1">
                  <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.businessContactName}
                </div>
              )}
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
                placeholder="kari@bedrift.no"
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder-gray-500 placeholder:opacity-100 ${
                  errors.businessEmail ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'
                }`}
                required
              />
              {errors.businessEmail && (
                <div className="flex items-center text-red-500 text-sm mt-1">
                  <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.businessEmail}
                </div>
              )}
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
                placeholder="87654321"
                maxLength={8}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder-gray-500 placeholder:opacity-100 ${
                  errors.businessPhone ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'
                }`}
                required
              />
              {errors.businessPhone && (
                <div className="flex items-center text-red-500 text-sm mt-1">
                  <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.businessPhone}
                </div>
              )}
            </div>
            
            <div className="mt-4">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  name="businessAcceptTerms"
                  checked={formData.businessAcceptTerms || false}
                  onChange={handleChange}
                  className={`mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                    errors.businessAcceptTerms ? 'border-red-300 ring-1 ring-red-300' : ''
                  }`}
                  required
                />
                <span className="ml-2 text-sm text-gray-600">
                  Jeg aksepterer brukervilkårene, og bekrefter at personopplysningene er korrekte.
                </span>
              </label>
              {errors.businessAcceptTerms && (
                <div className="flex items-center text-red-500 text-sm mt-1">
                  <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.businessAcceptTerms}
                </div>
              )}
            </div>

            {/* Heat pump offer box for business */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-green-600" viewBox="0 0 512 512" fill="currentColor">
                    <g>
                      <polygon points="403.692,219.077 108.308,219.077 90.585,297.846 421.415,297.846"></polygon>
                    </g>
                    <g>
                      <path d="M467.692,66.462H44.308C19.876,66.462,0,86.338,0,110.769v142.769c0,24.431,19.876,44.308,44.308,44.308h16l21.776-96.78
                        c1.516-6.74,7.501-11.528,14.409-11.528h319.015c6.908,0,12.893,4.788,14.409,11.528l21.776,96.78h16
                        c24.431,0,44.308-19.876,44.308-44.308V110.769C512,86.338,492.124,66.462,467.692,66.462z M334.769,169.846h-19.692
                        c-8.157,0-14.769-6.613-14.769-14.769s6.613-14.769,14.769-14.769h19.692c8.157,0,14.769,6.613,14.769,14.769
                        S342.926,169.846,334.769,169.846z M403.692,169.846H384c-8.157,0-14.769-6.613-14.769-14.769s6.613-14.769,14.769-14.769h19.692
                        c8.157,0,14.769,6.613,14.769,14.769S411.849,169.846,403.692,169.846z"></path>
                    </g>
                    <g>
                      <path d="M265.846,365.125c0-4.113,0.767-5.392,2.818-8.809c2.799-4.664,7.028-11.712,7.028-24.008
                        c0-8.157-6.613-14.769-14.769-14.769s-14.769,6.613-14.769,14.769c0,4.113-0.767,5.392-2.818,8.809
                        c-2.799,4.664-7.028,11.712-7.028,24.008c0,12.296,4.229,19.345,7.027,24.01c2.051,3.419,2.819,4.698,2.819,8.812
                        s-0.767,5.395-2.819,8.812c-2.798,4.665-7.027,11.714-7.027,24.01c0,8.157,6.613,14.769,14.769,14.769s14.769-6.613,14.769-14.769
                        c0-4.115,0.767-5.395,2.819-8.812c2.798-4.664,7.027-11.713,7.027-24.01s-4.229-19.345-7.027-24.01
                        C266.614,370.519,265.846,369.240,265.846,365.125z"></path>
                    </g>
                    <g>
                      <path d="M187.077,365.125c0-4.113,0.767-5.392,2.818-8.809c2.799-4.664,7.028-11.712,7.028-24.008
                        c0-8.157-6.613-14.769-14.769-14.769s-14.769,6.613-14.769,14.769c0,4.113-0.767,5.392-2.818,8.809
                        c-2.799,4.664-7.028,11.712-7.028,24.008c0,12.296,4.229,19.345,7.027,24.01c2.051,3.419,2.819,4.698,2.819,8.812
                        s-0.767,5.395-2.819,8.812c-2.798,4.665-7.027,11.714-7.027,24.01c0,8.157,6.613,14.769,14.769,14.769s14.769-6.613,14.769-14.769
                        c0-4.115,0.767-5.395,2.819-8.812c2.798-4.664,7.027-11.713,7.027-24.01s-4.229-19.345-7.027-24.01
                        C187.845,370.519,187.077,369.240,187.077,365.125z"></path>
                    </g>
                    <g>
                      <path d="M344.615,365.125c0-4.113,0.767-5.392,2.818-8.809c2.799-4.664,7.028-11.712,7.028-24.008
                        c0-8.157-6.613-14.769-14.769-14.769s-14.769,6.613-14.769,14.769c0,4.113-0.767,5.392-2.818,8.809
                        c-2.799,4.664-7.028,11.712-7.028,24.008c0,12.296,4.229,19.345,7.027,24.01c2.051,3.419,2.819,4.698,2.819,8.812
                        s-0.767,5.395-2.819,8.812c-2.798,4.665-7.027,11.714-7.027,24.01c0,8.157,6.613,14.769,14.769,14.769s14.769-6.613,14.769-14.769
                        c0-4.115,0.767-5.395,2.819-8.812c2.798-4.664,7.027-11.713,7.027-24.01s-4.229-19.345-7.027-24.01
                        C345.383,370.519,344.615,369.240,344.615,365.125z"></path>
                    </g>
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-green-800 mb-2">
                    Spar mer med varmepumpe
                  </h4>
                  <p className="text-xs text-green-700 mb-3">
                    En varmepumpe kan redusere oppvarmingskostnadene betydelig. Vi kan også hjelpe deg med tilbud på dette.
                  </p>
                  <div className="mt-3">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="businessWantHeatPumpOffer"
                        checked={formData.businessWantHeatPumpOffer || false}
                        onChange={handleChange}
                        className="h-6 w-6 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer"
                      />
                      <span className="ml-4 text-sm text-green-700">
                        <strong>Ja, send meg også tilbud på varmepumpe</strong>
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.submit}
                </div>
              </div>
            )}
            
            {/* Show validation message when submit button is clicked but form is invalid */}
            {!isStepValid && Object.keys(errors).length > 0 && !errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center text-red-700">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">Vennligst fyll ut alle påkrevde felt for å sende inn</span>
                </div>
              </div>
            )}
            
            <div className="flex space-x-4">
              <button
                onClick={handleBack}
                className="w-1/2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-[15px] px-4 rounded-[25px] transition-all duration-300 ease-in-out flex items-center justify-center gap-2"
                disabled={loading}
              >
                Tilbake
              </button>
              <button
                onClick={handleBusinessSubmit}
                disabled={loading}
                className={`w-1/2 font-medium py-[15px] px-4 rounded-[25px] transition-all duration-300 ease-in-out flex items-center justify-center gap-2 ${
                  !loading
                    ? 'bg-[#4CAF50] hover:bg-[#45a049] text-white' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sender...
                  </>
                ) : (
                  <>
                    Send inn
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </>
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