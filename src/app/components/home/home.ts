import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators,FormsModule  } from '@angular/forms';
import { SliderModule } from 'primeng/slider';

@Component({
  selector: 'app-home',
  standalone:true,
  imports: [ReactiveFormsModule,CommonModule,SliderModule,FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {
searchForm!: FormGroup;
  filteredModels: any[] = [];
  minPrice = 250000;
  maxPrice = 1000000;
  rangeValues: number[] = [250000, 1000000];
  
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
