import { NgModule } from '@angular/core';
import { AdvSearchComponent } from './adv-search.component';
import { CommonModule } from '@angular/common';
import { DisplaySearchComponent } from './display-search/display-search.component';
@NgModule({
  declarations: [AdvSearchComponent, DisplaySearchComponent],
  imports: [
    CommonModule
  ],
  exports: [AdvSearchComponent]
})
export class AdvSearchModule { }
