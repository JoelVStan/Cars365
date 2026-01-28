import { Injectable } from "@angular/core";
import { AuthService } from "./auth.service";

@Injectable({
  providedIn: 'root'
})
export class RecentlyViewedService {

  private MAX_ITEMS = 4;

  constructor(private authService: AuthService) {}

  private getStorageKey(): string | null {
    const email = this.authService.getUserEmail();
    return email ? `recentCars_${email}` : null;
  }

  getCars(): any[] {
    const key = this.getStorageKey();
    if (!key) return [];

    return JSON.parse(localStorage.getItem(key) || '[]');
  }

  addCar(car: any) {
    const key = this.getStorageKey();
    if (!key) return;

    let cars = this.getCars();

    // Remove duplicate
    cars = cars.filter(c => c.id !== car.id);

    // Add to front
    cars.unshift({
      id: car.id,
      brand: car.brand,
      model: car.model,
      year: car.year,
      price: car.price,
      imageUrl: car.imageUrl,
      fuelType: car.fuelType,
      transmission: car.transmission
    });

    // Limit
    cars = cars.slice(0, this.MAX_ITEMS);

    localStorage.setItem(key, JSON.stringify(cars));
  }

  clear() {
    const key = this.getStorageKey();
    if (key) localStorage.removeItem(key);
  }
}