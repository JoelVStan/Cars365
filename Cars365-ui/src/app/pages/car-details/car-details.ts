import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CarsService } from '../../services/car.service';
import { RecentlyViewedService } from '../../services/recently-viewed.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-car-details',
  imports: [CommonModule, RouterLink],
  templateUrl: './car-details.html',
  styleUrl: './car-details.css',
})
export class CarDetails {

  car: any;
  loading = true;
  selectedImage: string | null = null;
  galleryImages: any[] = [];
  currentIndex = 0;

  constructor(
    private route: ActivatedRoute,
    private carsService: CarsService,
    private router: Router,
    private recentlyViewedService: RecentlyViewedService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const idSlug = this.route.snapshot.paramMap.get('idSlug');

    if (!idSlug) {
      this.router.navigate(['/cars']);
      return;
    }

    const id = Number(idSlug.split('-')[0]);

    if (isNaN(id)) {
      this.router.navigate(['/cars']);
      return;
    }

    this.carsService.getCarById(id).subscribe({
      next: (res) => {
        const baseUrl = 'https://localhost:7193';

        // ✅ Build gallery safely
        if (res.images && res.images.length > 0) {
          this.galleryImages = res.images
            .slice() // clone
            .sort((a: any, b: any) => {
              if (a.isPrimary && !b.isPrimary) return -1;
              if (!a.isPrimary && b.isPrimary) return 1;
              return a.sortOrder - b.sortOrder;
            })
            .map((img: any) => ({
              ...img,
              fullUrl: `${baseUrl}${img.imageUrl}?t=${Date.now()}`
            }));

          // ✅ ALWAYS select by index
          this.currentIndex = 0;
          this.selectedImage = this.galleryImages[0].fullUrl;
        }
        else {
          // ✅ Fallback to thumbnail image
          this.galleryImages = [];
          this.currentIndex = 0;
          this.selectedImage = `${baseUrl}${res.imageUrl}?t=${Date.now()}`;
        }

        this.car = res;
        this.loading = false;
        if (this.authService.isLoggedIn()) {
          this.recentlyViewedService.addCar(this.car);
        }
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

  getOwnershipSuffix(value: number): string {
    if (value === 1) return 'st';
    if (value === 2) return 'nd';
    if (value === 3) return 'rd';
    return 'th';
  }

  insuranceDisplay(insuranceTill: any): string {
    if (!insuranceTill) return 'Expired';

    const d = new Date(insuranceTill);
    if (isNaN(d.getTime())) return 'Expired';

    const now = new Date();
    if (d < now) return 'Expired';

    return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(d);
  }

  selectImage(index: number) {
    if (!this.galleryImages.length) return;

    this.currentIndex = index;
    this.selectedImage = this.galleryImages[index].fullUrl;
  }

  prevImage() {
    if (this.currentIndex > 0) {
      this.selectImage(this.currentIndex - 1);
    }
  }

  nextImage() {
    if (this.currentIndex < this.galleryImages.length - 1) {
      this.selectImage(this.currentIndex + 1);
    }
  }


}
