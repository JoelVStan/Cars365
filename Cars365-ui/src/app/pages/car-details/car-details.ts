import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CarsService } from '../../services/car.service';
import { RecentlyViewedService } from '../../services/recently-viewed.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { FormsModule } from '@angular/forms';
import { TestDriveService } from '../../services/test-drive.service';

@Component({
  selector: 'app-car-details',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './car-details.html',
  styleUrl: './car-details.css',
})
export class CarDetails {

  car: any;
  loading = true;
  selectedImage: string | null = null;
  galleryImages: any[] = [];
  currentIndex = 0;

  testDrive = {
    preferredDate: '',
    timeSlot: ''
  };

  existingRequest: any = null;
  loadingTestDrive = true;

  constructor(
    private route: ActivatedRoute,
    private carsService: CarsService,
    public router: Router,
    private recentlyViewedService: RecentlyViewedService,
    public authService: AuthService,
    private toast: ToastService,
    private testDriveService: TestDriveService
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
        this.loadTestDriveStatus();
      },
      error: () => {
        this.router.navigate(['/cars']);
      }
    });
  }

  loadTestDriveStatus() {
    if (!this.authService.isLoggedIn()) return;

    this.testDriveService.getMyRequests().subscribe((res: any) => {
      this.existingRequest =
        res.find((r: { car: { id: any; }; }) => r.car?.id === this.car.id) || null;
      this.loadingTestDrive = false;
    });
  }

  requestTestDrive() {
    if (!this.testDrive.preferredDate || !this.testDrive.timeSlot) {
      this.toast.error('Please select date and time');
      return;
    }

    this.testDriveService
      .request(this.car.id, this.testDrive)
      .subscribe(() => {
        this.toast.success('Test drive requested');
        this.loadTestDriveStatus(); // ✅ reload from backend
      });

  }

  confirmTestDrive() {
  if (!this.testDrive.preferredDate || !this.testDrive.timeSlot) {
    this.toast.error('Please select date and time');
    return;
  }

  this.testDriveService
    .request(this.car.id, this.testDrive)
    .subscribe(() => {
      this.toast.success('Test drive requested');

      this.existingRequest = {
        status: 'Pending'
      };

      // reset form
      this.testDrive = {
        preferredDate: '',
        timeSlot: ''
      };

      // close modal (Bootstrap way)
      const modalEl = document.getElementById('testDriveModal');
      const modal = (window as any).bootstrap.Modal.getInstance(modalEl);
      modal?.hide();
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

  getShareUrl(): string {
    return window.location.href;
  }

  getShareMessage(): string {
    return `Check out this ${this.car.year} ${this.car.brand} ${this.car.model} on Cars365 🚗`;
  }

  copyLink() {
    navigator.clipboard.writeText(this.getShareUrl());
    this.toast.success('Link copied to clipboard');
  }


  shareWhatsApp() {
    const text = encodeURIComponent(
      `${this.getShareMessage()} ${this.getShareUrl()}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }


  shareTelegram() {
    const text = encodeURIComponent(this.getShareMessage());
    const url = encodeURIComponent(this.getShareUrl());
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
  }


  shareGmail() {
    const subject = encodeURIComponent(this.getShareMessage());
    const body = encodeURIComponent(this.getShareUrl());

    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`,
      '_blank'
    );
  }

  emi = {
    downPayment: 0,
    interestRate: 8.5,
    tenureYears: 3
  };

  get loanAmount(): number {
    return Math.max(this.car.price - this.emi.downPayment, 0);
  }

  get tenureMonths(): number {
    return this.emi.tenureYears * 12;
  }

  get monthlyEmi(): number {
    const P = this.loanAmount;
    const r = this.emi.interestRate / 12 / 100;
    const n = this.tenureMonths;

    if (P <= 0 || r <= 0 || n <= 0) return 0;

    return Math.round(
      (P * r * Math.pow(1 + r, n)) /
      (Math.pow(1 + r, n) - 1)
    );
  }

  get totalPayable(): number {
    return this.monthlyEmi * this.tenureMonths;
  }

  get totalInterest(): number {
    return Math.max(this.totalPayable - this.loanAmount, 0);
  }

  goToLogin() {
    const returnUrl = this.router.url; // current car details URL
    this.router.navigate(['/login'], {
      queryParams: { returnUrl }
    });
  }



}
