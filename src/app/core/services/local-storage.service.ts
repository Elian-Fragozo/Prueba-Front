import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  private initialized = false;

  constructor(private readonly storage: Storage) {}

  async init(): Promise<void> {
    if (this.initialized) {
      return;
    }
    await this.storage.create();
    this.initialized = true;
  }

  async get<T>(key: string, fallback: T): Promise<T> {
    await this.init();
    const value = await this.storage.get(key);
    return (value as T) ?? fallback;
  }

  async set<T>(key: string, value: T): Promise<void> {
    await this.init();
    await this.storage.set(key, value);
  }
}

