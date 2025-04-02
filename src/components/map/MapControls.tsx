import React from 'react';
import { toast } from 'sonner';
import { MapPin, Navigation, Share2 } from 'lucide-react';
import { createMapLinks, isGoogleMapsLoaded } from '@/utils/mapUtils';
import { Coordinates } from '@/types';

/// <reference types="google.maps" />

interface MapControlsProps {
  mapState: any;
  showDriverControls: boolean;
}

const MapControls: React.FC<MapControlsProps> = ({ mapState, showDriverControls }) => {
  const handleShareLocation = () => {
    if (!mapState.sharingLocation) {
      if (navigator.geolocation) {
        mapState.setSharingLocation(true);
        toast.success("Compartiendo ubicación en tiempo real");
        
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { longitude, latitude } = position.coords;
            const coords = { lat: latitude, lng: longitude };
            mapState.setCurrentLocation(coords);
            
            const { googleLink } = createMapLinks(coords);
            mapState.setGoogleMapsLink(googleLink);
            
            if (mapState.mapInstance && isGoogleMapsLoaded()) {
              try {
                mapState.mapInstance.setCenter(coords);
                mapState.mapInstance.setZoom(15);
                
                const currentLocMarker = new window.google.maps.Marker({
                  position: coords,
                  map: mapState.mapInstance,
                  icon: {
                    url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                  },
                  animation: window.google.maps.Animation.BOUNCE,
                  title: 'Mi ubicación actual'
                });
                
                console.log(`Order ${mapState.trackingId} - Location updated: ${latitude}, ${longitude}`);
              } catch (error) {
                console.error('Error updating map with current location:', error);
              }
            }
          },
          (error) => {
            console.error('Error getting location:', error);
            toast.error("Error al obtener tu ubicación");
            mapState.setSharingLocation(false);
          },
          { 
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
        
        try {
          const id = navigator.geolocation.watchPosition(
            (position) => {
              const { longitude, latitude } = position.coords;
              const coords = { lat: latitude, lng: longitude };
              mapState.setCurrentLocation(coords);
              
              const { googleLink } = createMapLinks(coords);
              mapState.setGoogleMapsLink(googleLink);
              
              if (mapState.mapInstance && isGoogleMapsLoaded()) {
                try {
                  mapState.mapInstance.panTo(coords);
                  
                  console.log(`Order ${mapState.trackingId} - Location updated: ${latitude}, ${longitude}`);
                } catch (error) {
                  console.error('Error updating map position:', error);
                }
              }
            },
            (error) => {
              console.error('Error tracking location:', error);
              toast.error("Error al rastrear tu ubicación");
              mapState.setSharingLocation(false);
            },
            { 
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0
            }
          );
          
          mapState.setWatchId(id);
        } catch (error) {
          console.error('Error setting up watch position:', error);
          toast.error("Error al configurar el seguimiento de ubicación");
        }
      } else {
        toast.error("Tu navegador no soporta geolocalización");
      }
    } else {
      if (mapState.watchId !== null) {
        try {
          navigator.geolocation.clearWatch(mapState.watchId);
        } catch (error) {
          console.error('Error clearing watch:', error);
        }
        mapState.setWatchId(null);
      }
      mapState.setSharingLocation(false);
      toast.info("Has dejado de compartir tu ubicación");
    }
  };
  
  const handleOpenGoogleMaps = () => {
    const start = mapState.startCoordinates;
    const end = mapState.endCoordinates;
    
    if (mapState.googleMapsLink) {
      window.open(mapState.googleMapsLink, '_blank');
    } else if (start && end) {
      const directionsUrl = `https://www.google.com/maps/dir/${start.replace(',', '/')}/${end.replace(',', '/')}`;
      window.open(directionsUrl, '_blank');
    } else {
      toast.error("No hay información de ubicación disponible");
    }
  };
  
  const handleShareGoogleMapsLink = () => {
    const link = mapState.googleMapsLink;
    
    if (link) {
      if (navigator.share) {
        navigator.share({
          title: 'Ubicación de seguimiento',
          text: `Rastreo de servicio ${mapState.trackingId}`,
          url: link
        })
        .then(() => toast.success("Enlace compartido"))
        .catch(err => {
          console.error('Error sharing:', err);
          navigator.clipboard.writeText(link)
            .then(() => toast.success("Enlace copiado al portapapeles"))
            .catch(() => toast.error("Error al copiar el enlace"));
        });
      } else {
        navigator.clipboard.writeText(link)
          .then(() => toast.success("Enlace copiado al portapapeles"))
          .catch(() => toast.error("Error al copiar el enlace"));
      }
    } else {
      toast.error("No hay información de ubicación disponible");
    }
  };

  if (!showDriverControls || mapState.fallbackMode) return null;

  return (
    <div className="absolute bottom-4 right-4 left-4 z-10">
      <div className="bg-white rounded-lg shadow-md p-3">
        <div className="flex flex-wrap gap-2 justify-center sm:justify-between">
          <button
            onClick={handleShareLocation}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              mapState.sharingLocation 
                ? 'bg-green-500 text-white hover:bg-green-600' 
                : 'bg-white text-primary border border-primary/20 hover:bg-primary/5'
            }`}
          >
            <MapPin size={16} />
            <span>{mapState.sharingLocation ? 'Compartiendo ubicación' : 'Compartir ubicación'}</span>
          </button>
          
          {(mapState.googleMapsLink || (mapState.startCoordinates && mapState.endCoordinates)) && (
            <>
              <button
                onClick={handleOpenGoogleMaps}
                className="flex items-center gap-2 px-3 py-2 bg-white text-primary border border-primary/20 rounded-md text-sm font-medium hover:bg-primary/5 transition-colors"
              >
                <Navigation size={16} />
                <span>Abrir en Google Maps</span>
              </button>
              <button
                onClick={handleShareGoogleMapsLink}
                className="flex items-center gap-2 px-3 py-2 bg-white text-primary border border-primary/20 rounded-md text-sm font-medium hover:bg-primary/5 transition-colors"
              >
                <Share2 size={16} />
                <span>Compartir enlace</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapControls;
