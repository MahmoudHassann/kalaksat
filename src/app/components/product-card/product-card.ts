import { Component, Input } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { CarCardData } from './product';

@Component({
  selector: 'app-product-card',
  standalone:true,
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss'
})
export class ProductCard {
    @Input() carData!: CarCardData;

    formatDiscount(discount: number): string {
  if (discount >= 1_000_000) return `${Math.round(discount / 1_000_000)}M off`;
  if (discount >= 1_000) return `${Math.round(discount / 1_000)}K off`;
  return `${discount} off`;
}
}
