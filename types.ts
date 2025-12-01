export enum TimerStatus {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
}

export enum TabView {
  TIMER = 'TIMER',
  ALARM = 'ALARM',
}

export interface TimeParts {
  hours: number;
  minutes: number;
  seconds: number;
}