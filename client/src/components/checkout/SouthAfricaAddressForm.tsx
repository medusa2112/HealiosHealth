import React, { useState, useEffect, useRef } from 'react';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';
import googleMapsService from '@/lib/googleMapsService';

// Google Maps types are now handled by the centralized service

// South African provinces
const SA_PROVINCES = [
  'Eastern Cape',
  'Free State', 
  'Gauteng',
  'KwaZulu-Natal',
  'Limpopo',
  'Mpumalanga',
  'North West',
  'Northern Cape',
  'Western Cape',
];

// Address validation schema
const addressSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  phone: z.string().min(10, "Phone number must be at least 10 digits").optional(),
  line1: z.string().min(5, "Street address must be at least 5 characters"),
  line2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  region: z.string().min(2, "Province is required"),
  postal_code: z.string().min(4, "Postal code must be at least 4 characters"),
  country: z.literal("South Africa"),
});

type AddressData = z.infer<typeof addressSchema>;

interface SouthAfricaAddressFormProps {
  onValidationChange: (isValid: boolean, address?: AddressData) => void;
}

export const SouthAfricaAddressForm = ({ onValidationChange }: SouthAfricaAddressFormProps) => {
  const [address, setAddress] = useState<Partial<AddressData>>({
    email: '',
    name: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    region: '',
    postal_code: '',
    country: 'South Africa',
  });
  
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isValid, setIsValid] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [showGoogleMapsError, setShowGoogleMapsError] = useState(false);
  const [useNewApi, setUseNewApi] = useState(false);
  
  const autocompleteRef = useRef<any>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const placeAutocompleteElementRef = useRef<any>(null);
  const autocompleteContainerRef = useRef<HTMLDivElement>(null);

  // Load Google Maps API using centralized service
  useEffect(() => {
    const loadGoogleMaps = async () => {
      try {
        const loaded = await googleMapsService.load({
          libraries: ['places'],
          region: 'ZA',
          language: 'en'
        });
        
        if (loaded) {
          setGoogleMapsLoaded(true);
          console.log('Google Maps loaded successfully via service');
          
          // Check if new API is supported and try to load it
          if (googleMapsService.supportsNewApi()) {
            try {
              await googleMapsService.loadNewPlacesLibrary();
              setUseNewApi(true);
              console.log('New PlaceAutocompleteElement API will be used');
            } catch (error) {
              console.warn('Failed to load new Places API, using legacy:', error);
              setUseNewApi(false);
            }
          } else {
            console.log('New Places API not available, using legacy');
            setUseNewApi(false);
          }
        } else {
          const error = googleMapsService.getError();
          console.warn('Google Maps failed to load:', error);
          setShowGoogleMapsError(true);
        }
      } catch (error) {
        console.error('Google Maps loading error:', error);
        setShowGoogleMapsError(true);
      }
    };

    loadGoogleMaps();
  }, []);

  // Initialize Google Places Autocomplete using centralized service
  useEffect(() => {
    if (!googleMapsLoaded || (autocompleteRef.current || placeAutocompleteElementRef.current)) {
      return;
    }

    // Add delay to ensure DOM is ready
    const initTimeout = setTimeout(() => {
      try {
        if (!googleMapsService.isLoaded()) {
          console.warn('Google Maps service not loaded, falling back to manual entry');
          setShowGoogleMapsError(true);
          return;
        }

        if (useNewApi && googleMapsService.supportsNewApi()) {
          // Use new PlaceAutocompleteElement API
          initializeNewApi();
        } else {
          // Fallback to legacy API
          initializeLegacyApi();
        }
        
      } catch (error) {
        console.warn('Google Places API initialization failed:', error);
        console.warn('Falling back to manual address entry for compatibility');

        setGoogleMapsLoaded(false);
        setShowGoogleMapsError(true);
        
        // Ensure the input field remains functional for manual entry
        if (addressInputRef.current) {
          addressInputRef.current.disabled = false;
          addressInputRef.current.readOnly = false;
        }
      }
    }, 1000);

    return () => {
      clearTimeout(initTimeout);
      cleanupAutocompleteInstances();
    };
  }, [googleMapsLoaded, useNewApi]);

  // Parse Google Places result (Legacy API)
  const parseGooglePlace = (place: any) => {
    const components = place.address_components;
    const getComponent = (types: string[]) => {
      const component = components.find((comp: any) => 
        types.some((type: string) => comp.types.includes(type))
      );
      return component ? component.long_name : '';
    };

    const streetNumber = getComponent(['street_number']);
    const route = getComponent(['route']);
    const line1 = `${streetNumber} ${route}`.trim();

    setAddress(prev => ({
      ...prev,
      line1: line1 || place.formatted_address,
      city: getComponent(['locality', 'administrative_area_level_2']),
      region: getComponent(['administrative_area_level_1']),
      postal_code: getComponent(['postal_code']),
      country: 'South Africa'
    }));
  };

  // Parse Google Places result (New API)
  const parseNewApiPlace = (place: any) => {
    try {
      console.log('Parsing place from new API:', place);
      
      const getAddressComponent = (types: string[]) => {
        if (!place.addressComponents) return '';
        
        const component = place.addressComponents.find((comp: any) => 
          types.some((type: string) => comp.types.includes(type))
        );
        return component ? component.longText : '';
      };

      const streetNumber = getAddressComponent(['street_number']);
      const route = getAddressComponent(['route']);
      const line1 = `${streetNumber} ${route}`.trim();

      setAddress(prev => ({
        ...prev,
        line1: line1 || place.formattedAddress,
        city: getAddressComponent(['locality', 'administrative_area_level_2']),
        region: getAddressComponent(['administrative_area_level_1']),
        postal_code: getAddressComponent(['postal_code']),
        country: 'South Africa'
      }));
    } catch (error) {
      console.warn('Error parsing place from new API:', error);
      // Fallback to formatted address if parsing fails
      if (place.formattedAddress) {
        setAddress(prev => ({
          ...prev,
          line1: place.formattedAddress,
          country: 'South Africa'
        }));
      }
    }
  };

  const initializeNewApi = () => {
    try {
      console.log('Initializing new PlaceAutocompleteElement API');
      
      placeAutocompleteElementRef.current = googleMapsService.createPlaceAutocompleteElement({
        componentRestrictions: { country: 'ZA' },
        types: ['address'],
      });

      // Style the element to match our design
      placeAutocompleteElementRef.current.style.width = '100%';
      placeAutocompleteElementRef.current.style.height = '40px';
      placeAutocompleteElementRef.current.style.border = '1px solid #d1d5db';
      placeAutocompleteElementRef.current.style.borderRadius = '6px';
      placeAutocompleteElementRef.current.style.padding = '8px 12px';
      placeAutocompleteElementRef.current.style.fontSize = '14px';
      
      // Add event listener for place selection
      placeAutocompleteElementRef.current.addEventListener('gmp-select', async (event: any) => {
        try {
          const { placePrediction } = event;
          if (placePrediction) {
            console.log('Place selected via new API:', placePrediction);
            
            // Convert prediction to Place and fetch fields
            const place = placePrediction.toPlace();
            await place.fetchFields({
              fields: ['addressComponents', 'formattedAddress', 'id']
            });
            
            parseNewApiPlace(place);
          }
        } catch (error) {
          console.warn('Error processing new API place selection:', error);
        }
      });

      // Append to container if available, or hide the original input
      if (autocompleteContainerRef.current) {
        autocompleteContainerRef.current.appendChild(placeAutocompleteElementRef.current);
        if (addressInputRef.current) {
          addressInputRef.current.style.display = 'none';
        }
      }
      
      console.log('New PlaceAutocompleteElement initialized successfully');
      
    } catch (error) {
      console.warn('Failed to initialize new API, falling back to legacy:', error);
      setUseNewApi(false);
      initializeLegacyApi();
    }
  };

  const initializeLegacyApi = () => {
    if (!addressInputRef.current) {
      console.warn('Address input ref not available for legacy API');
      return;
    }

    console.log('Initializing legacy Autocomplete API');

    // Test autocomplete creation with a temporary input first
    const testContainer = document.createElement('div');
    const testInput = document.createElement('input');
    testContainer.style.position = 'absolute';
    testContainer.style.left = '-9999px';
    testContainer.appendChild(testInput);
    document.body.appendChild(testContainer);

    try {
      const testAutocomplete = googleMapsService.createAutocomplete(testInput, {
        componentRestrictions: { country: 'ZA' }
      });
      
      // If test passes, create the real autocomplete
      autocompleteRef.current = googleMapsService.createAutocomplete(
        addressInputRef.current,
        {
          componentRestrictions: { country: 'ZA' },
          fields: ['address_components', 'formatted_address', 'place_id'],
          types: ['address'],
        }
      );

      autocompleteRef.current.addListener('place_changed', () => {
        try {
          const place = autocompleteRef.current.getPlace();
          if (place.address_components) {
            parseGooglePlace(place);
          }
        } catch (error) {
          console.warn('Error processing legacy place selection:', error);
        }
      });
      
      document.body.removeChild(testContainer);
      console.log('Legacy Autocomplete initialized successfully');
      
    } catch (testError) {
      document.body.removeChild(testContainer);
      throw testError;
    }
  };

  const cleanupAutocompleteInstances = () => {
    if (autocompleteRef.current) {
      try {
        googleMapsService.clearInstanceListeners(autocompleteRef.current);
      } catch (error) {
        console.warn('Error clearing legacy autocomplete listeners:', error);
      }
      autocompleteRef.current = null;
    }

    if (placeAutocompleteElementRef.current) {
      try {
        // Remove from DOM
        if (placeAutocompleteElementRef.current.parentNode) {
          placeAutocompleteElementRef.current.parentNode.removeChild(placeAutocompleteElementRef.current);
        }
        // Show original input again if hidden
        if (addressInputRef.current) {
          addressInputRef.current.style.display = '';
        }
      } catch (error) {
        console.warn('Error cleaning up PlaceAutocompleteElement:', error);
      }
      placeAutocompleteElementRef.current = null;
    }
  };

  // Validate address format (currently simplified due to API restrictions)
  const validateWithGoogle = async () => {
    if (!address.line1 || !address.city || !address.region) {
      setValidationErrors(prev => ({ 
        ...prev, 
        addressValidation: 'Please fill in address, city, and province first' 
      }));
      return;
    }

    setIsValidating(true);

    try {
      // Call the backend address validation API
      const addressLines = [
        address.line1,
        address.line2,
        address.city,
        address.region,
        address.postal_code,
        'South Africa'
      ].filter(line => line && line.trim());

      const response = await fetch('/api/validate-address/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          addressLines,
          regionCode: 'ZA'
        }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.validation?.isValid) {
        setValidationResult({
          confidence: data.validation.confidence || 'HIGH',
          verdict: 'VALID',
          completeness: 'COMPLETE'
        });
        
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.addressValidation;
          return newErrors;
        });
      } else {
        // Fallback to local validation if API fails
        const hasStreetNumber = /\d+/.test(address.line1);
        const isValidCity = address.city.length >= 2;
        const isValidProvince = SA_PROVINCES.includes(address.region);
        const hasPostalCode = address.postal_code && /^\d{4}$/.test(address.postal_code);

        if (hasStreetNumber && isValidCity && isValidProvince) {
          setValidationResult({
            confidence: 'MEDIUM',
            verdict: 'VALID',
            completeness: hasPostalCode ? 'COMPLETE' : 'MISSING_POSTAL_CODE'
          });
          
          setValidationErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.addressValidation;
            return newErrors;
          });
          
          if (!hasPostalCode) {
            setValidationErrors(prev => ({ 
              ...prev, 
              addressValidation: 'Address format looks good! Postal code recommended for better delivery.' 
            }));
          }
        } else {
          setValidationErrors(prev => ({ 
            ...prev, 
            addressValidation: 'Please check: street number, city name, and province selection' 
          }));
          setValidationResult(null);
        }
      }
    } catch (error) {
      // // console.error('Address validation error:', error);
      setValidationErrors(prev => ({ 
        ...prev, 
        addressValidation: 'Address validation temporarily unavailable'
      }));
      setValidationResult(null);
    } finally {
      setIsValidating(false);
    }
  };

  // Handle field changes
  const handleFieldChange = (field: keyof AddressData, value: string) => {
    setAddress(prev => ({ ...prev, [field]: value }));
    
    // Clear field-specific errors
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Validate form
  useEffect(() => {
    const result = addressSchema.safeParse(address);
    
    if (result.success) {
      setIsValid(true);
      setValidationErrors({});
      // Map region to state for Stripe compatibility
      const stripeCompatibleAddress = {
        ...result.data,
        state: result.data.region // Map region to state for Stripe
      };
      onValidationChange(true, stripeCompatibleAddress as AddressData);
    } else {
      setIsValid(false);
      const errors: Record<string, string> = {};
      result.error.errors.forEach(error => {
        errors[error.path[0] as string] = error.message;
      });
      setValidationErrors(errors);
      onValidationChange(false);
    }
  }, [address, onValidationChange]);

  const getFieldError = (field: string) => validationErrors[field];
  const hasFieldError = (field: string) => !!validationErrors[field];

  return (
    <div className="space-y-6">
      {/* Customer Information */}
      <div className="space-y-4">
        <h4 className="font-medium">Customer Information</h4>
        
        <div className="space-y-3">
          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={address.email || ''}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              className={hasFieldError('email') ? 'border-red-500' : ''}
              data-testid="input-email"
              required
            />
            {hasFieldError('email') && (
              <Alert className="mt-1 py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {getFieldError('email')}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={address.name || ''}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                className={hasFieldError('name') ? 'border-red-500' : ''}
                data-testid="input-name"
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+27 82 123 4567"
                value={address.phone || ''}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                className={hasFieldError('phone') ? 'border-red-500' : ''}
                data-testid="input-phone"
              />
            </div>
          </div>
        </div>
      </div>

      {/* South African Shipping Address */}
      <div className="space-y-4">
        <h4 className="font-medium">Shipping Address</h4>
        
        <div className="space-y-3">
          <div>
            <Label htmlFor="line1">Street Address *</Label>
            {/* Container for the new PlaceAutocompleteElement */}
            <div ref={autocompleteContainerRef} className="w-full" />
            <Input
              ref={addressInputRef}
              id="line1"
              type="text"
              placeholder={googleMapsLoaded ? "Start typing your address..." : "Enter your street address (e.g., 123 Main Street)"}
              value={address.line1 || ''}
              onChange={(e) => handleFieldChange('line1', e.target.value)}
              className={hasFieldError('line1') ? 'border-red-500' : ''}
              data-testid="input-address-line1"
              required
            />
            {hasFieldError('line1') && (
              <Alert className="mt-1 py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {getFieldError('line1')}
                </AlertDescription>
              </Alert>
            )}
            
            {/* Google Maps status messages */}
            {googleMapsLoaded && (
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Powered by Google - Address autocomplete {useNewApi ? '(Enhanced)' : '(Legacy)'} enabled
              </p>
            )}
            {!googleMapsLoaded && !showGoogleMapsError && (
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading address autocomplete...
              </p>
            )}
            {showGoogleMapsError && (
              <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Manual entry mode - autocomplete unavailable
              </p>
            )}
            {googleMapsLoaded && !showGoogleMapsError && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Address autocomplete enabled - start typing
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="line2">Apartment, suite, etc. (optional)</Label>
            <Input
              id="line2"
              type="text"
              placeholder="Unit 4B"
              value={address.line2 || ''}
              onChange={(e) => handleFieldChange('line2', e.target.value)}
              data-testid="input-address-line2"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                type="text"
                placeholder="Cape Town"
                value={address.city || ''}
                onChange={(e) => handleFieldChange('city', e.target.value)}
                className={hasFieldError('city') ? 'border-red-500' : ''}
                data-testid="input-city"
                required
              />
              {hasFieldError('city') && (
                <Alert className="mt-1 py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    {getFieldError('city')}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div>
              <Label htmlFor="postal_code">Postal Code *</Label>
              <Input
                id="postal_code"
                type="text"
                placeholder="8001"
                value={address.postal_code || ''}
                onChange={(e) => handleFieldChange('postal_code', e.target.value)}
                className={hasFieldError('postal_code') ? 'border-red-500' : ''}
                data-testid="input-postal-code"
                required
              />
              {hasFieldError('postal_code') && (
                <Alert className="mt-1 py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    {getFieldError('postal_code')}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="region">Province *</Label>
            <Select 
              value={address.region || ''} 
              onValueChange={(value) => handleFieldChange('region', value)}
            >
              <SelectTrigger className={hasFieldError('region') ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select province" />
              </SelectTrigger>
              <SelectContent>
                {SA_PROVINCES.map((province) => (
                  <SelectItem key={province} value={province}>
                    {province}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasFieldError('region') && (
              <Alert className="mt-1 py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {getFieldError('region')}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        {/* Address Validation */}
        {address.line1 && address.city && address.region && (
          <div className="space-y-2 pt-3 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={validateWithGoogle}
                disabled={isValidating}
                className="flex items-center gap-2"
                data-testid="button-validate-address"
              >
                {isValidating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MapPin className="h-4 w-4" />
                )}
                {isValidating ? 'Checking...' : 'Verify Address Format'}
              </Button>
              
              {validationResult && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-green-600">
                    Verified ({validationResult.confidence} confidence)
                  </span>
                </div>
              )}
            </div>
            
            {validationErrors.addressValidation && (
              <Alert className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {validationErrors.addressValidation}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </div>
    </div>
  );
};