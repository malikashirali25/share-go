export interface Address {
  id: number;
  address1: string;
  address2: string;
  zipcode: string;
  city: string;
  state: string;
  country: string;
  isDefault: boolean;
  lat: number;
  lng: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAddressRequest {
  address1: string;
  address2: string;
  zipcode: string;
  city: string;
  state: string;
  country: string;
  isDefault: boolean;
  lat: number;
  lng: number;
}

export interface UpdateAddressRequest {
  address1?: string;
  address2?: string;
  zipcode?: string;
  city?: string;
  state?: string;
  country?: string;
  isDefault?: boolean;
  lat?: number;
  lng?: number;
}
