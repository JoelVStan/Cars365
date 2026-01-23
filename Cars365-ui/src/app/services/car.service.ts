import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CarsService {
  private apiUrl = 'https://localhost:7193/api/cars';

  constructor(private http: HttpClient) {}

  getCars(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  addCar(data: any) {
    return this.http.post(this.apiUrl, data);
  }

  deleteCar(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getCarById(id: number) {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  updateCar(id: number, data: any) {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  getDashboardStats() {
    return this.http.get<any>(`${this.apiUrl}/dashboard-stats`);
  }


}
