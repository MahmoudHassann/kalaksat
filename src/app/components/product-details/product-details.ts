import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, Inject, Input, PLATFORM_ID, ViewChild } from '@angular/core';
import { GalleriaModule } from 'primeng/galleria';
import { TabsModule } from 'primeng/tabs';
import { ButtonModule } from 'primeng/button';
import { Skeleton } from 'primeng/skeleton';
import { Subject, takeUntil } from 'rxjs';
import { ProductService } from './product-service';
import { Swiper } from 'swiper';
import { Router } from '@angular/router';
import { SliderModule } from 'primeng/slider';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';

interface ConditionItem {
  id: string;
  title: string;
  description: string;
  icon?: string;
  value?: string | number;
}

interface FeatureItem {
  label: string;
  value: string | number;
}

interface TabConfig {
  id: string;
  title: string;
  subtitle: string;
  tabs: TabInfo[];
}

interface TabInfo {
  id: string;
  title: string;
  data: ConditionItem[] | FeatureItem[];
}

@Component({
  selector: 'app-product-details',
  standalone:true,
  imports: [CommonModule,
    GalleriaModule,
    FormsModule,
    TabsModule,
    ButtonModule,
    CardModule,
    Skeleton,InputNumberModule,SliderModule],
  templateUrl: './product-details.html',
  styleUrl: './product-details.scss'
})
export class ProductDetails {
 carId!: number;
  // Car price slider
  carPrice: number = 0;
  minCarPrice: number = 500000;
  maxCarPrice: number = 3000000;
  monthlyInstallmentInput: number = 5000; 
  
  // Down payment as percentage
  downPaymentPercentage: number = 40; // 40%
  minDownPaymentPercentage: number = 0;
  maxDownPaymentPercentage: number = 95;
  
  downPaymentFixed: number = 0;
  // Loan tenor slider
  loanTenor: number = 48;
  minLoanTenor: number = 12;
  maxLoanTenor: number = 84;
  // Calculated values
  downPaymentAmount: number = 0;
  loanAmount: number = 0;
  calculatedMonthlyInstallment: number = 0;

  car: any | null = null;
  private destroy$ = new Subject<void>();
  constructor(private carService:ProductService,@Inject(PLATFORM_ID) private platformId: Object , private router:Router ){
    this.isBrowser = isPlatformBrowser(this.platformId);
this.carId = 1;
  }
  @ViewChild('tabSwiperContainer', { static: false }) tabSwiperContainer!: ElementRef;
  
  isPopupOpen = false;
  activeTabIndex = 0;
  currentTabConfig: any = null;
  tabSwiper: Swiper | null = null;
  isBrowser: boolean;

  // Tab Panel Configurations
  tabConfigs: { [key: string]: TabConfig } = {
    '2': { // Car Condition
      id: 'condition',
      title: 'Car Condition Report',
      subtitle: 'New Volvo EX30 2025',
      tabs: [
        {
          id: 'exterior',
          title: 'Exterior Condition',
          data: [
            {
              id: 'rear-bumper',
              title: 'Rear Bumper',
              description: 'Small dent near the number plate',
              icon: 'assets/icons/car-rear.svg'
            },
            {
              id: 'front-bumper',
              title: 'Front Bumper',
              description: 'Minor scratch on the left side',
              icon: 'assets/icons/car-front.svg'
            },
            {
              id: 'left-door',
              title: 'Left Door (Driver Side)',
              description: 'Paint scratch near the handle',
              icon: 'assets/icons/car-door.svg'
            },
            {
              id: 'right-mirror',
              title: 'Right Mirror Cover',
              description: 'Light crack on the outer shell',
              icon: 'assets/icons/car-mirror.svg'
            }
          ]
        },
        {
          id: 'interior',
          title: 'Interior Condition',
          data: [
            {
              id: 'dashboard',
              title: 'Dashboard',
              description: 'Minor wear on the center console',
              icon: 'assets/icons/dashboard.svg'
            },
            {
              id: 'seats',
              title: 'Front Seats',
              description: 'Small tear on driver seat',
              icon: 'assets/icons/car-seat.svg'
            },
            {
              id: 'steering',
              title: 'Steering Wheel',
              description: 'Good condition, no issues',
              icon: 'assets/icons/steering.svg'
            }
          ]
        },
        {
          id: 'mechanical',
          title: 'Mechanical Condition',
          data: [
            {
              id: 'engine',
              title: 'Engine',
              description: 'Running smoothly, no issues detected',
              icon: 'assets/icons/engine.svg'
            },
            {
              id: 'brakes',
              title: 'Brake System',
              description: 'Brake pads need replacement soon',
              icon: 'assets/icons/brakes.svg'
            },
            {
              id: 'transmission',
              title: 'Transmission',
              description: 'Automatic transmission working perfectly',
              icon: 'assets/icons/transmission.svg'
            }
          ]
        }
      ]
    },
    '3': { // Car Features
      id: 'features',
      title: 'Car Features',
      subtitle: 'New Volvo EX30 2025',
      tabs: [
        {
          id: 'performance',
          title: 'Performance',
          data: [
            { label: 'Fuel Type', value: 'Gasoline' },
            { label: 'Fuel Tank Capacity(L)', value: '50' },
            { label: 'Maximum Speed', value: '188' },
            { label: 'Cylinders', value: '4' },
            { label: 'Gear Shifts', value: '6' },
            { label: 'Acceleration from 0-100 (Km/Hr)', value: '12' }
          ]
        },
        {
          id: 'comfort',
          title: 'Comfort & Convenience',
          data: [
            { label: 'Air Conditioning', value: 'Automatic Climate Control' },
            { label: 'Seat Material', value: 'Leather' },
            { label: 'Power Windows', value: 'All Windows' },
            { label: 'Central Locking', value: 'Remote' },
            { label: 'Cruise Control', value: 'Available' }
          ]
        },
        {
          id: 'entertainment',
          title: 'Entertainment & Communication',
          data: [
            { label: 'Infotainment System', value: '9" Touchscreen' },
            { label: 'Bluetooth', value: 'Available' },
            { label: 'USB Ports', value: '4 Ports' },
            { label: 'Speakers', value: '8 Speakers' },
            { label: 'Navigation', value: 'Built-in GPS' }
          ]
        }
      ]
    }
  };

