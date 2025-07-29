import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'
import {
  ApiResponse,
  CarouselSection,
  ProcessedCarousel,
  ProcessedCarouselItem
} from '../interfaces/api.interface'
import { environment } from '../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly API_URL = environment.apiUrl

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
      let data: ApiResponse

      if (environment.production) {
        // Production: Use remote API
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

        data = await response.json()
      } else {
        // Development: Use local JSON file
        const response = await fetch(this.API_URL)

        if (!response.ok) {
          throw new Error(
            `Failed to load local data file: ${response.status} - ${response.statusText}`
          )
        }

        data = await response.json()
      }

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
      items: section.data.map((item, index) =>
        this.processCarouselItem(item, index)
      )
    }))
  }

  private processCarouselItem(
    apiItem: any,
    index: number
  ): ProcessedCarouselItem {
    const verticalPhoto = apiItem.verticalPhotos?.[0]

    // Extract required image sizes from photoTypes
    const images = {
      small: verticalPhoto?.photoTypes?.['60']?.url || '', // 180x270
      large: verticalPhoto?.photoTypes?.['80']?.url || '' // 400x600
    }

    return {
      id: apiItem.id?.toString() || `item-${index}`, // Use actual ID from API, fallback to generated ID
      heading: apiItem.heading || 'Untitled',
      canonicalUrl: apiItem.canonicalUrl || '',
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
            canonicalUrl: '#',
            images: {
              small: 'assets/carousel-item-placeholder.png',
              large: 'assets/carousel-item-placeholder.png'
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

  retryLoading(): void {
    this.loadCarousels()
  }
}
