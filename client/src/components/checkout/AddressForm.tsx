import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { z } from 'zod';

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
          <div>
            <Label htmlFor="line1">Street Address *</Label>
            <Input
              id="line1"
              type="text"
              placeholder="123 Main Street"
              value={structuredAddress.line1 || ''}
              onChange={(e) => updateField('line1', e.target.value)}
              className={hasFieldError('line1') ? 'border-red-500 focus:border-red-500' : ''}
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

      {/* Validation Summary */}
      {!isValid && Object.keys(validationErrors).length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please fix the following errors to continue:
            <ul className="mt-2 list-disc list-inside">
              {Object.values(validationErrors).map((error, index) => (
                <li key={index} className="text-sm">{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};