  // Categories for each tab panel
  categoryItems: { [key: string]: Array<{title: string, category: string}> } = {
    '2': [
      { title: 'Exterior Condition', category: 'exterior' },
      { title: 'Interior Condition', category: 'interior' },
      { title: 'Mechanical Condition', category: 'mechanical' }
    ],
    '3': [
      { title: 'Performance', category: 'performance' },
      { title: 'Comfort & Convenience', category: 'comfort' },
      { title: 'Entertainment & Communication', category: 'entertainment' }
    ]
  };

  responsiveOptions = [
    {
      breakpoint: '1024px',
      numVisible: 6
    },
    {
      breakpoint: '768px',
      numVisible: 6
    },
    {
      breakpoint: '560px',
      numVisible: 6
    }
  ];

  ngOnInit(): void {
    if (this.carId) {
      this.loadCarDetails();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.tabSwiper) {
      this.tabSwiper.destroy();
    }
  }
   onCarPriceChange(): void {
    this.calculateValues();
  }
  calculateValues(): void {
 
    this.downPaymentAmount = (this.carPrice * this.downPaymentPercentage) / 100;

  this.loanAmount = this.carPrice - this.downPaymentAmount;

  if (this.loanAmount <= 0) {
    this.calculatedMonthlyInstallment = 0;
    return;
  }

  const annualRate = 0.05;
  const monthlyRate = annualRate / 12;
  const numberOfPayments = this.loanTenor;

  if (monthlyRate === 0) {
    this.calculatedMonthlyInstallment = this.loanAmount / numberOfPayments;
  } else {
    this.calculatedMonthlyInstallment = this.loanAmount * 
      (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  }

  this.monthlyInstallmentInput = Math.round(this.calculatedMonthlyInstallment);
}
 openConditionItem(tabPanelId: string, category?: string): void {
    this.currentTabConfig = this.tabConfigs[tabPanelId];
    if (!this.currentTabConfig) return;

    // Find the index of the category if specified
    if (category) {
      const tabIndex = this.currentTabConfig.tabs.findIndex((tab:any) => tab.id === category);
      this.activeTabIndex = tabIndex !== -1 ? tabIndex : 0;
    } else {
      this.activeTabIndex = 0;
    }

    this.isPopupOpen = true;
    
    // Initialize only tab swiper after popup opens
    if (this.isBrowser) {
      setTimeout(() => {
        this.initTabSwiper();
      }, 100);
    }
  }
   formatCurrency(value: number | undefined | null): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }

  return value.toLocaleString('en-EG', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0
  });
}
 onDownPaymentPercentageChange(): void {
    this.calculateValues();
  }
   onLoanTenorChange(): void {
    this.calculateValues();
  }
   applyForFinancing(): void {
    console.log('Applying for financing with:', {
      carPrice: this.carPrice,
      downPaymentPercentage: this.downPaymentPercentage,
      downPaymentAmount: this.downPaymentAmount,
      loanAmount: this.loanAmount,
      loanTenor: this.loanTenor,
      monthlyInstallment: this.monthlyInstallmentInput
    });
  }

  closePopup(): void {
    this.isPopupOpen = false;
    if (this.tabSwiper) {
      this.tabSwiper.destroy();
      this.tabSwiper = null;
    }
  }

  private initTabSwiper(): void {
    if (!this.tabSwiperContainer || this.tabSwiper) return;

    this.tabSwiper = new Swiper(this.tabSwiperContainer.nativeElement, {
      slidesPerView: 'auto',
      spaceBetween: 0,
      freeMode: true,
      watchOverflow: true,
      centerInsufficientSlides: true,
      on: {
        init: (swiper) => {
          // Center the active slide
          if (this.activeTabIndex < swiper.slides.length) {
            swiper.slideTo(this.activeTabIndex, 0);
          }
        }
      }
    });
  }

  onTabClick(index: number): void {
    this.activeTabIndex = index;
    if (this.tabSwiper) {
      this.tabSwiper.slideTo(index);
    }
  }

  getCurrentTab(): any {
    if (!this.currentTabConfig || this.activeTabIndex >= this.currentTabConfig.tabs.length) {
      return null;
    }
    return this.currentTabConfig.tabs[this.activeTabIndex];
  }

  getCategoryItems(tabPanelId: string): Array<{title: string, category: string}> {
    return this.categoryItems[tabPanelId] || [];
  }

  isFeatureData(data: any[]): data is FeatureItem[] {
    return data.length > 0 && 'label' in data[0] && 'value' in data[0];
  }

  isConditionData(data: any[]): data is ConditionItem[] {
    return data.length > 0 && 'title' in data[0] && 'description' in data[0];
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closePopup();
    }
  }

  private loadCarDetails(): void {
    this.carService.getCarById(this.carId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (car:any) => {
          this.car = car['data'];
          this.carPrice = this.car.pricing.final_price;
          console.log(this.car);
          
        },
        error: (error) => {
          console.error('Error loading car details:', error);
        }
      });
  }

  formatPrice(price: number): string {
    return price.toLocaleString();
  }

  bookVisit() {
  this.router.navigate(['/booking'], {
    state: { carDetails: this.car }
  });
}
}
