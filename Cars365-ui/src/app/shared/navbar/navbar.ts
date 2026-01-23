import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  showToast = false;
  toastMessage = '';

  constructor(public auth: AuthService, private router: Router) {}

  onLogout() {
    this.auth.logout();

    this.toastMessage = 'Logged out successfully';
    this.showToast = true;

    setTimeout(() => {
      this.showToast = false;
      this.router.navigate(['/login'], { replaceUrl: true });
    }, 1000);
  }
}
