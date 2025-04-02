/// <reference types="google.maps" />

// Make TypeScript aware of the global window object with Google Maps
declare global {
	interface Window {
		initMap: () => void;
		google: typeof google;
		reloadMapsAPI: () => void;
		clearMapCache: () => void;
		googleMapsApiKey: string;
		gmapsCacheBuster: number;
	}

	// Google Maps Web Components
	namespace JSX {
		interface IntrinsicElements {
			'gmpx-api-loader': any;
			'gmp-map': any;
			'gmp-advanced-marker': any;
			'gmpx-place-picker': any;
		}
	}
}

// Type definitions for Google Maps Place Result
declare namespace gmpx {
	interface PlaceResult {
		location: {
			lat: number;
			lng: number;
		};
		displayName?: string;
		formattedAddress?: string;
		viewport?: google.maps.LatLngBounds;
	}
}

// Define interfaces for Google Maps Web Components
interface GmpMapElement extends HTMLElement {
	innerMap: google.maps.Map;
	center: string;
	zoom: string | number;
}

interface GmpAdvancedMarkerElement extends HTMLElement {
	position: string;
	title?: string;
}

interface GmpxPlacePickerElement extends HTMLElement {
	value: gmpx.PlaceResult;
	placeholder?: string;
	addEventListener(
		type: 'gmpx-placechange',
		listener: (event: Event) => void,
	): void;
	removeEventListener(type: string, listener: EventListener): void;
}

// Add the Google namespace type declaration
declare namespace google {
	namespace maps {
		class Map {
			constructor(mapDiv: HTMLElement, options?: MapOptions);
			setCenter(latLng: LatLng | LatLngLiteral): void;
			getCenter(): LatLng;
			setZoom(zoom: number): void;
			getZoom(): number;
			setOptions(options: MapOptions): void;
			panTo(latLng: LatLng | LatLngLiteral): void;
			fitBounds(bounds: LatLngBounds, padding?: number | Padding): void;
			addListener(eventName: string, handler: Function): MapsEventListener;
		}

		class LatLng {
			constructor(lat: number, lng: number, noWrap?: boolean);
			lat(): number;
			lng(): number;
			toString(): string;
			toJSON(): LatLngLiteral;
			equals(other: LatLng): boolean;
			toUrlValue(precision?: number): string;
		}

		class LatLngBounds {
			constructor(sw?: LatLng | LatLngLiteral, ne?: LatLng | LatLngLiteral);
			extend(point: LatLng | LatLngLiteral): LatLngBounds;
			contains(latLng: LatLng | LatLngLiteral): boolean;
			getCenter(): LatLng;
			toString(): string;
			toJSON(): LatLngBoundsLiteral;
			equals(other: LatLngBounds | LatLngBoundsLiteral): boolean;
			toUrlValue(precision?: number): string;
			isEmpty(): boolean;
		}

		class Marker {
			constructor(opts?: MarkerOptions);
			setMap(map: Map | null): void;
			getMap(): Map | null;
			setPosition(latLng: LatLng | LatLngLiteral): void;
			getPosition(): LatLng | null;
			setTitle(title: string): void;
			getTitle(): string | null;
			setIcon(icon: string | Icon | Symbol): void;
			setAnimation(animation: Animation): void;
		}

		class DirectionsService {
			route(
				request: DirectionsRequest,
				callback: (result: DirectionsResult, status: DirectionsStatus) => void,
			): void;
		}

		class DirectionsRenderer {
			constructor(opts?: DirectionsRendererOptions);
			setMap(map: Map | null): void;
			setDirections(directions: DirectionsResult): void;
			setOptions(options: DirectionsRendererOptions): void;
		}

		interface MapOptions {
			center?: LatLng | LatLngLiteral;
			zoom?: number;
			mapTypeId?: MapTypeId;
			[key: string]: any;
		}

		interface MarkerOptions {
			position: LatLng | LatLngLiteral;
			map?: Map;
			title?: string;
			icon?: string | Icon | Symbol;
			animation?: Animation;
			[key: string]: any;
		}

		interface DirectionsRequest {
			origin: string | LatLng | LatLngLiteral | Place;
			destination: string | LatLng | LatLngLiteral | Place;
			travelMode: TravelMode;
			transitOptions?: TransitOptions;
			drivingOptions?: DrivingOptions;
			unitSystem?: UnitSystem;
			waypoints?: DirectionsWaypoint[];
			optimizeWaypoints?: boolean;
			provideRouteAlternatives?: boolean;
			avoidFerries?: boolean;
			avoidHighways?: boolean;
			avoidTolls?: boolean;
			region?: string;
		}

		interface DirectionsResult {
			routes: DirectionsRoute[];
		}

		interface DirectionsRoute {
			bounds: LatLngBounds;
			legs: DirectionsLeg[];
			overview_path: LatLng[];
			overview_polyline: string;
			warnings: string[];
			waypoint_order: number[];
		}

