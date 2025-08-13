import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, MapPin, Loader2 } from 'lucide-react';
import { z } from 'zod';

// Google Maps type declarations
declare global {
  interface Window {
    google?: {
      maps: {
        places: {
          AutocompleteService: new () => any;
          PlacesService: new (div: HTMLDivElement) => any;
          PlacesServiceStatus: {
            OK: string;
          };
        };
      };
    };
  }
}

// Address validation schema
const addressSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name too long").optional(),
  phone: z.string().min(10, "Phone number must be at least 10 digits").max(20, "Phone number too long").optional(),
  line1: z.string().min(5, "Street address must be at least 5 characters").max(200, "Street address too long"),
  line2: z.string().max(200, "Address line 2 too long").optional(),
  city: z.string().min(2, "City is required").max(100, "City name too long"),
  state: z.string().min(2, "State/Province is required").max(100, "State name too long").optional(),
  zipCode: z.string().min(3, "Postal/ZIP code is required").max(20, "Postal code too long"),
  country: z.string().min(2, "Country is required").max(100, "Country name too long"),
});

type AddressData = z.infer<typeof addressSchema>;

interface AddressFormProps {
  customerInfo: {
    email: string;
    name: string;
    phone: string;
    address: string;
  };
  onCustomerInfoChange: (info: any) => void;
  onValidationChange: (isValid: boolean, structuredAddress?: AddressData) => void;
}

// Common countries for shipping
const COUNTRIES = [
  'South Africa',
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'New Zealand',
  'Germany',
  'Netherlands',
  'France',
  'Italy',
  'Spain',
  'Other',
];

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

