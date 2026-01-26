import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { EMPTY } from "rxjs";
import { AuthService } from "./auth.service";


@Injectable({ providedIn: 'root' })
export class WishlistService {
  private baseUrl = 'https://localhost:7193/api' + '/wishlist';

  constructor(private http: HttpClient, private authService: AuthService) {}

  add(carId: number) {
    return this.http.post(`${this.baseUrl}/${carId}`, {}, { responseType: 'text' });
  }

  remove(carId: number) {
    return this.http.delete(`${this.baseUrl}/${carId}`, { responseType: 'text' });
  }

  getAll() {
    if (!this.authService.isLoggedIn()) {
      return EMPTY; // RxJS
    }

    return this.http.get<any[]>(this.baseUrl);
  }
}
