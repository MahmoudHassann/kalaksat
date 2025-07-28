import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { BookingService, CarDetails } from '../booking-service';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-step2',
  standalone:true,
  imports: [CommonModule,FormsModule],
  templateUrl: './step2.html',
  styleUrl: './step2.scss'
})
export class Step2 implements OnInit {
 @Input() carDetails?: CarDetails;
  @Output() nextStep = new EventEmitter<void>();
  @Output() prevStep = new EventEmitter<void>();
  @Output() stepData = new EventEmitter<any>();

  customerInfo:any = {
    fullName: '',
    email: '',
    phoneNumber: ''
  };

  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    // Load existing data if any
    const existingData = this.bookingService.getCurrentBookingData();
    if (existingData.customerInfo) {
      this.customerInfo = { ...existingData.customerInfo };
    }
  }

  goBack(): void {
    this.prevStep.emit();
  }

  continue(): void {
    const stepData = {
      customerInfo: this.customerInfo
    };
    
    this.stepData.emit(stepData);
    this.nextStep.emit();
  }
}
