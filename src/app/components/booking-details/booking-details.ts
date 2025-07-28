import { Component, Input, OnInit } from '@angular/core';
import { BookingData, BookingService, CarDetails } from './booking-service';
import { Step1 } from './step1/step1';
import { Step2 } from './step2/step2';
import { Step3 } from './step3/step3';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-booking-details',
  standalone:true,
  imports: [CommonModule,Step1,Step2,Step3],
  templateUrl: './booking-details.html',
  styleUrl: './booking-details.scss'
})
export class BookingDetails implements OnInit {
 carDetails?: CarDetails;
  
  currentStep = 1;
  bookingData: BookingData = {};

  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    if (this.carDetails) {
      this.bookingService.updateBookingData({ carDetails: this.carDetails });
    }
    
    this.bookingService.bookingData$.subscribe(data => {
      this.bookingData = data;
    });
  }

  onNextStep(): void {
    console.log(this.currentStep);
    
    if (this.currentStep < 3) {
      this.currentStep++;
    }
  }

  onPrevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  onStepData(data: any): void {
    this.bookingService.updateBookingData(data);
  }

  onBookingComplete(): void {
    // Handle booking completion
    console.log('Booking completed:', this.bookingData);
    // You can emit an event or navigate to a success page
  }
}
