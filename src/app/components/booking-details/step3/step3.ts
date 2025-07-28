import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BookingData, BookingService, CarDetails } from '../booking-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-step3',
  standalone:true,
  imports: [CommonModule,FormsModule],
  templateUrl: './step3.html',
  styleUrl: './step3.scss'
})
export class Step3 {
  @Input() carDetails?: CarDetails;
  @Input() bookingData?: BookingData;
  @Output() prevStep = new EventEmitter<void>();
  @Output() bookingComplete = new EventEmitter<void>();

  acceptTerms = false;
  isSubmitting = false;
  bookingConfirmed = false;
  private bookingId?: string;

  constructor(private bookingService: BookingService) {}

  goBack(): void {
    this.prevStep.emit();
  }

  generateBookingId(): string {
    if (!this.bookingId) {
      this.bookingId = Math.floor(Math.random() * 9000000 + 1000000).toString();
    }
    return this.bookingId;
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    
    return date.toLocaleDateString('en-US', options);
  }

  formatBookingDateTime(): string {
    if (!this.bookingData?.selectedDate || !this.bookingData?.selectedTime) {
      return '26 Jul, 2025, 01:00 PM';
    }

    const date = new Date(this.bookingData.selectedDate);
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    };
    
    const formattedDate = date.toLocaleDateString('en-US', options);
    return `${formattedDate}, ${this.bookingData.selectedTime}`;
  }

  formatPrice(price?: number): string {
    if (!price) return '1,755,000';
    return price.toLocaleString();
  }

  formatMonthlyPrice(price?: number): string {
    if (!price) return '11,110/mo';
    const monthly = Math.floor(price / 158); // Approximate monthly calculation
    return `${monthly.toLocaleString()}/mo`;
  }

  formatMileage(mileage?: number): string {
    if (!mileage) return '111,000';
    return mileage.toLocaleString();
  }

  async confirmBooking(): Promise<void> {
    if (!this.acceptTerms || !this.bookingData) return;

    this.isSubmitting = true;

    try {
      // Submit booking to API
      await this.bookingService.submitBooking(this.bookingData).toPromise();
      
      this.bookingConfirmed = true;
      this.isSubmitting = false;
      
      // Emit completion event after a delay
      setTimeout(() => {
        this.bookingComplete.emit();
      }, 2000);
      
    } catch (error) {
      console.error('Booking submission failed:', error);
      this.isSubmitting = false;
      // Handle error (show error message, etc.)
    }
  }
}
