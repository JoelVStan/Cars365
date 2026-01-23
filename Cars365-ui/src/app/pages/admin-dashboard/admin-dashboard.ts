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

  ngOnInit(): void {
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
}
