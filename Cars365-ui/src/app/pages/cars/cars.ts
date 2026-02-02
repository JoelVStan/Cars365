import { Component, OnInit } from '@angular/core';
import { CarsService } from '../../services/car.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { WishlistService } from '../../services/wishlist.service';
import { ToastService } from '../../services/toast.service';
import { generateCarSlug as buildCarSlug } from '../../utils/slug.util';
import { ActivatedRoute, Router } from '@angular/router';

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
  brands: string[] = [];
  selectedBrand: string = '';

  pageSize = 9;        // cars per load
  visibleCount = 9;   // currently visible cars

  constructor(private carsService: CarsService, public authService: AuthService, private wishlistService: WishlistService, private toast: ToastService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();

    this.carsService.getCars().subscribe({
      next: (res) => {
        this.allCars = [...res];        // original order
        this.filteredCars = [...res];  // working copy
        this.brands = Array.from(
        new Set(res.map((c: any) => c.brand).filter(Boolean))
        ).sort();
        this.loading = false;

        // Check for brand filter in query params
        this.route.queryParams.subscribe(params => {

          if (params['type']) {
            this.filters.type = params['type'];
          }

          if (params['transmission']) {
            this.filters.transmission = params['transmission'];
          }

          if (params['fuelType']) {
            this.filters.fuelType = params['fuelType'];
          }

          if (params['maxPrice']) {
            this.filters.maxPrice = +params['maxPrice'];
          }

          if (params['brand']) {
            this.selectedBrand = params['brand'];
          }

          if (params['search']) {
            this.searchTerm = params['search'];
          }

          this.filteredCars = this.applyFilters([...this.allCars]);
        });

      },
      error: () => {
        this.loading = false;
      } 
    });
    this.wishlistService.getAll().subscribe(wishlist => {
      wishlist.forEach(w => this.wishlistedCarIds.add(w.carId || w.id));
    });
  }

  get visibleCars() {
    return this.filteredCars.slice(0, this.visibleCount);
  }


  updateQueryParams() {
    const queryParams: any = {};

    if (this.filters.type) {
      queryParams.type = this.filters.type;
    }

    if (this.filters.transmission) {
      queryParams.transmission = this.filters.transmission;
    }

    if (this.filters.fuelType) {
      queryParams.fuelType = this.filters.fuelType;
    }

    if (this.filters.maxPrice && this.filters.maxPrice < 3000000) {
      queryParams.maxPrice = this.filters.maxPrice;
    }

    if (this.selectedBrand) {
      queryParams.brand = this.selectedBrand;
    }

    if (this.searchTerm) {
      queryParams.search = this.searchTerm;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: '' // replace params
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
    this.visibleCount = this.pageSize;
    this.updateQueryParams();
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
    this.visibleCount = this.pageSize;
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

      if (this.selectedBrand && car.brand !== this.selectedBrand) {
        return false;
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
    this.visibleCount = this.pageSize;
    this.updateQueryParams();
  }

  loadMore() {
    this.visibleCount += this.pageSize;
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
    this.selectedBrand = '';
    this.visibleCount = this.pageSize;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {}
    });

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