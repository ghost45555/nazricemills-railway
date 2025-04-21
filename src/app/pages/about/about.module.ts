import { NgModule } from '@angular/core';
import { Route, Routes } from '@angular/router';
import { AboutComponent } from './about.component';

export const routes: Route[] = [
  {
    path: '',
    component: AboutComponent
  }
];

@NgModule({
  imports: [],
  exports: []
})
export class AboutModule { }
