import { ComponentFixture, TestBed } from '@angular/core/testing'
import { By } from '@angular/platform-browser'
import { Component, Input } from '@angular/core'
import { BehaviorSubject } from 'rxjs'
import { AppComponent } from './app.component'
import { CarouselService } from './services/carousel.service'
import {
  ProcessedCarousel,
  ProcessedCarouselItem
} from './interfaces/api.interface'

// Mock carousel component for testing
@Component({
  selector: 'app-carousel',
  standalone: false,
  template:
    '<div data-testid="carousel">Mock Carousel: {{carouselHeader}} - Items: {{carouselItems?.length || 0}} - Index: {{carouselIndex}}</div>'
})
class MockCarouselComponent {
  @Input() carouselHeader: string = ''
  @Input() carouselItems: ProcessedCarouselItem[] = []
  @Input() carouselIndex: number = 0
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

    // Set up default mock behavior
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

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy()
    })

    it('should have the correct title', () => {
      expect(component.title).toBe('Jupiter Carousel')
    })

    it('should initialize with empty carousels array', () => {
      expect(component.carousels).toEqual([])
    })

    it('should call CarouselService.getCarousels on init', () => {
      component.ngOnInit()
      expect(mockCarouselService.getCarousels).toHaveBeenCalled()
    })
  })

  describe('Multiple Carousels Management', () => {
    it('should populate carousels array when carousels are loaded', () => {
      component.ngOnInit()
      carouselsSubject.next(mockCarousels)
      fixture.detectChanges()

      expect(component.carousels).toEqual(mockCarousels)
    })

    it('should handle empty carousels array', () => {
      component.ngOnInit()
      carouselsSubject.next([])
      fixture.detectChanges()

      expect(component.carousels).toEqual([])
    })

    it('should update carousels when new data is received', () => {
      component.ngOnInit()
      carouselsSubject.next(mockCarousels)
      fixture.detectChanges()

      const newCarousels: ProcessedCarousel[] = [
        {
          id: 'new-carousel',
          header: 'New Carousel Header',
          items: []
        }
      ]

      carouselsSubject.next(newCarousels)
      fixture.detectChanges()

      expect(component.carousels).toEqual(newCarousels)
    })
  })

  describe('Template Integration', () => {
    it('should render multiple carousel components', () => {
      component.ngOnInit()
      carouselsSubject.next(mockCarousels)
      fixture.detectChanges()

      const carouselElements = fixture.debugElement.queryAll(
        By.directive(MockCarouselComponent)
      )
      expect(carouselElements.length).toBe(2)
    })

    it('should pass correct header and items to each carousel component', () => {
      component.ngOnInit()
      carouselsSubject.next(mockCarousels)
      fixture.detectChanges()

      const carouselComponents = fixture.debugElement.queryAll(
        By.directive(MockCarouselComponent)
      )

      expect(carouselComponents[0].componentInstance.carouselHeader).toBe(
        'Test Carousel 1'
      )
      expect(carouselComponents[0].componentInstance.carouselItems).toEqual(
        mockCarousels[0].items
      )
      expect(carouselComponents[0].componentInstance.carouselIndex).toBe(0)

      expect(carouselComponents[1].componentInstance.carouselHeader).toBe(
        'Test Carousel 2'
      )
      expect(carouselComponents[1].componentInstance.carouselItems).toEqual(
        mockCarousels[1].items
      )
      expect(carouselComponents[1].componentInstance.carouselIndex).toBe(1)
    })

    it('should show loading state when no carousels are available', () => {
      component.ngOnInit()
      fixture.detectChanges()

      const loadingText = fixture.nativeElement.textContent
      expect(loadingText).toContain('Loading carousels...')
    })
  })

  describe('Lifecycle Management', () => {
    it('should properly clean up subscriptions on destroy', () => {
      component.ngOnInit()
      const destroySpy = spyOn(component['destroy$'], 'next')
      const completeeSpy = spyOn(component['destroy$'], 'complete')

      component.ngOnDestroy()

      expect(destroySpy).toHaveBeenCalled()
      expect(completeeSpy).toHaveBeenCalled()
    })
  })
})
