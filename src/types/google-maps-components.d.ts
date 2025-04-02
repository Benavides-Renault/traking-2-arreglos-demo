declare global {
	// Google Maps Web Components
	interface GmpMapElement extends HTMLElement {
		center: string;
		zoom: string;
		mapId: string;
		innerMap: google.maps.Map;
	}

	interface GmpAdvancedMarkerElement extends HTMLElement {
		position: string;
		title: string;
		map: google.maps.Map | null;
	}

	interface GmpxPlacePickerElement extends HTMLElement {
		value: {
			location: {
				lat: number;
				lng: number;
			};
			displayName?: string;
			formattedAddress?: string;
		} | null;
		placeholder: string;
		addEventListener(type: string, listener: EventListener): void;
		removeEventListener(type: string, listener: EventListener): void;
	}
}

export {};
