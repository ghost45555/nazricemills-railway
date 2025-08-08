import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-coming-soon',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './coming-soon.component.html',
  styleUrls: ['./coming-soon.component.css']
})
export class ComingSoonComponent implements OnInit, OnDestroy {
  // Countdown target (adjust as needed)
  private targetDate: Date = new Date('2025-10-01T00:00:00Z');
  private intervalId: any;

  days = '00';
  hours = '00';
  minutes = '00';
  seconds = '00';

  email = '';
  submitted = false;
  isValidEmail = true;
  currentYear = new Date().getFullYear();

  ngOnInit(): void {
    this.updateCountdown();
    this.intervalId = setInterval(() => this.updateCountdown(), 1000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  notifyMe(): void {
    this.isValidEmail = this.validateEmail(this.email);
    if (!this.isValidEmail) return;
    // For now, just store locally and show success state
    try {
      const key = 'coming-soon-subscribers';
      const list = JSON.parse(localStorage.getItem(key) || '[]');
      list.push({ email: this.email, ts: Date.now() });
      localStorage.setItem(key, JSON.stringify(list));
    } catch {}
    this.submitted = true;
  }

  private validateEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  private updateCountdown(): void {
    const now = new Date().getTime();
    const distance = this.targetDate.getTime() - now;

    if (distance <= 0) {
      this.days = this.hours = this.minutes = this.seconds = '00';
      clearInterval(this.intervalId);
      return;
    }

    const d = Math.floor(distance / (1000 * 60 * 60 * 24));
    const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((distance % (1000 * 60)) / 1000);

    this.days = this.pad(d);
    this.hours = this.pad(h);
    this.minutes = this.pad(m);
    this.seconds = this.pad(s);
  }

  private pad(num: number): string {
    return String(num).padStart(2, '0');
  }
}


