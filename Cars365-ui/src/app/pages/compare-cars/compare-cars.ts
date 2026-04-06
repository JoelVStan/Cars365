import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CarsService } from '../../services/car.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-compare-cars',
  imports: [CommonModule, RouterLink],
  templateUrl: './compare-cars.html',
  styleUrl: './compare-cars.css',
})
export class CompareCars {
  loading = true;
  cars: any[] = [];
  apiBaseUrl = 'https://localhost:7193';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private carsService: CarsService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const idsParam = params['ids'] || '';
      const ids = (idsParam as string)
        .split(',')
        .map(x => +x)
        .filter(x => !!x);

      if (ids.length < 2) {
        this.loading = false;
        this.cars = [];
        return;
      }

      this.loading = true;
      this.carsService.getCompareCars(ids).subscribe({
        next: (res) => {
          this.cars = res;
          this.loading = false;
        },
        error: () => {
          this.cars = [];
          this.loading = false;
        }
      });
    });
  }

  getImageUrl(path: string | null | undefined) {
    if (!path) return 'assets/no-image.png';
    return path.startsWith('http') ? path : `${this.apiBaseUrl}${path}`;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN').format(price);
  }

  removeCar(id: number) {
    const nextIds = this.cars.filter(c => c.id !== id).map(c => c.id);
    this.router.navigate(['/compare'], {
      queryParams: { ids: nextIds.join(',') }
    });
  }
}
