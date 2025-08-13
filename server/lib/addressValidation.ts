import fetch from 'node-fetch';
import { logger } from './logger';

interface GoogleGeocodingResponse {
  results: Array<{
    address_components: Array<{
      long_name: string;
      short_name: string;
      types: string[];
    }>;
    formatted_address: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
      location_type: string;
    };
    place_id: string;
    types: string[];
  }>;
  status: string;
}

interface AddressValidationResult {
  isValid: boolean;
  confidence: 'high' | 'medium' | 'low';
  formattedAddress?: string;
  components?: {
    streetNumber?: string;
    streetName?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  coordinates?: {
    lat: number;
    lng: number;
  };
  errors?: string[];
}

export class AddressValidationService {
  private apiKey: string;
  private baseUrl = 'https://maps.googleapis.com/maps/api/geocode/json';

  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_SERVER_KEY || '';
    if (!this.apiKey) {
      logger.warn('ADDRESS_VALIDATION', 'Google Maps Server API key not configured');
    }
  }

  async validateAddress(address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }): Promise<AddressValidationResult> {
    if (!this.apiKey) {
      return {
        isValid: false,
        confidence: 'low',
        errors: ['Address validation service not configured']
      };
    }

    try {
      // Construct full address for geocoding
      const fullAddress = [
        address.line1,
        address.line2,
        address.city,
        address.state,
        address.postalCode,
        address.country
      ].filter(Boolean).join(', ');

      // Make request to Google Geocoding API
      const params = new URLSearchParams({
        address: fullAddress,
        key: this.apiKey,
        region: address.country === 'South Africa' ? 'za' : 'us'
      });

      const response = await fetch(`${this.baseUrl}?${params}`);
      const data = await response.json() as GoogleGeocodingResponse;

      if (data.status !== 'OK' || !data.results.length) {
        return {
          isValid: false,
          confidence: 'low',
          errors: [`Address could not be verified: ${data.status}`]
        };
      }

      const result = data.results[0];
      const components = this.parseAddressComponents(result.address_components);

      // Determine confidence based on location type and match quality
      const confidence = this.determineConfidence(result, address);

      return {
        isValid: true,
        confidence,
        formattedAddress: result.formatted_address,
        components,
        coordinates: {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng
        }
      };

    } catch (error) {
      logger.error('ADDRESS_VALIDATION', 'Failed to validate address', { error, address });
      return {
        isValid: false,
        confidence: 'low',
        errors: ['Address validation service temporarily unavailable']
      };
    }
  }

  private parseAddressComponents(components: GoogleGeocodingResponse['results'][0]['address_components']) {
    const getComponent = (types: string[]) => {
      const component = components.find(comp => 
        types.some(type => comp.types.includes(type))
      );
      return component ? component.long_name : undefined;
    };

    return {
      streetNumber: getComponent(['street_number']),
      streetName: getComponent(['route']),
      city: getComponent(['locality', 'administrative_area_level_2']),
      state: getComponent(['administrative_area_level_1']),
      postalCode: getComponent(['postal_code']),
      country: getComponent(['country'])
    };
  }

  private determineConfidence(
    result: GoogleGeocodingResponse['results'][0], 
    inputAddress: any
  ): 'high' | 'medium' | 'low' {
    const locationType = result.geometry.location_type;
    
    // High confidence: exact rooftop match
    if (locationType === 'ROOFTOP') {
      return 'high';
    }
    
    // Medium confidence: good interpolation or premise level
    if (locationType === 'RANGE_INTERPOLATED' || 
        result.types.includes('premise') ||
        result.types.includes('subpremise')) {
      return 'medium';
    }
    
    // Low confidence: geometric center or approximate
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