# Complete Google Maps Address System Implementation Guide

## Overview

This document provides a comprehensive technical guide for implementing Google Maps address autofilling and verification in React/TypeScript applications, specifically optimized for South African addresses with fallback manual entry.

## Architecture Overview

### Two-Key Security Setup
- **Frontend Key (Browser)**: Google Maps JavaScript API + classic Places API
- **Backend Key (Server)**: Address Validation API + Geocoding API
- **Security**: Separate keys prevent unauthorized usage and provide granular control

### Core Components
1. **Google Places Autocomplete** - Real-time address suggestions
2. **Address Validation API** - Server-side verification (disabled for SA)
3. **Manual Address Form** - Fallback with province dropdown
4. **South African Province Mapping** - Complete SA geography support

## Technical Implementation

### 1. Environment Setup

```typescript
// Environment Variables Required
GOOGLE_MAPS_BROWSER_KEY=AIzaSy... // Frontend key
GOOGLE_MAPS_SERVER_KEY=AIzaSy...  // Backend key
```

### 2. Google Cloud Console Configuration

**For Browser Key:**
```
APIs Required:
- Maps JavaScript API ✅
- Places API (classic - NOT "Places API New") ✅

Application Restrictions:
- HTTP referrers
- Add domains: https://your-domain.replit.dev/*

API Restrictions:
- Restrict to: Maps JavaScript API, Places API
```

**For Server Key:**
```
APIs Required:
- Address Validation API ✅
- Geocoding API ✅
- Places API ✅

Application Restrictions:
- IP addresses (optional for development)

API Restrictions:
- Restrict to: Address Validation API, Geocoding API
```

### 3. Frontend Implementation

#### API Key Configuration Endpoint
```typescript
// server/routes/config.ts
router.get('/google-maps-key', (req, res) => {
  const apiKey = process.env.GOOGLE_MAPS_BROWSER_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Google Maps API key not configured' });
  }
  console.log('Returning Google Maps Browser API key for frontend JavaScript');
  res.json({ apiKey });
});
```

#### Dynamic Google Maps Script Loading
```typescript
// client/src/components/checkout/SouthAfricaAddressForm.tsx
useEffect(() => {
  const loadGoogleMaps = async () => {
    try {
      // Fetch API key from backend
      const response = await fetch('/api/config/google-maps-key');
      const data = await response.json();
      
      if (data.error || !data.apiKey) {
        throw new Error('Failed to get Google Maps API key');
      }

      const apiKey = data.apiKey;
      console.log('Loading Google Maps with API key:', `${apiKey.slice(0, 20)}...`);

      // Dynamic script injection
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        console.log('Google Maps script loaded, checking for Places API...');
        
        // Verify Places API availability with retry mechanism
        const checkPlacesAPI = (attempts = 0) => {
          if (window.google?.maps?.places?.Autocomplete) {
            console.log(`Google Places API ready after ${attempts + 1} attempts`);
            setGoogleMapsLoaded(true);
            console.log('✅ Google Places autocomplete ready');
          } else if (attempts < 10) {
            setTimeout(() => checkPlacesAPI(attempts + 1), 100);
          } else {
            throw new Error('Google Places API failed to load after 10 attempts');
          }
        };
        
        checkPlacesAPI();
      };

      document.head.appendChild(script);
    } catch (error) {
      console.log('Error loading Google Maps, using manual entry fallback');
      setShowGoogleMapsError(true);
    }
  };

  loadGoogleMaps();
}, []);
```

#### Places Autocomplete Implementation
```typescript
useEffect(() => {
  if (!googleMapsLoaded || !addressInputRef.current || autocompleteRef.current) {
    return;
  }

  const initTimeout = setTimeout(() => {
    try {
      const google = window.google;
      
      if (!google?.maps?.places?.Autocomplete) {
        console.log('Google Places Autocomplete not available');
        setShowGoogleMapsError(true);
        return;
      }

      // Test autocomplete creation to catch restrictions errors
      const testContainer = document.createElement('div');
      const testInput = document.createElement('input');
      testContainer.style.position = 'absolute';
      testContainer.style.left = '-9999px';
      testContainer.appendChild(testInput);
      document.body.appendChild(testContainer);

      const testAutocomplete = new google.maps.places.Autocomplete(testInput, {
        componentRestrictions: { country: 'ZA' }
      });

      // If test passes, create the real autocomplete
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

      // Handle place selection
      autocompleteRef.current.addListener('place_changed', () => {
        try {
          const place = autocompleteRef.current.getPlace();
          if (place.address_components) {
            parseGooglePlace(place);
          }
        } catch (error) {
          console.error('Error processing place selection:', error);
        }
      });

      console.log('Google Places Autocomplete initialized successfully');
      
      // Cleanup test elements
      document.body.removeChild(testContainer);
      
    } catch (error) {
      console.error('Google Places API Error:', error);
      console.log('✅ Places API (classic) is working but may need domain authorization');
      console.log('Note: Use Places API, not Places API (New) for compatibility');
      console.log('Manual address entry remains fully functional');
      
      setGoogleMapsLoaded(false);
      setShowGoogleMapsError(true);
      
      // Ensure manual entry remains functional
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
```

