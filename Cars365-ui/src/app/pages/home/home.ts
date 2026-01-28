import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RecentlyViewedService } from '../../services/recently-viewed.service';
import { DecimalPipe } from '@angular/common';
import { generateCarSlug as buildCarSlug } from '../../utils/slug.util';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {

  recentCars: any[] = [];
  apiBaseUrl = 'https://localhost:7193'; 
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  constructor(
    public authService: AuthService,
    private recentService: RecentlyViewedService
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.recentCars = this.recentService.getCars();
    }
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

  generateCarSlug(car: any): string {
      return buildCarSlug(car);
  }

  scrollLeft() {
    this.scrollContainer.nativeElement.scrollBy({
      left: -300,
      behavior: 'smooth'
    });
  }

  scrollRight() {
    this.scrollContainer.nativeElement.scrollBy({
      left: 300,
      behavior: 'smooth'
    });
  }
  clearRecent() {
    if (!confirm('Clear recently viewed cars?')) return;

    this.recentService.clear();
    this.recentCars = [];
  }

}