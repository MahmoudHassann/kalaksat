import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-financing-modal',
  standalone:true,
  imports: [CommonModule],
  templateUrl: './financing-modal.html',
  styleUrl: './financing-modal.scss'
})
export class FinancingModal {
 @Input() isOpen: boolean = false;
  @Output() modalClosed = new EventEmitter<void>();
  
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      // Prevent body scroll when modal is open
      if (this.isOpen) {
        document.body.style.overflow = 'hidden';
      }
    }
  }

  ngOnDestroy() {
    if (this.isBrowser) {
      // Restore body scroll
      document.body.style.overflow = 'auto';
    }
  }

  closeModal() {
    this.isOpen = false;
    this.modalClosed.emit();
    
    if (this.isBrowser) {
      document.body.style.overflow = 'auto';
    }
  }

  downloadApp() {
    // Add your app download logic here
    console.log('Download app clicked');
    // You can redirect to app stores or handle download logic
  }
}
