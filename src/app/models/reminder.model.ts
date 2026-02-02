export interface Reminder {
  id: string;
  title: string;
  time: string; // HH:mm format
  isCompleted: boolean;
  createdAt: number;
}
