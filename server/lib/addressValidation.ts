import fetch, { AbortError } from 'node-fetch';
import { logger } from './logger';

// Network error types for better error handling
interface NetworkError extends Error {
  code?: string;
  status?: number;
  type?: string;
}

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
  private readonly defaultTimeout = 10000; // 10 seconds timeout
  private readonly retryAttempts = 2;

  constructor() {
    // Use server key for backend Address Validation API calls
    this.apiKey = process.env.GOOGLE_MAPS_SERVER_KEY || '';
    if (!this.apiKey) {
      logger.warn('ADDRESS_VALIDATION', 'Google Maps Server API key not configured - add GOOGLE_MAPS_SERVER_KEY environment variable');
    }
  }

  private isZAAddress(addressLines: string[]): boolean {
    const addressText = addressLines.join(' ').toLowerCase();
    const zaIndicators = [
      'south africa', 'gauteng', 'western cape', 'kwazulu-natal', 'eastern cape',
      'limpopo', 'mpumalanga', 'free state', 'north west', 'northern cape',
      'johannesburg', 'cape town', 'durban', 'pretoria', 'sandton'
    ];
    return zaIndicators.some(indicator => addressText.includes(indicator));
  }

  async validateAddress(addressLines: string[], regionCode: string = 'US'): Promise<AddressValidationResult> {
    if (!this.apiKey) {
      return {
        isValid: false,
        confidence: 'low',
        errors: ['Address validation service not configured']
      };
    }

    // Disable address validation for South Africa (ZA) as requested
    // Keep function structure for future expansion to other countries
    if (regionCode === 'ZA' || this.isZAAddress(addressLines)) {
      logger.info('ADDRESS_VALIDATION', 'Skipping validation for South African address', { addressLines, regionCode });
      return {
        isValid: true,
        confidence: 'high',
        errors: [],
        formattedAddress: addressLines.join(', ')
      };
    }

    // Create AbortController for timeout protection
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, this.defaultTimeout);

    try {
      // Google Address Validation API for non-ZA countries
      const requestBody = {
        address: {
          regionCode: regionCode === 'ZA' ? 'US' : regionCode,
          addressLines: addressLines.filter(line => line && line.trim())
        }
      };

      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: abortController.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorMessage = `API request failed with status ${response.status}: ${response.statusText}`;
        logger.warn('ADDRESS_VALIDATION', errorMessage, { 
          status: response.status, 
          statusText: response.statusText,
          addressLines 
        });
        throw new Error(errorMessage);
      }

      const data = await response.json() as GoogleAddressValidationResponse;

      if (!data.result) {
        logger.warn('ADDRESS_VALIDATION', 'No result returned from API', { addressLines });
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

      // Map address components to structured format
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
      clearTimeout(timeoutId);
      
      const networkError = error as NetworkError;
      let errorMessage = 'Address validation service temporarily unavailable';
      let logLevel: 'error' | 'warn' = 'error';
      
      if (error instanceof AbortError || networkError.name === 'AbortError') {
        errorMessage = 'Address validation request timed out';
        logLevel = 'warn';
        logger.warn('ADDRESS_VALIDATION', 'Request timeout', { timeout: this.defaultTimeout, addressLines });
      } else if (networkError.code === 'ENOTFOUND' || networkError.code === 'EAI_AGAIN') {
        errorMessage = 'Network connectivity issue';
        logLevel = 'warn';
        logger.warn('ADDRESS_VALIDATION', 'DNS/Network error', { code: networkError.code, addressLines });
      } else if (networkError.code === 'ECONNREFUSED') {
        errorMessage = 'Address validation service unavailable';
        logLevel = 'warn';
        logger.warn('ADDRESS_VALIDATION', 'Connection refused', { addressLines });
      } else if (networkError.code === 'ETIMEDOUT') {
        errorMessage = 'Address validation request timed out';
        logLevel = 'warn';
        logger.warn('ADDRESS_VALIDATION', 'Connection timeout', { addressLines });
      } else {
        logger.error('ADDRESS_VALIDATION', 'Unexpected error validating address', { 
          error: networkError.message,
          code: networkError.code,
          addressLines 
        });
      }
      
      return {
        isValid: false,
        confidence: 'low',
        errors: [errorMessage]
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
    if (!this.apiKey) {
      logger.warn('ADDRESS_VALIDATION', 'API key not configured for postal code validation');
      return false;
    }

    // Skip validation for South Africa postal codes
    if (country === 'South Africa') {
      logger.info('ADDRESS_VALIDATION', 'Skipping postal code validation for South Africa', { postalCode });
      return true;
    }

    let attempt = 0;
    while (attempt < this.retryAttempts) {
      // Create AbortController for timeout protection
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => {
        abortController.abort();
      }, this.defaultTimeout);

      try {
        const requestBody = {
          address: {
            regionCode: country === 'South Africa' ? 'ZA' : 'US',
            addressLines: [postalCode.trim()]
          }
        };

        const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
          signal: abortController.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          if (response.status === 400) {
            logger.warn('ADDRESS_VALIDATION', 'Invalid postal code format', { 
              postalCode, 
              country, 
              status: response.status 
            });
            return false;
          }
          if (response.status === 401 || response.status === 403) {
            logger.error('ADDRESS_VALIDATION', 'API authentication failed', { 
              status: response.status,
              postalCode 
            });
            return false;
          }
          if (response.status === 429) {
            logger.warn('ADDRESS_VALIDATION', 'Rate limit exceeded', { postalCode, attempt });
            if (attempt < this.retryAttempts - 1) {
              // Wait before retrying
              await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
              attempt++;
              continue;
            }
            return false;
          }
          if (response.status >= 500) {
            logger.warn('ADDRESS_VALIDATION', 'Server error, will retry', { 
              status: response.status,
              postalCode,
              attempt 
            });
            if (attempt < this.retryAttempts - 1) {
              // Wait before retrying server errors
              await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
              attempt++;
              continue;
            }
            return false;
          }
          
          throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
        }

        const data = await response.json() as GoogleAddressValidationResponse;
        
        if (!data.result) {
          logger.warn('ADDRESS_VALIDATION', 'No result returned for postal code validation', { postalCode });
          return false;
        }

        // Consider postal code valid if API returns a result with reasonable confidence
        const verdict = data.result.verdict;
        const isValid = verdict.addressComplete || !verdict.hasUnconfirmedComponents;
        
        logger.info('ADDRESS_VALIDATION', 'Postal code validation completed', {
          postalCode,
          country,
          isValid,
          confidence: this.determineConfidence(verdict)
        });
        
        return isValid;

      } catch (error) {
        clearTimeout(timeoutId);
        
        const networkError = error as NetworkError;
        
        if (error instanceof AbortError || networkError.name === 'AbortError') {
          logger.warn('ADDRESS_VALIDATION', 'Postal code validation timed out', { 
            postalCode, 
            timeout: this.defaultTimeout,
            attempt 
          });
          if (attempt < this.retryAttempts - 1) {
            attempt++;
            continue;
          }
          return false;
        }
        
        if (networkError.code === 'ENOTFOUND' || networkError.code === 'EAI_AGAIN') {
          logger.warn('ADDRESS_VALIDATION', 'DNS/Network error validating postal code', { 
            postalCode,
            code: networkError.code,
            attempt 
          });
          if (attempt < this.retryAttempts - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
            attempt++;
            continue;
          }
          return false;
        }
        
        if (networkError.code === 'ECONNREFUSED' || networkError.code === 'ETIMEDOUT') {
          logger.warn('ADDRESS_VALIDATION', 'Connection error validating postal code', { 
            postalCode,
            code: networkError.code,
            attempt 
          });
          if (attempt < this.retryAttempts - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
            attempt++;
            continue;
          }
          return false;
        }
        
        logger.error('ADDRESS_VALIDATION', 'Unexpected error validating postal code', { 
          error: networkError.message,
          code: networkError.code,
          postalCode,
          attempt
        });
        
        // Don't retry on unexpected errors
        return false;
      }
    }
    
    logger.warn('ADDRESS_VALIDATION', 'Postal code validation failed after all retry attempts', { 
      postalCode,
      attempts: this.retryAttempts 
    });
    return false;
  }
}

export const addressValidation = new AddressValidationService();