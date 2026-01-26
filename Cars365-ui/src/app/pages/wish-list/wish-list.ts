import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WishlistService } from '../../services/wishlist.service';
import { CarsService } from '../../services/car.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-wish-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './wish-list.html',
  styleUrl: './wish-list.css',
})
export class WishList implements OnInit {
  wishlistCars: any[] = [];
  loading = true;
  isAdmin = false;
  wishlisted: Set<number> = new Set();

  apiBaseUrl = 'https://localhost:7193';

  constructor(
    private wishlistService: WishlistService,
    private carsService: CarsService,
    private authService: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.loadWishlistCars();
  }

  loadWishlistCars(): void {
    this.wishlistService.getAll().subscribe({
      next: (wishlisted) => {
        console.log('Wishlist response:', wishlisted);
        
        // Handle different response structures
        let carIds: number[] = [];
        
        if (Array.isArray(wishlisted)) {
          // If it's an array of objects with carId or id property
          carIds = wishlisted.map((item: any) => item.carId || item.id);
        }
        
        this.wishlisted = new Set(carIds);

        // Fetch all cars and filter by wishlist IDs
        this.carsService.getCars().subscribe({
          next: (allCars) => {
            console.log('All cars:', allCars);
            console.log('Wishlisted IDs:', carIds);
            
            this.wishlistCars = allCars.filter(car => 
              this.wishlisted.has(car.id)
            );
            
            console.log('Filtered wishlist cars:', this.wishlistCars);
            this.loading = false;
          },
          error: (error) => {
            console.error('Error loading cars:', error);
            this.loading = false;
          }
        });
      },
      error: (error) => {
        console.error('Error loading wishlist:', error);
        this.loading = false;
      }
    });
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

    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }

    return this.apiBaseUrl + imageUrl;
  }

  toggleWishlist(carId: number): void {
    if (this.wishlisted.has(carId)) {
      this.wishlistService.remove(carId).subscribe({
        next: () => {
          this.wishlisted.delete(carId);
          this.wishlistCars = this.wishlistCars.filter(car => car.id !== carId);
          this.toast.success('Removed from wishlist');
        },
        error: () => {
          this.toast.error('Failed to remove from wishlist');
        }
      });
    } else {
      this.wishlistService.add(carId).subscribe({
        next: () => {
          this.wishlisted.add(carId);
          this.toast.success('Added to wishlist');
        },
        error: () => {
          this.toast.error('Failed to add to wishlist');
        }
      });
    }
  }

  isWishlisted(carId: number): boolean {
    return this.wishlisted.has(carId);
  }

  deleteCar(id: number): void {
    if (!confirm('Are you sure you want to delete this car?')) return;

    this.carsService.deleteCar(id).subscribe({
      next: () => {
        this.wishlistCars = this.wishlistCars.filter(c => c.id !== id);
        this.toast.success('Car deleted successfully');
      },
      error: () => {
        this.toast.error('Failed to delete car');
      }
    });
  }
}
