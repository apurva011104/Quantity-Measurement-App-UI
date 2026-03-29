import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Navbar } from '../../components/navbar/navbar';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  token = '';
  name = '';

  operations = ['COMPARE', 'CONVERT', 'ADD', 'SUBTRACT', 'DIVIDE'];
  categories: string[] = [];
  unitList: string[] = [];

  selectedOperation = '';
  selectedCategory = '';

  value1: any;
  value2: any;
  unit1 = '';
  unit2 = '';
  targetUnit = '';

  result = '---';

  showInput = false;
  showSecond = true;
  showTarget = false;

  opMap: any = {
    COMPARE: "equals",
    CONVERT: "convert",
    ADD: "add",
    SUBTRACT: "subtract",
    DIVIDE: "divide"
  };

  measurementMap: any = {
    LENGTH: "LengthUnit",
    WEIGHT: "WeightUnit",
    VOLUME: "VolumeUnit",
    TEMPERATURE: "TemperatureUnit"
  };

  units: any = {
    LENGTH: ["FEET", "INCHES", "YARDS", "CENTIMETERS"],
    WEIGHT: ["KILOGRAMS", "GRAMS", "POUNDS"],
    VOLUME: ["GALLON", "LITRE", "MILLILITRE"],
    TEMPERATURE: ["CELSIUS", "FAHRENHEIT", "KELVIN"]
  };

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {

    const params = new URLSearchParams(window.location.search);

    const tokenFromUrl = params.get("token");
    const nameFromUrl = params.get("name");
    const emailFromUrl = params.get("email");

    if (tokenFromUrl) {
      localStorage.setItem("token", tokenFromUrl);
      localStorage.setItem("userName", nameFromUrl || '');
      localStorage.setItem("userEmail", emailFromUrl || '');
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    this.token = localStorage.getItem("token") || '';

    if (!this.token) {
      window.location.href = "/";
    }

    this.name = localStorage.getItem("userName") || '';
  }

  selectOperation(op: string) {
    this.selectedOperation = this.opMap[op];
    this.selectedCategory = '';
    this.resetUI();

    const base = ["LENGTH", "WEIGHT", "VOLUME"];

    if (this.selectedOperation === "equals" || this.selectedOperation === "convert") {
      base.push("TEMPERATURE");
    }

    this.categories = base;
  }

  selectCategory(cat: string) {
    this.selectedCategory = cat;
    this.resetUI();
    this.setupInputs();
  }

  setupInputs() {
    this.showInput = true;

    this.unitList = this.units[this.selectedCategory];

    this.unit1 = this.unitList[0];
    this.unit2 = this.unitList[0];
    this.targetUnit = this.unitList[0];

    if (this.selectedOperation === "convert") {
      this.showSecond = false;
      this.showTarget = true;
    } 
    else if (this.selectedOperation === "add" || this.selectedOperation === "subtract") {
      this.showSecond = true;
      this.showTarget = true;
    } 
    else {
      this.showSecond = true;
      this.showTarget = false;
    }
  }

  perform() {

    const v1 = parseFloat(this.value1);
    const v2 = parseFloat(this.value2);

    if (isNaN(v1) || (this.selectedOperation !== "convert" && isNaN(v2))) {
      this.result = "⚠️ Please enter valid values";
      return;
    }

    let url = `http://localhost:8080/quantities/${this.selectedOperation}`;
    let body: any;

    if (this.selectedOperation === "convert") {

      if (this.targetUnit) {
        url += `?targetUnit=${this.targetUnit}`;
      }

      body = {
        quantityValue: v1,
        unit: this.unit1,
        measurementType: this.measurementMap[this.selectedCategory]
      };
    } 
    else {

      if ((this.selectedOperation === "add" || this.selectedOperation === "subtract") && this.targetUnit) {
        url += `?targetUnit=${this.targetUnit}`;
      }

      body = {
        quantity1: {
          quantityValue: v1,
          unit: this.unit1,
          measurementType: this.measurementMap[this.selectedCategory]
        },
        quantity2: {
          quantityValue: v2,
          unit: this.unit2,
          measurementType: this.measurementMap[this.selectedCategory]
        }
      };
    }

    this.result = "Calculating...";

    this.http.post(url, body, {
      headers: { Authorization: "Bearer " + this.token }
    }).subscribe({
      next: (data: any) => {

        console.log("RAW RESPONSE:", data);

        if (data && data.value !== undefined) {
          this.result = `Result: ${Number(data.value).toFixed(2)} ${data.unit}`;
        } else {
          this.result = `Result: ${JSON.stringify(data)}`;
        }

        this.cdr.detectChanges(); // 🔥 FORCE UI UPDATE
      },
      error: (err) => {
        console.log("ERROR:", err);

        this.result = err.error?.message || "Error occurred";

        this.cdr.detectChanges(); // 🔥 FORCE UI UPDATE
      }
    });
  }

  resetUI() {
    this.showInput = false;
    this.showSecond = true;
    this.showTarget = false;

    this.value1 = '';
    this.value2 = '';

    this.unitList = [];

    this.result = "---";
  }
}