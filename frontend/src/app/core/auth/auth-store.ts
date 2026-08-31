import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../config/app-config';

interface AuthResponseDto {
  token: string;
  expiresAt: string;
  username: string;
  role: string;
}

interface Session {
  token: string;
  username: string;
  role: string;
  expiresAt: string;
}

const STORAGE_KEY = 'vitrine.session';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  private readonly sessionSignal = signal<Session | null>(this.restore());

  readonly token = computed(() => this.sessionSignal()?.token ?? null);
  readonly username = computed(() => this.sessionSignal()?.username ?? null);
  readonly isAuthenticated = computed(() => this.sessionSignal() !== null);

  async login(username: string, password: string): Promise<void> {
    const response = await firstValueFrom(
      this.http.post<AuthResponseDto>(`${this.apiBaseUrl}/api/v1/auth/login`, {
        username,
        password,
      }),
    );

    const session: Session = {
      token: response.token,
      username: response.username,
      role: response.role,
      expiresAt: response.expiresAt,
    };

    this.sessionSignal.set(session);
    this.persist(session);
  }

  logout(): void {
    this.sessionSignal.set(null);
    this.clear();
  }

  private restore(): Session | null {
    try {
      const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
      if (!raw) {
        return null;
      }
      const session = JSON.parse(raw) as Session;
      if (new Date(session.expiresAt).getTime() <= Date.now()) {
        return null;
      }
      return session;
    } catch {
      return null;
    }
  }

  private persist(session: Session): void {
    try {
      globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      // Non-fatal: session simply won't survive a reload.
    }
  }

  private clear(): void {
    try {
      globalThis.localStorage?.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors.
    }
  }
}
