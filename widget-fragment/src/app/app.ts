import { Component, signal, effect, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth/auth.service';

const FRAGMENT_ID = 'angular-widget';
const CHANNEL_NAME = 'angular-widget-channel';

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit, OnDestroy {
  private readonly auth = inject(AuthService);
  protected readonly isAuthenticated = this.auth.isAuthenticated;
  protected readonly isStandalone = signal<boolean>(
    (() => {
      try {
        return window.self === window.top;
      } catch {
        return true;
      }
    })(),
  );
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

  async ngOnInit(): Promise<void> {
    await this.auth.init();
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

  login() {
    void this.auth.login();
  }

  logout() {
    void this.auth.logout();
  }
}
