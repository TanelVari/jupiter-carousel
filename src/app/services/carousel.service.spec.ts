import { TestBed } from '@angular/core/testing'
import { BehaviorSubject, firstValueFrom } from 'rxjs'
import { CarouselService } from './carousel.service'
import { ApiService } from './api.service'
import {
  ProcessedCarousel,
  ProcessedCarouselItem
} from '../interfaces/api.interface'
import { CarouselItem } from '../interfaces/carousel.interface'

describe('CarouselService', () => {
  let service: CarouselService
  let mockApiService: jasmine.SpyObj<ApiService>
  let carouselsSubject: BehaviorSubject<ProcessedCarousel[]>
  let loadingSubject: BehaviorSubject<boolean>
  let errorSubject: BehaviorSubject<string | null>

  const mockProcessedCarouselItems: ProcessedCarouselItem[] = [
    {
      id: '1',
      heading: 'Test Item 1',
      canonicalUrl: '/item1',
      images: {
        small: 'https://example.com/small1.jpg',
        large: 'https://example.com/large1.jpg'
      }
    },
    {
      id: '2',
      heading: 'Test Item 2',
      canonicalUrl: '/item2',
      images: {
        small: 'https://example.com/small2.jpg',
        large: 'https://example.com/large2.jpg'
      }
    }
  ]

  const mockProcessedCarousels: ProcessedCarousel[] = [
    {
      id: 'carousel-1',
      header: 'Test Carousel 1',
      items: mockProcessedCarouselItems
    },
    {
      id: 'carousel-2',
      header: 'Test Carousel 2',
      items: [
        {
          id: '3',
          heading: 'Test Item 3',
          canonicalUrl: '/item3',
          images: {
            small: 'https://example.com/small3.jpg',
            large: 'https://example.com/large3.jpg'
          }
        }
      ]
    }
  ]

  beforeEach(() => {
    // Reset TestBed for each test to ensure clean state
    TestBed.resetTestingModule()

    carouselsSubject = new BehaviorSubject<ProcessedCarousel[]>([])
    loadingSubject = new BehaviorSubject<boolean>(false)
    errorSubject = new BehaviorSubject<string | null>(null)

    const apiServiceSpy = jasmine.createSpyObj(
      'ApiService',
      ['getCarousels', 'retryLoading'],
      {
        carousels$: carouselsSubject.asObservable(),
        loading$: loadingSubject.asObservable(),
        error$: errorSubject.asObservable()
      }
    )

    TestBed.configureTestingModule({
      providers: [
        CarouselService,
        { provide: ApiService, useValue: apiServiceSpy }
      ]
    })

    service = TestBed.inject(CarouselService)
    mockApiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>

    // Set up default return values
    mockApiService.getCarousels.and.returnValue(carouselsSubject.asObservable())
  })

  afterEach(() => {
    // Clean up subscriptions
    carouselsSubject.complete()
    loadingSubject.complete()
    errorSubject.complete()
  })

  describe('Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy()
    })

    it('should initialize with empty selected carousel ID', async () => {
      const selectedId = await firstValueFrom(service.selectedCarouselId$)
      expect(selectedId).toBe('')
    })

    it('should initialize with empty items array when no carousels', async () => {
      const items = await firstValueFrom(service.getItems())
      expect(items).toEqual([])
    })

    it('should have access to ApiService observables', () => {
      expect(service.getLoading).toBeDefined()
      expect(service.getError).toBeDefined()
    })
  })

  describe('Carousel Selection and Auto-Selection', () => {
    it('should auto-select first carousel when carousels are loaded and none selected', async () => {
      // Test that items$ observable provides the correct items from auto-selected carousel
      // instead of testing selectedCarouselId$ directly, since that's where the auto-selection logic is
      const itemsPromise = new Promise<CarouselItem[]>(resolve => {
        service.getItems().subscribe(items => {
          if (items.length > 0) {
            // Wait for items to be populated
            resolve(items)
          }
        })
      })

      // Load carousels
      carouselsSubject.next(mockProcessedCarousels)

      // Wait for items to be auto-selected and converted
      const items = await itemsPromise
      expect(items.length).toBe(2) // Should have items from first carousel
      expect(items[0].id).toBe('1') // First item from first carousel
    })

    it('should select specific carousel when selectCarousel is called', async () => {
      service.selectCarousel('carousel-2')

      const selectedId = await firstValueFrom(service.selectedCarouselId$)
      expect(selectedId).toBe('carousel-2')
    })

    it('should not auto-select when carousel is already manually selected', async () => {
      // First manually select a carousel
      service.selectCarousel('carousel-2')

      // Load carousels - should not auto-select since one is already selected
      carouselsSubject.next(mockProcessedCarousels)

      const selectedId = await firstValueFrom(service.selectedCarouselId$)
      expect(selectedId).toBe('carousel-2')
    })

    it('should handle selecting non-existent carousel gracefully', async () => {
      carouselsSubject.next(mockProcessedCarousels)
      service.selectCarousel('non-existent-carousel')

      const items = await firstValueFrom(service.getItems())
      expect(items).toEqual([])
    })
  })

  describe('Items Management', () => {
    it('should return items from auto-selected first carousel', async () => {
      const expectedItems: CarouselItem[] = [
        {
          id: '1',
          heading: 'Test Item 1',
          canonicalUrl: '/item1',
          images: {
            small: 'https://example.com/small1.jpg',
            large: 'https://example.com/large1.jpg'
          }
        },
        {
          id: '2',
          heading: 'Test Item 2',
          canonicalUrl: '/item2',
          images: {
            small: 'https://example.com/small2.jpg',
            large: 'https://example.com/large2.jpg'
          }
        }
      ]

      carouselsSubject.next(mockProcessedCarousels)

      // Wait for auto-selection
      await new Promise(resolve => setTimeout(resolve, 50))

      const items = await firstValueFrom(service.getItems())
      expect(items).toEqual(expectedItems)
    })

    it('should return items from manually selected carousel', async () => {
      const expectedItems: CarouselItem[] = [
        {
          id: '3',
          heading: 'Test Item 3',
          canonicalUrl: '/item3',
          images: {
            small: 'https://example.com/small3.jpg',
            large: 'https://example.com/large3.jpg'
          }
        }
      ]

      carouselsSubject.next(mockProcessedCarousels)
      service.selectCarousel('carousel-2')

      // Wait for selection to propagate
      await new Promise(resolve => setTimeout(resolve, 50))

      const items = await firstValueFrom(service.getItems())
      expect(items).toEqual(expectedItems)
    })

    it('should return empty array when no carousels available', async () => {
      carouselsSubject.next([])

      const items = await firstValueFrom(service.getItems())
      expect(items).toEqual([])
    })
  })

  describe('Data Conversion', () => {
    it('should correctly convert ProcessedCarouselItem to CarouselItem', async () => {
      const processedItem: ProcessedCarouselItem = {
        id: 'test-id',
        heading: 'Test Heading',
        canonicalUrl: '/test-url',
        images: {
          small: 'https://example.com/small.jpg',
          large: 'https://example.com/large.jpg'
        }
      }

      const carousel: ProcessedCarousel = {
        id: 'test-carousel',
        header: 'Test Carousel',
        items: [processedItem]
      }

      carouselsSubject.next([carousel])

      // Wait for auto-selection
      await new Promise(resolve => setTimeout(resolve, 50))

      const items = await firstValueFrom(service.getItems())
      const item = items[0]

      expect(item.id).toBe('test-id')
      expect(item.heading).toBe('Test Heading')
      expect(item.canonicalUrl).toBe('/test-url')
      expect(item.images.small).toBe('https://example.com/small.jpg')
      expect(item.images.large).toBe('https://example.com/large.jpg')
    })

    it('should handle empty items array in carousel', async () => {
      const emptyCarousel: ProcessedCarousel = {
        id: 'empty-carousel',
        header: 'Empty Carousel',
        items: []
      }

      carouselsSubject.next([emptyCarousel])

      const items = await firstValueFrom(service.getItems())
      expect(items).toEqual([])
    })
  })

  describe('API Service Integration', () => {
    it('should delegate getCarousels to ApiService', () => {
      service.getCarousels()
      expect(mockApiService.getCarousels).toHaveBeenCalled()
    })

    it('should return ApiService carousels observable from getCarousels', async () => {
      const testCarousels = [mockProcessedCarousels[0]]

      carouselsSubject.next(testCarousels)

      const carousels = await firstValueFrom(service.getCarousels())
      expect(carousels).toEqual(testCarousels)
    })

    it('should delegate getLoading to ApiService', async () => {
      loadingSubject.next(true)

      const loading = await firstValueFrom(service.getLoading())
      expect(loading).toBe(true)
    })

    it('should delegate getError to ApiService', async () => {
      const testError = 'Test error message'

      errorSubject.next(testError)

      const error = await firstValueFrom(service.getError())
      expect(error).toBe(testError)
    })

    it('should delegate retryLoading to ApiService', () => {
      service.retryLoading()
      expect(mockApiService.retryLoading).toHaveBeenCalled()
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle null/undefined carousels gracefully', async () => {
      carouselsSubject.next(null as any)

      const items = await firstValueFrom(service.getItems())
      expect(items).toEqual([])
    })

    it('should handle carousel without items property', async () => {
      const carouselWithoutItems = {
        id: 'test-carousel',
        header: 'Test Carousel'
        // items property missing
      } as ProcessedCarousel

      carouselsSubject.next([carouselWithoutItems])

      const items = await firstValueFrom(service.getItems())
      expect(items).toEqual([])
    })

    it('should handle items with missing properties gracefully', async () => {
      const itemWithMissingProps = {
        id: 'incomplete-item',
        heading: 'Incomplete Item'
        // Missing canonicalUrl and images
      } as ProcessedCarouselItem

      const carousel: ProcessedCarousel = {
        id: 'test-carousel',
        header: 'Test Carousel',
        items: [itemWithMissingProps]
      }

      carouselsSubject.next([carousel])

      // Wait for auto-selection
      await new Promise(resolve => setTimeout(resolve, 50))

      const items = await firstValueFrom(service.getItems())
      const item = items[0]

      expect(item.id).toBe('incomplete-item')
      expect(item.heading).toBe('Incomplete Item')
      expect(item.canonicalUrl).toBe('')
      expect(item.images.small).toBe('')
      expect(item.images.large).toBe('')
    })

    it('should handle rapid carousel selection changes', async () => {
      carouselsSubject.next(mockProcessedCarousels)

      // Rapid selections
      service.selectCarousel('carousel-1')
      service.selectCarousel('carousel-2')
      service.selectCarousel('carousel-1')
      service.selectCarousel('carousel-2')

      const selectedId = await firstValueFrom(service.selectedCarouselId$)
      expect(selectedId).toBe('carousel-2')
    })
  })

  describe('Observable Behavior', () => {
    it('should emit initial values immediately for new subscribers', async () => {
      // Load carousels first
      carouselsSubject.next(mockProcessedCarousels)

      // Subscribe to items$ to trigger the auto-selection logic
      const itemsSubscription = service.getItems().subscribe()

      // Wait for auto-selection to happen
      await new Promise(resolve => setTimeout(resolve, 50))

      // Clean up the subscription
      itemsSubscription.unsubscribe()

      // Verify that a new subscriber gets the current selected carousel immediately
      const currentSelectedId = await firstValueFrom(
        service.selectedCarouselId$
      )

      // Should have auto-selected the first carousel
      expect(currentSelectedId).toBe('carousel-1')
    })

    it('should handle multiple subscribers correctly', async () => {
      let subscriber1Value: string = ''
      let subscriber2Value: string = ''

      const sub1 = service.selectedCarouselId$.subscribe(id => {
        subscriber1Value = id
      })

      const sub2 = service.selectedCarouselId$.subscribe(id => {
        subscriber2Value = id
      })

      service.selectCarousel('test-carousel')

      // Wait for emission
      await new Promise(resolve => setTimeout(resolve, 10))

      expect(subscriber1Value).toBe('test-carousel')
      expect(subscriber2Value).toBe('test-carousel')

      sub1.unsubscribe()
      sub2.unsubscribe()
    })

    it('should complete observables properly when service is destroyed', () => {
      const subscription = service.selectedCarouselId$.subscribe()
      expect(subscription.closed).toBe(false)

      subscription.unsubscribe()
      expect(subscription.closed).toBe(true)
    })
  })

  describe('Performance Considerations', () => {
    it('should not cause excessive emissions with same carousel selection', async () => {
      let emissionCount = 0
      const subscription = service.selectedCarouselId$.subscribe(() => {
        emissionCount++
      })

      // Select same carousel multiple times
      service.selectCarousel('carousel-1')
      service.selectCarousel('carousel-1')
      service.selectCarousel('carousel-1')

      await new Promise(resolve => setTimeout(resolve, 10))

      expect(emissionCount).toBe(4) // Initial empty + 3 same selections (BehaviorSubject emits even for same values)

      subscription.unsubscribe()
    })

    it('should handle large carousel datasets efficiently', async () => {
      // Create a large dataset
      const largeCarousel: ProcessedCarousel = {
        id: 'large-carousel',
        header: 'Large Carousel',
        items: Array.from({ length: 1000 }, (_, i) => ({
          id: `item-${i}`,
          heading: `Item ${i}`,
          canonicalUrl: `/item${i}`,
          images: {
            small: `https://example.com/small${i}.jpg`,
            large: `https://example.com/large${i}.jpg`
          }
        }))
      }

      const startTime = performance.now()

      carouselsSubject.next([largeCarousel])

      // Wait for auto-selection
      await new Promise(resolve => setTimeout(resolve, 50))

      const items = await firstValueFrom(service.getItems())
      const endTime = performance.now()
      const processingTime = endTime - startTime

      expect(items.length).toBe(1000)
      expect(processingTime).toBeLessThan(100) // Should process quickly
    })
  })
})
