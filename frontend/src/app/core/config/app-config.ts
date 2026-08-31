import { InjectionToken } from '@angular/core';

/** Base URL of the Vitrine API. Set per deployment (env/window override). */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');

interface VitrineWindow extends Window {
  __VITRINE_API__?: string;
}

/**
 * Resolves the API base URL. For a new brand deployment, set `window.__VITRINE_API__`
 * (e.g. injected in index.html) or change this default — no component edits needed.
 */
export function resolveApiBaseUrl(): string {
  const fromWindow = (globalThis as unknown as VitrineWindow).__VITRINE_API__;
  return fromWindow && fromWindow.length > 0 ? fromWindow : 'http://localhost:5044';
}
