import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { 
  Truck, 
  Navigation, 
  CheckCircle, 
  Clock, 
  MapPin,
  LocateFixed
} from 'lucide-react';
import { toast } from 'sonner';
import { DemoTracking, Coordinates } from '@/types';
import ErrorBoundary from './ErrorBoundary';
import LoadingFallback from './LoadingFallback';
import Map from './Map';

const DemoTrackingComponent: React.FC = () => {
  const [demoConfig, setDemoConfig] = useState<DemoTracking>({
    startLocation: '',
    startCoordinates: '',
    endLocation: '',
    endCoordinates: '',
    status: 'no_iniciado'
  });
  
  const [isDemoActive, setIsDemoActive] = useState(false);
  const [etaMinutes, setEtaMinutes] = useState<number | null>(null);
  const [demoProgress, setDemoProgress] = useState(0);
  const [trackingId, setTrackingId] = useState(`DEMO${Math.random().toString(36).substring(2, 6).toUpperCase()}`);
  const [selectionMode, setSelectionMode] = useState<'start' | 'end' | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  
  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    
    if (isDemoActive && demoProgress < 100) {
      progressInterval = setInterval(() => {
        setDemoProgress(prev => {
          const newProgress = prev + 1;
          
          // Update status based on progress
          if (newProgress === 25) {
            setDemoConfig(prev => ({...prev, status: 'preparacion'}));
            toast.info("El vehículo está en preparación");
          } else if (newProgress === 50) {
            setDemoConfig(prev => ({...prev, status: 'en_ruta_recoger'}));
            toast.info("El vehículo está en ruta para recoger el equipo");
          } else if (newProgress === 75) {
            setDemoConfig(prev => ({...prev, status: 'ruta_entrega'}));
            toast.info("El vehículo está en ruta de entrega");
          } else if (newProgress === 100) {
            setDemoConfig(prev => ({...prev, status: 'entregado'}));
            toast.success("¡Producto entregado con éxito!");
            setIsDemoActive(false);
          }
          
          return newProgress > 100 ? 100 : newProgress;
        });
      }, 1000);
    }
    
    return () => {
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [isDemoActive, demoProgress]);
  
  const startDemo = () => {
    // Validate inputs
    if (!demoConfig.startCoordinates || !demoConfig.endCoordinates) {
      toast.error("Por favor seleccione ubicaciones de inicio y fin");
      return;
    }
    
    // Start the demo
    setDemoConfig(prev => ({...prev, status: 'preparacion'}));
    setIsDemoActive(true);
    setDemoProgress(0);
    
    toast.success("Demo iniciado. Sigue la ruta del vehículo en el mapa");
  };
  
  const resetDemo = () => {
    setIsDemoActive(false);
    setDemoProgress(0);
    setEtaMinutes(null);
    setDemoConfig({
      startLocation: '',
      startCoordinates: '',
      endLocation: '',
      endCoordinates: '',
      status: 'no_iniciado'
    });
    setTrackingId(`DEMO${Math.random().toString(36).substring(2, 6).toUpperCase()}`);
    toast.info("Demo reiniciado");
  };
  
  const handleLocationSelect = (coordinates: Coordinates, type: 'start' | 'end') => {
    // Make sure coordinates are valid numbers
    const lat = typeof coordinates.lat === 'number' ? coordinates.lat : parseFloat(String(coordinates.lat));
    const lng = typeof coordinates.lng === 'number' ? coordinates.lng : parseFloat(String(coordinates.lng));
    
    if (isNaN(lat) || isNaN(lng)) {
      toast.error(`Coordenadas inválidas recibidas`);
      return;
    }
    
    const coordString = `${lat},${lng}`;
    const locationLabel = `Ubicación seleccionada (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
    
    if (type === 'start') {
      setDemoConfig(prev => ({
        ...prev, 
        startCoordinates: coordString,
        startLocation: locationLabel
      }));
    } else {
      setDemoConfig(prev => ({
        ...prev, 
        endCoordinates: coordString,
        endLocation: locationLabel
      }));
    }
    
    // Exit selection mode after selection
    setSelectionMode(null);
    toast.success(`Ubicación de ${type === 'start' ? 'origen' : 'destino'} seleccionada`);
  };
  
  const getStatusIcon = (status: DemoTracking['status']) => {
    switch(status) {
      case 'preparacion':
        return <Clock className="text-amber-500" />;
      case 'en_ruta_recoger':
        return <Truck className="text-blue-500" />;
      case 'ruta_entrega':
        return <Navigation className="text-indigo-500" />;
      case 'entregado':
        return <CheckCircle className="text-green-500" />;
      default:
        return <Clock className="text-gray-400" />;
    }
  };
  
  const handleMapError = (error: string) => {
    setMapError(error);
    toast.error("Error al cargar el mapa: " + error);
  };
  
  // Determine if the vehicle should be shown on the map
  const isVehicleVisible = isDemoActive && demoProgress >= 50 && demoProgress < 100;
  
  return (
    <div className="bg-card rounded-xl border shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-6">Demostración de Rastreo</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-4 lg:col-span-1">
          <h3 className="font-medium">Configuración de Demo</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">
                Ubicación de Inicio
              </label>
              <div className="mt-1 flex items-center gap-2">
                <button
                  onClick={() => setSelectionMode('start')}
                  disabled={isDemoActive}
                  className="w-full flex items-center justify-between gap-2 h-10 px-3 rounded-md border focus:ring-2 focus:ring-primary focus:border-primary bg-background hover:bg-secondary/30 disabled:opacity-50"
                >
                  <span className="truncate text-left">
                    {demoConfig.startLocation || "Seleccionar ubicación de inicio"}
                  </span>
                  <MapPin size={16} className="text-muted-foreground" />
                </button>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">
                Ubicación de Destino
              </label>
              <div className="mt-1 flex items-center gap-2">
                <button
                  onClick={() => setSelectionMode('end')}
                  disabled={isDemoActive}
                  className="w-full flex items-center justify-between gap-2 h-10 px-3 rounded-md border focus:ring-2 focus:ring-primary focus:border-primary bg-background hover:bg-secondary/30 disabled:opacity-50"
                >
                  <span className="truncate text-left">
                    {demoConfig.endLocation || "Seleccionar ubicación de destino"}
                  </span>
                  <MapPin size={16} className="text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 pt-4">
            <button
              onClick={startDemo}
              disabled={isDemoActive || !demoConfig.startCoordinates || !demoConfig.endCoordinates}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              <Truck size={16} />
              <span>Iniciar Demo</span>
            </button>
            
            <button
              onClick={resetDemo}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-sm font-medium transition-all hover:bg-secondary/90 active:scale-[0.98]"
            >
              Reiniciar
            </button>
          </div>
          
          <div className="space-y-4 border rounded-lg p-4">
            <h4 className="font-medium">Etapas del Envío</h4>
            
            <ul className="space-y-3">
              {[
                { id: 'preparacion', label: 'En Preparación' },
                { id: 'en_ruta_recoger', label: 'En Ruta a Recoger Equipo' },
                { id: 'ruta_entrega', label: 'Ruta de Entrega' },
                { id: 'entregado', label: 'Entregado' }
              ].map((stage) => {
                const isActive = demoConfig.status === stage.id;
                const isCompleted = 
                  (stage.id === 'preparacion' && ['preparacion', 'en_ruta_recoger', 'ruta_entrega', 'entregado'].includes(demoConfig.status)) ||
                  (stage.id === 'en_ruta_recoger' && ['en_ruta_recoger', 'ruta_entrega', 'entregado'].includes(demoConfig.status)) ||
                  (stage.id === 'ruta_entrega' && ['ruta_entrega', 'entregado'].includes(demoConfig.status)) ||
                  (stage.id === 'entregado' && demoConfig.status === 'entregado');
                
                return (
                  <li 
                    key={stage.id}
                    className={`flex items-center gap-3 py-2 px-3 rounded-md ${
                      isActive ? 'bg-primary/10' : ''
                    }`}
                  >
                    <div className={`p-1.5 rounded-full ${
                      isCompleted 
                        ? 'bg-green-100 text-green-600' 
                        : isActive 
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-secondary text-muted-foreground'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle size={18} />
                      ) : (
                        getStatusIcon(stage.id as DemoTracking['status'])
                      )}
                    </div>
                    <span className={`text-sm ${
                      isCompleted 
                        ? 'text-green-800 font-medium line-through' 
                        : isActive 
                        ? 'font-medium'
                        : 'text-muted-foreground'
                    }`}>
                      {stage.label}
                    </span>
                    {isActive && (
                      <span className="ml-auto text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full animate-pulse">
                        En progreso
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        
        <div className="lg:col-span-2 space-y-4">
          {isDemoActive && (
            <div className="bg-secondary/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Progreso de entrega</span>
                <span className="text-sm">{demoProgress}%</span>
              </div>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-primary"
                  style={{ width: `${demoProgress}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${demoProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              {demoConfig.status === 'ruta_entrega' && (
                <p className="text-sm text-muted-foreground mt-2">
                  Sigue el vehículo en el mapa para ver su progreso en tiempo real
                </p>
              )}
            </div>
          )}
          
          <div className="rounded-lg overflow-hidden border">
            <ErrorBoundary>
              <Suspense fallback={<LoadingFallback />}>
                <Map 
                  startCoordinates={demoConfig.startCoordinates}
                  endCoordinates={demoConfig.endCoordinates}
                  destination={demoConfig.endLocation}
                  onLocationSelect={selectionMode ? handleLocationSelect : undefined}
                  selectionMode={selectionMode}
                  centerCoordinates={{ lat: 9.7489, lng: -83.7534 }} // Costa Rica center
                  onError={handleMapError}
                  simulationProgress={demoProgress}
                  isSimulationActive={isVehicleVisible}
                />
              </Suspense>
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoTrackingComponent;
