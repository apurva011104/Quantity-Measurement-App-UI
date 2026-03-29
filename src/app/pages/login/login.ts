import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  name = '';
  email = '';
  password = '';
  isRegister = true;

  constructor(private http: HttpClient, private router: Router) {}

  /* -------- Toggle Login/Register -------- */
  toggle() {
    this.isRegister = !this.isRegister;
  }

  /* -------- Submit Form -------- */
  submit(e: any) {
    e.preventDefault();

    const url = this.isRegister
      ? "http://localhost:8080/auth/register"
      : "http://localhost:8080/auth/login";

    const body = this.isRegister
      ? { name: this.name, email: this.email, password: this.password }
      : { email: this.email, password: this.password };

    this.http.post<any>(url, body).subscribe({
      next: (data) => {
        localStorage.setItem("userName", data.name);
        localStorage.setItem("userEmail", data.email);
        localStorage.setItem("token", data.token);

        alert(this.isRegister ? "Registered successfully" : "Login successful");

        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        alert(err.error?.message || "Something went wrong");
      }
    });
  }

  /* -------- Google Login -------- */
  googleLogin() {
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  }
}