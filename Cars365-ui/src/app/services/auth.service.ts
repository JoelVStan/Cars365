import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://localhost:7193/api/auth';
  private profileUrl = 'https://localhost:7193/api/profile';

  private displayNameSubject = new BehaviorSubject<string | null>(null);
  displayName$ = this.displayNameSubject.asObservable();


  constructor(private http: HttpClient) {}

  login(data: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, data);
  }

  register(data: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }


  saveToken(token: string) {
    localStorage.setItem('token', token);
    this.loadDisplayName();
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('displayName');
    this.displayNameSubject.next(null);
  }


  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;

    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload['role'] || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'Admin';
  }

  getUserEmail(): string | null {
    const token = this.getToken();
    if (!token) return null;

    const payload = JSON.parse(atob(token.split('.')[1]));
    return (
      payload['email'] ||
      payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress']
    );
  }

  loadDisplayName() {
    if (!this.isLoggedIn()) return;

    this.http.get<any>(this.profileUrl).subscribe({
      next: (profile) => {
        const name = profile?.fullName || this.getUserEmail();
        this.displayNameSubject.next(name);
        localStorage.setItem('displayName', name ?? '');
      },
      error: () => {
        const fallback = this.getUserEmail();
        this.displayNameSubject.next(fallback);
      }
    });
  }

  getDisplayName(): string | null {
    return localStorage.getItem('displayName') || this.getUserEmail();
  }

  updateDisplayName(name: string) {
    this.displayNameSubject.next(name);
    localStorage.setItem('displayName', name);
  }



}