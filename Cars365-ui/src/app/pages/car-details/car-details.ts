import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CarsService } from '../../services/car.service';

@Component({
  selector: 'app-car-details',
  imports: [CommonModule, RouterLink],
  templateUrl: './car-details.html',
  styleUrl: './car-details.css',
})
export class CarDetails {

  car: any;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private carsService: CarsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.router.navigate(['/cars']);
      return;
    }

    this.carsService.getCarById(+id).subscribe({
      next: (res) => {
        this.car = {
          ...res,
          imageUrl: `https://localhost:7193${res.imageUrl}?t=${Date.now()}`
        };
        this.loading = false;
      },
      error: () => {
        this.router.navigate(['/cars']);
      }
    });
  }

  formatPriceToLakhs(price: number): string {
    return (price / 100000).toFixed(2) + ' Lacs';
  }

  calculateEmi(price: number): number {
    const annualRate = 8.5; // %
    const tenureMonths = 60;
    const newPrice = price - (price * 0.2); // Assuming 20% down payment

    const monthlyRate = annualRate / 12 / 100;
    const emi =
      (newPrice * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
      (Math.pow(1 + monthlyRate, tenureMonths) - 1);

    return Math.round(emi);
  }

}
