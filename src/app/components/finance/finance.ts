import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SliderModule } from 'primeng/slider';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { AccordionModule } from 'primeng/accordion';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
  selector: 'app-finance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SliderModule,
    ButtonModule,
    CardModule,
    AccordionModule,
    InputNumberModule
  ],
  templateUrl: './finance.html',
  styleUrls: ['./finance.scss']
})
export class Finance implements OnInit {
isActive: 'carPrice' | 'monthlyInstallment' = 'carPrice';
minMonthlyInstallment: number = 3000;
maxMonthlyInstallment: number = 248000;
monthlyInstallmentInput: number = 5000; // entered by user
estimatedCarPrice: number = 0;


downPaymentFixed: number = 0; // For monthlyInstallment mode
minDownPaymentFixed: number = 0;
maxDownPaymentFixed: number = 2500000;
  // Car price slider
  carPrice: number = 200000;
  minCarPrice: number = 200000;
  maxCarPrice: number = 3000000;
  
  // Down payment as percentage
  downPaymentPercentage: number = 40; // 40%
  minDownPaymentPercentage: number = 0;
  maxDownPaymentPercentage: number = 95;
  
  
  // Loan tenor slider
  loanTenor: number = 48;
  minLoanTenor: number = 12;
  maxLoanTenor: number = 84;
  
  // Calculated values
  downPaymentAmount: number = 0;
  loanAmount: number = 0;
  calculatedMonthlyInstallment: number = 0;
  
  // FAQ items
  faqItems = [
    {
      question: 'How can I apply for financing?',
      answer: 'You can apply for financing through our online portal or visit one of our partner dealerships.'
    },
    {
      question: 'How much of this car\'s price can I finance?',
      answer: 'You can finance up to 80% of the car\'s value, depending on your credit profile and income.'
    },
    {
      question: 'What if I take a loan and return my car back in the 7-day guarantee period?',
      answer: 'If you return the car within 7 days, the loan will be cancelled and any payments made will be refunded.'
    },
    {
      question: 'What documents are required to avail car financing?',
      answer: 'Required documents include Emirates ID, salary certificate, bank statements, and passport copy.'
    },
    {
      question: 'Can I arrange for financing by myself for a car purchased at Katbat?',
      answer: 'Yes, you can arrange your own financing, but we also offer competitive rates through our partners.'
    }
  ];

  ngOnInit(): void {
    this.calculateValues();
  }

  onCarPriceChange(): void {
    this.calculateValues();
  }
  onMonthlyInstallmentChange(): void {
  const numberOfMonths = 60; // 5 years
  const interestRate = 0.10; // 10% total simple interest

  // Reverse formula
  const estimatedPrice = (this.monthlyInstallmentInput * numberOfMonths) / (1 + interestRate);
  this.estimatedCarPrice = Math.round(estimatedPrice);
}


  onDownPaymentPercentageChange(): void {
    this.calculateValues();
  }


  onLoanTenorChange(): void {
    this.calculateValues();
  }

  calculateValues(): void {
  if (this.isActive === 'carPrice') {
    this.downPaymentAmount = (this.carPrice * this.downPaymentPercentage) / 100;
  } else {
    this.downPaymentAmount = this.downPaymentFixed;
  }

  this.loanAmount = this.carPrice - this.downPaymentAmount;

  if (this.loanAmount <= 0) {
    this.calculatedMonthlyInstallment = 0;
    return;
  }

 const years = this.loanTenor / 12;
  const interestPercent = years * 15;
  const interestAmount = (this.loanAmount * interestPercent) / 100;
  const totalToPay = interestAmount + this.loanAmount;

  this.monthlyInstallmentInput = Math.round(totalToPay / this.loanTenor);
}
onDownPaymentFixedChange(): void {
  this.calculateValues();
}
 toggle(type: 'carPrice' | 'monthlyInstallment') {
  this.isActive = type;
}

 formatCurrency(value: number | undefined | null): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }

  return value.toLocaleString('en-EG', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0
  });
}

  formatPercentage(value: number): string {
    return `${value}%`;
  }

  applyForFinancing(): void {
    console.log('Applying for financing with:', {
      carPrice: this.carPrice,
      downPaymentPercentage: this.downPaymentPercentage,
      downPaymentAmount: this.downPaymentAmount,
      loanAmount: this.loanAmount,
      loanTenor: this.loanTenor,
      monthlyInstallment: this.monthlyInstallmentInput
    });
  }
}