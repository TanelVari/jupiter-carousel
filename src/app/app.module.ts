import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { CommonModule } from '@angular/common'

import { AppComponent } from './app.component'
import { CarouselComponent } from './components/carousel/carousel.component'

@NgModule({
  declarations: [AppComponent, CarouselComponent],
  imports: [BrowserModule, CommonModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
