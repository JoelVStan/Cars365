import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './shared/navbar/navbar';
import { Footer } from './shared/footer/footer';
import { Toast } from './shared/toast/toast';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,Navbar,Footer,Toast],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'Cars365 - Trusted Used Car Platform';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // On every app load/refresh, resume the auto logout timer
    const token = this.authService.getToken();
    if (token) {
      this.authService.startAutoLogoutTimer(token);
    }
  }
}
