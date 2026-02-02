import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TimeService {
  private fastModeSubject = new BehaviorSubject<boolean>(false);
  public fastMode$: Observable<boolean> = this.fastModeSubject.asObservable();

  private currentTimeSubject = new BehaviorSubject<Date>(new Date());
  public currentTime$: Observable<Date> = this.currentTimeSubject.asObservable();

  private normalInterval: any;
  private fastInterval: any;

  constructor() {
    this.startNormalTime();
  }

  private startNormalTime(): void {
    this.clearIntervals();
    // Update every second for normal time
    this.normalInterval = interval(1000).subscribe(() => {
      this.currentTimeSubject.next(new Date());
    });
  }

  private startFastTime(): void {
    this.clearIntervals();
    // In fast mode, 1 real second = 60 simulated seconds
    // So we update every ~17ms to simulate 1 minute per second
    let simulatedTime = new Date();
    this.fastInterval = interval(1000).subscribe(() => {
      simulatedTime = new Date(simulatedTime.getTime() + 60000); // Add 1 minute
      this.currentTimeSubject.next(simulatedTime);
    });
  }

  private clearIntervals(): void {
    if (this.normalInterval) {
      this.normalInterval.unsubscribe();
      this.normalInterval = null;
    }
    if (this.fastInterval) {
      this.fastInterval.unsubscribe();
      this.fastInterval = null;
    }
  }

  toggleFastMode(): void {
    const newFastMode = !this.fastModeSubject.value;
    this.fastModeSubject.next(newFastMode);

    if (newFastMode) {
      this.startFastTime();
    } else {
      // Reset to actual current time when switching back to normal mode
      this.currentTimeSubject.next(new Date());
      this.startNormalTime();
    }
  }

  isFastMode(): boolean {
    return this.fastModeSubject.value;
  }

  getCurrentTime(): Date {
    return this.currentTimeSubject.value;
  }

  formatTime(date: Date): string {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${displayHours}:${displayMinutes} ${ampm}`;
  }

  // Check if a reminder time has passed
  isTimePassed(reminderTime: string, currentTime: Date): boolean {
    const [hours, minutes] = reminderTime.split(':').map(Number);
    const currentHours = currentTime.getHours();
    const currentMinutes = currentTime.getMinutes();

    const reminderTotalMinutes = hours * 60 + minutes;
    const currentTotalMinutes = currentHours * 60 + currentMinutes;

    return currentTotalMinutes >= reminderTotalMinutes;
  }
}
