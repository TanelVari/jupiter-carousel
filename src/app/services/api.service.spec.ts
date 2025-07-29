import { TestBed } from '@angular/core/testing'
import { ApiService } from './api.service'
import { environment } from '../../environments/environment'
import { ApiResponse, ProcessedCarousel } from '../interfaces/api.interface'
import { firstValueFrom } from 'rxjs'

describe('ApiService', () => {
  let service: ApiService
  let originalFetch: typeof window.fetch

  const mockApiResponse: ApiResponse = {
    apiVersion: '1.0',
    data: {
      category: {
        id: 1,
        name: 'Test Category',
        description: 'Test Description',
        domain: 'test.com',
        analyticsId: 'test-analytics',
        gemiusId: 'test-gemius',
        siteContent: 'test content',
        frontPage: [
          {
            header: 'Test Carousel 1',
            headerUrl: 'https://example.com/carousel1',
            highTimeline: true,
            liveBlock: false,
            manual: {
              highTimeline: true,
              banner: false
            },
            data: [
              {
                id: 123,
                heading: 'Test Item 1',
                primaryCategoryId: 1,
                type: 'video',
                parentContentPath: '/test',
                scheduleStart: Date.now(),
                subHeading: 'Test Sub 1',
                hasActiveMedia: true,
                rootContentId: 123,
                rootCategoryId: 1,
                canonicalUrl: 'https://example.com/item1',
                fancyUrl: 'https://example.com/fancy1',
                anotherDomainContent: false,
                verticalPhotos: [
                  {
                    id: 1,
                    ord: 1,
                    type: 1,
                    created: Date.now(),
                    version: 1,
                    format: 'jpg',
                    captionEt: 'Caption ET',
                    captionEn: 'Caption EN',
                    captionRu: 'Caption RU',
                    authorEt: 'Author ET',
                    authorEn: 'Author EN',
                    authorRu: 'Author RU',
                    photoTypes: {
                      '60': {
                        type: 60,
                        w: 180,
                        h: 270,
                        url: 'https://example.com/small1.jpg'
                      },
                      '80': {
                        type: 80,
                        w: 400,
                        h: 600,
                        url: 'https://example.com/large1.jpg'
                      }
                    },
                    photoUrlOriginal: 'https://example.com/original1.jpg',
                    photoUrlBase: 'https://example.com/base1.jpg'
                  }
                ]
              },
              {
                id: 124,
                heading: 'Test Item 2',
                primaryCategoryId: 1,
                type: 'article',
                parentContentPath: '/test',
                scheduleStart: Date.now(),
                subHeading: 'Test Sub 2',
                hasActiveMedia: false,
                rootContentId: 124,
                rootCategoryId: 1,
                canonicalUrl: 'https://example.com/item2',
                fancyUrl: 'https://example.com/fancy2',
                anotherDomainContent: false,
                verticalPhotos: [
                  {
                    id: 2,
                    ord: 1,
                    type: 1,
                    created: Date.now(),
                    version: 1,
                    format: 'jpg',
                    captionEt: 'Caption ET 2',
                    captionEn: 'Caption EN 2',
                    captionRu: 'Caption RU 2',
                    authorEt: 'Author ET 2',
                    authorEn: 'Author EN 2',
                    authorRu: 'Author RU 2',
                    photoTypes: {
                      '60': {
                        type: 60,
                        w: 180,
                        h: 270,
                        url: 'https://example.com/small2.jpg'
                      },
                      '80': {
                        type: 80,
                        w: 400,
                        h: 600,
                        url: 'https://example.com/large2.jpg'
                      }
                    },
                    photoUrlOriginal: 'https://example.com/original2.jpg',
                    photoUrlBase: 'https://example.com/base2.jpg'
                  }
                ]
              }
            ]
          },
          {
            header: 'Test Carousel 2',
            headerUrl: 'https://example.com/carousel2',
            highTimeline: false, // This should be filtered out
            liveBlock: false,
            manual: {
              highTimeline: false,
              banner: false
            },
            data: [
              {
                id: 125,
                heading: 'Filtered Item',
                primaryCategoryId: 1,
                type: 'video',
                parentContentPath: '/test',
                scheduleStart: Date.now(),
                subHeading: 'Filtered Sub',
                hasActiveMedia: true,
                rootContentId: 125,
                rootCategoryId: 1,
                canonicalUrl: 'https://example.com/filtered',
                fancyUrl: 'https://example.com/fancy-filtered',
                anotherDomainContent: false,
                verticalPhotos: []
              }
            ]
          }
        ]
      }
    }
  }

  const expectedProcessedCarousels: ProcessedCarousel[] = [
    {
      id: 'carousel-0',
      header: 'Test Carousel 1',
      items: [
        {
          id: '123',
          heading: 'Test Item 1',
          canonicalUrl: 'https://example.com/item1',
          images: {
            small: 'https://example.com/small1.jpg',
            large: 'https://example.com/large1.jpg'
          }
        },
        {
          id: '124',
          heading: 'Test Item 2',
          canonicalUrl: 'https://example.com/item2',
          images: {
            small: 'https://example.com/small2.jpg',
            large: 'https://example.com/large2.jpg'
          }
        }
      ]
    }
  ]

  beforeEach(() => {
    // Reset TestBed to ensure fresh service instances for each test
    TestBed.resetTestingModule()

    // Store original fetch
    originalFetch = window.fetch

    // Default mock fetch (successful response) - tests can override this
    window.fetch = jasmine.createSpy('fetch').and.returnValue(
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockApiResponse)
      } as Response)
    )

    // Configure TestBed and create service instance
    TestBed.configureTestingModule({})
    service = TestBed.inject(ApiService)
  })

  afterEach(() => {
    // Restore original fetch
    window.fetch = originalFetch
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should initialize observables correctly', () => {
    expect(service.carousels$).toBeDefined()
    expect(service.loading$).toBeDefined()
    expect(service.error$).toBeDefined()
  })

  it('should load carousels successfully and process API response', done => {
    // Wait for initial loading to complete
    setTimeout(() => {
      service.carousels$.subscribe(carousels => {
        expect(carousels).toEqual(expectedProcessedCarousels)
        expect(carousels.length).toBe(1) // Only one carousel because the second has highTimeline: false
        expect(carousels[0].id).toBe('carousel-0')
        expect(carousels[0].header).toBe('Test Carousel 1')
        expect(carousels[0].items.length).toBe(2)
        done()
      })
    }, 100)
  })

  it('should set loading state correctly during fetch', async () => {
    let loadingStates: boolean[] = []

    service.loading$.subscribe(loading => {
      loadingStates.push(loading)
    })

    await service.loadCarousels()

    // Should have at least [true, false] states
    expect(loadingStates).toContain(true)
    expect(loadingStates).toContain(false)
    expect(loadingStates[loadingStates.length - 1]).toBe(false) // Final state should be false
  })

  it('should handle successful fetch request', async () => {
    window.fetch = jasmine.createSpy('fetch').and.returnValue(
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockApiResponse)
      } as Response)
    )

    await service.loadCarousels()

    service.carousels$
      .subscribe(carousels => {
        expect(carousels).toEqual(expectedProcessedCarousels)
      })
      .unsubscribe()

    service.loading$
      .subscribe(loading => {
        expect(loading).toBe(false)
      })
      .unsubscribe()

    service.error$
      .subscribe(error => {
        expect(error).toBe(null)
      })
      .unsubscribe()
  })

  it('should handle network error and use fallback data', async () => {
    // Create separate TestBed configuration for this error test
    TestBed.resetTestingModule()

    // Set up error mocking before creating service
    window.fetch = jasmine
      .createSpy('fetch')
      .and.returnValue(Promise.reject(new Error('Network error')))

    TestBed.configureTestingModule({})
    const errorService = TestBed.inject(ApiService)

    // Wait for the constructor to complete (it calls loadCarousels automatically)
    await new Promise(resolve => setTimeout(resolve, 100))

    // Get the current values after the async operation completes
    const loading = await firstValueFrom(errorService.loading$)
    const error = await firstValueFrom(errorService.error$)
    const carousels = await firstValueFrom(errorService.carousels$)

    expect(loading).toBe(false)
    expect(error).toBe('Failed to load carousel data: Network error')
    expect(carousels).toBeDefined()
    expect(carousels!.length).toBe(1)
    expect(carousels![0].id).toBe('fallback-carousel')
    expect(carousels![0].header).toBe('Featured Content')
    expect(carousels![0].items[0].heading).toBe('Content Unavailable')
  })

  it('should handle HTTP error response and use fallback data', async () => {
    // Create separate TestBed configuration for this error test
    TestBed.resetTestingModule()

    // Mock environment.production to be true
    const originalProduction = environment.production
    Object.defineProperty(environment, 'production', {
      get: () => true,
      configurable: true
    })

    // Set up error mocking before creating service
    window.fetch = jasmine.createSpy('fetch').and.returnValue(
      Promise.resolve({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      } as Response)
    )

    TestBed.configureTestingModule({})
    const errorService = TestBed.inject(ApiService)

    // Wait for the constructor to complete (it calls loadCarousels automatically)
    await new Promise(resolve => setTimeout(resolve, 100))

    // Get the current values after the async operation completes
    const loading = await firstValueFrom(errorService.loading$)
    const error = await firstValueFrom(errorService.error$)
    const carousels = await firstValueFrom(errorService.carousels$)

    expect(loading).toBe(false)
    expect(error).toBe(
      'Failed to load carousel data: HTTP error! status: 404 - Not Found'
    )
    expect(carousels).toBeDefined()
    expect(carousels!.length).toBe(1)
    expect(carousels![0].id).toBe('fallback-carousel')
    expect(carousels![0].header).toBe('Featured Content')

    // Restore original environment value
    Object.defineProperty(environment, 'production', {
      get: () => originalProduction,
      configurable: true
    })
  })

  it('should retry loading successfully', async () => {
    // Mock initial failure
    window.fetch = jasmine
      .createSpy('fetch')
      .and.returnValue(Promise.reject(new Error('Initial error')))

    await service.loadCarousels()

    // Verify error state
    service.error$
      .subscribe(error => {
        expect(error).toBe('Failed to load carousel data: Initial error')
      })
      .unsubscribe()

    // Mock successful retry
    window.fetch = jasmine.createSpy('fetch').and.returnValue(
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockApiResponse)
      } as Response)
    )

    service.retryLoading()
    await new Promise(resolve => setTimeout(resolve, 100)) // Wait for async

    service.loading$
      .subscribe(loading => {
        expect(loading).toBe(false)
      })
      .unsubscribe()

    service.error$
      .subscribe(error => {
        expect(error).toBe(null)
      })
      .unsubscribe()

    service.carousels$
      .subscribe(carousels => {
        expect(carousels).toEqual(expectedProcessedCarousels)
      })
      .unsubscribe()
  })

  it('should return carousels observable via getCarousels method', done => {
    setTimeout(() => {
      service.getCarousels().subscribe(carousels => {
        expect(carousels).toEqual(expectedProcessedCarousels)
        expect(carousels.length).toBe(1)
        expect(carousels[0].header).toBe('Test Carousel 1')
        done()
      })
    }, 100)
  })

  it('should get carousel by id successfully', done => {
    setTimeout(() => {
      service.getCarouselById('carousel-0').subscribe(carousel => {
        expect(carousel).toBeDefined()
        expect(carousel?.id).toBe('carousel-0')
        expect(carousel?.header).toBe('Test Carousel 1')
        expect(carousel?.items.length).toBe(2)
        done()
      })
    }, 100)
  })

  it('should return undefined for non-existent carousel id', done => {
    setTimeout(() => {
      service.getCarouselById('non-existent-id').subscribe(carousel => {
        expect(carousel).toBeUndefined()
        done()
      })
    }, 100)
  })

  it('should handle missing photo types gracefully', async () => {
    const apiResponseWithMissingPhotos: ApiResponse = {
      ...mockApiResponse,
      data: {
        ...mockApiResponse.data,
        category: {
          ...mockApiResponse.data.category,
          frontPage: [
            {
              header: 'Test Carousel Missing Photos',
              headerUrl: 'https://example.com/carousel',
              highTimeline: true,
              liveBlock: false,
              manual: {
                highTimeline: true,
                banner: false
              },
              data: [
                {
                  id: 999,
                  heading: 'Item Without Photos',
                  primaryCategoryId: 1,
                  type: 'article',
                  parentContentPath: '/test',
                  scheduleStart: Date.now(),
                  subHeading: 'Test Sub',
                  hasActiveMedia: false,
                  rootContentId: 999,
                  rootCategoryId: 1,
                  canonicalUrl: 'https://example.com/no-photos',
                  fancyUrl: 'https://example.com/fancy-no-photos',
                  anotherDomainContent: false,
                  verticalPhotos: [] // Empty photos array
                }
              ]
            }
          ]
        }
      }
    }

    window.fetch = jasmine.createSpy('fetch').and.returnValue(
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(apiResponseWithMissingPhotos)
      } as Response)
    )

    await service.loadCarousels()

    service.carousels$
      .subscribe(carousels => {
        expect(carousels.length).toBe(1)
        expect(carousels[0].items.length).toBe(1)
        expect(carousels[0].items[0].images.small).toBe('')
        expect(carousels[0].items[0].images.large).toBe('')
      })
      .unsubscribe()
  })

  it('should handle missing heading gracefully', async () => {
    const apiResponseWithMissingHeading: ApiResponse = {
      ...mockApiResponse,
      data: {
        ...mockApiResponse.data,
        category: {
          ...mockApiResponse.data.category,
          frontPage: [
            {
              header: 'Test Carousel Missing Heading',
              headerUrl: 'https://example.com/carousel',
              highTimeline: true,
              liveBlock: false,
              manual: {
                highTimeline: true,
                banner: false
              },
              data: [
                {
                  id: 888,
                  heading: '', // Empty heading
                  primaryCategoryId: 1,
                  type: 'article',
                  parentContentPath: '/test',
                  scheduleStart: Date.now(),
                  subHeading: 'Test Sub',
                  hasActiveMedia: false,
                  rootContentId: 888,
                  rootCategoryId: 1,
                  canonicalUrl: '',
                  fancyUrl: '',
                  anotherDomainContent: false,
                  verticalPhotos: []
                }
              ]
            }
          ]
        }
      }
    }

    window.fetch = jasmine.createSpy('fetch').and.returnValue(
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(apiResponseWithMissingHeading)
      } as Response)
    )

    await service.loadCarousels()

    service.carousels$
      .subscribe(carousels => {
        expect(carousels.length).toBe(1)
        expect(carousels[0].items.length).toBe(1)
        expect(carousels[0].items[0].heading).toBe('Untitled')
      })
      .unsubscribe()
  })

  it('should filter out sections with highTimeline false', async () => {
    const apiResponseWithFilteredSections: ApiResponse = {
      ...mockApiResponse,
      data: {
        ...mockApiResponse.data,
        category: {
          ...mockApiResponse.data.category,
          frontPage: [
            {
              header: 'Visible Carousel',
              headerUrl: 'https://example.com/visible',
              highTimeline: true,
              liveBlock: false,
              manual: { highTimeline: true, banner: false },
              data: [
                {
                  id: 100,
                  heading: 'Visible Item',
                  primaryCategoryId: 1,
                  type: 'article',
                  parentContentPath: '/test',
                  scheduleStart: Date.now(),
                  subHeading: 'Visible Sub',
                  hasActiveMedia: false,
                  rootContentId: 100,
                  rootCategoryId: 1,
                  canonicalUrl: 'https://example.com/visible',
                  fancyUrl: 'https://example.com/visible-fancy',
                  anotherDomainContent: false,
                  verticalPhotos: []
                }
              ]
            },
            {
              header: 'Hidden Carousel',
              headerUrl: 'https://example.com/hidden',
              highTimeline: false, // Should be filtered out
              liveBlock: false,
              manual: { highTimeline: false, banner: false },
              data: [
                {
                  id: 200,
                  heading: 'Hidden Item',
                  primaryCategoryId: 1,
                  type: 'article',
                  parentContentPath: '/test',
                  scheduleStart: Date.now(),
                  subHeading: 'Hidden Sub',
                  hasActiveMedia: false,
                  rootContentId: 200,
                  rootCategoryId: 1,
                  canonicalUrl: 'https://example.com/hidden',
                  fancyUrl: 'https://example.com/hidden-fancy',
                  anotherDomainContent: false,
                  verticalPhotos: []
                }
              ]
            }
          ]
        }
      }
    }

    window.fetch = jasmine.createSpy('fetch').and.returnValue(
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(apiResponseWithFilteredSections)
      } as Response)
    )

    await service.loadCarousels()

    service.carousels$
      .subscribe(carousels => {
        expect(carousels.length).toBe(1) // Only the visible carousel
        expect(carousels[0].header).toBe('Visible Carousel')
        expect(carousels[0].items[0].heading).toBe('Visible Item')
      })
      .unsubscribe()
  })

  it('should handle unknown error types', async () => {
    window.fetch = jasmine
      .createSpy('fetch')
      .and.returnValue(Promise.reject('String error instead of Error object'))

    await service.loadCarousels()

    service.error$
      .subscribe(error => {
        expect(error).toBe(
          'An unknown error occurred while loading carousel data'
        )
      })
      .unsubscribe()
  })

  it('should call fetch with correct URL from environment', async () => {
    const fetchSpy = jasmine.createSpy('fetch').and.returnValue(
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockApiResponse)
      } as Response)
    )
    window.fetch = fetchSpy

    await service.loadCarousels()

    // Should call fetch with the environment's API URL
    expect(fetchSpy).toHaveBeenCalled()
    const callArgs = fetchSpy.calls.mostRecent().args
    expect(callArgs[0]).toMatch(/assets\/sample\/jupiter\.json$/)
  })
})
