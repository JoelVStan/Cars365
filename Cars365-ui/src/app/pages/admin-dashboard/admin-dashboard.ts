import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CarsService } from '../../services/car.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard {

  stats: any;
  loading = true;

  constructor(private carsService: CarsService) {}

  cars: any[] = [];

  ngOnInit(): void {
    this.loadStats();
    this.loadCars();
  }

  loadStats() {
    this.loading = true;

    this.carsService.getDashboardStats().subscribe({
      next: (res) => {
        this.stats = res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  loadCars() {
    this.carsService.getAllCarsForAdmin().subscribe({
      next: (res) => {
        this.cars = res;
      },
      error: () => {}
    });
  }



  toggleActive(car: any) {
    this.carsService.toggleCarActive(car.id).subscribe(() => {
      car.isActive = !car.isActive;
      this.loadStats(); // refresh counts
    });
  }



}
