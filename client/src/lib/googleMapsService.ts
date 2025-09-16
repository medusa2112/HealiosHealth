// Centralized Google Maps API loading service
// This provides a single source of truth for Google Maps loading across the app

// Extend window type for Google Places API (Legacy and New)
declare global {
  interface Window {
    google?: {
      maps?: {
        places?: {
          // Legacy API
          Autocomplete: new (input: HTMLInputElement, options: any) => any;
          AutocompleteService: new () => any;
          PlacesService: new (div: HTMLDivElement) => any;
          PlacesServiceStatus: {
            OK: string;
          };
          // New API (PlaceAutocompleteElement)
          PlaceAutocompleteElement: new (options?: any) => any;
          AutocompleteSessionToken: new () => any;
        };
        event?: {
          clearInstanceListeners: (instance: any) => void;
        };
        // New importLibrary method
        importLibrary?: (library: string) => Promise<any>;
      };
    };
  }
}

export interface GoogleMapsConfig {
  libraries?: string[];
  region?: string;
  language?: string;
}

export interface GoogleMapsService {
  load: (config?: GoogleMapsConfig) => Promise<boolean>;
  isLoaded: () => boolean;
  isLoading: () => boolean;
  hasError: () => boolean;
  getError: () => string | null;
  waitForLoad: () => Promise<boolean>;
  // Legacy API methods
  createAutocomplete: (input: HTMLInputElement, options: any) => any;
  createAutocompleteService: () => any;
  createPlacesService: (div: HTMLDivElement) => any;
  clearInstanceListeners: (instance: any) => void;
  // New API methods
  supportsNewApi: () => boolean;
  loadNewPlacesLibrary: () => Promise<boolean>;
  createPlaceAutocompleteElement: (options?: any) => any;
  createAutocompleteSessionToken: () => any;
}

class GoogleMapsServiceImpl implements GoogleMapsService {
  private loadPromise: Promise<boolean> | null = null;
  private loaded = false;
  private loading = false;
  private error: string | null = null;
  private apiKey: string | null = null;
  private newApiLoaded = false;
  private preferNewApi = true; // Prefer new API when available

  async load(config: GoogleMapsConfig = {}): Promise<boolean> {
    // If already loaded, return immediately
    if (this.loaded) {
      return true;
    }

    // If currently loading, wait for existing promise
    if (this.loading && this.loadPromise) {
      return this.loadPromise;
    }

    // Start new loading process
    this.loading = true;
    this.error = null;

    this.loadPromise = this._loadGoogleMaps(config);
    const result = await this.loadPromise;
    
    this.loading = false;
    this.loaded = result;
    
    return result;
  }

