/// <reference types="google.maps" />

// Export from the main types file
export interface Coordinates {
	lat: number;
	lng: number;
}

// Include reference to the global window object with Google Maps
declare global {
	interface Window {
		google: any;
		initMap: () => void;
		googleMapsApiKey: string;
	}
}
