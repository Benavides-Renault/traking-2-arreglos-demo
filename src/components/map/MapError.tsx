import React from 'react';
import { RefreshCw } from 'lucide-react';

interface MapErrorProps {
  error: string;
  isReloading: boolean;
  onReload: () => void;
}

const MapError: React.FC<MapErrorProps> = ({ error, isReloading, onReload }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-90 z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center bg-blue-600 text-white p-3 mb-4 rounded">
          <h3 className="text-lg font-semibold">Error de Google Maps</h3>
          <button 
            onClick={onReload}
            className="p-1.5 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
            disabled={isReloading}
          >
            <RefreshCw size={18} className={isReloading ? "animate-spin" : ""} />
          </button>
        </div>
        <div className="bg-blue-600 text-white p-3 mb-4 rounded">
          <p>{error}</p>
        </div>
        <div className="bg-yellow-100 p-3 mb-4 rounded border border-yellow-200">
          <div className="font-medium text-blue-600 mb-2">Asegúrate de que tu clave de API tiene habilitadas:</div>
          <ul className="list-disc ml-5">
            <li>Maps JavaScript API</li>
            <li>Places API</li>
            <li>Directions API</li>
            <li>Geocoding API</li>
          </ul>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={onReload}
            className="w-full flex items-center justify-center gap-2 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            disabled={isReloading}
          >
            {isReloading ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                <span>Recargando...</span>
              </>
            ) : (
              <>
                <RefreshCw size={16} />
                <span>Reiniciar Google Maps</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapError;
