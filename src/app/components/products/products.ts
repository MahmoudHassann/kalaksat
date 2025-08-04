import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  Signal,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ActivatedRoute,
  convertToParamMap,
  ParamMap,
  Router,
  RouterLink,
} from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { FormsModule } from '@angular/forms';
import { CarCardData } from '../product-card/product';
import { ProductCard } from '../product-card/product-card';

export type CarFilterMode = 'new' | 'used' | 'vip' | 'electric';

export interface CarFiltersValue {
  vehicle_status: CarFilterMode;

  // shared
  brand_ids: string[];
  body_style_ids: string[];
  price_range?: string | null;

  // used-only
  conditions ?: string[];
 engine_capacity_cc?: [number, number] | undefined;
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ProductCard],
  templateUrl: './products.html',
  styleUrl: './products.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'car-filters' },
})
export class Products implements OnInit {
  Cars = signal<CarCardData[]>([]);
  loading = signal<boolean>(true);
  noData = computed(() => !this.loading() && this.Cars().length === 0);
  sortOptions = [
    { label: 'Most relevant', value: 'most-relevant' },
    { label: 'Recently Added', value: 'recently-added' },
    { label: 'Price–Highest to Lowest', value: 'price-desc' },
    { label: 'Price–Lowest to Highest', value: 'price-asc' },
    { label: 'KMs–Highest to Lowest', value: 'km-desc' },
    { label: 'KMs–Lowest to Highest', value: 'km-asc' },
    { label: 'Year–Old to New', value: 'year-asc' },
    { label: 'Year–New to Old', value: 'year-desc' },
  ];
  selectedSort: string = 'most-relevant';
  loadingBrands = signal<boolean>(false);
  loadingBodyStyles = signal<boolean>(false);
  private fetchedTabs = signal<Set<string>>(new Set());
  /** External control (optional). If not provided, user can toggle inside. */
  get mode(): CarFilterMode {
    return this._mode();
  }

  /** Emits the full current filter state whenever something changes */

  // -----------------------------
  // Signals (state)
  // -----------------------------
  private readonly route = inject(ActivatedRoute, { optional: true });
  private readonly router = inject(Router);

  // --- URL queryParamMap as a Signal with safe fallback
  readonly qpm: Signal<ParamMap> = toSignal(
    this.route?.queryParamMap ?? of(convertToParamMap({})),
    {
      initialValue:
        this.route?.snapshot?.queryParamMap ?? convertToParamMap({}),
    }
  );

  // -----------------------------
  // Signals (state)
  // -----------------------------
  private _mode = signal<CarFilterMode>('electric'); // your default

  // Tabs/signals omitted for brevity … (keep your existing ones)

  constructor(private _httpClinet: HttpClient, private elementRef: ElementRef) {
    // Update _mode only when URL explicitly provides a valid 'mode'
   effect(() => {
    const raw = this.qpm().get('mode');
    if (raw === 'new' || raw === 'used' || raw === 'vip') {
      const prevMode = this._mode();
      this._mode.set(raw);

      // Reset filters and sort if mode changes
      if (prevMode !== raw) {
        this.resetFiltersAndSort();
        this.fetchedTabs.set(new Set()); // Clear fetched tabs to allow re-fetching
      }
    }
  });

  // Fetch only necessary tab data depending on mode
  effect(() => {
    const mode = this._mode();
    const tab = this.activeTab();

    // Skip if already fetched
    if (this.fetchedTabs().has(tab)) return;

    // Skip brand loading if mode is 'vip'
    if ((mode === 'vip' || mode === 'electric') && tab === 'brand') return;

    const updated = new Set(this.fetchedTabs());
    updated.add(tab);
    this.fetchedTabs.set(updated);

    switch (tab) {
      case 'brand':
        this.loadBrandData();
        break;
      case 'body':
        this.loadBodyStyleData();
        break;
      case 'special':
        this.loadSpecialConditionsData();
        break;
      case 'cc':
        this.loadCcData();
        break;
    }
  });

  // Fetch cars when mode is set or changed
  effect(() => {
    this.fetchFilteredCars();
  });

  }
  ngOnInit(): void {}
  private resetFiltersAndSort() {
  this.selectedSort = 'most-relevant';
   this.resetFilters(); // Clear all form filter values
}
resetFilters() {
  this.selectedBrands.set(new Set<string>());
  this.selectedBodyStyles.set(new Set<string>());
  this.selectedPrice.set(null);
  this.selectedSpecial.set(new Set<string>());
  this.selectedCc.set(null);
}
  // Tab state per mode
  private _activeTabNew = signal<'brand' | 'price' | 'body'>('brand');
  private _activeTabUsed = signal<
    'brand' | 'price' | 'special' | 'cc' | 'body'
  >('brand');

