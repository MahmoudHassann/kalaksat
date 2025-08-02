import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
  standalone:true,
  imports: [CommonModule],
  templateUrl: './about.html',
  styleUrl: './about.scss'
})
export class About {

  features = [
    {
      icon: 'money-back',
      iconColor: '#e74c3c',
      title: '7 Day Money Back',
      subtitle: 'Make sure you made the right decision',
      description: 'You can return your purchased vehicle and receive a 100% refund on day five of our part of our 7-day money-back guarantee. All vehicles have to service 3 to 4 total times for our standards before purchasing them from dealers more than 100 kilometers.'
    },
    {
      icon: 'quality',
      iconColor: '#8e44ad',
      title: 'Quality You Can Trust',
      subtitle: 'We ensure your safety through warranty guidelines',
      description: 'All our Klaksat Certified cars go through a thorough and detailed quality inspection. We carefully handpick each car to ensure you receive a high quality used vehicle delivered to your location.'
    },
    {
      icon: 'warranty',
      iconColor: '#e74c3c',
      title: 'Full Coverage Warranty for 90 Days',
      subtitle: 'Peace of Mind, Guaranteed',
      description: 'All our Klaksat Certified cars come with a comprehensive and warranty of 90 days or 1500 kilometers (whichever comes first). If there is an unforeseen electrical & mechanical parts or any mishap your car experiences, we aim to repair or replace your vehicle for you. Klaksat Certified cars qualify. Our warranty does not cover consumables like fluid, batteries, tires and air conditioning. This warranty covers any malfunction due to corrosion, wear, tear, manufacturer defect or malfunctioned fuel or miscellaneous items. Please refer to our terms and conditions for more details.'
    }
  ];

  processSteps = [
    {
      step: 1,
      title: 'Find your Perfect klaksat Certified car',
      description: 'Browse our extensive collection of certified vehicles. Each car has undergone rigorous quality and value that match your budget & preferred timing, we are just the right car for you.',
      illustration: 'search-car'
    },
    {
      step: 2,
      title: 'See everything inside out',
      description: 'Use our detailed vehicle inspection in out Categories: Specs, pricing, financing options, and all in-depth inspection report. Explore every detail with our 360-degree interior and exterior photos.',
      illustration: 'inspect-car'
    },
    {
      step: 3,
      title: 'Test drive time! Where shall we meet?',
      description: 'Book your test drive at your preferred location. We will meet you personally with full transparency and answer all your questions, wherever and whenever it suits you.',
      illustration: 'test-drive'
    },
    {
      step: 4,
      title: 'Financing is always an option',
      description: 'Get your car with flexible payment plans that work for your specific needs - you will get approved in just a few hours from competitive interest rates starting as low as 2.99% APR.',
      illustration: 'financing'
    }
  ];

  constructor() { }
}
