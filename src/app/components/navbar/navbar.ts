import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, effect, HostListener, Inject, OnInit, PLATFORM_ID, Signal, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth-service';

@Component({
  selector: 'app-navbar',
  standalone:true,
  imports: [CommonModule,RouterModule,FormsModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar implements OnInit{
 searchQuery = signal('');
  isNavbarOpen = signal(false);
  isMobileSearchOpen = signal(false);
private _dropdownOpen = signal<boolean>(false);

// Local dropdown state
public readonly dropdownOpen = this._dropdownOpen.asReadonly();

// Computed signals from auth service
public isLoggedIn!: Signal<boolean>;
public currentUser!: Signal<any>;
public userInitial!: Signal<string>;
public userName!: Signal<string>;
public userPhone!: Signal<string>;

  // Cached values for template binding
  public userInitialValue = '';
  public userNameValue = '';
  public userPhoneValue = '';
  public isLoggedInValue = false;
constructor(
    private _router: Router,
    private _httpClient: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    private authService: AuthService
  ) {
    // Assign signals from authService
    this.isLoggedIn = this.authService.isLoggedIn;
    this.currentUser = this.authService.currentUser;
    this.userInitial = this.authService.userInitial;
    this.userName = this.authService.userName;
    this.userPhone = this.authService.userPhone;
  }

  ngOnInit(): void {
    effect(() => {
      this.userInitialValue = this.userInitial();
      this.userNameValue = this.userName();
      this.userPhoneValue = this.userPhone();
      this.isLoggedInValue = this.isLoggedIn();
    });
  }
  

  toggleDropdown(): void {
    this._dropdownOpen.update(state => !state);
  }

  closeDropdown(): void {
    this._dropdownOpen.set(false);
  }

  navigateToSignIn(): void {
    this.closeDropdown();
    this._router.navigate(['/sign-in']);
  }

  logout(): void {
    this.closeDropdown();
    this.authService.logout();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const userMenuElement = target.closest('.user-menu');
    
    if (!userMenuElement && this.dropdownOpen()) {
      this.closeDropdown();
    }
  }

  toggleNavbar() {
    this.isNavbarOpen.set(!this.isNavbarOpen());
  }

  toggleMobileSearch() {
    this.isMobileSearchOpen.set(!this.isMobileSearchOpen());
    if (this.isMobileSearchOpen()) {
      // Focus the input after the view updates
      setTimeout(() => {
        const input = document.querySelector('.mobile-search-input') as HTMLInputElement;
        if (input) input.focus();
      }, 100);
    }
  }

  closeMobileSearch() {
    setTimeout(() => {
      this.isMobileSearchOpen.set(false);
    }, 150);
  }

  closeModal() {
    this.isNavbarOpen.set(false); // Close mobile menu
  }

  performSearch() {
    if (this.searchQuery()) {
      console.log(`Searching for: ${this.searchQuery()}`);
      const url = 'cars/pagination'
      this._httpClient.post(`${environment.baseUrl}${url}`,{search:this.searchQuery()}).subscribe({
        next:(res)=>{
          console.log(res);
          
        }
      })
    }
    this.isMobileSearchOpen.set(false);
  }

  toggleLanguage() {
    console.log('Language toggle clicked');
    // Add your language toggle logic here
  }

}
