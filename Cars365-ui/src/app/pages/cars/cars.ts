import { Component, OnInit } from '@angular/core';
import { CarsService } from '../../services/car.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { WishlistService } from '../../services/wishlist.service';
import { ToastService } from '../../services/toast.service';
import { generateCarSlug as buildCarSlug } from '../../utils/slug.util';

@Component({
  selector: 'app-cars',
  imports: [CommonModule,RouterLink,FormsModule],
  templateUrl: './cars.html',
  styleUrl: './cars.css',
})
export class Cars implements OnInit {
  cars: any[] = [];
  loading = true;
  isAdmin = false;

  apiBaseUrl = 'https://localhost:7193'; 

  allCars: any[] = [];   // original list
  filteredCars: any[] = [];

  filters = {
    fuelType: '',
    transmission: '',
    type: '',
    maxPrice: 3000000
  };

  selectedSort: string = '';
  searchTerm = '';
  wishlistedCarIds = new Set<number>();


  constructor(private carsService: CarsService, public authService: AuthService, private wishlistService: WishlistService, private toast: ToastService) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();

    this.carsService.getCars().subscribe({
      next: (res) => {
        this.allCars = [...res];        // original order
        this.filteredCars = [...res];  // working copy
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
    this.wishlistService.getAll().subscribe(wishlist => {
      wishlist.forEach(w => this.wishlistedCarIds.add(w.carId || w.id));
    });
  }



  deleteCar(id: number) {
    if (!confirm('Are you sure you want to delete this car?')) return;

    this.carsService.deleteCar(id).subscribe({
      next: () => {
        this.cars = this.cars.filter(c => c.id !== id);
      }
    });
    setTimeout(() => {
        this.ngOnInit(); // your existing getCars method
      }, 1500);
  }

  formatPrice(price: number): string {
    if (!price) return '';

    if (price >= 100000) {
      return (price / 100000).toFixed(2) + ' L';
    }

    return price.toString();
  }

  getImageUrl(imageUrl: string | null | undefined): string {
    if (!imageUrl) {
      return 'https://via.placeholder.com/400x250';
    }

    // Old cars (full URL)
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }

    // New cars (relative path)
    return this.apiBaseUrl + imageUrl;
  }

  onFilterChange() {
    this.filteredCars = this.applyFilters([...this.allCars]);
  }


  onSortChange(sort: string) {
    // Restore DEFAULT order
    if (!sort) {
      this.filteredCars = this.applyFilters([...this.allCars]);
      return;
    }

    if (sort === 'priceAsc') {
      this.filteredCars = [...this.filteredCars].sort(
        (a, b) => a.price - b.price
      );
    }

    if (sort === 'priceDesc') {
      this.filteredCars = [...this.filteredCars].sort(
        (a, b) => b.price - a.price
      );
    }

    if (sort === 'yearDesc') {
      this.filteredCars = [...this.filteredCars].sort(
        (a, b) => b.year - a.year
      );
    }

    if (sort === 'yearAsc') {
      this.filteredCars = [...this.filteredCars].sort(
        (a, b) => a.year - b.year
      );
    }
  }

  applyFilters(cars: any[]) {
    const search = this.searchTerm.toLowerCase().trim();

    return cars.filter(car => {

      // 🔍 Search (brand or model)
      if (search) {
        const brandMatch = car.brand?.toLowerCase().includes(search);
        const modelMatch = car.model?.toLowerCase().includes(search);

        if (!brandMatch && !modelMatch) {
          return false;
        }
      }

      if (this.filters.fuelType && car.fuelType !== this.filters.fuelType) {
        return false;
      }

      if (this.filters.transmission && car.transmission !== this.filters.transmission) {
        return false;
      }

      if (this.filters.type && car.type !== this.filters.type) {
        return false;
      }

      if (car.price > this.filters.maxPrice) {
        return false;
      }

      return true;
    });
  }

  onSearchChange() {
    this.filteredCars = this.applyFilters([...this.allCars]);
  }


  clearFilters() {
    this.filters = {
      fuelType: '',
      transmission: '',
      type: '',
      maxPrice: 3000000
    };

    // Reset displayed cars
    this.filteredCars = [...this.allCars];
    this.selectedSort = '';
    this.searchTerm = '';

  }

  toggleWishlist(carId: number) {
    if (this.isWishlisted(carId)) {
      // Remove from wishlist - update immediately
      this.wishlistedCarIds.delete(carId);
      
      this.wishlistService.remove(carId).subscribe({
        next: () => {
          this.toast.success('Removed from wishlist');
        },
        error: (error) => {
          console.error('Error removing from wishlist:', error);
          // Revert if API call fails
          this.wishlistedCarIds.add(carId);
          this.toast.error('Failed to remove from wishlist');
        }
      });
    } else {
      // Add to wishlist - update immediately
      this.wishlistedCarIds.add(carId);
      
      this.wishlistService.add(carId).subscribe({
        next: () => {
          this.toast.success('Added to wishlist');
        },
        error: (error) => {
          console.error('Error adding to wishlist:', error);
          // Revert if API call fails
          this.wishlistedCarIds.delete(carId);
          this.toast.error('Failed to add to wishlist');
        }
      });
    }
  }


  isWishlisted(carId: number): boolean {
    return this.wishlistedCarIds.has(carId);
  }

  generateCarSlug(car: any): string {
    return buildCarSlug(car);
  }


}