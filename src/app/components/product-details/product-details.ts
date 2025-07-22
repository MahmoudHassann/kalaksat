import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { GalleriaModule } from 'primeng/galleria';
import { TabsModule } from 'primeng/tabs';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { Subject, takeUntil } from 'rxjs';
import { ProductService } from './product-service';
import { Car } from '../product-card/product';

@Component({
  selector: 'app-product-details',
  standalone:true,
  imports: [CommonModule,
    GalleriaModule,
    TabsModule,
    ButtonModule,
    SkeletonModule],
  templateUrl: './product-details.html',
  styleUrl: './product-details.scss'
})
export class ProductDetails {
 @Input() carId!: number;
  
  car: Car | null = null;
  private destroy$ = new Subject<void>();
  constructor(private carService:ProductService ){
this.carId = 1;
  }
  responsiveOptions = [
    {
      breakpoint: '1024px',
      numVisible: 5
    },
    {
      breakpoint: '768px',
      numVisible: 3
    },
    {
      breakpoint: '560px',
      numVisible: 2
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
  }

  private loadCarDetails(): void {
    this.carService.getCarById(this.carId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (car) => {
          console.log(car);
          
          this.car = car;
        },
        error: (error) => {
          console.error('Error loading car details:', error);
        }
      });
  }

  formatPrice(price: number): string {
    return price.toLocaleString();
  }
}