		interface DirectionsLeg {
			distance: Distance;
			duration: Duration;
			end_address: string;
			end_location: LatLng;
			start_address: string;
			start_location: LatLng;
			steps: DirectionsStep[];
		}

		interface DirectionsStep {
			distance: Distance;
			duration: Duration;
			instructions: string;
			path: LatLng[];
			travel_mode: TravelMode;
		}

		interface DirectionsRendererOptions {
			directions?: DirectionsResult;
			map?: Map;
			panel?: HTMLElement;
			polylineOptions?: PolylineOptions;
			suppressMarkers?: boolean;
			suppressPolylines?: boolean;
			suppressInfoWindows?: boolean;
		}

		interface LatLngLiteral {
			lat: number;
			lng: number;
		}

		interface LatLngBoundsLiteral {
			east: number;
			north: number;
			south: number;
			west: number;
		}

		interface Distance {
			text: string;
			value: number;
		}

		interface Duration {
			text: string;
			value: number;
		}

		interface Icon {
			url: string;
			size?: Size;
			scaledSize?: Size;
			origin?: Point;
			anchor?: Point;
			labelOrigin?: Point;
		}

		interface PolylineOptions {
			clickable?: boolean;
			draggable?: boolean;
			editable?: boolean;
			geodesic?: boolean;
			icons?: IconSequence[];
			map?: Map;
			path?: MVCArray<LatLng> | LatLng[] | LatLngLiteral[];
			strokeColor?: string;
			strokeOpacity?: number;
			strokeWeight?: number;
			visible?: boolean;
			zIndex?: number;
		}

		interface IconSequence {
			icon: Symbol;
			offset: string;
			repeat: string;
		}

		interface Symbol {
			anchor?: Point;
			fillColor?: string;
			fillOpacity?: number;
			labelOrigin?: Point;
			path: SymbolPath | string;
			rotation?: number;
			scale?: number;
			strokeColor?: string;
			strokeOpacity?: number;
			strokeWeight?: number;
		}

		interface Padding {
			bottom: number;
			left: number;
			right: number;
			top: number;
		}

		interface Point {
			x: number;
			y: number;
		}

		interface Size {
			height: number;
			width: number;
		}

		// Define the Animation enum
		enum Animation {
			BOUNCE = 1,
			DROP = 2,
		}

		// Define the MapTypeId enum
		enum MapTypeId {
			HYBRID = 'hybrid',
			ROADMAP = 'roadmap',
			SATELLITE = 'satellite',
			TERRAIN = 'terrain',
		}

		// Define the TravelMode enum
		enum TravelMode {
			BICYCLING = 'BICYCLING',
			DRIVING = 'DRIVING',
			TRANSIT = 'TRANSIT',
			WALKING = 'WALKING',
		}

		// Define the UnitSystem enum
		enum UnitSystem {
			IMPERIAL = 0,
			METRIC = 1,
		}

		// Define the DirectionsStatus enum
		enum DirectionsStatus {
			INVALID_REQUEST = 'INVALID_REQUEST',
			MAX_WAYPOINTS_EXCEEDED = 'MAX_WAYPOINTS_EXCEEDED',
			NOT_FOUND = 'NOT_FOUND',
			OK = 'OK',
			OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
			REQUEST_DENIED = 'REQUEST_DENIED',
			UNKNOWN_ERROR = 'UNKNOWN_ERROR',
			ZERO_RESULTS = 'ZERO_RESULTS',
		}

		// Define the SymbolPath enum
		enum SymbolPath {
			BACKWARD_CLOSED_ARROW = 3,
			BACKWARD_OPEN_ARROW = 4,
			CIRCLE = 0,
			FORWARD_CLOSED_ARROW = 1,
			FORWARD_OPEN_ARROW = 2,
		}

		interface Place {
			location?: LatLng | LatLngLiteral;
			placeId?: string;
			query?: string;
		}

		interface TransitOptions {
			arrivalTime?: Date;
			departureTime?: Date;
			modes?: TransitMode[];
			routingPreference?: TransitRoutePreference;
		}

		interface DrivingOptions {
			departureTime?: Date;
			trafficModel?: TrafficModel;
		}

		interface DirectionsWaypoint {
			location: LatLng | LatLngLiteral | string;
			stopover?: boolean;
		}

		type TransitMode = 'BUS' | 'RAIL' | 'SUBWAY' | 'TRAIN' | 'TRAM';
		type TransitRoutePreference = 'FEWER_TRANSFERS' | 'LESS_WALKING';
		type TrafficModel = 'BEST_GUESS' | 'OPTIMISTIC' | 'PESSIMISTIC';

		interface MapsEventListener {
			remove(): void;
		}

		interface MVCArray<T> {
			clear(): void;
			forEach(callback: (elem: T, i: number) => void): void;
			getArray(): T[];
			getAt(i: number): T;
			getLength(): number;
			insertAt(i: number, elem: T): void;
			pop(): T;
			push(elem: T): number;
			removeAt(i: number): T;
			setAt(i: number, elem: T): void;
		}
	}
}

export {};
