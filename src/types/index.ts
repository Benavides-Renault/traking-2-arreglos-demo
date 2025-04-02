export interface Coordinates {
	lat: number;
	lng: number;
}

export interface DemoTracking {
	startLocation: string;
	startCoordinates: string;
	endLocation: string;
	endCoordinates: string;
	status:
		| 'no_iniciado'
		| 'preparacion'
		| 'en_ruta_recoger'
		| 'ruta_entrega'
		| 'entregado';
}

export interface TrackingOrder {
	id: string;
	clientName: string;
	clientPhone: string;
	driverName: string;
	driverPhone: string;
	startCoordinates: string;
	endCoordinates: string;
	destination: string;
	details?: string;
	comments?: string;
	status: 'en_curso' | 'completado' | 'cancelado';
	createdAt: string;
	completedAt?: string;
}

export interface DriverCredentials {
	email: string;
	password: string;
	username: string;
	name: string;
	phone: string;
}