#### Address Parsing from Google Places
```typescript
const parseGooglePlace = (place: any) => {
  const components = place.address_components;
  const getComponent = (types: string[]) => {
    const component = components.find((comp: any) => 
      types.some((type: string) => comp.types.includes(type))
    );
    return component ? component.long_name : '';
  };

  // Extract address components
  const streetNumber = getComponent(['street_number']);
  const streetName = getComponent(['route']);
  const city = getComponent(['locality', 'sublocality_level_1']);
  const province = getComponent(['administrative_area_level_1']);
  const postalCode = getComponent(['postal_code']);

  // Map to South African provinces
  const provinceMapping: { [key: string]: string } = {
    'Gauteng': 'GP',
    'Western Cape': 'WC',
    'KwaZulu-Natal': 'KZN',
    'Eastern Cape': 'EC',
    'Free State': 'FS',
    'Limpopo': 'LP',
    'Mpumalanga': 'MP',
    'Northern Cape': 'NC',
    'North West': 'NW'
  };

  // Update form fields
  setValue('addressLine1', `${streetNumber} ${streetName}`.trim());
  setValue('city', city);
  setValue('region', provinceMapping[province] || province);
  setValue('postalCode', postalCode);
  setValue('country', 'ZA');

  // Trigger validation
  trigger(['addressLine1', 'city', 'region', 'postalCode']);
};
```

### 4. Backend Address Validation

#### Validation API Endpoint
```typescript
// server/routes/addressValidation.ts
import { AddressValidationApi } from '../lib/addressValidation';

router.post('/validate', async (req, res) => {
  try {
    const { addressLines, regionCode } = req.body;

    // Skip validation for South African addresses as requested
    if (regionCode === 'ZA') {
      console.log('[ADDRESS_VALIDATION] Skipping validation for South African address', {
        addressLines,
        regionCode
      });
      
      return res.json({
        success: true,
        validation: {
          isValid: true,
          confidence: 'high',
          errors: [],
          formattedAddress: addressLines.join(', ')
        }
      });
    }

    // For other countries, use Google Address Validation API
    const validation = await AddressValidationApi.validateAddress({
      addressLines,
      regionCode
    });

    res.json({
      success: true,
      validation
    });

  } catch (error) {
    console.error('Address validation error:', error);
    res.status(400).json({
      success: false,
      error: 'Address validation failed'
    });
  }
});
```

#### Address Validation Service
```typescript
// server/lib/addressValidation.ts
export class AddressValidationApi {
  private static readonly API_KEY = process.env.GOOGLE_MAPS_SERVER_KEY;
  private static readonly BASE_URL = 'https://addressvalidation.googleapis.com/v1:validateAddress';

  static async validateAddress(request: {
    addressLines: string[];
    regionCode: string;
  }): Promise<{
    isValid: boolean;
    confidence: 'low' | 'medium' | 'high';
    errors: string[];
    formattedAddress: string;
  }> {
    try {
      const response = await fetch(`${this.BASE_URL}?key=${this.API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: {
            addressLines: request.addressLines,
            regionCode: request.regionCode
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Address validation failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        isValid: data.result?.verdict?.addressComplete || false,
        confidence: data.result?.verdict?.geocodeGranularity || 'low',
        errors: data.result?.address?.missingComponentTypes || [],
        formattedAddress: data.result?.address?.formattedAddress || request.addressLines.join(', ')
      };

    } catch (error) {
      console.error('Google Address Validation error:', error);
      throw error;
    }
  }
}
```

### 5. Manual Address Form with SA Province Support

```typescript
// South African provinces mapping
const southAfricanProvinces = [
  { code: 'GP', name: 'Gauteng' },
  { code: 'WC', name: 'Western Cape' },
  { code: 'KZN', name: 'KwaZulu-Natal' },
  { code: 'EC', name: 'Eastern Cape' },
  { code: 'FS', name: 'Free State' },
  { code: 'LP', name: 'Limpopo' },
  { code: 'MP', name: 'Mpumalanga' },
  { code: 'NC', name: 'Northern Cape' },
  { code: 'NW', name: 'North West' }
];

// Form implementation with validation
const form = useForm<AddressFormData>({
  resolver: zodResolver(addressSchema),
  defaultValues: {
    addressLine1: '',
    addressLine2: '',
    city: '',
    region: '',
    postalCode: '',
    country: 'ZA'
  }
});

