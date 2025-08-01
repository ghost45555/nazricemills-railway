import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';

if (process.env['NODE_ENV'] === 'production') {
  enableProdMode();
}

export default () => bootstrapApplication(AppComponent, config);
