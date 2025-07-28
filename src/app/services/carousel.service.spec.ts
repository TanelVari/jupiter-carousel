import { TestBed } from '@angular/core/testing'
import { CarouselService } from './carousel.service'
import { ApiService } from './api.service'
import { CarouselItem } from '../interfaces/carousel.interface'
import { ProcessedCarousel } from '../interfaces/api.interface'
import { of } from 'rxjs'

describe('CarouselService', () => {
  let service: CarouselService
  let mockApiService: jasmine.SpyObj<ApiService>

  const mockCarousels: ProcessedCarousel[] = [
    {
      id: 'test-carousel',
      header: 'Test Carousel',
      items: [
        {
          id: '1',
          heading: 'Test Item 1',
          description: 'Test description 1',
          images: {
            small: 'test-small.jpg',
            medium: 'test-medium.jpg',
            large: 'test-large.jpg',
            portrait: 'test-portrait.jpg'
          },
          isActive: true
        },
        {
          id: '2',
          heading: 'Test Item 2',
          description: 'Test description 2',
          images: {
            small: 'test-small-2.jpg',
            medium: 'test-medium-2.jpg',
            large: 'test-large-2.jpg',
            portrait: 'test-portrait-2.jpg'
          },
          isActive: false
        }
      ]
    }
  ]

  beforeEach(() => {
    const apiSpy = jasmine.createSpyObj(
      'ApiService',
      ['getCarousels', 'setActiveItem', 'retryLoading'],
      {
        carousels$: of(mockCarousels),
        loading$: of(false),
        error$: of(null)
      }
    )

    TestBed.configureTestingModule({
      providers: [CarouselService, { provide: ApiService, useValue: apiSpy }]
    })

    service = TestBed.inject(CarouselService)
    mockApiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>
    mockApiService.getCarousels.and.returnValue(of(mockCarousels))
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should get carousel items', done => {
    service.getItems().subscribe((items: CarouselItem[]) => {
      expect(items).toBeDefined()
      expect(items.length).toBeGreaterThan(0)
      expect(items[0].heading).toBe('Test Item 1')
      expect(items[0].imageUrl).toBe('test-large.jpg')
      done()
    })
  })

  it('should get carousels from API service', done => {
    service.getCarousels().subscribe((carousels: ProcessedCarousel[]) => {
      expect(carousels).toBeDefined()
      expect(carousels.length).toBe(1)
      expect(carousels[0].header).toBe('Test Carousel')
      done()
    })
  })

  it('should set active item correctly', () => {
    service.selectCarousel('test-carousel')
    service.setActiveItem('2')

    expect(mockApiService.setActiveItem).toHaveBeenCalledWith(
      'test-carousel',
      '2'
    )
  })

  it('should handle loading state', done => {
    service.getLoading().subscribe((loading: boolean) => {
      expect(typeof loading).toBe('boolean')
      done()
    })
  })

  it('should handle error state', done => {
    service.getError().subscribe((error: string | null) => {
      expect(error === null || typeof error === 'string').toBe(true)
      done()
    })
  })

  it('should retry loading', () => {
    service.retryLoading()
    expect(mockApiService.retryLoading).toHaveBeenCalled()
  })

  it('should select carousel', () => {
    service.selectCarousel('test-carousel-2')

    service.selectedCarouselId$.subscribe(id => {
      expect(id).toBe('test-carousel-2')
    })
  })
})
