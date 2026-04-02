import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.prod';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {

  constructor(private router: Router, private http: HttpClient) {}

  goHome() {
    this.router.navigate(['/dashboard']);
  }

  goProfile() {
    this.router.navigate(['/profile']);
  }

  logout() {
    const token = localStorage.getItem("token");

    this.http.post(`${environment.backendUrl}/auth/logout`, {}, {
      headers: { Authorization: "Bearer " + token }
    }).subscribe({
      next: () => {
        localStorage.clear();
        this.router.navigate(['/']);
      },
      error: () => {
        localStorage.clear();
        this.router.navigate(['/']);
      }
    });
  }
}