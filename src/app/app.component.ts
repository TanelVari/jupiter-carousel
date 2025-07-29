import { Component, OnInit, OnDestroy } from '@angular/core'
import { Subject } from 'rxjs'
import { takeUntil } from 'rxjs/operators'
import { CarouselService } from './services/carousel.service'

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Jupiter Carousel'
  carouselHeader = ''
  private destroy$ = new Subject<void>()

  constructor(private carouselService: CarouselService) {}

  ngOnInit(): void {
    this.carouselService
      .getCarousels()
      .pipe(takeUntil(this.destroy$))
      .subscribe(carousels => {
        if (carousels && carousels.length > 0) {
          this.carouselHeader = carousels[0].header
        }
      })
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }
}