export const AddressForm = ({ customerInfo, onCustomerInfoChange, onValidationChange }: AddressFormProps) => {
  const [structuredAddress, setStructuredAddress] = useState<Partial<AddressData>>({
    email: customerInfo.email,
    name: customerInfo.name,
    phone: customerInfo.phone,
    line1: '',
    line2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'South Africa',
  });
  
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isValid, setIsValid] = useState(false);
  const [isValidatingAddress, setIsValidatingAddress] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const addressInputRef = useRef<HTMLInputElement>(null);
  const autocompleteService = useRef<any>(null);
  const placesService = useRef<any>(null);

  // Initialize Google Maps Places API
  useEffect(() => {
    const initializePlacesAPI = () => {
      if (typeof window !== 'undefined' && window.google && window.google.maps && window.google.maps.places) {
        autocompleteService.current = new window.google.maps.places.AutocompleteService();
        placesService.current = new window.google.maps.places.PlacesService(document.createElement('div'));
      }
    };

    // Load Google Maps JavaScript API
    const loadGoogleMapsAPI = async () => {
      try {
        // Get the API key from the backend
        const response = await fetch('/api/config/google-maps-key');
        const { apiKey } = await response.json();
        
        if (!apiKey) {
          console.warn('Google Maps API key not available');
          return;
        }
        
        if (!document.querySelector('script[src*="maps.googleapis.com"]')) {
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
          script.async = true;
          script.defer = true;
          script.onload = initializePlacesAPI;
          document.head.appendChild(script);
        } else {
          initializePlacesAPI();
        }
      } catch (error) {
        console.warn('Failed to load Google Maps API:', error);
      }
    };

    loadGoogleMapsAPI();
  }, []);

  // Parse existing address if it exists
  useEffect(() => {
    if (customerInfo.address && structuredAddress.line1 === '') {
      // Try to parse the existing address
      const addressLines = customerInfo.address.split('\n').filter(line => line.trim());
      if (addressLines.length > 0) {
        setStructuredAddress(prev => ({
          ...prev,
          line1: addressLines[0] || '',
          line2: addressLines[1] || '',
          city: addressLines[2] || '',
          state: prev.country === 'South Africa' ? 'Gauteng' : '',
          zipCode: addressLines[addressLines.length - 1]?.match(/\d{4,}/)?.[0] || '',
        }));
      }
    }
  }, [customerInfo.address, structuredAddress.line1]);

  // Validate address on change
  useEffect(() => {
    const result = addressSchema.safeParse(structuredAddress);
    
    if (result.success) {
      setValidationErrors({});
      setIsValid(true);
      
      // Create formatted address string for legacy compatibility
      const formattedAddress = [
        structuredAddress.line1,
        structuredAddress.line2,
        structuredAddress.city,
        structuredAddress.state,
        structuredAddress.zipCode,
        structuredAddress.country,
      ].filter(Boolean).join('\n');
      
      // Update customer info with formatted address
      onCustomerInfoChange({
        ...customerInfo,
        email: structuredAddress.email || '',
        name: structuredAddress.name || '',
        phone: structuredAddress.phone || '',
        address: formattedAddress,
      });
      
      onValidationChange(true, result.data);
    } else {
      const errors: Record<string, string> = {};
      result.error.errors.forEach(error => {
        if (error.path.length > 0) {
          errors[error.path[0] as string] = error.message;
        }
      });
      setValidationErrors(errors);
      setIsValid(false);
      onValidationChange(false);
    }
  }, [structuredAddress, onCustomerInfoChange, onValidationChange, customerInfo]);

  const updateField = (field: keyof AddressData, value: string) => {
    setStructuredAddress(prev => ({ ...prev, [field]: value }));
    
    // Trigger address suggestions for street address
    if (field === 'line1' && value.length > 3 && autocompleteService.current) {
      getAddressSuggestions(value);
    } else if (field === 'line1' && value.length <= 3) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Get address suggestions from Google Places API
  const getAddressSuggestions = async (input: string) => {
    if (!autocompleteService.current) return;
    
    try {
      const request = {
        input,
        componentRestrictions: { country: structuredAddress.country === 'South Africa' ? 'za' : 'us' },
        types: ['address']
      };
      
      autocompleteService.current.getPlacePredictions(request, (predictions: any[], status: any) => {
        if (status === window.google?.maps?.places?.PlacesServiceStatus?.OK && predictions) {
          setAddressSuggestions(predictions.slice(0, 5));
          setShowSuggestions(true);
        } else {
          setAddressSuggestions([]);
          setShowSuggestions(false);
        }
      });
    } catch (error) {
      console.error('Error getting address suggestions:', error);
    }
  };

  // Select an address suggestion
  const selectAddressSuggestion = async (placeId: string) => {
    if (!placesService.current) return;
    
    setIsValidatingAddress(true);
    setShowSuggestions(false);
    
    try {
      const request = {
        placeId,
        fields: ['address_components', 'formatted_address', 'name']
      };
      
      placesService.current.getDetails(request, (place: any, status: any) => {
        if (status === window.google?.maps?.places?.PlacesServiceStatus?.OK && place.address_components) {
          const addressComponents = place.address_components;
          
          // Parse Google Places address components
          const getComponent = (types: string[]) => {
            const component = addressComponents.find((comp: any) => 
              types.some(type => comp.types.includes(type))
            );
            return component ? component.long_name : '';
          };
          
          const streetNumber = getComponent(['street_number']);
          const streetName = getComponent(['route']);
          const subpremise = getComponent(['subpremise']);
          const city = getComponent(['locality', 'administrative_area_level_2']);
          const state = getComponent(['administrative_area_level_1']);
          const postalCode = getComponent(['postal_code']);
          const country = getComponent(['country']);
          
          // Build structured address
          const line1 = [streetNumber, streetName].filter(Boolean).join(' ') || place.name;
          const line2 = subpremise || '';
          
          setStructuredAddress(prev => ({
            ...prev,
            line1,
            line2,
            city: city || prev.city,
            state: state || prev.state,
            zipCode: postalCode || prev.zipCode,
            country: country === 'South Africa' ? 'South Africa' : prev.country,
          }));
        }
        setIsValidatingAddress(false);
      });
    } catch (error) {
      console.error('Error getting place details:', error);
      setIsValidatingAddress(false);
    }
  };

  // Validate address with server-side Google Maps API
  const validateAddressWithGoogle = async () => {
    if (!structuredAddress.line1 || !structuredAddress.city || !structuredAddress.zipCode) return;
    
    setIsValidatingAddress(true);
    
    try {
      // Get CSRF token for the request
      const csrfResponse = await fetch('/api/csrf');
      const csrfData = await csrfResponse.json();
      
      const response = await fetch('/api/address/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfData.csrfToken,
        },
        body: JSON.stringify({
          line1: structuredAddress.line1,
          line2: structuredAddress.line2,
          city: structuredAddress.city,
          state: structuredAddress.state,
          postalCode: structuredAddress.zipCode,
          country: structuredAddress.country,
        }),
      });

      const data = await response.json();

      if (data.success && data.validation.isValid) {
        // Address validated successfully
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.googleValidation;
          return newErrors;
        });
        
        // Optionally update address with formatted version
        if (data.validation.components) {
          const components = data.validation.components;
          setStructuredAddress(prev => ({
            ...prev,
            // Update with more accurate components if available
            city: components.city || prev.city,
            state: components.state || prev.state,
            zipCode: components.postalCode || prev.zipCode,
          }));
        }
      } else {
        // Address could not be validated
        const errorMessage = data.validation?.errors?.[0] || 'Address could not be verified. Please check the details.';
        setValidationErrors(prev => ({ 
          ...prev, 
          googleValidation: errorMessage
        }));
      }
    } catch (error) {
      console.error('Error validating address:', error);
      setValidationErrors(prev => ({ 
        ...prev, 
        googleValidation: 'Address validation service temporarily unavailable.' 
      }));
    } finally {
      setIsValidatingAddress(false);
    }
  };

  const getFieldError = (field: string) => validationErrors[field];
  const hasFieldError = (field: string) => !!getFieldError(field);

  return (
    <div className="space-y-6">
      {/* Contact Information */}
      <div className="space-y-4">
        <h4 className="font-medium flex items-center gap-2">
          Contact Information
          {isValid && (
            <CheckCircle className="w-4 h-4 text-green-600" />
          )}
        </h4>
        
        <div className="space-y-3">
          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={structuredAddress.email || ''}
              onChange={(e) => updateField('email', e.target.value)}
              className={hasFieldError('email') ? 'border-red-500 focus:border-red-500' : ''}
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

          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={structuredAddress.name || ''}
              onChange={(e) => updateField('name', e.target.value)}
              className={hasFieldError('name') ? 'border-red-500 focus:border-red-500' : ''}
              data-testid="input-name"
            />
            {hasFieldError('name') && (
              <Alert className="mt-1 py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {getFieldError('name')}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+27 82 123 4567"
              value={structuredAddress.phone || ''}
              onChange={(e) => updateField('phone', e.target.value)}
              className={hasFieldError('phone') ? 'border-red-500 focus:border-red-500' : ''}
              data-testid="input-phone"
            />
            {hasFieldError('phone') && (
              <Alert className="mt-1 py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {getFieldError('phone')}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="space-y-4">
        <h4 className="font-medium">Shipping Address</h4>
        
        <div className="space-y-3">
          <div className="relative">
            <Label htmlFor="line1">Street Address *</Label>
            <div className="relative">
              <Input
                ref={addressInputRef}
                id="line1"
                type="text"
                placeholder="123 Main Street"
                value={structuredAddress.line1 || ''}
                onChange={(e) => updateField('line1', e.target.value)}
                onFocus={() => {
                  if (addressSuggestions.length > 0) setShowSuggestions(true);
                }}
                onBlur={() => {
                  // Delay hiding suggestions to allow clicking
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
                className={hasFieldError('line1') ? 'border-red-500 focus:border-red-500' : ''}
                data-testid="input-address-line1"
                required
              />
              {isValidatingAddress && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                </div>
              )}
            </div>
            
            {/* Address suggestions dropdown */}
            {showSuggestions && addressSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {addressSuggestions.map((suggestion, index) => (
                  <button
                    key={suggestion.place_id}
                    type="button"
                    onClick={() => selectAddressSuggestion(suggestion.place_id)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                  >
                    <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm">{suggestion.description}</span>
                  </button>
                ))}
              </div>
            )}
            
            {hasFieldError('line1') && (
              <Alert className="mt-1 py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {getFieldError('line1')}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div>
            <Label htmlFor="line2">Apartment, suite, etc. (optional)</Label>
            <Input
              id="line2"
              type="text"
              placeholder="Apartment 4B"
              value={structuredAddress.line2 || ''}
              onChange={(e) => updateField('line2', e.target.value)}
              className={hasFieldError('line2') ? 'border-red-500 focus:border-red-500' : ''}
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
                value={structuredAddress.city || ''}
                onChange={(e) => updateField('city', e.target.value)}
                className={hasFieldError('city') ? 'border-red-500 focus:border-red-500' : ''}
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
              <Label htmlFor="zipCode">Postal Code *</Label>
              <Input
                id="zipCode"
                type="text"
                placeholder="8001"
                value={structuredAddress.zipCode || ''}
                onChange={(e) => updateField('zipCode', e.target.value)}
                className={hasFieldError('zipCode') ? 'border-red-500 focus:border-red-500' : ''}
                data-testid="input-postal-code"
                required
              />
              {hasFieldError('zipCode') && (
                <Alert className="mt-1 py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    {getFieldError('zipCode')}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="state">State/Province</Label>
              {structuredAddress.country === 'South Africa' ? (
                <Select 
                  value={structuredAddress.state || ''} 
                  onValueChange={(value) => updateField('state', value)}
                >
                  <SelectTrigger 
                    className={hasFieldError('state') ? 'border-red-500 focus:border-red-500' : ''}
                    data-testid="select-province"
                  >
                    <SelectValue placeholder="Select Province" />
                  </SelectTrigger>
                  <SelectContent>
                    {SA_PROVINCES.map(province => (
                      <SelectItem key={province} value={province}>{province}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="state"
                  type="text"
                  placeholder="State/Province"
                  value={structuredAddress.state || ''}
                  onChange={(e) => updateField('state', e.target.value)}
                  className={hasFieldError('state') ? 'border-red-500 focus:border-red-500' : ''}
                  data-testid="input-state"
                />
              )}
              {hasFieldError('state') && (
                <Alert className="mt-1 py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    {getFieldError('state')}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div>
              <Label htmlFor="country">Country *</Label>
              <Select 
                value={structuredAddress.country || ''} 
                onValueChange={(value) => updateField('country', value)}
              >
                <SelectTrigger 
                  className={hasFieldError('country') ? 'border-red-500 focus:border-red-500' : ''}
                  data-testid="select-country"
                >
                  <SelectValue placeholder="Select Country" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map(country => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {hasFieldError('country') && (
                <Alert className="mt-1 py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    {getFieldError('country')}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Address Validation Button */}
      {structuredAddress.line1 && structuredAddress.city && structuredAddress.zipCode && (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={validateAddressWithGoogle}
            disabled={isValidatingAddress}
            className="flex items-center gap-2"
            data-testid="button-validate-address"
          >
            {isValidatingAddress ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MapPin className="h-4 w-4" />
            )}
            {isValidatingAddress ? 'Validating...' : 'Verify Address'}
          </Button>
          {getFieldError('googleValidation') && (
            <span className="text-sm text-amber-600">⚠️ {getFieldError('googleValidation')}</span>
          )}
          {!getFieldError('googleValidation') && structuredAddress.line1 && structuredAddress.city && (
            <span className="text-sm text-green-600">✓ Ready for verification</span>
          )}
        </div>
      )}

      {/* Validation Summary */}
      {!isValid && Object.keys(validationErrors).length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please fix the following errors to continue:
            <ul className="mt-2 list-disc list-inside">
              {Object.values(validationErrors).filter(error => error && error !== '').map((error, index) => (
                <li key={index} className="text-sm">{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};