import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  standalone:true,
  imports: [CommonModule,RouterModule,FormsModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar {
 searchQuery = signal('');
  isNavbarOpen = signal(false);
  isMobileSearchOpen = signal(false);

  constructor(private _router:Router){}

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
      // Add your search logic here
    }
    this.isMobileSearchOpen.set(false);
  }

  toggleLanguage() {
    console.log('Language toggle clicked');
    // Add your language toggle logic here
  }

  signIn() {
    console.log('Sign in clicked');
    // Add your sign in logic here
  }
}
