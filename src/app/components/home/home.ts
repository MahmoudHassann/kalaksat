import { CommonModule } from '@angular/common';
import { Component, computed, EventEmitter, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators,FormsModule  } from '@angular/forms';
import { SliderModule } from 'primeng/slider';
import { CarCardData, PriceFilter } from '../product-card/product';
import { ProductCard } from "../product-card/product-card";
import { LoanCalculator } from "../loan-calculator/loan-calculator";
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone:true,
  imports: [ReactiveFormsModule, CommonModule, SliderModule, FormsModule, ProductCard, LoanCalculator,RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {
searchForm!: FormGroup;
  filteredModels: any[] = [];
  minPrice = 250000;
  maxPrice = 1000000;
  rangeValues: number[] = [250000, 1000000];

  cars: CarCardData[] = [
    {
      id:1,
      image: 'img/product.png',
      imageAlt: 'Toyota 2022',
      status: 'fully refurbished',
      brand: 'Toyota',
      year: 2022,
      category: '1st Category',
      mileage: '55,500 KM',
      originalPrice: 650000,
      discountedPrice: 500000,
      discountAmount: '35k off',
      monthlyPayment: 'from 11,110/mo',
      transmission: 'Automatic'
    },
    {
      id:1,
      image: 'img/product.png',
      imageAlt: 'BMW 2023',
      status: 'certified pre-owned',
      brand: 'BMW',
      year: 2023,
      category: 'Premium',
      mileage: '25,000 KM',
      originalPrice: 850000,
      discountedPrice: 780000,
      discountAmount: '70k off',
      monthlyPayment: 'from 15,500/mo',
      transmission: 'Automatic'
    },
    {
      id:1,
      image: 'img/product.png',
      imageAlt: 'Mercedes 2021',
      status: 'like new',
      brand: 'Mercedes',
      year: 2021,
      category: 'Luxury',
      mileage: '40,000 KM',
      originalPrice: 1200000,
      discountedPrice: 1050000,
      discountAmount: '150k off',
      monthlyPayment: 'from 20,800/mo',
      transmission: 'Automatic'
    }
  ];
  
  // Data arrays
  carBrands = [
    { id: 'toyota', name: 'Toyota' },
    { id: 'bmw', name: 'BMW' },
    { id: 'mercedes', name: 'Mercedes-Benz' },
    { id: 'audi', name: 'Audi' },
    { id: 'ford', name: 'Ford' },
    { id: 'honda', name: 'Honda' },
    { id: 'nissan', name: 'Nissan' },
    { id: 'hyundai', name: 'Hyundai' }
  ];
  
  carModels = [
    { id: 'camry', name: 'Camry', brandId: 'toyota' },
    { id: 'corolla', name: 'Corolla', brandId: 'toyota' },
    { id: 'prius', name: 'Prius', brandId: 'toyota' },
    { id: 'x3', name: 'X3', brandId: 'bmw' },
    { id: 'x5', name: 'X5', brandId: 'bmw' },
    { id: '320i', name: '320i', brandId: 'bmw' },
    { id: 'c-class', name: 'C-Class', brandId: 'mercedes' },
    { id: 'e-class', name: 'E-Class', brandId: 'mercedes' },
    { id: 'glc', name: 'GLC', brandId: 'mercedes' },
    { id: 'a4', name: 'A4', brandId: 'audi' },
    { id: 'q5', name: 'Q5', brandId: 'audi' },
    { id: 'a6', name: 'A6', brandId: 'audi' }
  ];
  
  years = Array.from({length: 25}, (_, i) => 2024 - i);
  
  carTypes = [
    { id: 'sedan', name: 'Sedan' },
    { id: 'suv', name: 'SUV' },
    { id: 'hatchback', name: 'Hatchback' },
    { id: 'coupe', name: 'Coupe' },
    { id: 'convertible', name: 'Convertible' },
    { id: 'truck', name: 'Truck' },
    { id: 'wagon', name: 'Wagon' }
  ];
  
  vehicleStatuses = [
    { id: 'new', name: 'New' },
    { id: 'used', name: 'Used' },
    { id: 'certified', name: 'Certified Pre-owned' },
    { id: 'lease', name: 'Lease Return' }
  ];
  
  bodyStyles = [
    { id: 'sedan', name: 'Sedan' },
    { id: 'suv', name: 'SUV' },
    { id: 'hatchback', name: 'Hatchback' },
    { id: 'coupe', name: 'Coupe' },
    { id: 'wagon', name: 'Wagon' },
    { id: 'convertible', name: 'Convertible' },
    { id: 'pickup', name: 'Pickup Truck' }
  ];
  filters: PriceFilter[] = [
    { id: 'all', label: 'All', value: 'all' },
    { id: 'below-200k', label: 'Below 200k', value: 'below-200k', maxPrice: 200000 },
    { id: '200k-400k', label: 'From 200k - 400k', value: '200k-400k', minPrice: 200000, maxPrice: 400000 },
    { id: '400k-800k', label: 'From 400k - 800k', value: '400k-800k', minPrice: 400000, maxPrice: 800000 },
    { id: '800k-1m', label: 'From 800k - 1M', value: '800k-1m', minPrice: 800000, maxPrice: 1000000 },
    { id: 'above-1m', label: 'From 1M+', value: 'above-1m', minPrice: 1000000 }
  ];
 // Signal for the selected filter ID
  selectedFilterId = signal<string | null>(null);

  // Computed signal for selected filter object
  selectedFilter = computed(() => {
    return this.filters.find(f => f.id === this.selectedFilterId());
  });

  // Change selection
  selectFilter(filter: PriceFilter): void {
    this.selectedFilterId.set(filter.id);
  }

  // Track by ID
  trackByFilterId(index: number, filter: PriceFilter): string {
    return filter.id;
  }
  constructor(private fb: FormBuilder) {}
  ngOnInit(): void {
    this.initializeForm();
    this.setupFormSubscriptions();
  }
  private initializeForm(): void {
    this.searchForm = this.fb.group({
      carBrand: ['', Validators.required],
      carModel: [''],
      carYear: [''],
      priceRange: [[this.minPrice, this.maxPrice]],
      carType: [''],
      vehicleStatus: [''],
      bodyStyle: ['']
    });
  }
  
  private setupFormSubscriptions(): void {
    // Subscribe to carBrand changes to filter models
    this.searchForm.get('carBrand')?.valueChanges.subscribe(brandId => {
      this.onCarBrandChange();
    });
    
    // Subscribe to form value changes for debugging
    this.searchForm.valueChanges.subscribe(formValues => {
      console.log('Form values changed:', formValues);
    });
  }
  
  onCarBrandChange(): void {
    const selectedBrandId = this.searchForm.get('carBrand')?.value;
    
    if (selectedBrandId) {
      this.filteredModels = this.carModels.filter(
        model => model.brandId === selectedBrandId
      );
    } else {
      this.filteredModels = [];
    }
    
    // Reset model selection when brand changes
    this.searchForm.patchValue({ carModel: '' });
  }
  
  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);
  }
  
  onSearchSubmit(): void {
    if (this.searchForm.valid) {
      const formValues = this.searchForm.value;
      console.log('Search submitted with values:', formValues);
      
      // Here you would typically call your search service
      this.searchVehicles(formValues);
    } else {
      console.log('Form is invalid');
      this.markFormGroupTouched(this.searchForm);
    }
  }
  
  private searchVehicles(searchCriteria: any): void {
    // Implement your search logic here
    console.log('Searching vehicles with criteria:', searchCriteria);
    
    // Example: Call your service
    // this.carService.searchVehicles(searchCriteria).subscribe(
    //   results => {
    //     console.log('Search results:', results);
    //     // Handle results
    //   },
    //   error => {
    //     console.error('Search error:', error);
    //   }
    // );
  }
  
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
  
  // Utility methods for form state
  isFieldInvalid(fieldName: string): boolean {
    const field = this.searchForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
  
  getFieldError(fieldName: string): string {
    const field = this.searchForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) {
        return `${fieldName} is required`;
      }
    }
    return '';
  }
  
  resetForm(): void {
    this.searchForm.reset();
    this.filteredModels = [];
  }
}
