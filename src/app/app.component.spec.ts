import { ComponentFixture, TestBed } from '@angular/core/testing'
import { By } from '@angular/platform-browser'
import { Component, Input } from '@angular/core'
import { BehaviorSubject, throwError } from 'rxjs'
import { AppComponent } from './app.component'
import { CarouselService } from './services/carousel.service'
import { ProcessedCarousel } from './interfaces/api.interface'

// Mock carousel component for testing
@Component({
  selector: 'app-carousel',
  standalone: false,
  template:
    '<div data-testid="carousel">Mock Carousel: {{carouselHeader}}</div>'
})
class MockCarouselComponent {
  @Input() carouselHeader: string = ''
}

describe('AppComponent', () => {
  let component: AppComponent
  let fixture: ComponentFixture<AppComponent>
  let mockCarouselService: jasmine.SpyObj<CarouselService>
  let carouselsSubject: BehaviorSubject<ProcessedCarousel[]>

  const mockCarousels: ProcessedCarousel[] = [
    {
      id: 'carousel-1',
      header: 'Test Carousel 1',
      items: [
        {
          id: '1',
          heading: 'Test Item 1',
          canonicalUrl: 'https://example.com/item1',
          images: {
            small: 'https://example.com/small1.jpg',
            large: 'https://example.com/large1.jpg'
          }
        }
      ]
    },
    {
      id: 'carousel-2',
      header: 'Test Carousel 2',
      items: [
        {
          id: '2',
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

  beforeEach(async () => {
    // Create BehaviorSubject for carousels to control emission timing
    carouselsSubject = new BehaviorSubject<ProcessedCarousel[]>([])

    // Create spy object for CarouselService
    mockCarouselService = jasmine.createSpyObj('CarouselService', [
      'getCarousels',
      'getItems',
      'selectCarousel',
      'getLoading',
      'getError',
      'retryLoading'
    ])

    // Set up spy return values
    mockCarouselService.getCarousels.and.returnValue(
      carouselsSubject.asObservable()
    )

    await TestBed.configureTestingModule({
      declarations: [AppComponent, MockCarouselComponent],
      providers: [{ provide: CarouselService, useValue: mockCarouselService }]
    }).compileComponents()

    fixture = TestBed.createComponent(AppComponent)
    component = fixture.componentInstance
  })

  afterEach(() => {
    carouselsSubject.complete()
  })

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy()
    })

    it('should have the correct title', () => {
      expect(component.title).toBe('Jupiter Carousel')
    })

    it('should initialize with empty carouselHeader', () => {
      expect(component.carouselHeader).toBe('')
    })

    it('should call CarouselService.getCarousels on init', () => {
      fixture.detectChanges() // This triggers ngOnInit
      expect(mockCarouselService.getCarousels).toHaveBeenCalled()
    })
  })

  describe('Carousel Header Management', () => {
    it('should set carouselHeader to first carousel header when carousels are loaded', () => {
      fixture.detectChanges() // Trigger ngOnInit

      // Emit carousels data
      carouselsSubject.next(mockCarousels)

      expect(component.carouselHeader).toBe('Test Carousel 1')
    })

    it('should not change carouselHeader when empty carousels array is received', () => {
      fixture.detectChanges() // Trigger ngOnInit

      // Emit empty carousels
      carouselsSubject.next([])

      expect(component.carouselHeader).toBe('')
    })

    it('should update carouselHeader when new carousels are received', () => {
      fixture.detectChanges() // Trigger ngOnInit

      // First emit
      carouselsSubject.next(mockCarousels)
      expect(component.carouselHeader).toBe('Test Carousel 1')

      // Second emit with different data
      const newCarousels: ProcessedCarousel[] = [
        {
          id: 'new-carousel',
          header: 'New Carousel Header',
          items: []
        }
      ]
      carouselsSubject.next(newCarousels)
      expect(component.carouselHeader).toBe('New Carousel Header')
    })

    it('should handle carousels with only one item correctly', () => {
      fixture.detectChanges() // Trigger ngOnInit

      const singleCarousel: ProcessedCarousel[] = [
        {
          id: 'single-carousel',
          header: 'Single Carousel',
          items: []
        }
      ]
      carouselsSubject.next(singleCarousel)

      expect(component.carouselHeader).toBe('Single Carousel')
    })
  })

  describe('Template Integration', () => {
    it('should render the carousel component', () => {
      fixture.detectChanges()

      const carouselComponent = fixture.debugElement.query(
        By.directive(MockCarouselComponent)
      )
      expect(carouselComponent).toBeTruthy()
    })

    it('should pass carouselHeader to carousel component', () => {
      fixture.detectChanges()

      // Emit carousel data to set the header
      carouselsSubject.next(mockCarousels)
      fixture.detectChanges()

      const carouselComponent = fixture.debugElement.query(
        By.directive(MockCarouselComponent)
      )
      const carouselInstance =
        carouselComponent.componentInstance as MockCarouselComponent

      expect(carouselInstance.carouselHeader).toBe('Test Carousel 1')
    })

    it('should have correct CSS classes applied', () => {
      fixture.detectChanges()

      const rootDiv = fixture.debugElement.query(
        By.css('.min-h-screen.bg-gray-50')
      )
      expect(rootDiv).toBeTruthy()
    })

    it('should update carousel component when carouselHeader changes', () => {
      fixture.detectChanges()

      // Initial state
      let carouselComponent = fixture.debugElement.query(
        By.directive(MockCarouselComponent)
      )
      let carouselInstance =
        carouselComponent.componentInstance as MockCarouselComponent
      expect(carouselInstance.carouselHeader).toBe('')

      // Emit data and detect changes
      carouselsSubject.next(mockCarousels)
      fixture.detectChanges()

      carouselComponent = fixture.debugElement.query(
        By.directive(MockCarouselComponent)
      )
      carouselInstance =
        carouselComponent.componentInstance as MockCarouselComponent
      expect(carouselInstance.carouselHeader).toBe('Test Carousel 1')
    })
  })

  describe('Lifecycle Management', () => {
    it('should properly clean up subscriptions on destroy', () => {
      fixture.detectChanges() // Trigger ngOnInit

      // Spy on the destroy$ subject
      spyOn(component['destroy$'], 'next')
      spyOn(component['destroy$'], 'complete')

      // Trigger destroy
      component.ngOnDestroy()

      expect(component['destroy$'].next).toHaveBeenCalled()
      expect(component['destroy$'].complete).toHaveBeenCalled()
    })

    it('should not receive carousel updates after destroy', () => {
      fixture.detectChanges() // Trigger ngOnInit

      // Destroy the component
      component.ngOnDestroy()

      // Try to emit new data
      const initialHeader = component.carouselHeader
      carouselsSubject.next(mockCarousels)

      // Header should not change
      expect(component.carouselHeader).toBe(initialHeader)
    })

    it('should handle multiple destroy calls gracefully', () => {
      fixture.detectChanges()

      expect(() => {
        component.ngOnDestroy()
        component.ngOnDestroy() // Second call should not throw
      }).not.toThrow()
    })
  })

  describe('Error Handling', () => {
    it('should handle service errors gracefully', () => {
      // Make getCarousels return an error
      mockCarouselService.getCarousels.and.returnValue(
        throwError('Service error')
      )

      expect(() => {
        fixture.detectChanges() // This should not throw
      }).not.toThrow()

      // Component should still be in a valid state
      expect(component.carouselHeader).toBe('')
    })

    it('should handle null/undefined carousels gracefully', () => {
      fixture.detectChanges()

      // This should not cause errors
      carouselsSubject.next(null as any)
      expect(component.carouselHeader).toBe('')

      carouselsSubject.next(undefined as any)
      expect(component.carouselHeader).toBe('')
    })

    it('should handle carousels with missing headers', () => {
      fixture.detectChanges()

      const carouselsWithMissingHeader: ProcessedCarousel[] = [
        {
          id: 'carousel-no-header',
          header: '', // Empty header
          items: []
        }
      ]

      carouselsSubject.next(carouselsWithMissingHeader)
      expect(component.carouselHeader).toBe('')
    })
  })

  describe('Integration Tests', () => {
    it('should complete the full lifecycle from init to destroy', () => {
      // Initialize
      fixture.detectChanges()
      expect(component.carouselHeader).toBe('')

      // Receive data
      carouselsSubject.next(mockCarousels)
      expect(component.carouselHeader).toBe('Test Carousel 1')

      // Update data
      const updatedCarousels: ProcessedCarousel[] = [
        {
          id: 'updated-carousel',
          header: 'Updated Header',
          items: []
        }
      ]
      carouselsSubject.next(updatedCarousels)
      expect(component.carouselHeader).toBe('Updated Header')

      // Destroy
      expect(() => component.ngOnDestroy()).not.toThrow()
    })

    it('should handle rapid carousel updates correctly', () => {
      fixture.detectChanges()

      // Rapid updates
      const updates = [
        [{ id: '1', header: 'Header 1', items: [] }],
        [{ id: '2', header: 'Header 2', items: [] }],
        [{ id: '3', header: 'Header 3', items: [] }]
      ]

      updates.forEach(carousels => {
        carouselsSubject.next(carousels as ProcessedCarousel[])
      })

      // Should have the last update
      expect(component.carouselHeader).toBe('Header 3')
    })

    it('should maintain state consistency throughout component lifecycle', () => {
      fixture.detectChanges()

      // Verify initial state
      expect(component.title).toBe('Jupiter Carousel')
      expect(component.carouselHeader).toBe('')
      expect(mockCarouselService.getCarousels).toHaveBeenCalled()

      // Update state
      carouselsSubject.next(mockCarousels)
      expect(component.carouselHeader).toBe('Test Carousel 1')

      // Title should remain unchanged
      expect(component.title).toBe('Jupiter Carousel')

      // Service should have been called once
      expect(mockCarouselService.getCarousels).toHaveBeenCalledTimes(1)
    })
  })

  describe('Accessibility and Performance', () => {
    it('should not cause memory leaks by properly unsubscribing', () => {
      fixture.detectChanges()

      const subscription = component['destroy$']
      spyOn(subscription, 'next')
      spyOn(subscription, 'complete')

      component.ngOnDestroy()

      expect(subscription.next).toHaveBeenCalled()
      expect(subscription.complete).toHaveBeenCalled()
    })

    it('should handle component reinitialization correctly', () => {
      // First initialization
      fixture.detectChanges()
      carouselsSubject.next(mockCarousels)
      expect(component.carouselHeader).toBe('Test Carousel 1')

      // Simulate reinitialization
      component.ngOnDestroy()

      // Reset and reinitialize
      component.carouselHeader = ''
      component.ngOnInit()

      // Should work correctly again
      carouselsSubject.next([
        { id: 'new', header: 'New After Reinit', items: [] }
      ] as ProcessedCarousel[])

      expect(component.carouselHeader).toBe('New After Reinit')
    })
  })
})