  private async _loadGoogleMaps(config: GoogleMapsConfig): Promise<boolean> {
    try {
      // Check if already loaded in window (legacy or new)
      if (window.google?.maps?.places?.Autocomplete || window.google?.maps?.places?.PlaceAutocompleteElement) {
        console.log('Google Maps API already loaded');
        // Try to load new API if available
        if (window.google?.maps?.importLibrary && !this.newApiLoaded) {
          try {
            await this.loadNewPlacesLibrary();
          } catch (error) {
            console.warn('Failed to load new Places API, using legacy:', error);
          }
        }
        return true;
      }

      // Get API key from backend if not already fetched
      if (!this.apiKey) {
        try {
          const response = await fetch('/api/config/google-maps-key');
          if (!response.ok) {
            throw new Error(`Failed to fetch API key: ${response.status}`);
          }
          
          const data = await response.json();
          this.apiKey = data.apiKey;
          
          if (!this.apiKey) {
            throw new Error('Google Maps API key not available');
          }
        } catch (error) {
          this.error = error instanceof Error ? error.message : 'Failed to fetch API key';
          console.warn('Google Maps API key fetch failed:', this.error);
          return false;
        }
      }

      // Check if script already exists
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        console.log('Google Maps script already exists, waiting for load...');
        return this._waitForGoogleMaps();
      }

      console.log('Loading Google Maps API...');

      // Build script URL with configuration
      const libraries = config.libraries?.join(',') || 'places';
      const region = config.region || 'ZA';
      const language = config.language || 'en';
      
      const scriptUrl = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=${libraries}&region=${region}&language=${language}`;

      // Create and load script
      const script = document.createElement('script');
      script.src = scriptUrl;
      script.async = true;
      script.defer = true;

      const loadPromise = new Promise<boolean>((resolve, reject) => {
        script.onload = () => {
          console.log('Google Maps script loaded, waiting for API...');
          this._waitForGoogleMaps().then(resolve).catch(reject);
        };
        
        script.onerror = (error) => {
          console.error('Google Maps script load failed:', error);
          reject(new Error('Failed to load Google Maps script'));
        };

        // Timeout after 30 seconds
        const timeoutId = setTimeout(() => {
          reject(new Error('Google Maps script load timeout'));
        }, 30000);

        script.onload = () => {
          clearTimeout(timeoutId);
          console.log('Google Maps script loaded, waiting for API...');
          this._waitForGoogleMaps().then(resolve).catch(reject);
        };
      });

      document.head.appendChild(script);
      return await loadPromise;

    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Unknown error loading Google Maps';
      console.error('Google Maps loading error:', this.error);
      return false;
    }
  }

  private async _waitForGoogleMaps(): Promise<boolean> {
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds with 100ms intervals
    
    return new Promise(async (resolve) => {
      const checkAvailability = async () => {
        attempts++;
        
        // Check for either legacy or new API
        if (window.google?.maps?.places?.Autocomplete || window.google?.maps?.places?.PlaceAutocompleteElement) {
          console.log('Google Maps Places API is ready');
          
          // Try to load new API if available
          if (window.google?.maps?.importLibrary && !this.newApiLoaded) {
            try {
              await this.loadNewPlacesLibrary();
            } catch (error) {
              console.warn('Failed to load new Places API, using legacy:', error);
            }
          }
          
          resolve(true);
          return;
        }
        
        if (attempts >= maxAttempts) {
          this.error = 'Google Maps Places API not available after timeout';
          console.warn(this.error);
          resolve(false);
          return;
        }
        
        setTimeout(checkAvailability, 100);
      };
      
      checkAvailability();
    });
  }

  isLoaded(): boolean {
    return this.loaded && (!!window.google?.maps?.places?.Autocomplete || !!window.google?.maps?.places?.PlaceAutocompleteElement);
  }

  isLoading(): boolean {
    return this.loading;
  }

  hasError(): boolean {
    return !!this.error;
  }

  getError(): string | null {
    return this.error;
  }

  async waitForLoad(): Promise<boolean> {
    if (this.loaded) {
      return true;
    }
    
    if (this.loading && this.loadPromise) {
      return this.loadPromise;
    }
    
    return false;
  }

  // Helper methods for creating Google Maps instances
  createAutocomplete(input: HTMLInputElement, options: any): any {
    if (!this.isLoaded()) {
      throw new Error('Google Maps API not loaded');
    }
    
    return new window.google!.maps!.places!.Autocomplete(input, options);
  }

  createAutocompleteService(): any {
    if (!this.isLoaded()) {
      throw new Error('Google Maps API not loaded');
    }
    
    return new window.google!.maps!.places!.AutocompleteService();
  }

  createPlacesService(div: HTMLDivElement): any {
    if (!this.isLoaded()) {
      throw new Error('Google Maps API not loaded');
    }
    
    return new window.google!.maps!.places!.PlacesService(div);
  }

  clearInstanceListeners(instance: any): void {
    try {
      if (window.google?.maps?.event && 'clearInstanceListeners' in window.google.maps.event) {
        (window.google.maps.event as any).clearInstanceListeners(instance);
      }
    } catch (error) {
      console.warn('Failed to clear Google Maps event listeners:', error);
    }
  }

  // New API methods
  supportsNewApi(): boolean {
    return !!window.google?.maps?.importLibrary && !!window.google?.maps?.places?.PlaceAutocompleteElement;
  }

  async loadNewPlacesLibrary(): Promise<boolean> {
    if (this.newApiLoaded) {
      return true;
    }

    try {
      if (!window.google?.maps?.importLibrary) {
        console.warn('New Google Maps importLibrary not available');
        return false;
      }

      console.log('Loading new Google Maps Places library...');
      await window.google.maps.importLibrary('places');
      this.newApiLoaded = true;
      console.log('New Google Maps Places library loaded successfully');
      return true;
    } catch (error) {
      console.warn('Failed to load new Places library:', error);
      return false;
    }
  }

  createPlaceAutocompleteElement(options: any = {}): any {
    if (!this.supportsNewApi()) {
      throw new Error('New Google Maps PlaceAutocompleteElement API not available');
    }

    // Convert legacy options to new API format
    const newOptions: any = {};

    if (options.componentRestrictions?.country) {
      const countries = Array.isArray(options.componentRestrictions.country) 
        ? options.componentRestrictions.country 
        : [options.componentRestrictions.country];
      newOptions.includedRegionCodes = countries;
    }

    if (options.types) {
      newOptions.includedPrimaryTypes = options.types;
    }

    if (options.bounds) {
      newOptions.locationBias = {
        rectangle: options.bounds
      };
    }

    if (options.strictBounds) {
      newOptions.locationRestriction = {
        rectangle: options.bounds
      };
    }

    console.log('Creating PlaceAutocompleteElement with options:', newOptions);
    return new window.google!.maps!.places!.PlaceAutocompleteElement(newOptions);
  }

  createAutocompleteSessionToken(): any {
    if (!this.isLoaded()) {
      throw new Error('Google Maps API not loaded');
    }

    if (window.google?.maps?.places?.AutocompleteSessionToken) {
      return new window.google.maps.places.AutocompleteSessionToken();
    }

    throw new Error('AutocompleteSessionToken not available');
  }
}

// Singleton instance
const googleMapsService = new GoogleMapsServiceImpl();
export default googleMapsService;

// Export for testing
export { GoogleMapsServiceImpl };