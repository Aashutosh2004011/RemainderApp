import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReminderService } from './services/reminder.service';
import { TimeService } from './services/time.service';
import { Reminder } from './models/reminder.model';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  reminders: Reminder[] = [];
  currentTime: Date = new Date();
  isFastMode: boolean = false;

  newReminderTitle: string = '';
  newReminderTime: string = '';

  private destroy$ = new Subject<void>();

  constructor(
    private reminderService: ReminderService,
    private timeService: TimeService
  ) {}

  ngOnInit(): void {
    // Subscribe to reminders
    this.reminderService.reminders$
      .pipe(takeUntil(this.destroy$))
      .subscribe(reminders => {
        this.reminders = reminders.sort((a, b) => {
          // Sort by time
          return a.time.localeCompare(b.time);
        });
      });

    // Subscribe to time updates
    combineLatest([
      this.timeService.currentTime$,
      this.reminderService.reminders$
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([time, reminders]) => {
        this.currentTime = time;

        // Check and mark completed reminders
        reminders.forEach(reminder => {
          if (!reminder.isCompleted && this.timeService.isTimePassed(reminder.time, time)) {
            this.reminderService.markAsCompleted(reminder.id);
          }
        });
      });

    // Subscribe to fast mode changes
    this.timeService.fastMode$
      .pipe(takeUntil(this.destroy$))
      .subscribe(fastMode => {
        this.isFastMode = fastMode;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get formattedCurrentTime(): string {
    return this.timeService.formatTime(this.currentTime);
  }

  addReminder(): void {
    if (this.newReminderTitle.trim() && this.newReminderTime) {
      this.reminderService.addReminder(this.newReminderTitle.trim(), this.newReminderTime);
      this.newReminderTitle = '';
      this.newReminderTime = '';
    }
  }

  deleteReminder(id: string): void {
    this.reminderService.deleteReminder(id);
  }

  toggleFastMode(): void {
    this.timeService.toggleFastMode();
  }

  formatReminderTime(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes);
    return this.timeService.formatTime(date);
  }
}
