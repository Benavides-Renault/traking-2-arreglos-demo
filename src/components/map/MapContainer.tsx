import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { parseCoordinates, calculateRoute, isGoogleMapsLoaded, reverseGeocode } from '@/utils/mapUtils';
import { Coordinates } from '@/types';
import { Skeleton } from "@/components/ui/skeleton";
import AddressSearch from './AddressSearch';
import { MapPin, LocateFixed, Car } from 'lucide-react';

// Add triple-slash reference directive
/// <reference types="google.maps" />

interface MapContainerProps {
  mapState: any;
  selectionMode?: 'start' | 'end' | null;
  onLocationSelect?: (coordinates: Coordinates, type: 'start' | 'end') => void;
  onError?: (error: string) => void;
  simulationProgress?: number;
  isSimulationActive?: boolean;
}

const MapContainer: React.FC<MapContainerProps> = ({ 
  mapState,
  selectionMode = null,
  onLocationSelect,
  onError,
  simulationProgress = 0,
  isSimulationActive = false
}) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const [locationAddress, setLocationAddress] = useState<string | null>(null);
  const [highAccuracyEnabled, setHighAccuracyEnabled] = useState(true);

  useEffect(() => {
    // Skip if map is already loaded
    if (mapState.mapLoaded && mapState.mapInstance) return;
    
    // Clear any previous map elements
    if (mapState.mapContainerRef.current) {
      mapState.mapContainerRef.current.innerHTML = '';
    }

    // Load Google Maps API with Places library
    const loadGoogleMaps = () => {
      window.googleMapsApiKey = apiKey;
      
      // Initialize map when API is loaded
      window.initMap = () => {
        initializeMap();
      };
      
      // Add Google Maps script if not already present
      if (!document.querySelector('script[src*="maps.googleapis.com"]')) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`;
        script.async = true;
        script.defer = true;
        script.onerror = () => {
          console.error('Failed to load Google Maps API');
          const errorMessage = 'Error al cargar Google Maps API';
          mapState.setMapLoadError(errorMessage);
          if (onError) onError(errorMessage);
        };
        document.head.appendChild(script);
      } else {
        // If script already exists, call initMap directly
        if (isGoogleMapsLoaded()) {
          initializeMap();
        }
      }
    };
    
    const initializeMap = () => {
      if (!mapState.mapContainerRef.current) return;
      
      try {
        // Create map with better default options
        const center = mapState.centerCoordinates || { lat: 9.7489, lng: -83.7534 };
        const mapOptions = {
          center: center,
          zoom: 15, // Higher zoom for better visibility
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          gestureHandling: 'greedy', // Makes it easier to move the map on mobile
          mapTypeId: window.google.maps.MapTypeId.ROADMAP
        };
        
        const map = new window.google.maps.Map(
          mapState.mapContainerRef.current,
          mapOptions
        );
        
        mapState.setMapInstance(map);
        
        // Setup map click handler for location selection
        if (selectionMode && onLocationSelect) {
          map.addListener('click', (event: google.maps.MapMouseEvent) => {
            const coords: Coordinates = {
              lat: event.latLng!.lat(),
              lng: event.latLng!.lng()
            };
            
            // Get address for the clicked location
            reverseGeocode(coords, (address) => {
              if (address) {
                setLocationAddress(address);
              }
              
              onLocationSelect(coords, selectionMode);
              toast.success(`Ubicación seleccionada en el mapa`);
            });
          });
        }
        
        // Add markers if coordinates exist
        const start = parseCoordinates(mapState.startCoordinates);
        const end = parseCoordinates(mapState.endCoordinates);
        
        if (start) {
          const startMarker = new window.google.maps.Marker({
            position: start,
            map: map,
            title: 'Punto de inicio',
            icon: {
              url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
            }
          });
          mapState.startMarkerRef.current = startMarker;
          
          // Add info window for the start marker
          const startInfoWindow = new window.google.maps.InfoWindow({
            content: '<div><strong>Punto de inicio</strong></div>'
          });
          
          startMarker.addListener('click', () => {
            startInfoWindow.open(map, startMarker);
          });
        }
        
        if (end) {
          const endMarker = new window.google.maps.Marker({
            position: end,
            map: map,
            title: 'Destino',
            icon: {
              url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
            }
          });
          mapState.endMarkerRef.current = endMarker;
          
          // Add info window for the end marker
          const endInfoWindow = new window.google.maps.InfoWindow({
            content: '<div><strong>Destino</strong></div>'
          });
          
          endMarker.addListener('click', () => {
            endInfoWindow.open(map, endMarker);
          });
        }
        
        // Calculate route if both markers exist
        if (start && end) {
          calculateRoute(start, end, map, mapState.directionsRendererRef, (response) => {
            if (response) {
              mapState.directionsResponseRef.current = response;
              
              // Extract route path for animation
              const route = response.routes[0];
              if (route && route.overview_path) {
                mapState.setRoutePath(route.overview_path);
                
                // Add vehicle marker using car icon
                const vehicleMarker = new window.google.maps.Marker({
                  position: route.overview_path[0],
                  map: map,
                  title: 'Vehículo',
                  icon: {
                    url: 'https://maps.google.com/mapfiles/kml/shapes/cabs.png',
                    scaledSize: new window.google.maps.Size(32, 32),
                    origin: new window.google.maps.Point(0, 0),
                    anchor: new window.google.maps.Point(16, 16)
                  },
                  // Hide the vehicle marker initially
                  visible: false
                });
                mapState.vehicleMarkerRef.current = vehicleMarker;
              }
            }
          });
          
          // Fit bounds to include both markers
          const bounds = new window.google.maps.LatLngBounds();
          bounds.extend(start);
          bounds.extend(end);
          map.fitBounds(bounds);
        } else if (start) {
          map.setCenter(start);
          map.setZoom(15);
        } else if (end) {
          map.setCenter(end);
          map.setZoom(15);
        }
        
        mapState.setMapLoaded(true);
      } catch (error) {
        console.error('Error initializing map:', error);
        const errorMessage = 'Error al inicializar el mapa';
        mapState.setMapLoadError(errorMessage);
        if (onError) onError(errorMessage);
        toast.error('Error al cargar el mapa');
      }
    };
    
    loadGoogleMaps();
    
    return () => {
      // Cleanup
      if (mapState.directionsRendererRef.current) {
        mapState.directionsRendererRef.current.setMap(null);
      }
      if (mapState.vehicleMarkerRef.current) {
        mapState.vehicleMarkerRef.current.setMap(null);
      }
    };
  }, [apiKey, mapState.centerCoordinates, selectionMode]);
  
  // Update markers and route when coordinates change
  useEffect(() => {
    if (!mapState.mapLoaded || !mapState.mapInstance) return;
    
    const start = parseCoordinates(mapState.startCoordinates);
    const end = parseCoordinates(mapState.endCoordinates);
    
    // Update start marker
    if (start) {
      if (mapState.startMarkerRef.current) {
        mapState.startMarkerRef.current.setPosition(start);
      } else {
        const startMarker = new window.google.maps.Marker({
          position: start,
          map: mapState.mapInstance,
          title: 'Punto de inicio',
          icon: {
            url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
          }
        });
        mapState.startMarkerRef.current = startMarker;
      }
    }
    
    // Update end marker
    if (end) {
      if (mapState.endMarkerRef.current) {
        mapState.endMarkerRef.current.setPosition(end);
      } else {
        const endMarker = new window.google.maps.Marker({
          position: end,
          map: mapState.mapInstance,
          title: 'Destino',
          icon: {
            url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
          }
        });
        mapState.endMarkerRef.current = endMarker;
      }
    }
    
    // Calculate route if both markers exist
    if (start && end) {
      calculateRoute(start, end, mapState.mapInstance, mapState.directionsRendererRef, (response) => {
        if (response) {
          mapState.directionsResponseRef.current = response;
          
          // Extract route path for animation
          const route = response.routes[0];
          if (route && route.overview_path) {
            mapState.setRoutePath(route.overview_path);
            
            // Add or update vehicle marker with car icon
            if (!mapState.vehicleMarkerRef.current) {
              const vehicleMarker = new window.google.maps.Marker({
                position: route.overview_path[0],
                map: mapState.mapInstance,
                title: 'Vehículo',
                icon: {
                  url: 'https://maps.google.com/mapfiles/kml/shapes/cabs.png',
                  scaledSize: new window.google.maps.Size(32, 32),
                  origin: new window.google.maps.Point(0, 0),
                  anchor: new window.google.maps.Point(16, 16)
                },
                // Hide the vehicle marker initially
                visible: false
              });
              mapState.vehicleMarkerRef.current = vehicleMarker;
            } else {
              mapState.vehicleMarkerRef.current.setPosition(route.overview_path[0]);
            }
          }
        }
      });
      
      // Fit bounds to include both markers
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(start);
      bounds.extend(end);
      mapState.mapInstance.fitBounds(bounds);
    }
  }, [mapState.startCoordinates, mapState.endCoordinates, mapState.mapLoaded, mapState.mapInstance]);

  // Update vehicle position based on simulation progress
  useEffect(() => {
    if (!mapState.mapLoaded || !mapState.mapInstance || !mapState.vehicleMarkerRef.current || !isSimulationActive) {
      return;
    }
    
    // Show vehicle marker during simulation
    mapState.vehicleMarkerRef.current.setVisible(isSimulationActive);
    
    // Update vehicle position based on route path and progress
    const routePath = mapState.routePath;
    if (routePath.length > 0 && simulationProgress > 0) {
      // Calculate path index based on progress
      const pathIndex = Math.min(
        Math.floor((routePath.length - 1) * (simulationProgress / 100)),
        routePath.length - 1
      );
      
      // Calculate rotation angle based on path direction
      let rotation = 0;
      if (pathIndex > 0) {
        const p1 = routePath[pathIndex - 1];
        const p2 = routePath[pathIndex];
        const dx = p2.lng() - p1.lng();
        const dy = p2.lat() - p1.lat();
        rotation = Math.atan2(dy, dx) * 180 / Math.PI;
      }
      
      // Update vehicle marker position
      const position = routePath[pathIndex];
      mapState.vehicleMarkerRef.current.setPosition(position);
      
      // Center map on vehicle if simulation is active
      if (isSimulationActive && simulationProgress > 0 && simulationProgress < 100) {
        mapState.mapInstance.panTo(position);
      }
    }
  }, [simulationProgress, isSimulationActive, mapState.routePath]);

  // Geolocation handler with high accuracy
  const handleMyLocation = () => {
    if (navigator.geolocation) {
      toast.info("Obteniendo ubicación con alta precisión...");
      
      const options = {
        enableHighAccuracy: highAccuracyEnabled,
        timeout: 10000,  // 10 seconds timeout
        maximumAge: 0    // Always get fresh position
      };
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude, accuracy } = position.coords;
          const coords = { lat: latitude, lng: longitude };
          
          console.log(`Ubicación obtenida con precisión de ${accuracy} metros`);
          mapState.setCurrentLocation(coords);
          
          if (selectionMode && onLocationSelect) {
            onLocationSelect(coords, selectionMode);
            toast.success(`Ubicación actual seleccionada como ${selectionMode === 'start' ? 'origen' : 'destino'}`);
          } else if (mapState.mapInstance) {
            mapState.mapInstance.setCenter(coords);
            mapState.mapInstance.setZoom(17); // Closer zoom for better precision
            
            // Add "my location" marker
            new window.google.maps.Marker({
              position: coords,
              map: mapState.mapInstance,
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                fillColor: '#4285F4',
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 2,
                scale: 8
              },
              title: 'Mi ubicación actual'
            });
            
            // Add accuracy circle if accuracy is available
            if (accuracy) {
              new window.google.maps.Circle({
                map: mapState.mapInstance,
                center: coords,
                radius: accuracy,
                fillColor: '#4285F4',
                fillOpacity: 0.2,
                strokeColor: '#4285F4',
                strokeOpacity: 0.4,
                strokeWeight: 1
              });
            }
            
            toast.success("Mapa centrado en tu ubicación actual");
            
            // Reverse geocode to get the address
            reverseGeocode(coords, (address) => {
              if (address) {
                setLocationAddress(address);
                toast.info(`Dirección: ${address}`);
              }
            });
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          let errorMessage = "Error al obtener tu ubicación";
          
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Permiso de ubicación denegado";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Ubicación no disponible";
              break;
            case error.TIMEOUT:
              errorMessage = "Tiempo de espera agotado al obtener ubicación";
              
              // Try again with lower accuracy if we timed out
              if (highAccuracyEnabled) {
                setHighAccuracyEnabled(false);
                toast.info("Intentando con menor precisión...");
                setTimeout(() => {
                  handleMyLocation();
                }, 500);
                return;
              }
              break;
          }
          
          toast.error(errorMessage);
        },
        options
      );
    } else {
      toast.error("Tu navegador no soporta geolocalización");
    }
  };

  const handleAddressSelect = (coordinates: Coordinates, address: string) => {
    if (mapState.mapInstance) {
      mapState.mapInstance.setCenter(coordinates);
      mapState.mapInstance.setZoom(17);
      
      // Show marker for selected address
      new window.google.maps.Marker({
        position: coordinates,
        map: mapState.mapInstance,
        animation: window.google.maps.Animation.DROP,
        title: address
      });
      
      setLocationAddress(address);
      
      if (selectionMode && onLocationSelect) {
        onLocationSelect(coordinates, selectionMode);
        toast.success(`Dirección seleccionada como ${selectionMode === 'start' ? 'origen' : 'destino'}`);
      }
    }
  };

  return (
    <div className="relative w-full h-full">
      {!mapState.mapLoaded && !mapState.mapLoadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-secondary/20">
          <div className="space-y-2 w-full max-w-sm px-4">
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-3 w-3/5" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      )}
      
      <div className="absolute top-4 left-4 right-4 z-10 bg-white/95 backdrop-blur-sm p-3 rounded-md shadow-md">
        {selectionMode ? (
          <div>
            <div className="font-medium mb-3">
              {selectionMode === 'start' ? 'Selecciona punto de inicio' : 'Selecciona destino'}
            </div>
            
            <AddressSearch 
              onAddressSelect={(coords, address) => handleAddressSelect(coords, address)} 
              placeholder={`Buscar ${selectionMode === 'start' ? 'origen' : 'destino'} por dirección`}
            />
            
            {locationAddress && (
              <div className="mt-2 text-sm text-muted-foreground">
                <span className="font-medium">Dirección actual:</span> {locationAddress}
              </div>
            )}
            
            <div className="flex justify-end mt-3">
              <button
                onClick={handleMyLocation}
                className="bg-primary text-white p-2 rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm"
              >
                <LocateFixed size={16} />
                <span>Usar mi ubicación exacta</span>
              </button>
            </div>
          </div>
        ) : (
          <AddressSearch 
            onAddressSelect={(coords, address) => handleAddressSelect(coords, address)} 
            placeholder="Buscar una dirección en Costa Rica"
          />
        )}
      </div>
      
      <div ref={mapState.mapContainerRef} className="w-full h-full"></div>
      
      {!selectionMode && (
        <button
          onClick={handleMyLocation}
          className="absolute bottom-20 right-4 z-10 bg-white shadow-md p-3 rounded-full hover:bg-gray-100 transition-colors"
          title="Mi ubicación"
        >
          <LocateFixed size={20} className="text-primary" />
        </button>
      )}
    </div>
  );
};

export default MapContainer;
