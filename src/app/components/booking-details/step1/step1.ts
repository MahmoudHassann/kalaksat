import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService, CarDetails, DateOption, LocationDetails, TimeSlot } from '../booking-service';

@Component({
  selector: 'app-step1',
  standalone:true,
  imports: [CommonModule],
  templateUrl: './step1.html',
  styleUrl: './step1.scss'
})
export class Step1 implements OnInit {
   @Input() carDetails?: CarDetails;
  @Output() nextStep = new EventEmitter<void>();
  @Output() stepData = new EventEmitter<any>();

  dateOptions: DateOption[] = [];
  availableTimeSlots: TimeSlot[] = [
    { time: '02:00 PM', available: true },
    { time: '03:00 PM', available: true },
    { time: '04:00 PM', available: true },
    { time: '05:00 PM', available: true },
    { time: '07:00 PM', available: true }
  ];

  locationDetails: LocationDetails = {
    id: '1',
    name: 'Klaksat Auto Centre',
    address: 'Egypt, Cairo, Nasr City, 15 Makram Ebeid Street, 7th District',
    city: 'Cairo',
    district: 'Nasr City'
  };

  selectedDate?: string;
  selectedTime?: string;

  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    this.dateOptions = this.bookingService.getDateOptions();
    
    // Load existing data if any
    const existingData = this.bookingService.getCurrentBookingData();
    if (existingData.selectedDate) {
      this.selectedDate = existingData.selectedDate;
    }
    if (existingData.selectedTime) {
      this.selectedTime = existingData.selectedTime;
    }
  }

  selectDate(date: string): void {
    this.selectedDate = date;
    // You can load time slots for the selected date here
    // this.loadTimeSlots(date);
  }

  selectTime(time: string): void {
    this.selectedTime = time;
  }

  canContinue(): boolean {
    return !!(this.selectedDate && this.selectedTime);
  }

  continue(): void {
    if (this.canContinue()) {
      const stepData = {
        selectedDate: this.selectedDate,
        selectedTime: this.selectedTime,
        location: this.locationDetails
      };
      
      this.stepData.emit(stepData);
      this.nextStep.emit();
    }
  }
}
