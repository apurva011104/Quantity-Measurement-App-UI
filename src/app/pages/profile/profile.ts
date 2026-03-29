import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Navbar } from '../../components/navbar/navbar';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {

  name = '';
  email = '';
  token = '';

  history: any[] = [];
  filter = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.token = localStorage.getItem("token") || '';

    if (!this.token) {
      window.location.href = "/";
    }

    this.name = localStorage.getItem("userName") || '';
    this.email = localStorage.getItem("userEmail") || '';

    this.loadHistory();
  }

  /* -------- LOAD HISTORY -------- */
  loadHistory() {
    let url = "http://localhost:8080/quantities/operationsHistory";

    if (this.filter) {
      url += "/" + this.filter;
    }

    this.http.get<any[]>(url, {
      headers: { Authorization: "Bearer " + this.token }
    }).subscribe({
      next: (data) => this.history = data,
      error: () => this.history = []
    });
  }

  /* -------- LOGOUT -------- */
  logout() {
    this.http.post("http://localhost:8080/auth/logout", {}, {
      headers: { Authorization: "Bearer " + this.token }
    }).subscribe({
      next: () => {
        localStorage.clear();
        window.location.href = "/";
      },
      error: () => {
        localStorage.clear();
        window.location.href = "/";
      }
    });
  }
}