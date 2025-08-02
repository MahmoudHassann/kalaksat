import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-personal-info',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './personal-info.html',
  styleUrl: './personal-info.scss',
})
export class PersonalInfo implements OnInit {
  personalInfoForm!: FormGroup;
  isSubmitted = false;
  isLoading = false;
  success = false;
  constructor(private fb: FormBuilder, private http: HttpClient,private messageService: MessageService) {}
  ngOnInit(): void {
    this.personalInfoForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
    });
  }

  onSubmit() {
    if (this.personalInfoForm.invalid) return;

    this.isSubmitted = true;
    this.isLoading = true;

    const formData = this.personalInfoForm.value;

    this.http.post(`${environment.baseUrl}auth/updateProfile`, formData).subscribe({
      next: () => {
        this.isLoading = false;
         this.messageService.add({
        severity: 'success',
        summary: 'Success',
       detail: 'Profile updated successfully'
      });
      },
      error: (err) => {
        console.error('Update failed', err);
        this.isLoading = false;
         this.messageService.add({
        severity: 'error',
        summary: 'Error',
       detail: err?.error?.message || 'Failed to update profile'
      });
      },
    });
  }
}