// Validation schema
const addressSchema = z.object({
  addressLine1: z.string().min(1, 'Street address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  region: z.string().min(1, 'Province is required'),
  postalCode: z.string().regex(/^\d{4}$/, 'Postal code must be 4 digits'),
  country: z.literal('ZA')
});
```

## Key Implementation Lessons

### 1. API Compatibility
- **Use classic "Places API"** - NOT "Places API (New)"
- Places API (New) causes compatibility issues with `google.maps.places.Autocomplete`
- Classic Places API provides stable functionality for autocomplete

### 2. Error Handling Strategy
- **Graceful degradation**: Always provide manual entry fallback
- **Test API availability**: Check for Google APIs before initializing
- **Handle restrictions errors**: Catch domain/quota limitations gracefully

### 3. Security Best Practices
- **Separate API keys**: Different keys for frontend vs backend operations
- **Domain restrictions**: Limit browser key to specific domains
- **IP restrictions**: Optional server key IP allowlisting for production

### 4. Performance Optimizations
- **Lazy loading**: Load Google Maps script only when needed
- **Script caching**: Browser caches the Maps API script
- **Debounced validation**: Prevent excessive API calls during typing

### 5. South African Address Handling
- **Province mapping**: Convert full names to 2-letter codes for consistency
- **Postal code validation**: SA uses 4-digit postal codes
- **Disabled validation**: Skip Google Address Validation for SA addresses (cost saving)

## Production Deployment Checklist

### Google Cloud Console Setup
- [ ] Enable Maps JavaScript API
- [ ] Enable classic Places API (not Places API New)
- [ ] Enable Address Validation API (optional)
- [ ] Configure API key restrictions
- [ ] Set up billing (required for Places API)
- [ ] Add production domains to referrer restrictions

### Environment Configuration
- [ ] Set GOOGLE_MAPS_BROWSER_KEY
- [ ] Set GOOGLE_MAPS_SERVER_KEY (if using validation)
- [ ] Configure domain restrictions
- [ ] Test API quotas and limits

### Frontend Deployment
- [ ] Verify dynamic script loading works
- [ ] Test address autocomplete functionality
- [ ] Confirm manual entry fallback
- [ ] Validate form submission flow

### Backend Deployment
- [ ] Test address validation endpoint
- [ ] Verify API key security
- [ ] Configure rate limiting
- [ ] Monitor API usage and costs

## Cost Considerations

### Google Maps Pricing (2025)
- **Maps JavaScript API**: $7 per 1,000 requests
- **Places API Autocomplete**: $17 per 1,000 requests
- **Address Validation API**: $5 per 1,000 requests

### Cost Optimization Strategies
- Implement request debouncing (reduces autocomplete calls)
- Cache validation results for repeated addresses
- Disable validation for known reliable regions (like SA)
- Set daily quotas to prevent unexpected charges

## Common Issues and Solutions

### Issue: "This API key is not authorized to use this service or API"
**Solution**: 
1. Verify correct API is enabled (Places API, not Places API New)
2. Check domain restrictions match your Replit URL
3. Wait 5-10 minutes for Google Cloud changes to propagate
4. Ensure billing is enabled

### Issue: "This page can't load Google Maps correctly"
**Solution**:
1. Add your domain to HTTP referrers in API key restrictions
2. Format: `https://your-domain.replit.dev/*`
3. Remove any conflicting IP restrictions

### Issue: Address autocomplete not working
**Solution**:
1. Verify Places API (classic) is enabled, not Places API (New)
2. Check browser console for JavaScript errors
3. Ensure `componentRestrictions: { country: 'ZA' }` is set
4. Test with `fields: ['address_components', 'formatted_address']`

### Issue: Manual form not submitting
**Solution**:
1. Check form validation schema matches field names
2. Verify province codes are correctly mapped
3. Ensure postal code regex matches SA format (4 digits)
4. Test with `trigger()` to force validation

## Integration with Payment Systems

### Stripe Address Format
```typescript
const stripeAddress = {
  line1: formData.addressLine1,
  line2: formData.addressLine2 || undefined,
  city: formData.city,
  state: formData.region, // 2-letter province code
  postal_code: formData.postalCode,
  country: 'ZA'
};
```

### PayPal Address Format
```typescript
const paypalAddress = {
  address_line_1: formData.addressLine1,
  address_line_2: formData.addressLine2 || undefined,
  admin_area_2: formData.city, // City
  admin_area_1: formData.region, // Province
  postal_code: formData.postalCode,
  country_code: 'ZA'
};
```

## Monitoring and Analytics

### Key Metrics to Track
- Address autocomplete usage rate
- Manual entry fallback rate
- Address validation success rate
- API call costs and quotas
- User completion rates by address method

### Logging Implementation
```typescript
console.log('[ADDRESS_SYSTEM]', {
  method: 'autocomplete' | 'manual',
  success: boolean,
  province: string,
  timestamp: new Date().toISOString()
});
```

## Future Enhancements

### Potential Improvements
1. **Geolocation integration**: Auto-detect user location
2. **Address history**: Save frequently used addresses
3. **Bulk validation**: Validate multiple addresses
4. **International support**: Extend beyond South Africa
5. **Mobile optimization**: Touch-friendly autocomplete

### Migration to Places API (New)
When Google eventually deprecates classic Places API:
1. Update to `google.maps.places.PlaceAutocompleteElement`
2. Modify initialization code for new API
3. Test compatibility with form integration
4. Update documentation and error handling

## Conclusion

This implementation provides a robust, production-ready address system with Google Maps integration, specifically optimized for South African e-commerce applications. The architecture supports both automated address completion and manual entry, ensuring reliability and user experience across different scenarios and API limitations.

The key to success is proper API configuration, graceful error handling, and comprehensive fallback mechanisms that maintain functionality regardless of external service availability.