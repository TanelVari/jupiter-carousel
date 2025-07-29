import { Component, OnInit, OnDestroy } from '@angular/core'
import { Subject } from 'rxjs'
import { takeUntil } from 'rxjs/operators'
import { CarouselService } from './services/carousel.service'
import { ProcessedCarousel } from './interfaces/api.interface'

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Jupiter Carousel'
  carousels: ProcessedCarousel[] = []
  private destroy$ = new Subject<void>()

  constructor(private carouselService: CarouselService) {}

  ngOnInit(): void {
    this.carouselService
      .getCarousels()
      .pipe(takeUntil(this.destroy$))
      .subscribe(carousels => {
        this.carousels = carousels || []
      })
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }
}
