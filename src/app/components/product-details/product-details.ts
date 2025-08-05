import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, computed, ElementRef, Inject, Input, PLATFORM_ID, signal, ViewChild } from '@angular/core';
import { GalleriaModule } from 'primeng/galleria';
import { TabsModule } from 'primeng/tabs';
import { ButtonModule } from 'primeng/button';
import { Skeleton } from 'primeng/skeleton';
import { Subject, takeUntil } from 'rxjs';
import { ProductService } from './product-service';
import { Swiper } from 'swiper';
import { ActivatedRoute, Router } from '@angular/router';
import { SliderModule } from 'primeng/slider';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { FinancingModal } from "../financing-modal/financing-modal";
import { environment } from '../../../environments/environment';

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
    Skeleton, InputNumberModule, SliderModule, FinancingModal],
  templateUrl: './product-details.html',
  styleUrl: './product-details.scss'
})
export class ProductDetails {
 carId!: number;
  // Car price slider
/*   carPrice: number = 0; */
  minCarPrice: number = 500000;
  maxCarPrice: number = 3000000;
  monthlyInstallmentInput: number = 5000; 
  environment = environment;
  
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

carSignal = signal<any | null>(null);
 car = computed(() => this.carSignal());
 price: number | null = null;

  // another computed signal example (e.g. just the final price)
  carPrice = computed(() => this.car()?.pricing?.final_price);
  private destroy$ = new Subject<void>();
  constructor(private carService:ProductService,@Inject(PLATFORM_ID) private platformId: Object , private router:Router,private route: ActivatedRoute ){
    this.isBrowser = isPlatformBrowser(this.platformId);
  }
  @ViewChild('tabSwiperContainer', { static: false }) tabSwiperContainer!: ElementRef;
  
  isPopupOpen = false;
  activeTabIndex = 0;
  currentTabConfig: any = null;
  tabSwiper: Swiper | null = null;
  isBrowser: boolean;
public tabConfigs: any = {};

public conditionCategories: Array<{ title: string, category: string }> = [];
public featureCategories: Array<{ title: string, category: string }> = [];

  // Categories for each tab panel
/*   categoryItems: { [key: string]: Array<{title: string, category: string}> } = {
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
  }; */

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
    this.route.paramMap.subscribe(p => {
      this.carId = +p.get('id')!;
      this.loadCarDetails();
    });
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
 
    this.downPaymentAmount = (this.carPrice() * this.downPaymentPercentage) / 100;

  this.loanAmount = this.carPrice() - this.downPaymentAmount;

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
 openConditionItem(tabPanelId: string, category: string): void {
  this.currentTabConfig = this.tabConfigs[tabPanelId];
  if (!this.currentTabConfig) return;

  const tabIndex = this.currentTabConfig.tabs.findIndex((t: any) => t.id === category);
  this.activeTabIndex = tabIndex !== -1 ? tabIndex : 0;

  this.isPopupOpen = true;

  setTimeout(() => {
    this.initTabSwiper();
  }, 100);
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

 /*  getCategoryItems(tabPanelId: string): Array<{title: string, category: string}> {
    return this.categoryItems[tabPanelId] || [];
  } */

 isConditionData(data: any[]): boolean {
  return data.length && data[0].hasOwnProperty('part');
}

isFeatureData(data: any[]): boolean {
  return data.length && data[0].hasOwnProperty('label');
}

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closePopup();
    }
  }

  galleryImages: string[] = [];
private loadCarDetails(): void {
  this.carService.getCarById(this.carId)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res: any) => {
       this.carSignal.set(res.data);
       if (res?.data?.images?.length) {
        this.galleryImages = res.data.images.map(
      (img: any) => environment.photoUrl + img.location
    );
  }
       this.price = this.carPrice();
        /** ----- CONDITIONS ----- **/
      if (res.data.conditions) {
        this.conditionCategories = [];
        const tabs:any = [];

        Object.keys(res.data.conditions).forEach(key => {
          const title = this.formatTitle(key);
          this.conditionCategories.push({ title, category: key });
          tabs.push({
            id: key,
            title,
            data: res.data.conditions[key]   // contains part, description, image
          });
        });

        this.tabConfigs['conditions'] = {
          id: 'condition',
          title: 'Car Condition Report',
          subtitle: res.data.full_name,
          tabs
        };
      }

      /** ----- FEATURES ----- **/
      if (res.data.features) {
        this.featureCategories = [];
        const tabs:any = [];

        Object.keys(res.data.features).forEach(key => {
          const title = this.formatTitle(key);
          this.featureCategories.push({ title, category: key });
          tabs.push({
            id: key,
            title,
            data: res.data.features[key]   // contains label, value
          });
        });

        this.tabConfigs['features'] = {
          id: 'features',
          title: 'Car Features',
          subtitle: res.data.full_name,
          tabs
        };
      }
      },
      error: (error) => {
        console.error('Error loading car details:', error);
      }
    });
}
private formatTitle(text: string): string {
  return text.replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}

  formatPrice(price: number): string {
    return price.toLocaleString();
  }

  bookVisit() {
    console.log(this.car());
    
  this.router.navigate(['/booking'], {
    state: { carDetails: this.car() }
  });
}

isModalOpen = false;

  openFinancingModal() {
    this.isModalOpen = true;
  }

  closeFinancingModal() {
    this.isModalOpen = false;
  }
}
