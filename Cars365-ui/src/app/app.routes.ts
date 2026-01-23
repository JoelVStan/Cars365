import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Cars } from './pages/cars/cars';
import { Admin } from './pages/admin/admin';
import { adminGuard } from './guards/admin.guard';
import { guestGuard } from './guards/guest.guard';
import { CarDetails } from './pages/car-details/car-details';
import { Profile } from './pages/profile/profile';
import { AdminDashboard } from './pages/admin-dashboard/admin-dashboard';
import { Home } from './pages/home/home';

export const routes: Routes = [
  //{ path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'cars', component: Cars },

  {
    path: 'login',
    component: Login,
    canActivate: [guestGuard]
  },

  {
    path: 'register',
    component: Register,
    canActivate: [guestGuard]
  },

  {
    path: 'admin',
    component: Admin,
    canActivate: [adminGuard]
  },

  {
    path: 'admin/edit/:id',
    component: Admin,
    canActivate: [adminGuard]
  },
  {
    path: 'cars/:id',
    component: CarDetails
  },
  {
    path: 'profile',
    component: Profile
  },
  {
    path: 'admin/dashboard',
    component: AdminDashboard,
    canActivate: [adminGuard]
  },

  {
    path: '',
    component: Home
  },

  { path: '**', redirectTo: '' }
];