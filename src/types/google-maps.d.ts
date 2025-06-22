// Google Maps API TypeScript declarations
declare global {
  interface Window {
    google: any;
  }
  
  namespace google {
    namespace maps {
      class Map {
        constructor(mapDiv: Element, opts?: MapOptions);
      }
      
      class Marker {
        constructor(opts?: MarkerOptions);
        addListener(eventName: string, handler: () => void): void;
        setMap(map: Map | null): void;
      }
      
      class InfoWindow {
        constructor(opts?: InfoWindowOptions);
        open(map: Map, anchor?: Marker): void;
      }
      
      class Size {
        constructor(width: number, height: number);
      }
      
      enum MapTypeId {
        ROADMAP = 'roadmap',
        SATELLITE = 'satellite',
        HYBRID = 'hybrid',
        TERRAIN = 'terrain'
      }
      
      enum Animation {
        DROP = 1,
        BOUNCE = 2
      }
      
      namespace marker {
        class AdvancedMarkerElement {
          constructor(opts?: any);
          addListener(eventName: string, handler: () => void): void;
        }
      }
      
      interface MapOptions {
        center?: { lat: number; lng: number };
        zoom?: number;
        mapTypeId?: MapTypeId;
        styles?: any[];
        mapTypeControl?: boolean;
        streetViewControl?: boolean;
        fullscreenControl?: boolean;
        zoomControl?: boolean;
        mapId?: string;
      }
      
      interface MarkerOptions {
        position?: { lat: number; lng: number };
        map?: Map;
        title?: string;
        icon?: any;
        animation?: Animation;
      }
      
      interface InfoWindowOptions {
        content?: string;
      }
    }
  }
}

// Export empty to make this a module
export {};
