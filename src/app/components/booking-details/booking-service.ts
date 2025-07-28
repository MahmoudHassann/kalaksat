import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

export interface CarDetails {
  id: string;
  name: string;
  model: string;
  year: number;
  price: number;
  pricePerMonth: number;
  mileage: number;
  transmission: string;
  image: string;
}

export interface LocationDetails {
  id: string;
  name: string;
  address: string;
  city: string;
  district: string;
}

export interface BookingData {
  carDetails?: CarDetails;
  selectedDate?: string;
  selectedTime?: string;
  location?: LocationDetails;
  customerInfo?: {
    fullName: string;
    email: string;
    phoneNumber?: string;
  };
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface DateOption {
  date: string;
  day: string;
  label: string;
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private bookingDataSubject = new BehaviorSubject<BookingData>({});
  public bookingData$ = this.bookingDataSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Get available time slots for a specific date
  getAvailableTimeSlots(date: string, locationId: string): Observable<TimeSlot[]> {
    return this.http.get<TimeSlot[]>(`${environment.baseUrl}/booking/timeslots`, {
      params: { date, locationId }
    });
  }

  // Get location details
  getLocationDetails(locationId: string): Observable<LocationDetails> {
    return this.http.get<LocationDetails>(`${environment.baseUrl}/locations/${locationId}`);
  }

  // Submit booking
  submitBooking(bookingData: BookingData): Observable<any> {
    return this.http.post(`${environment.baseUrl}/bookings`, bookingData);
  }

  // Update booking data
  updateBookingData(data: Partial<BookingData>): void {
    const currentData = this.bookingDataSubject.value;
    this.bookingDataSubject.next({ ...currentData, ...data });
  }

  // Get current booking data
  getCurrentBookingData(): BookingData {
    return this.bookingDataSubject.value;
  }

  // Clear booking data
  clearBookingData(): void {
    this.bookingDataSubject.next({});
  }

  // Generate date options (next 7 days)
  getDateOptions(): DateOption[] {
    const options: DateOption[] = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      let label = '';
      if (i === 0) label = 'Today';
      else if (i === 1) label = 'Tomorrow';
      else label = dayNames[date.getDay()];
      
      options.push({
        date: date.toISOString().split('T')[0],
        day: `${date.getDate()} ${months[date.getMonth()]}`,
        label: label
      });
    }
    
    return options;
  }
}
