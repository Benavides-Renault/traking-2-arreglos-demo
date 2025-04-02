import React, { useState } from 'react';
import { Coordinates } from '@/types';
import { useMapState } from '@/hooks/useMapState';
import MapContainer from '@/components/map/MapContainer';
import { toast } from 'sonner';
import ErrorBoundary from '@/components/ErrorBoundary';

interface MapProps {
  startCoordinates?: string;
  endCoordinates?: string;
  destination?: string;
  onLocationSelect?: (coordinates: Coordinates, type: 'start' | 'end') => void;
  selectionMode?: 'start' | 'end' | null;
  centerCoordinates?: Coordinates;
  onError?: (error: string) => void;
  simulationProgress?: number;
  isSimulationActive?: boolean;
}

const Map: React.FC<MapProps> = ({ 
  startCoordinates,
  endCoordinates,
  destination,
  onLocationSelect,
  selectionMode = null,
  centerCoordinates,
  onError,
  simulationProgress = 0,
  isSimulationActive = false
}) => {
  const [mapError, setMapError] = useState<string | null>(null);
  
  const mapState = useMapState({
    startCoordinates,
    endCoordinates,
    centerCoordinates
  });

  // Handle errors
  const handleError = (errorMessage: string) => {
    setMapError(errorMessage);
    if (onError) {
      onError(errorMessage);
    }
  };

  return (
    <ErrorBoundary fallback={
      <div className="w-full h-[400px] md:h-[600px] rounded-xl overflow-hidden border shadow-sm bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-6 rounded-xl shadow-md max-w-md">
          <h3 className="text-lg font-semibold mb-2">Error en el componente de mapa</h3>
          <p className="text-muted-foreground mb-4">
            Ha ocurrido un error al cargar el mapa. Por favor, recargue la página e intente nuevamente.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full flex items-center justify-center gap-2 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Recargar página
          </button>
        </div>
      </div>
    }>
      <div className="relative w-full h-[400px] md:h-[600px] rounded-xl overflow-hidden border shadow-sm bg-gray-100">
        {mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-20">
            <div className="bg-white p-6 rounded-xl shadow-md max-w-md">
              <h3 className="text-lg font-semibold mb-2">Error al cargar el mapa</h3>
              <p className="text-muted-foreground mb-4">{mapError}</p>
              <button 
                onClick={() => window.location.reload()}
                className="w-full flex items-center justify-center gap-2 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              >
                Recargar página
              </button>
            </div>
          </div>
        )}
        
        <MapContainer 
          mapState={mapState} 
          selectionMode={selectionMode} 
          onLocationSelect={onLocationSelect}
          onError={handleError} 
          simulationProgress={simulationProgress}
          isSimulationActive={isSimulationActive}
        />
      </div>
    </ErrorBoundary>
  );
};

export default Map;
