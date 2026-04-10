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
    this.startAutoLogoutTimer(token); // 👈 add this
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
    const token = this.getToken();
    if (!token) return false;

    // Check if token is expired
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload['exp']; // exp is in seconds
      const now = Math.floor(Date.now() / 1000); // current time in seconds

      if (expiry < now) {
        // Token expired — clean up and return false
        this.logout();
        return false;
      }

      return true;
    } catch (e) {
      this.logout();
      return false;
    }
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

  private tokenExpiryTimer: any;


  startAutoLogoutTimer(token: string) {
    // Clear any existing timer
    if (this.tokenExpiryTimer) {
      clearTimeout(this.tokenExpiryTimer);
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload['exp']; // seconds
      const now = Math.floor(Date.now() / 1000);
      const timeLeftMs = (expiry - now) * 1000; // convert to milliseconds

      if (timeLeftMs <= 0) {
        this.logout();
        return;
      }

      console.log(`Auto logout in ${timeLeftMs / 1000} seconds`); // for testing

      this.tokenExpiryTimer = setTimeout(() => {
        this.logout();
        // Redirect to login
        window.location.href = '/login';
      }, timeLeftMs);

    } catch (e) {
      this.logout();
    }
  }

}