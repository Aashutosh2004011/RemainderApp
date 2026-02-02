import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Reminder } from '../models/reminder.model';

@Injectable({
  providedIn: 'root'
})
export class ReminderService {
  private readonly STORAGE_KEY = 'reminders_v1';
  private remindersSubject = new BehaviorSubject<Reminder[]>([]);
  public reminders$: Observable<Reminder[]> = this.remindersSubject.asObservable();

  constructor() {
    this.loadReminders();
  }

  private loadReminders(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const reminders = JSON.parse(stored);
        this.remindersSubject.next(reminders);
      }
    } catch (error) {
      console.error('Error loading reminders:', error);
      this.remindersSubject.next([]);
    }
  }

  private saveReminders(reminders: Reminder[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(reminders));
      this.remindersSubject.next(reminders);
    } catch (error) {
      console.error('Error saving reminders:', error);
    }
  }

  addReminder(title: string, time: string): void {
    const reminders = this.remindersSubject.value;
    const newReminder: Reminder = {
      id: `reminder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      time,
      isCompleted: false,
      createdAt: Date.now()
    };
    this.saveReminders([...reminders, newReminder]);
  }

  deleteReminder(id: string): void {
    const reminders = this.remindersSubject.value.filter(r => r.id !== id);
    this.saveReminders(reminders);
  }

  markAsCompleted(id: string): void {
    const reminders = this.remindersSubject.value.map(r =>
      r.id === id ? { ...r, isCompleted: true } : r
    );
    this.saveReminders(reminders);
  }

  getReminders(): Reminder[] {
    return this.remindersSubject.value;
  }
}
