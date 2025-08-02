import { HttpClient } from '@angular/common/http';
import { computed, Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private _http:HttpClient,private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object){
      this.initializeAuthState();
    
    // Listen for storage changes (for multi-tab support)
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('storage', (e) => {
        if (e.key === 'accessToken' || e.key === 'currentUser') {
          this.checkAuthState();
        }
      });
    }
  }
  private _isLoggedIn = signal<boolean>(false);
  private _currentUser = signal<any>(null);
  private _accessToken = signal<string | null>(null);

  // Public computed signals
  public readonly isLoggedIn = this._isLoggedIn.asReadonly();
  public readonly currentUser = this._currentUser.asReadonly();
  public readonly accessToken = this._accessToken.asReadonly();

  // Computed user initial
  public readonly userInitial = computed(() => {
    const user = this._currentUser();
    if (!user) return '';
    
    const name = user.data?.name || user.name;
    return name?.charAt(0).toUpperCase() || 'U';
  });

  // Computed user name
  public readonly userName = computed(() => {
    const user = this._currentUser();
    if (!user) return '';
    return user.data?.name || user.name || 'User';
  });

  // Computed user phone
  public readonly userPhone = computed(() => {
    const user = this._currentUser();
    if (!user) return '';
    return user.data?.phone || user.phone || '';
  });

  private initializeAuthState(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.checkAuthState();
    }
  }

  private checkAuthState(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const token = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('currentUser');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this._isLoggedIn.set(true);
        this._currentUser.set(user);
        this._accessToken.set(token);
      } catch (error) {
        console.error('Error parsing user data:', error);
        this.clearAuthState();
      }
    } else {
      this.clearAuthState();
    }
  }

  private clearAuthState(): void {
    this._isLoggedIn.set(false);
    this._currentUser.set(null);
    this._accessToken.set(null);
  }

  // Public methods for authentication actions
  public login(user: any, token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('accessToken', token);
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
    
    this._isLoggedIn.set(true);
    this._currentUser.set(user);
    this._accessToken.set(token);
  }

  public logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('currentUser');
    }
    
    this.clearAuthState();
    this.router.navigate(['/']);
  }

  public updateUser(user: any): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
    this._currentUser.set(user);
  }

  // Method to refresh auth state (useful for manual checks)
  public refreshAuthState(): void {
    this.checkAuthState();
  }

  // Method to check if token exists (useful for guards)
  public hasValidToken(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    
    const token = localStorage.getItem('accessToken');
    return !!token;
  }
  register(email:any):Observable<any>{
    const url = 'auth/register'
    return this._http.post(`${environment.baseUrl}${url}`,email);
  }
  verfiyOTP(data:any){
    const url = 'auth/verifyOtp'
    return this._http.post(`${environment.baseUrl}${url}`,data);
  }
  resendOTP(data:any){
    const url = 'auth/resendOtp'
    return this._http.post(`${environment.baseUrl}${url}`,data);
  }
}
