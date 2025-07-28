import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable, combineLatest } from 'rxjs'
import { map } from 'rxjs/operators'
import { CarouselItem } from '../interfaces/carousel.interface'
import {
  ProcessedCarousel,
  ProcessedCarouselItem
} from '../interfaces/api.interface'
import { ApiService } from './api.service'

@Injectable({
  providedIn: 'root'
})
export class CarouselService {
  private selectedCarouselIdSubject = new BehaviorSubject<string>('')
  public selectedCarouselId$: Observable<string> =
    this.selectedCarouselIdSubject.asObservable()

  // Computed observable for the current carousel items
  public items$: Observable<CarouselItem[]> = combineLatest([
    this.apiService.carousels$,
    this.selectedCarouselIdSubject
  ]).pipe(
    map(([carousels, selectedId]) => {
      if (!selectedId && carousels.length > 0) {
        // Auto-select first carousel if none selected
        this.selectedCarouselIdSubject.next(carousels[0].id)
        return this.convertToCarouselItems(carousels[0].items)
      }

      const selectedCarousel = carousels.find(c => c.id === selectedId)
      return selectedCarousel
        ? this.convertToCarouselItems(selectedCarousel.items)
        : []
    })
  )

  constructor(private apiService: ApiService) {}

  private convertToCarouselItems(
    processedItems: ProcessedCarouselItem[]
  ): CarouselItem[] {
    return processedItems.map((item, index) => ({
      id: item.id,
      heading: item.heading,
      description: '', // No longer available from API
      imageUrl: item.images.large || item.images.small,
      isActive: index === 0 // First item is active by default
    }))
  }

  getItems(): Observable<CarouselItem[]> {
    return this.items$
  }

  getCarousels(): Observable<ProcessedCarousel[]> {
    return this.apiService.getCarousels()
  }

  selectCarousel(carouselId: string): void {
    this.selectedCarouselIdSubject.next(carouselId)
  }

  setActiveItem(id: string): void {
    const currentCarouselId = this.selectedCarouselIdSubject.value
    if (currentCarouselId) {
      this.apiService.setActiveItem(currentCarouselId, id)
    }
  }

  getLoading(): Observable<boolean> {
    return this.apiService.loading$
  }

  getError(): Observable<string | null> {
    return this.apiService.error$
  }

  retryLoading(): void {
    this.apiService.retryLoading()
  }
}
