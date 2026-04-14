import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { initializeApp } from 'firebase/app';
import { fetchAndActivate, getBoolean, getRemoteConfig } from 'firebase/remote-config';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FeatureFlagsService {
  private readonly categoriesFlagSubject = new BehaviorSubject<boolean>(true);
  readonly categoriesEnabled$ = this.categoriesFlagSubject.asObservable();

  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) {
      return;
    }

    this.initialized = true;

    if (!environment.firebase?.apiKey) {
      this.categoriesFlagSubject.next(environment.featureFlags.enableCategories);
      return;
    }

    try {
      const app = initializeApp(environment.firebase);
      const remoteConfig = getRemoteConfig(app);
      remoteConfig.settings.minimumFetchIntervalMillis = 60_000;
      remoteConfig.defaultConfig = {
        enableCategories: environment.featureFlags.enableCategories,
      };

      await fetchAndActivate(remoteConfig);
      this.categoriesFlagSubject.next(getBoolean(remoteConfig, 'enableCategories'));
    } catch {
      this.categoriesFlagSubject.next(environment.featureFlags.enableCategories);
    }
  }
}

