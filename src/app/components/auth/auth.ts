import { Component, effect, Inject, PLATFORM_ID , signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { InputOtpModule } from 'primeng/inputotp';
import { ProgressBarModule } from 'primeng/progressbar';
import { AuthService } from './auth-service';
import { MessageService } from 'primeng/api';
import { UserService } from '../user/user-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, ButtonModule, InputOtpModule, ProgressBarModule],
  templateUrl: './auth.html',
  styleUrl: './auth.scss'
})
export class Auth {
  step = signal(1);
  email = signal('');
  otpCode = signal('');
  userName = signal('');
  token:string = '';
  progress = signal(33); // Step-based progress
  otpError = signal(false);

  constructor(@Inject(PLATFORM_ID) private platformId: Object,private authService:AuthService,private messageService: MessageService,private userService:UserService,private _router:Router) {
    effect(() => {
      this.progress.set(this.step() * 33);
    });
  }

  nextStep() {
    if (this.step() === 1) {
  this.authService.register({ email: this.email() }).subscribe({
    next: (res) => {
    if(res.user){
      this.messageService.add({
        severity: 'success',
        summary: 'Registration Success',
        detail: res?.message,
      });
      this.step.set(this.step() + 1);
    }
    },
    error: (err) => {
      this.messageService.add({
        severity: 'error',
        summary: 'Registration Failed',
        detail: err?.error?.message || 'Something went wrong!',
      });
    }
  });
}

    if (this.step() === 2) {
    if (this.otpCode() && this.email()) {
      const data = { otp: this.otpCode(), email: this.email() };

      this.authService.verfiyOTP(data).subscribe({
        next: (res: any) => {
          console.log(res);

          if (res.token) {
            this.messageService.add({
              severity: 'success',
              summary: 'OTP',
              detail: res?.message,
            });

            // ✅ Store accessToken & refreshToken safely on browser only
            if (isPlatformBrowser(this.platformId)) {
              localStorage.setItem('accessToken', res.token);

              // If you get refreshToken in response
              if (res.refreshToken) {
                localStorage.setItem('refreshToken', res.refreshToken);
              }

              // Optional: Store username or user info if needed
              if (res.user) {
                localStorage.setItem('user', JSON.stringify(res.user));
              }
            }

            this.otpError.set(false);
            this.step.set(this.step() + 1);
          }
        },
        error: (err) => {
          this.otpError.set(true);
          this.messageService.add({
            severity: 'error',
            summary: 'OTP',
            detail: err?.error?.error || 'Something went wrong!',
          });
        },
      });
    }
  }
    if (this.step() === 3) {
      console.log(this.userName());
      
      if(this.userName()){
        this.userService.updsteUser({name:this.userName}).subscribe({
        next: (res: any) => {
          if (res.message) {
            this.messageService.add({
              severity: 'success',
              summary: 'OTP',
              detail: res?.message,
            });
            this._router.navigate(['home']);
          }
        },
        error: (err) => {
          this.otpError.set(true);
          this.messageService.add({
            severity: 'error',
            summary: 'OTP',
            detail: err?.error?.message || 'Something went wrong!',
          });
        },
      });
      }
    }
  }
  onOtpChange(value: string) {
  this.otpCode.set(value);
  if (this.otpError()) {
    this.otpError.set(false);
  }
}


  resendOtp() {
    this.email.set('sw.soliemansnossy@gmail.com')
    this.authService.resendOTP({email:this.email()}).subscribe({
    next: (res:any) => {
    if(res.message){
      this.messageService.add({
        severity: 'success',
        summary: 'OTP Re-sent Successfully',
        detail: res?.message,
      });
      this.step.set(this.step() + 1);
    }
    },
    error: (err) => {
      this.messageService.add({
        severity: 'error',
        summary: 'ERROR OTP',
        detail: err?.error?.message || 'Something went wrong!',
      });
    }
    });
  }
}
