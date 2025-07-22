import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-loan-calculator',
  standalone:true,
  imports: [CommonModule, FormsModule],
  templateUrl: './loan-calculator.html',
  styleUrl: './loan-calculator.scss'
})
export class LoanCalculator {
 // Form signals
  carPrice = signal<number>(0);
  downPayment = signal<number>(0);
  loanTerm = signal<number | string>('');

  // Computed monthly payment
 monthlyPayment = computed(() => {
    const price = this.carPrice();
    const down = this.downPayment();
    const term = Number(this.loanTerm());

    if (!price || !term || price <= 0 || term <= 0) {
      return 0;
    }

    const principal = price - down;
    if (principal <= 0) return 0;

    const numPayments = term * 12;
    const monthlyPayment = principal / numPayments;

    return monthlyPayment;
  });

  calculateLoan(): void {
    // Trigger recalculation (signals will automatically update)
    console.log('Loan calculated:', {
      carPrice: this.carPrice(),
      downPayment: this.downPayment(),
      loanTerm: this.loanTerm(),
      monthlyPayment: this.monthlyPayment()
    });
  }

  resetForm(): void {
    this.carPrice.set(0);
    this.downPayment.set(0);
    this.loanTerm.set('');
  }

  applyNow(): void {
    console.log('Apply now clicked with payment:', this.monthlyPayment());
    // Implement application logic here
    alert(`Monthly Payment: $${this.monthlyPayment().toFixed(2)}\nRedirecting to application...`);
  }
}
