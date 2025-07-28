import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import {
  ApiResponse,
  CarouselSection,
  ProcessedCarousel,
  ProcessedCarouselItem
} from '../interfaces/api.interface'

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly API_URL =
    'https://services.err.ee/api/v2/category/getByUrl?url=video&domain=jupiter.err.ee'

  private carouselsSubject = new BehaviorSubject<ProcessedCarousel[]>([])
  public carousels$: Observable<ProcessedCarousel[]> =
    this.carouselsSubject.asObservable()

  private loadingSubject = new BehaviorSubject<boolean>(false)
  public loading$: Observable<boolean> = this.loadingSubject.asObservable()

  private errorSubject = new BehaviorSubject<string | null>(null)
  public error$: Observable<string | null> = this.errorSubject.asObservable()

  constructor() {
    this.loadCarousels()
  }

  async loadCarousels(): Promise<void> {
    this.loadingSubject.next(true)
    this.errorSubject.next(null)

    try {
      const response = await fetch(this.API_URL, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status} - ${response.statusText}`
        )
      }

      const data: ApiResponse = await response.json()
      const processedCarousels = this.processApiResponse(data)
      this.carouselsSubject.next(processedCarousels)
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? `Failed to load carousel data: ${error.message}`
          : 'An unknown error occurred while loading carousel data'

      console.error('API Service Error:', error)
      this.errorSubject.next(errorMessage)

      // Load fallback data in case of error
      this.loadFallbackData()
    } finally {
      this.loadingSubject.next(false)
    }
  }

  private processApiResponse(apiResponse: ApiResponse): ProcessedCarousel[] {
    const { frontPage } = apiResponse.data.category

    // Filter out sections where highTimeline is false and process the rest
    const validSections = frontPage.filter(
      (section: CarouselSection) => section.highTimeline !== false
    )

    return validSections.map((section: CarouselSection, index: number) => ({
      id: `carousel-${index}`,
      header: section.header || `Carousel ${index + 1}`,
      items: section.data.map(item => this.processCarouselItem(item))
    }))
  }

  private processCarouselItem(apiItem: any): ProcessedCarouselItem {
    const verticalPhoto = apiItem.verticalPhotos?.[0]

    // Extract required image sizes from photoTypes
    const images = {
      small: verticalPhoto?.photoTypes?.['60']?.url || '', // 180x270
      large: verticalPhoto?.photoTypes?.['80']?.url || '' // 400x600
    }

    return {
      id: apiItem.id.toString(),
      heading: apiItem.heading || 'Untitled',
      images
    }
  }

  private loadFallbackData(): void {
    // Fallback data in case API fails
    const fallbackCarousels: ProcessedCarousel[] = [
      {
        id: 'fallback-carousel',
        header: 'Featured Content',
        items: [
          {
            id: 'fallback-1',
            heading: 'Content Unavailable',
            images: {
              small:
                'https://via.placeholder.com/180x270/6B7280/FFFFFF?text=Content+Unavailable',
              large:
                'https://via.placeholder.com/400x600/6B7280/FFFFFF?text=Content+Unavailable'
            }
          }
        ]
      }
    ]

    this.carouselsSubject.next(fallbackCarousels)
  }

  getCarousels(): Observable<ProcessedCarousel[]> {
    return this.carousels$
  }

  getCarouselById(id: string): Observable<ProcessedCarousel | undefined> {
    return this.carousels$.pipe(
      map(carousels => carousels.find(carousel => carousel.id === id))
    )
  }

  setActiveItem(carouselId: string, itemId: string): void {
    const currentCarousels = this.carouselsSubject.value
    const updatedCarousels = currentCarousels.map(carousel => {
      if (carousel.id === carouselId) {
        return {
          ...carousel,
          items: carousel.items.map(item => ({
            ...item,
            isActive: item.id === itemId
          }))
        }
      }
      return carousel
    })
    this.carouselsSubject.next(updatedCarousels)
  }

  retryLoading(): void {
    this.loadCarousels()
  }
}