  // Selections (signals)
  selectedBrands = signal<Set<string>>(new Set());
  selectedBodyStyles = signal<Set<string>>(new Set());
  selectedPrice = signal<string | null>(null);
  selectedSpecial = signal<Set<string>>(new Set());
selectedCc = signal<[number, number] | null>(null);

  // Show-more for brand grid
  showAllBrands = signal<boolean>(false);
  private Brands = signal<any[]>([]);
  readonly BodyStyles = signal<any[]>([]);
  SpecialConditions: Array<any> = [];
  CCRanges: Array<any> = [];

  // -----------------------------
  // Static option lists
  // -----------------------------

  readonly priceNew = [
    '0k to 250k EGP',
    '250k to 500k EGP',
    '500k to 750k EGP',
    '750k to 1m EGP',
    '1.25m to 1.5m EGP',
    '1.5m to 2.0m EGP',
    '2.0m to 2.5m EGP',
    '2.0m to 3m EGP',
    'More than 3m',
  ];

  readonly priceUsed = [
    '0 to 100k EGP',
    '100k to 200k EGP',
    '200k to 300k EGP',
    '300k to 400k EGP',
    '400k to 500k EGP',
    '500k to 600k EGP',
    '600k to 700k EGP',
    '700k+ EGP',
  ];

  readonly specialConditions = [
    'First Owner',
    'Warranty',
    'Dealer Maintained',
    'Under Finance',
    'Accident Free',
  ];

   ccRanges: [number, number][]= [
    [1000, 1300],
    [1300, 1600],
    [1600, 2000],
    [2000, 3000]
  ];
  

  private loadBrandData() {
    this.loadingBrands.set(true);
    const url = 'brands';

    this._httpClinet.get(`${environment.baseUrl}${url}`).subscribe({
      next: (res: any) => {
        this.Brands.set(Array.isArray(res) ? res : []);
      },
      error: () => {
        this.Brands.set([]);
      },
      complete: () => {
        this.loadingBrands.set(false);
      },
    });
  }

  private loadBodyStyleData() {
    this.loadingBodyStyles.set(true);
    const url = 'body_styles';
    this._httpClinet.get(`${environment.baseUrl}${url}`).subscribe({
      next: (res: any) => {
        this.BodyStyles.set(Array.isArray(res) ? res : []);
      },
      error: () => {
        this.BodyStyles.set([]);
      },
      complete: () => {
        this.loadingBodyStyles.set(false);
      },
    });
  }

  private loadSpecialConditionsData() {
    console.log('Fetching special conditions...');
    // your logic here
  }

  private loadCcData() {
    console.log('Fetching cc range...');
    // your logic here
  }

  // -----------------------------
  // Computed projections
  // -----------------------------
  readonly activeTab = computed(() =>
    this._mode() === 'new' ? this._activeTabNew() : this._activeTabUsed()
  );

  // Price list depends on mode
  readonly priceList = computed(() =>
    this._mode() === 'new' ? this.priceNew : this.priceUsed
  );

  // Brand display (show first 18, then all on toggle)
  readonly visibleBrands = computed(() => {
    const list = this.Brands();
    return this.showAllBrands() ? list : list.slice(0, 12);
  });

  // Snapshot for output
 readonly value = computed<CarFiltersValue>(() => {
  const cc = this.selectedCc(); // [number, number] | null

  const engine_capacity_cc =
    this._mode() === 'used' && cc
      ? [Number(cc[0]), Number(cc[1])] as [number, number]
      : undefined;

  return {
    vehicle_status: this._mode(),
   brand_ids: [...this.selectedBrands()].map((b:any) => b.id),
body_style_ids: [...this.selectedBodyStyles()].map((b:any) => b.id),
    price_range: this.selectedPrice(),
    conditions :
      this._mode() === 'used' ? [...this.selectedSpecial()] : undefined,
    engine_capacity_cc,
  };
});

