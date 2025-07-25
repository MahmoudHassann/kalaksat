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
    @Input() carData: CarCardData = {
    id:1,
    image: '/api/placeholder/300/200',
    imageAlt: 'Car image',
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
  };

}
