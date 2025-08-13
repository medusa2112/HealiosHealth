import fetch from 'node-fetch';
import { logger } from './logger';

interface GoogleAddressValidationResponse {
  result: {
    verdict: {
      inputGranularity: string;
      validationGranularity: string;
      geocodeGranularity: string;
      addressComplete: boolean;
      hasUnconfirmedComponents: boolean;
      hasInferredComponents: boolean;
      hasReplacedComponents: boolean;
    };
    address: {
      formattedAddress: string;
      postalAddress: {
        regionCode: string;
        languageCode: string;
        postalCode: string;
        sortingCode: string;
        administrativeArea: string;
        locality: string;
        sublocality: string;
        addressLines: string[];
      };
      addressComponents: Array<{
        componentName: {
          text: string;
          languageCode: string;
        };
        componentType: string;
        confirmationLevel: string;
      }>;
    };
    geocode: {
      location: {
        latitude: number;
        longitude: number;
      };
      plusCode: {
        globalCode: string;
        compoundCode: string;
      };
      bounds: {
        low: { latitude: number; longitude: number };
        high: { latitude: number; longitude: number };
      };
      featureSizeMeters: number;
      placeId: string;
      placeType: string[];
    };
  };
}

interface StructuredAddress {
  line1: string;
  line2?: string;
  city: string;
  region: string;
  postal_code: string;
  country: string;
}

interface AddressValidationResult {
  isValid: boolean;
  confidence: 'high' | 'medium' | 'low';
  formattedAddress?: string;
  structuredAddress?: StructuredAddress;
  coordinates?: {
    lat: number;
    lng: number;
  };
  errors?: string[];
}

export class AddressValidationService {
  private apiKey: string;
  private baseUrl = 'https://addressvalidation.googleapis.com/v1:validateAddress';

  constructor() {
    // Use server key for backend Address Validation API calls
    this.apiKey = process.env.GOOGLE_MAPS_SERVER_KEY || '';
    if (!this.apiKey) {
      logger.warn('ADDRESS_VALIDATION', 'Google Maps Server API key not configured - add GOOGLE_MAPS_SERVER_KEY environment variable');
    }
  }

  async validateAddress(addressLines: string[], regionCode: string = 'ZA'): Promise<AddressValidationResult> {
    if (!this.apiKey) {
      return {
        isValid: false,
        confidence: 'low',
        errors: ['Address validation service not configured']
      };
    }

    try {
      const requestBody = {
        address: {
          regionCode: regionCode,
          addressLines: addressLines.filter(line => line && line.trim())
        }
      };

      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json() as GoogleAddressValidationResponse;

      if (!data.result) {
        return {
          isValid: false,
          confidence: 'low',
          errors: ['Address validation failed - no result returned']
        };
      }

      const verdict = data.result.verdict;
      const address = data.result.address;
      const geocode = data.result.geocode;

      // Determine confidence based on validation granularity and completeness
      const confidence = this.determineConfidence(verdict);

      // Map address components to structured format for South Africa
      const structuredAddress = this.mapToStructuredAddress(address);

      return {
        isValid: verdict.addressComplete && !verdict.hasUnconfirmedComponents,
        confidence,
        formattedAddress: address.formattedAddress,
        structuredAddress,
        coordinates: geocode ? {
          lat: geocode.location.latitude,
          lng: geocode.location.longitude
        } : undefined
      };

    } catch (error) {
      logger.error('ADDRESS_VALIDATION', 'Failed to validate address', { error, addressLines });
      return {
        isValid: false,
        confidence: 'low',
        errors: ['Address validation service temporarily unavailable']
      };
    }
  }

  private mapToStructuredAddress(address: GoogleAddressValidationResponse['result']['address']): StructuredAddress {
    const postalAddress = address.postalAddress;
    const addressLines = postalAddress.addressLines || [];
    
    return {
      line1: addressLines[0] || '',
      line2: addressLines.length > 1 ? addressLines.slice(1).join(', ') : undefined,
      city: postalAddress.locality || '',
      region: postalAddress.administrativeArea || '', // This maps to province in South Africa
      postal_code: postalAddress.postalCode || '',
      country: 'South Africa' // Always South Africa for ZA region code
    };
  }

  private determineConfidence(verdict: GoogleAddressValidationResponse['result']['verdict']): 'high' | 'medium' | 'low' {
    // High confidence: complete address with confirmed components
    if (verdict.addressComplete && !verdict.hasUnconfirmedComponents && !verdict.hasInferredComponents) {
      return 'high';
    }
    
    // Medium confidence: complete but with some inferred components
    if (verdict.addressComplete && !verdict.hasUnconfirmedComponents) {
      return 'medium';
    }
    
    // Low confidence: incomplete or unconfirmed components
    return 'low';
  }

  async validatePostalCode(postalCode: string, country: string): Promise<boolean> {
    if (!this.apiKey) return false;

    try {
      const params = new URLSearchParams({
        address: postalCode,
        key: this.apiKey,
        region: country === 'South Africa' ? 'za' : 'us',
        components: `country:${country === 'South Africa' ? 'ZA' : 'US'}`
      });

      const response = await fetch(`${this.baseUrl}?${params}`);
      const data = await response.json() as GoogleGeocodingResponse;

      return data.status === 'OK' && data.results.length > 0;
    } catch (error) {
      logger.error('ADDRESS_VALIDATION', 'Failed to validate postal code', { error, postalCode });
      return false;
    }
  }
}

export const addressValidation = new AddressValidationService();