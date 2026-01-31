import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class TestDriveService {
  private api = 'https://localhost:7193/api/testdrive';
  private adminapi = 'https://localhost:7193/api/admin/testdrives';

  constructor(private http: HttpClient) {}

  request(carId: number, payload: any) {
    return this.http.post(this.api, {
      carId,
      preferredDate: payload.preferredDate,
      timeSlot: payload.timeSlot
    });
  }

  getMyRequests() {
    return this.http.get(this.api + '/my');
  }

  getAll() {
    return this.http.get<any[]>(this.adminapi);
  }

  approve(id: number) {
    return this.http.put(`${this.adminapi}/${id}/approve`, {});
  }

  reject(id: number, comment: string) {
    return this.http.put(`${this.adminapi}/${id}/reject`, { comment });
  }

  complete(id: number) {
    return this.http.put(`${this.adminapi}/${id}/complete`, {});
  }
}
