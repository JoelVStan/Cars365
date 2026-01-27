import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class BrandService {
  private baseUrl = 'https://localhost:7193/api/brands';

  constructor(private http: HttpClient) {}

  getBrands() {
    return this.http.get<any[]>(this.baseUrl);
  }

  addBrand(name: string) {
    return this.http.post(this.baseUrl, { name });
  }

  getModelsByBrand(brandId: number) {
    return this.http.get<any[]>(`${this.baseUrl}/${brandId}/models`);
  }

  addModel(brandId: number, name: string) {
    return this.http.post(`${this.baseUrl}/${brandId}/models`, { name });
  }
}