  // -----------------------------
  // UI handlers
  // -----------------------------
  setMode(mode: CarFilterMode) {
    if (this._mode() === mode) return;
    this._mode.set(mode);
    // Reset view tabs but keep selections independent of mode switches (optional)
    if (this.route) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { mode: mode },
        queryParamsHandling: 'merge',
      });
    }
  }
  onSortChange(event: Event) {
    const selected = (event.target as HTMLSelectElement).value;
    console.log('Selected Sort:', selected);
    // Emit event or call service to re-fetch data with new sort
  }

  setTabNew(tab: 'brand' | 'price' | 'body') {
    this._activeTabNew.set(tab);
  }
  setTabUsed(tab: 'brand' | 'price' | 'special' | 'cc' | 'body') {
    this._activeTabUsed.set(tab);
  }

  toggleBrand(b: string) {
    const s = new Set(this.selectedBrands());
    s.has(b) ? s.delete(b) : s.add(b);
    this.selectedBrands.set(s);
  }

  selectPrice(p: string) {
    this.selectedPrice.set(this.selectedPrice() === p ? null : p);
  }

  toggleBodyStyle(v: string) {
    const s = new Set(this.selectedBodyStyles());
    s.has(v) ? s.delete(v) : s.add(v);
    this.selectedBodyStyles.set(s);
  }

  toggleSpecial(v: string) {
    const s = new Set(this.selectedSpecial());
    s.has(v) ? s.delete(v) : s.add(v);
    this.selectedSpecial.set(s);
  }

   selectCc(cc: [number, number]): void {
  const selected = this.selectedCc();
  if (selected && selected[0] === cc[0] && selected[1] === cc[1]) {
    this.selectedCc.set(null); // Deselect
  } else {
    this.selectedCc.set(cc); // Select
  }
}
  isCcSelected(cc: [number, number]): boolean {
  const selected = this.selectedCc();
  return !!selected && selected[0] === cc[0] && selected[1] === cc[1];
}

  toggleShowAllBrands() {
    this.showAllBrands.set(!this.showAllBrands());
  }

  /* private emit() {
  this.fetchFilteredCars(); 
} */
  isOpen = false;

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

 selectOption(value: string) {
  if (this.selectedSort === value) {
    this.isOpen = false;
    return; // Do nothing if the value hasn't changed
  }
  this.selectedSort = value;
  this.isOpen = false;
  this.fetchFilteredCars();
}

  getLabel(value: string) {
    return this.sortOptions.find((opt) => opt.value === value)?.label || '';
  }
  @HostListener('document:click', ['$event'])
handleClickOutside(event: MouseEvent) {
  const clickedInside = this.elementRef.nativeElement.contains(event.target);
  if (!clickedInside) {
    this.isOpen = false;
  }
}

  private getSortParams(sortValue: string): {
    direction: 'asc' | 'desc';
    field: string;
  } {
    switch (sortValue) {
      case 'price-asc':
        return { direction: 'asc', field: 'price' };
      case 'price-desc':
        return { direction: 'desc', field: 'price' };
      case 'km-asc':
        return { direction: 'asc', field: 'mileage' };
      case 'km-desc':
        return { direction: 'desc', field: 'mileage' };
      case 'year-asc':
        return { direction: 'asc', field: 'model_year' };
      case 'year-desc':
        return { direction: 'desc', field: 'model_year' };
      case 'recently-added':
        return { direction: 'desc', field: 'created_at' };
      default: // 'most-relevant' or unknown
        return { direction: 'desc', field: 'id' };
    }
  }
  private fetchFilteredCars() {
    this.loading.set(true);

    const value = this.value();
    const priceRange = this.mapPriceToRange(value.price_range ?? null);
    const sortParams = this.getSortParams(this.selectedSort);

    const page = 1;
    const mode = this._mode();
 
    const limit = (mode === 'vip' || mode === 'electric') ? 12 : 6;

    const url = `${environment.baseUrl}cars/pagination/${sortParams.direction}/${sortParams.field}/${page}/${limit}`;

    const payload = {
      ...value,
      price_range: priceRange,
      vehicle_status:''
    };

    this._httpClinet.post<CarCardData[]>(url, (mode === 'vip' || mode === 'electric') ? {vehicle_status:mode} : payload).subscribe({
      next: (res:any) => {
        this.Cars.set(Array.isArray(res['data']) ? res['data'] : []);
      },
      error: () => {
        this.Cars.set([]);
      },
      complete: () => {
        this.loading.set(false);
      },
    });
  }
  private mapPriceToRange(label: string | null): [number, number] | null {
  if (!label) return null;

  const clean = label.replace(/EGP|,/g, '').trim().toLowerCase();

  if (clean.includes('more than')) {
    const from = this.parsePrice(clean.replace('more than', '').trim());
    return [from, Infinity];
  }

  if (clean.includes('to')) {
    const [fromStr, toStr] = clean.split('to').map(s => s.trim());
    const from = this.parsePrice(fromStr);
    const to = this.parsePrice(toStr);
    return [from, to];
  }

  if (clean.includes('+')) {
    const from = this.parsePrice(clean.replace('+', '').trim());
    return [from, Infinity];
  }

  return null;
}

private parsePrice(str: string): number {
  const match = str.match(/([\d.]+)([km]?)/); // handles '1.25m', '750k', '200'
  if (!match) return 0;

  const value = parseFloat(match[1]);
  const unit = match[2];

  switch (unit) {
    case 'k': return value * 1_000;
    case 'm': return value * 1_000_000;
    default: return value;
  }
}
}
