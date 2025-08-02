
export interface CarCardData {
 id: number;
  brand: {
    id: string;
    name: string;
  };
  model: {
    id: string;
    name: string;
  };
  model_year: string;
  full_name: string;
  license_valid_until: string;
  specifications: {
    body_style: {
      id: string;
      name: string;
    };
    type: {
      id: string;
      name: string;
    };
    transmission_type: {
      id: string;
      name: string;
    };
    drive_type: {
      id: string;
      name: string;
    };
  };
  appearance: {
    color: string;
    size: {
      length: string;
      width: string;
      height: string;
      formate: string;
    };
  };
  performance: {
    fuel_economy: {
      min: string;
      max: string;
      formate: string;
    };
    engine_type: {
      id: number;
      name: string;
    };
    engine_capacity_cc: string;
    horsepower: {
      min: string;
      max: string;
      formate: string;
    };
    mileage: {
      value: string;
      formate: string;
    };
    vehicle_status: {
      id: string;
      name: string;
    };
    refurbishment_status: string;
  };
  pricing: {
    original_price: string;
    original_price_formatted: string;
    discount: string;
    discount_formatted: string;
    final_price: number;
    final_price_formatted: string;
    monthly_installment: string;
    monthly_installment_formatted: string;
    has_discount: boolean;
  };
  trim: {
    id: string;
    name: string;
  };
  flags: any[]; // If known structure, define it instead of `any`
  features: any[];
  conditions: any[];
  images: any[];
  created_at: string;
  updated_at: string;
  created_at_human: string;
  updated_at_human: string;
}

 export interface PriceFilter {
  id: string;
  label: string;
  value: [number, number | null] | [null,null]; // array with min and max
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
