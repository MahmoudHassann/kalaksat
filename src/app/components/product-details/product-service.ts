import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { Car } from '../product-card/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'https://api.example.com/cars';

  constructor() {}
   private mockData: Car = {
    id: 1,
    title: 'New Volvo EX30 2025',
    year: 2025,
    price: 700000,
    currency: 'EGP',
    images: [
      {
        id: 1,
        url: '/img/main-car.png',
        alt: 'Volvo EX30 Main View',
        thumbnailUrl: '/img/car1.png'
      },
      {
        id: 2,
        url: '/img/car2.jpg',
        alt: 'Volvo EX30 Side View',
        thumbnailUrl: '/img/car2.jpg'
      },
      {
        id: 3,
        url: '/img/car3.jpg',
        alt: 'Volvo EX30 Interior',
        thumbnailUrl: '/img/car3.jpg'
      },
      {
        id: 4,
        url: '/img/car4.jpg',
        alt: 'Volvo EX30 Rear View',
        thumbnailUrl: '/img/car4.jpg'
      },
      {
        id: 5,
        url: '/img/car5.jpg',
        alt: 'Volvo EX30 Dashboard',
        thumbnailUrl: '/img/car5.jpg'
      },
      {
        id: 6,
        url: '/img/car6.jpg',
        alt: 'Volvo EX30 Engine',
        thumbnailUrl: '/img/car6.jpg'
      }
    ],
    specifications: [
      { icon: 'pi-refresh', label: 'Fuel Economy', value: '16.7-18', unit: 'liters/100km' },
      { icon: 'pi-cog', label: 'Engine Capacity', value: '----' },
      { icon: 'pi-bolt', label: 'Horsepower', value: '200 - 428' },
      { icon: 'pi-forward', label: 'Transmission', value: 'Automatic' },
      { icon: 'pi-expand', label: 'Size', value: '4233 L x 1838 W x 1550 H', unit: 'meters' },
      { icon: 'pi-car', label: 'Engine Type', value: 'Electric' }
    ],
    features: [],
    description: 'Experience the future of electric driving with the new Volvo EX30 2025.',
    tabs: {
      carSummary: [
        { icon: 'pi-palette', title: 'repainted part', description: 'Vehicle has been repainted' },
        { icon: 'pi-wrench', title: 'No mechanical problems', description: 'All systems functioning properly' },
        { icon: 'pi-circle', title: 'New front and back tires', description: 'Fresh tire replacement' },
        { icon: 'pi-shield', title: 'Car in warranty', description: 'Full warranty coverage' },
        { icon: 'pi-cog', title: 'New maintenance in the authorized service center', description: 'Recently serviced' }
      ],
      overview: 'Detailed overview of the vehicle specifications and features.',
      inspection: [],
      features: ['Electric Engine', 'Automatic Transmission', 'Premium Interior'],
      financing: {}
    }
  };

  getCarById(id: number): Observable<Car> {
    // Simulate API call with delay
    return of(this.mockData);
  }
 
}
