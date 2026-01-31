import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CarsService } from '../../../services/car.service';
import { BrandService } from '../../../services/brand.service';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule,FormsModule,RouterLink],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard {

  stats: any;
  loading = true;

  brands: any[] = [];
  selectedBrandId: number | string = '';

  newBrandName = '';
  newModelName = '';

  constructor(private carsService: CarsService,
    private brandService: BrandService
  ) {}

  cars: any[] = [];

  ngOnInit(): void {
    this.loadStats();
    this.loadCars();
    this.loadBrands();
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

  loadBrands() {
    this.brandService.getBrands().subscribe(res => {
      this.brands = res;
    });
  }

  addBrand() {
    if (!this.newBrandName.trim()) return;

    this.brandService.addBrand(this.newBrandName).subscribe(() => {
      this.newBrandName = '';
      this.loadBrands();
      alert('Brand added');
    });
  }

  addModel() {
    if (!this.selectedBrandId || !this.newModelName.trim()) return;

    this.brandService
      .addModel(Number(this.selectedBrandId), this.newModelName)
      .subscribe(() => {
        this.newModelName = '';
        this.selectedBrandId = '';
        alert('Model added');
      });
  }




}
