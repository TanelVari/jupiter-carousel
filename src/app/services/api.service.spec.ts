import { TestBed } from '@angular/core/testing'
import { ApiService } from './api.service'
import { ProcessedCarousel } from '../interfaces/api.interface'

describe('ApiService', () => {
  let service: ApiService

  beforeEach(() => {
    TestBed.configureTestingModule({})
    service = TestBed.inject(ApiService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should have initial empty carousels', done => {
    service.getCarousels().subscribe((carousels: ProcessedCarousel[]) => {
      expect(carousels).toBeDefined()
      expect(Array.isArray(carousels)).toBe(true)
      done()
    })
  })

  it('should handle loading state', done => {
    service.loading$.subscribe((loading: boolean) => {
      expect(typeof loading).toBe('boolean')
      done()
    })
  })

  it('should handle error state', done => {
    service.error$.subscribe((error: string | null) => {
      expect(error === null || typeof error === 'string').toBe(true)
      done()
    })
  })

  it('should set active item correctly', () => {
    const testCarouselId = 'test-carousel'
    const testItemId = 'test-item'

    expect(() => {
      service.setActiveItem(testCarouselId, testItemId)
    }).not.toThrow()
  })

  it('should have retry functionality', () => {
    expect(() => {
      service.retryLoading()
    }).not.toThrow()
  })

  it('should get carousel by id', done => {
    const testId = 'nonexistent-id'
    service.getCarouselById(testId).subscribe(carousel => {
      expect(carousel).toBeUndefined()
      done()
    })
  })
})
