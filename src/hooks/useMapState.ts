import { useState, useRef } from 'react';
import { Coordinates } from '@/types';

// Add a triple-slash reference directive at the top
/// <reference types="google.maps" />

interface MapStateOptions {
	startCoordinates?: string;
	endCoordinates?: string;
	centerCoordinates?: Coordinates;
	trackingId?: string;
}

export function useMapState(options: MapStateOptions = {}) {
	const {
		startCoordinates,
		endCoordinates,
		centerCoordinates = { lat: 9.7489, lng: -83.7534 }, // Costa Rica center
		trackingId,
	} = options;

	const mapContainerRef = useRef<HTMLDivElement>(null);
	const startMarkerRef = useRef<google.maps.Marker | null>(null);
	const endMarkerRef = useRef<google.maps.Marker | null>(null);
	const vehicleMarkerRef = useRef<google.maps.Marker | null>(null);
	const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(
		null,
	);
	const directionsResponseRef = useRef<google.maps.DirectionsResult | null>(
		null,
	);

	const [mapLoaded, setMapLoaded] = useState(false);
	const [mapLoadError, setMapLoadError] = useState<string | null>(null);
	const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
	const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(
		null,
	);
	const [fallbackMode, setFallbackMode] = useState(false);
	const [googleMapsLink, setGoogleMapsLink] = useState<string | null>(null);
	const [sharingLocation, setSharingLocation] = useState(false);
	const [watchId, setWatchId] = useState<number | null>(null);
	const [startAddress, setStartAddress] = useState<string | null>(null);
	const [endAddress, setEndAddress] = useState<string | null>(null);
	const [routePath, setRoutePath] = useState<google.maps.LatLng[]>([]);

	return {
		// Refs
		mapContainerRef,
		startMarkerRef,
		endMarkerRef,
		vehicleMarkerRef,
		directionsRendererRef,
		directionsResponseRef,

		// State
		mapLoaded,
		setMapLoaded,
		mapLoadError,
		setMapLoadError,
		mapInstance,
		setMapInstance,
		currentLocation,
		setCurrentLocation,
		fallbackMode,
		setFallbackMode,
		googleMapsLink,
		setGoogleMapsLink,
		sharingLocation,
		setSharingLocation,
		watchId,
		setWatchId,
		trackingId,

		// Address state
		startAddress,
		setStartAddress,
		endAddress,
		setEndAddress,

		// Route path
		routePath,
		setRoutePath,

		// Config values
		startCoordinates,
		endCoordinates,
		centerCoordinates,
	};
}
