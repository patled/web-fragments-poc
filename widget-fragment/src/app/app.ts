import { Component, signal, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

const FRAGMENT_ID = 'angular-widget';
const CHANNEL_NAME = 'angular-widget-channel';

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnDestroy {
  protected readonly time = signal(new Date().toLocaleTimeString('de-DE'));
  protected readonly date = signal(
    new Date().toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  );
  protected readonly clickCount = signal(0);
  private channel: BroadcastChannel | null = null;
  private timeInterval: any = null;

  constructor() {
    // Initialize BroadcastChannel
    try {
      this.channel = new BroadcastChannel(CHANNEL_NAME);
      this.channel.postMessage({
        type: 'angular-widget-ready',
        fragmentId: FRAGMENT_ID,
        payload: { status: 'ready' },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.warn('BroadcastChannel not available', error);
    }

    // Update time every second
    this.timeInterval = setInterval(() => {
      this.time.set(new Date().toLocaleTimeString('de-DE'));
      this.date.set(
        new Date().toLocaleDateString('de-DE', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      );
    }, 1000);

    // Send updates when click count changes
    effect(() => {
      const count = this.clickCount();
      if (this.channel) {
        this.channel.postMessage({
          type: 'angular-widget-update',
          fragmentId: FRAGMENT_ID,
          payload: { clickCount: count },
          timestamp: new Date().toISOString(),
        });
      }
    });
  }

  ngOnDestroy() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
    if (this.channel) {
      this.channel.close();
    }
  }

  incrementClick() {
    this.clickCount.update((count) => count + 1);
  }
}
