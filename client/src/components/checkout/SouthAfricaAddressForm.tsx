import React, { useState, useEffect, useRef } from 'react';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';

// Extend window type for Google Places API
declare global {
  interface Window {
    google?: {
      maps?: {
        places?: {
          Autocomplete: new (input: HTMLInputElement, options: any) => any;
          AutocompleteService: new () => any;
          PlacesServiceStatus: {
            OK: string;
          };
        };
      };
    };
    initGoogleMaps?: () => void;
  }
}

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
  
  const autocompleteRef = useRef<any>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);

  // Load Google Maps API for Places autocomplete
  useEffect(() => {
    const loadGoogleMaps = async () => {
      try {
        // Check if already loaded
        if (window.google?.maps?.places?.Autocomplete) {
          setGoogleMapsLoaded(true);
          return;
        }

        const response = await fetch('/api/config/google-maps-key');
        if (!response.ok) {
          
          setShowGoogleMapsError(true);
          return;
        }
        
        const { apiKey } = await response.json();
        if (!apiKey) {
          
          setShowGoogleMapsError(true);
          return;
        }

        console.log('Loading Google Maps API with key:', apiKey.substring(0, 10) + '...');

        // Try direct script loading without callback first
        const directScript = document.createElement('script');
        directScript.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&region=ZA`;
        directScript.async = true;
        
        const loadPromise = new Promise((resolve, reject) => {
          directScript.onload = () => {
            
            let attempts = 0;
            const checkPlaces = () => {
              attempts++;
              if (window.google?.maps?.places?.Autocomplete) {
                
                resolve(true);
              } else if (attempts < 20) {
                setTimeout(checkPlaces, 100);
              } else {
                
                reject(new Error('Places API not available'));
              }
            };
            checkPlaces();
          };
          
          directScript.onerror = (error) => {
            // // console.error('Google Maps direct load failed:', error);
            reject(error);
          };
        });

        document.head.appendChild(directScript);

        try {
          await loadPromise;
          setGoogleMapsLoaded(true);
          
        } catch (error) {

          setShowGoogleMapsError(true);
        }

      } catch (error) {
        
        setShowGoogleMapsError(true);
      }
    };

    loadGoogleMaps();
  }, []);

  // Initialize Google Places Autocomplete (when available)
  useEffect(() => {
    if (!googleMapsLoaded || !addressInputRef.current || autocompleteRef.current) {
      return;
    }

    // Add delay and try to initialize autocomplete safely
    const initTimeout = setTimeout(() => {
      try {
        const google = window.google;
        
        if (!google?.maps?.places?.Autocomplete) {
          
          setShowGoogleMapsError(true);
          return;
        }

        // Test if we can create autocomplete without restrictions error
        const testContainer = document.createElement('div');
        const testInput = document.createElement('input');
        testContainer.style.position = 'absolute';
        testContainer.style.left = '-9999px';
        testContainer.appendChild(testInput);
        document.body.appendChild(testContainer);

        const testAutocomplete = new google.maps.places.Autocomplete(testInput, {
          componentRestrictions: { country: 'ZA' }
        });

        // If test passes, create the real one
        if (addressInputRef.current) {
          autocompleteRef.current = new google.maps.places.Autocomplete(
            addressInputRef.current,
            {
              componentRestrictions: { country: 'ZA' },
              fields: ['address_components', 'formatted_address', 'place_id'],
              types: ['address'],
            }
          );
        }

        autocompleteRef.current.addListener('place_changed', () => {
          try {
            const place = autocompleteRef.current.getPlace();
            if (place.address_components) {
              parseGooglePlace(place);
            }
          } catch (error) {
            // // console.error('Error processing place selection:', error);
          }
        });

        document.body.removeChild(testContainer);
        
      } catch (error) {
        // // console.error('Google Places API Error:', error);
        console.warn('Google Places API is working but may need domain authorization');
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
      if (autocompleteRef.current && window.google?.maps && 'event' in window.google.maps) {
        try {
          (window.google.maps as any).event.clearInstanceListeners(autocompleteRef.current);
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    };
  }, [googleMapsLoaded]);

  // Parse Google Places result
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
                Powered by Google - Address autocomplete enabled
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