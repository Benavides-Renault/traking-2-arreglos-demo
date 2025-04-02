import React, { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from "@/components/ui/input";
import { geocodeAddress, isGoogleMapsLoaded } from '@/utils/mapUtils';
import { Coordinates } from '@/types';

// Add triple-slash reference directive at the top
/// <reference types="google.maps" />

interface AddressSearchProps {
  onAddressSelect: (coordinates: Coordinates, address: string) => void;
  placeholder?: string;
  buttonLabel?: string;
}

const AddressSearch: React.FC<AddressSearchProps> = ({
  onAddressSelect,
  placeholder = "Ingrese una dirección",
  buttonLabel = "Buscar"
}) => {
  const [address, setAddress] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    // Initialize Places Autocomplete when Google Maps is loaded
    if (isGoogleMapsLoaded() && inputRef.current && !autocompleteRef.current) {
      try {
        if (window.google && window.google.maps && window.google.maps.places) {
          const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
            types: ['address'],
            fields: ['formatted_address', 'geometry'],
            componentRestrictions: { country: 'cr' } // Restrict to Costa Rica
          });
          
          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            
            if (place.geometry && place.geometry.location) {
              const coordinates = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
              };
              
              const formattedAddress = place.formatted_address || address;
              onAddressSelect(coordinates, formattedAddress);
              toast.success('Dirección seleccionada');
            } else {
              toast.error('No se pudo obtener la ubicación para esta dirección');
            }
          });
          
          autocompleteRef.current = autocomplete;
        }
      } catch (error) {
        console.error('Error initializing Places Autocomplete:', error);
      }
    }
  }, [inputRef.current, onAddressSelect, address]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address.trim()) {
      toast.error('Por favor ingrese una dirección');
      return;
    }
    
    setIsSearching(true);
    
    // Add Costa Rica to the search if not already specified
    let searchAddress = address;
    if (!address.toLowerCase().includes('costa rica')) {
      searchAddress += ', Costa Rica';
    }
    
    geocodeAddress(searchAddress, (coordinates) => {
      setIsSearching(false);
      
      if (coordinates) {
        onAddressSelect(coordinates, searchAddress);
        toast.success('Dirección encontrada');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <div className="relative flex-1">
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="pr-8"
        />
      </div>
      
      <button
        type="submit"
        disabled={isSearching || !address.trim()}
        className="flex items-center gap-2 py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:pointer-events-none"
      >
        <Search size={16} />
        <span>{isSearching ? 'Buscando...' : buttonLabel}</span>
      </button>
    </form>
  );
};

export default AddressSearch;
