export interface CarCardData {
  id:number;
  image: string;
  imageAlt: string;
  status: string;
  brand: string;
  year: number;
  category: string;
  mileage: string;
  originalPrice: number;
  discountedPrice: number;
  discountAmount: string;
  monthlyPayment: string;
  transmission: string;
}

export interface PriceFilter {
  id: string;
  label: string;
  value: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface CarImage {
  id: number;
  url: string;
  alt: string;
  thumbnailUrl?: string;
}

export interface CarSpecification {
  icon: string;
  label: string;
  value: string;
  unit?: string;
}

export interface CarFeature {
  icon: string;
  title: string;
  description: string;
}

export interface Car {
  id: number;
  title: string;
  year: number;
  price: number;
  currency: string;
  images: CarImage[];
  specifications: CarSpecification[];
  features: CarFeature[];
  description: string;
  tabs: {
    carSummary: CarFeature[];
    overview: string;
    inspection: any[];
    features: string[];
    financing: any;
  };
}
