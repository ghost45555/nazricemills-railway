import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Since our components are standalone, we don't need to declare or export them here
@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    CommonModule
  ]
})
export class SharedModule { }
