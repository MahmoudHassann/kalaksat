import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  computed,
  ElementRef,
  EventEmitter,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  signal,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormsModule,
} from '@angular/forms';
import { SliderModule } from 'primeng/slider';
import { CarCardData, PriceFilter } from '../product-card/product';
import { ProductCard } from '../product-card/product-card';
import { LoanCalculator } from '../loan-calculator/loan-calculator';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    SliderModule,
    FormsModule,
    ProductCard,
    LoanCalculator,
    RouterLink,
    SelectModule,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit, AfterViewInit,OnDestroy {
  searchForm!: FormGroup;
  environment = environment;
  filteredModels: any[] = [];
  minPrice = 250000;
  maxPrice = 1000000;
  rangeValues: number[] = [250000, 1000000];
  Cars = signal<CarCardData[]>([]);
  NewCars = signal<CarCardData[]>([]);
  UsedCars = signal<CarCardData[]>([]);
  loading = signal<boolean>(true);
  noData = computed(() => !this.loading() && this.Cars().length === 0);
  Brands: Array<{ id: number; name: string }> = [];
  Models: Array<any> = [];
  Types: Array<{ id: number; name: string }> = [];
  vehicleStatus: Array<{ id: number; name: string }> = [];
  bodyStyles: Array<{ id: number; name: string }> = [];

  // Options bound to selects
  brandOptions: Array<{ id: number; name: string }> = [];
  typeOptions: Array<{ id: number; name: string }> = [];
  statusOptions: Array<{ id: number; name: string }> = [];
  bodyStyleOptions: Array<{ id: number; name: string }> = [];

  // Load-once flags (call only on first typing/open)
  private brandsLoaded = false;
  private modelsLoaded = false;
  private typesLoaded = false;
  private statusesLoaded = false;
  private stylesLoaded = false;
  // Loading flags (for spinners)
  isBrandsLoading = false;
  isModelsLoading = false;
  isTypesLoading = false;
  isStatusesLoading = false;
  isStylesLoading = false;
  @ViewChild('swiperContainer', { static: false }) swiperContainer?: ElementRef;

  private swiper: any;
  private autoplayInterval: any;
  private currentSlideIndex = 0;
  private keydownHandler?: (e: KeyboardEvent) => void;
  private mouseEnterHandler?: () => void;
  private mouseLeaveHandler?: () => void;

  public isBrowser: boolean;

  slides: any[] = [
    {
      id: 'welcome',
      title: 'Welcome to the all-new Klaksat',
      subtitle: 'where finding your perfect car starts with you.',
      buttons: {
        primary: {
          text: 'Buy a Used Car',
          action: 'navigate',
          params: { path: '/products', queryParams: { mode: 'used' } },
        },
        secondary: {
          text: 'Buy a New Car',
          action: 'navigate',
          params: { path: '/products', queryParams: { mode: 'new' } },
        },
      },
      backgroundClass: 'slide-1',
      carType: 'sedan',
    },
    {
      id: 'used-cars',
      title: 'Premium Used Cars',
      subtitle: 'Quality pre-owned vehicles with certified inspections.',
      buttons: {
        primary: {
          text: 'Browse Used Cars',
          action: 'navigate',
          params: { path: '/products', queryParams: { mode: 'used' } },
        },
        secondary: {
          text: 'Financing Options',
          action: 'financing',
          params: {},
        },
      },
      backgroundClass: 'slide-2',
      carType: 'suv',
    },
    {
      id: 'new-cars',
      title: 'Latest New Models',
      subtitle: 'Experience the newest technology and luxury features.',
      buttons: {
        primary: {
          text: 'Browse New Cars',
          action: 'navigate',
          params: { path: '/products', queryParams: { mode: 'new' } },
        },
        secondary: {
          text: 'Schedule Test Drive',
          action: 'test-drive',
          params: {},
        },
      },
      backgroundClass: 'slide-3',
      carType: 'sports',
    },
  ];

  years: number[] = Array.from(
    { length: 126 },
    (_, i) => new Date().getFullYear() - i
  );

  filters: PriceFilter[] = [
    { id: 'all', label: 'All', value: [null, null] },
    {
      id: 'below-200k',
      label: 'Below 200k',
      value: [0, 200000],
      maxPrice: 200000,
    },
    {
      id: '200k-400k',
      label: 'From 200k - 400k',
      value: [200000, 400000],
      minPrice: 200000,
      maxPrice: 400000,
    },
    {
      id: '400k-800k',
      label: 'From 400k - 800k',
      value: [400000, 800000],
      minPrice: 400000,
      maxPrice: 800000,
    },
    {
      id: '800k-1m',
      label: 'From 800k - 1M',
      value: [800000, 1000000],
      minPrice: 800000,
      maxPrice: 1000000,
    },
    {
      id: 'above-1m',
      label: 'From 1M+',
      value: [1000000, null],
      minPrice: 1000000,
    },
  ];
  // Signal for the selected filter ID
  selectedRange = signal<[number, number | null] | [null, null]>([null, null]);

  // Computed signal for selected filter object
  selectedFilter = computed(() => {
    return this.filters.find(
      (f) => JSON.stringify(f.value) === JSON.stringify(this.selectedRange())
    );
  });

  // Change selection
  selectFilter(filter: PriceFilter): void {
    this.selectedRange.set(filter.value);
    this.loading.set(true);
    const url = 'cars/pagination/asc/price/1/3';
    this._httpClient
      .post(`${environment.baseUrl}${url}`, {
        price_range: this.selectedRange(),
      })
      .subscribe({
        next: (res: any) => {
          this.Cars.set(res['data']);
        },
        error: () => {
          this.Cars.set([]);
        },
        complete: () => {
          this.loading.set(false);
        },
      });
  }

  // Track by ID
  trackByFilterId(index: number, filter: PriceFilter): string {
    return filter.id;
  }
  constructor(
    private fb: FormBuilder,
    private _httpClient: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
  }
  ngOnInit(): void {
    this.initializeForm();
    this.setupFormSubscriptions();
    this.getCars();
    this.getUsedCars();
    this.getNewCars();
  }
  private initializeForm(): void {
    this.searchForm = this.fb.group({
      brand_id: [null, Validators.required],
      car_model_id: [{ value: null, disabled: true }],
      model_year: [null as number | null],
      priceRange: [[this.minPrice, this.maxPrice]],
      transmission_type_id: [null],
      fuel_economy: [null],
      body_style_id: [null],
    });
  }
ngAfterViewInit() {
  if (this.isBrowser) {
    this.initializeSwiper();
  }
}


  ngOnDestroy(): void {
    // Clean up event listeners
    if (this.keydownHandler) {
      document.removeEventListener('keydown', this.keydownHandler);
    }

    if (
      this.mouseEnterHandler &&
      this.mouseLeaveHandler &&
      this.swiperContainer
    ) {
      const swiperEl = this.swiperContainer.nativeElement;
      swiperEl.removeEventListener('mouseenter', this.mouseEnterHandler);
      swiperEl.removeEventListener('mouseleave', this.mouseLeaveHandler);
    }

    // Clean up swiper
    if (this.swiper) {
      this.swiper.destroy(true, true);
      this.swiper = null;
    }

    // Clean up intervals
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
    }
  }

  private async initializeSwiper(attempt = 1): Promise<void> {
  if (!this.isBrowser) return;

  // Wait for DOM
  await new Promise((resolve) => setTimeout(resolve, 0));

  // If container not ready → retry up to 5 times
  if (!this.swiperContainer?.nativeElement) {
    if (attempt <= 5) {
      console.warn(`Container not found. Retrying (${attempt})...`);
      return this.initializeSwiper(attempt + 1);
    } else {
      console.error('Swiper container still not found after retries');
      return;
    }
  }

  const { default: Swiper } = await import('swiper');
  const { Navigation, Pagination, Autoplay, EffectFade } = await import('swiper/modules');

  if (this.swiper) {
    try { this.swiper.destroy(true, true); } catch (_) {}
  }

  this.swiper = new Swiper(this.swiperContainer.nativeElement, {
    modules: [Navigation, Pagination, Autoplay, EffectFade],
    direction: 'horizontal',
    loop: true,
    autoplay: { delay: 5000, disableOnInteraction: false },
    effect: 'fade',
    fadeEffect: { crossFade: true },
    pagination: { el: '.swiper-pagination', clickable: true },
    navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
  });

  this.setupEventListeners();
}

  private setupEventListeners(): void {
    if (!this.isBrowser || !this.swiper) return;

    // Keyboard navigation
    const keydownHandler = (e: KeyboardEvent) => {
      if (!this.swiper) return;

      if (e.key === 'ArrowLeft') {
        this.swiper.slidePrev();
      } else if (e.key === 'ArrowRight') {
        this.swiper.slideNext();
      }
    };

    document.addEventListener('keydown', keydownHandler);

    // Store reference for cleanup
    this.keydownHandler = keydownHandler;

    // Pause autoplay on hover
    const swiperEl = this.swiperContainer?.nativeElement;

    const mouseEnterHandler = () => {
      if (this.swiper?.autoplay) {
        this.swiper.autoplay.stop();
      }
    };

    const mouseLeaveHandler = () => {
      if (this.swiper?.autoplay) {
        this.swiper.autoplay.start();
      }
    };

    swiperEl.addEventListener('mouseenter', mouseEnterHandler);
    swiperEl.addEventListener('mouseleave', mouseLeaveHandler);

    // Store references for cleanup
    this.mouseEnterHandler = mouseEnterHandler;
    this.mouseLeaveHandler = mouseLeaveHandler;
  }

  handleButtonClick(button: {
    text: string;
    action: string;
    params?: any;
  }): void {
    switch (button.action) {
      case 'navigate':
        this.router.navigate([button.params.path], {
          queryParams: button.params.queryParams,
          queryParamsHandling: 'merge',
        });
        break;
      case 'financing':
        this.showFinancing();
        break;
      case 'test-drive':
        this.scheduleTestDrive();
        break;
      default:
        console.log('Unknown action:', button.action);
    }
  }

  private showFinancing(): void {
    // Navigate to financing page or show modal
    this.router.navigate(['/financing']);
  }

  private scheduleTestDrive(): void {
    // Navigate to test drive page or show modal
    this.router.navigate(['/test-drive']);
  }

  trackBySlideId(index: number, slide: any): string {
    return slide.id;
  }

  // Public methods for external control
  public nextSlide(): void {
    if (this.swiper) {
      this.swiper.slideNext();
    }
  }

  public prevSlide(): void {
    if (this.swiper) {
      this.swiper.slidePrev();
    }
  }

  public goToSlide(index: number): void {
    if (this.swiper) {
      this.swiper.slideTo(index);
    }
  }

  private setupFormSubscriptions(): void {
    const brandCtrl = this.searchForm.get('brand_id')!;
    const modelCtrl = this.searchForm.get('car_model_id')!;

    brandCtrl.valueChanges.subscribe((brandId: number | null) => {
      // Clear current model selection
      modelCtrl.reset(null, { emitEvent: false });

      if (brandId) {
        // Enable the control when a brand is selected
        if (modelCtrl.disabled) modelCtrl.enable({ emitEvent: false });
        this.filterModelsByBrand(brandId);
        // If you lazy-load models, you can trigger getCarModels() the first time here
        // if (!this.modelsLoaded) { this.modelsLoaded = true; this.getCarModels(); }
      } else {
        // Disable if no brand
        if (modelCtrl.enabled) modelCtrl.disable({ emitEvent: false });
        this.Models = [];
      }
    });
  }

  getCarBrands(force = false) {
    if (this.brandsLoaded && !force) return;
    this.isBrandsLoading = true;
    const url = 'brands';
    this._httpClient.get(`${environment.baseUrl}${url}`).subscribe({
      next: (res: any) => {
        this.Brands = Array.isArray(res) ? res : [];
        this.brandOptions = this.Brands;
        this.brandsLoaded = true;
      },
      error: (_) => {
        this.brandOptions = [];
        this.brandsLoaded = false;
      },
      complete: () => {
        this.isBrandsLoading = false;
      },
    });
  }

  getCarModels(force = false, id: number) {
    if (this.modelsLoaded && !force) return;
    this.isModelsLoading = true;
    const url = 'models';
    this._httpClient
      .post(`${environment.baseUrl}${url}`, { brand_id: id })
      .subscribe({
        next: (res: any) => {
          this.Models = Array.isArray(res) ? res : [];
          console.log(this.Models);

          this.modelsLoaded = true;
        },
        error: (_) => {
          this.Models = [];
          this.modelsLoaded = false;
        },
        complete: () => {
          this.isModelsLoading = false;
        },
      });
  }

  getCarTypes(force = false) {
    if (this.typesLoaded && !force) return;
    this.isTypesLoading = true;
    const url = 'transmission_types';
    this._httpClient.get(`${environment.baseUrl}${url}`).subscribe({
      next: (res: any) => {
        this.Types = Array.isArray(res) ? res : [];
        this.typeOptions = this.Types;
        this.typesLoaded = true;
      },
      error: (_) => {
        this.typeOptions = [];
        this.typesLoaded = false;
      },
      complete: () => {
        this.isTypesLoading = false;
      },
    });
  }

  getVehicleStatus(force = false) {
    if (this.statusesLoaded && !force) return;
    this.isStatusesLoading = true;
    const url = 'vehicle_statuses';
    this._httpClient.get(`${environment.baseUrl}${url}`).subscribe({
      next: (res: any) => {
        this.vehicleStatus = Array.isArray(res) ? res : [];
        this.statusOptions = this.vehicleStatus;
        this.statusesLoaded = true;
      },
      error: (_) => {
        this.statusOptions = [];
        this.statusesLoaded = false;
      },
      complete: () => {
        this.isStatusesLoading = false;
      },
    });
  }

  getBodyStyle(force = false) {
    if (this.stylesLoaded && !force) return;
    this.isStylesLoading = true;
    const url = 'body_styles';
    this._httpClient.get(`${environment.baseUrl}${url}`).subscribe({
      next: (res: any) => {
        this.bodyStyles = Array.isArray(res) ? res : [];
        this.bodyStyleOptions = this.bodyStyles;
        this.stylesLoaded = true;
      },
      error: (_) => {
        this.bodyStyleOptions = [];
        this.stylesLoaded = false;
      },
      complete: () => {
        this.isStylesLoading = false;
      },
    });
  }
  getCars() {
    this.loading.set(true);
    const url = 'cars/pagination/asc/id/1/3';
    this._httpClient
      .post<CarCardData[]>(`${environment.baseUrl}${url}`, {})
      .subscribe({
        next: (res: any) => {
          this.Cars.set(res['data']);
        },
        error: () => {
          this.Cars.set([]);
        },
        complete: () => {
          this.loading.set(false);
        },
      });
  }
  getNewCars() {
    this.loading.set(true);
    const url = 'cars/pagination/asc/id/1/3';
    this._httpClient
      .post<CarCardData[]>(`${environment.baseUrl}${url}`, {
        vehicle_status: 'new',
      })
      .subscribe({
        next: (res: any) => {
          this.NewCars.set(res['data']);
        },
        error: () => {
          this.NewCars.set([]);
        },
        complete: () => {
          this.loading.set(false);
        },
      });
  }
  getUsedCars() {
    this.loading.set(true);
    const url = 'cars/pagination/asc/id/1/3';
    this._httpClient
      .post<CarCardData[]>(`${environment.baseUrl}${url}`, {
        vehicle_status: 'used',
      })
      .subscribe({
        next: (res: any) => {
          this.UsedCars.set(res['data']);
        },
        error: () => {
          this.UsedCars.set([]);
        },
        complete: () => {
          this.loading.set(false);
        },
      });
  }
  // call once when user types in Brand (or opens)
  onBrandFilter(_: any) {
    if (!this.brandsLoaded && !this.isBrandsLoading) this.getCarBrands();
  }

  // lazy load on first open if user clicks without typing
  ensureTypesOnOpen() {
    if (!this.typesLoaded && !this.isTypesLoading) this.getCarTypes();
  }
  ensureStatusesOnOpen() {
    if (!this.statusesLoaded && !this.isStatusesLoading)
      this.getVehicleStatus();
  }
  ensureStylesOnOpen() {
    if (!this.stylesLoaded && !this.isStylesLoading) this.getBodyStyle();
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  }

  // Filter local models for the selected brand
  private filterModelsByBrand(brandId: number | null) {
    if (!brandId) {
      this.Models = [];
      return;
    }
    // Support either "brand_id" or "brandId" from backend
    this.getCarModels(true, brandId);
  }

  submit() {
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }
    const payload = this.searchForm.getRawValue();
    console.log(payload);

    // POST payload with IDs
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
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
