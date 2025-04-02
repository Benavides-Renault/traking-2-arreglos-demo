
import { toast } from 'sonner';
import { Coordinates } from '@/types';

// Add triple-slash reference directive
/// <reference types="google.maps" />

export const parseCoordinates = (coordString?: string): Coordinates | null => {
  if (!coordString) return null;
  
  try {
    const decimalMatch = coordString.match(/(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
    if (decimalMatch) {
      return {
        lat: parseFloat(decimalMatch[1]),
        lng: parseFloat(decimalMatch[2])
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing coordinates:', error);
    return null;
  }
};

export const createMapLinks = (coords: Coordinates) => {
  const googleLink = `https://www.google.com/maps?q=${coords.lat},${coords.lng}`;
  return { googleLink };
};

export const calculateRoute = (
  start: google.maps.LatLngLiteral,
  end: google.maps.LatLngLiteral,
  map: google.maps.Map,
  directionsRendererRef: React.MutableRefObject<google.maps.DirectionsRenderer | null>,
  callback?: (response: google.maps.DirectionsResult) => void
) => {
  try {
    // Create a directions service if we have a valid map
    const directionsService = new window.google.maps.DirectionsService();

    // Setup or reuse directions renderer
    if (!directionsRendererRef.current) {
      directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
        map,
        suppressMarkers: true, // We handle markers ourselves
        polylineOptions: {
          strokeColor: '#4285F4',
          strokeWeight: 5,
          strokeOpacity: 0.8
        }
      });
    } else {
      directionsRendererRef.current.setMap(map);
    }

    // Calculate route
    directionsService.route(
      {
        origin: start,
        destination: end,
        travelMode: window.google.maps.TravelMode.DRIVING,
        optimizeWaypoints: true,
        avoidTolls: false,
        avoidHighways: false,
        provideRouteAlternatives: false,
        region: 'cr' // Set region to Costa Rica
      },
      (response, status) => {
        if (status === window.google.maps.DirectionsStatus.OK && response) {
          directionsRendererRef.current?.setDirections(response);
          
          if (callback) {
            callback(response);
          }
        } else {
          console.error('Directions request failed: ', status);
        }
      }
    );
  } catch (error) {
    console.error('Error calculating route:', error);
  }
};

export const isGoogleMapsLoaded = () => {
  return typeof window !== 'undefined' && window.google && window.google.maps;
};

export const geocodeAddress = (
  address: string, 
  callback: (coordinates: Coordinates | null) => void,
  googleMapsInstance?: any
) => {
  if (!isGoogleMapsLoaded()) {
    toast.error('Google Maps no está cargado');
    callback(null);
    return;
  }

  try {
    const geocoder = new window.google.maps.Geocoder();
    
    // Add Costa Rica restriction
    const options = {
      address,
      region: 'cr', // ISO 3166-1 alpha-2 country code for Costa Rica
      componentRestrictions: { country: 'cr' } // Restrict to Costa Rica
    };
    
    geocoder.geocode(options, (results, status) => {
      if (status === window.google.maps.GeocoderStatus.OK && results && results[0]) {
        const location = results[0].geometry.location;
        const coordinates = {
          lat: location.lat(),
          lng: location.lng()
        };
        
        console.log('Geocoded address:', address, 'to coordinates:', coordinates);
        callback(coordinates);
      } else {
        console.error('Geocoding failed:', status);
        toast.error('No se pudo encontrar la dirección en Costa Rica');
        callback(null);
      }
    });
  } catch (error) {
    console.error('Error geocoding address:', error);
    toast.error('Error al buscar la dirección');
    callback(null);
  }
};

export const reverseGeocode = (
  coordinates: Coordinates,
  callback: (address: string | null) => void
) => {
  if (!isGoogleMapsLoaded()) {
    toast.error('Google Maps no está cargado');
    callback(null);
    return;
  }

  try {
    const geocoder = new window.google.maps.Geocoder();
    const latlng = new window.google.maps.LatLng(coordinates.lat, coordinates.lng);
    
    // Add Costa Rica restriction
    const options = {
      location: latlng,
      region: 'cr' // ISO 3166-1 alpha-2 country code for Costa Rica
    };
    
    geocoder.geocode(options, (results, status) => {
      if (status === window.google.maps.GeocoderStatus.OK && results && results[0]) {
        const address = results[0].formatted_address;
        console.log('Reverse geocoded coordinates:', coordinates, 'to address:', address);
        callback(address);
      } else {
        console.error('Reverse geocoding failed:', status);
        toast.error('No se pudo obtener la dirección para estas coordenadas');
        callback(null);
      }
    });
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    toast.error('Error al obtener la dirección');
    callback(null);
  }
};
