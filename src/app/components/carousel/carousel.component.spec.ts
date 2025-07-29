import { ComponentFixture, TestBed } from '@angular/core/testing'
import { CarouselComponent } from './carousel.component'
import { CarouselService } from '../../services/carousel.service'
import { ApiService } from '../../services/api.service'
import { of } from 'rxjs'
import { CarouselItem } from '../../interfaces/carousel.interface'
import { ProcessedCarousel } from '../../interfaces/api.interface'

describe('CarouselComponent', () => {
  let component: CarouselComponent
  let fixture: ComponentFixture<CarouselComponent>
  let mockCarouselService: jasmine.SpyObj<CarouselService>
  let mockApiService: jasmine.SpyObj<ApiService>

  const mockItems: CarouselItem[] = [
    {
      id: '1',
      heading: 'Test Slide 1',
      description: 'Test description 1',
      imageUrl: 'test-image-1.jpg',
      isActive: true
    },
    {
      id: '2',
      heading: 'Test Slide 2',
      description: 'Test description 2',
      imageUrl: 'test-image-2.jpg',
      isActive: false
    }
  ]

  const mockCarousels: ProcessedCarousel[] = [
    {
      id: 'test-carousel',
      header: 'Test Carousel',
      items: []
    }
  ]

  beforeEach(async () => {
    const carouselSpy = jasmine.createSpyObj('CarouselService', [
      'getItems',
      'setActiveItem',
      'getCarousels',
      'getLoading',
      'getError'
    ])
    const apiSpy = jasmine.createSpyObj('ApiService', ['getCarousels'])

    await TestBed.configureTestingModule({
      declarations: [CarouselComponent],
      providers: [
        { provide: CarouselService, useValue: carouselSpy },
        { provide: ApiService, useValue: apiSpy }
      ]
    }).compileComponents()

    fixture = TestBed.createComponent(CarouselComponent)
    component = fixture.componentInstance
    mockCarouselService = TestBed.inject(
      CarouselService
    ) as jasmine.SpyObj<CarouselService>
    mockApiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>

    mockCarouselService.getItems.and.returnValue(of(mockItems))
    mockCarouselService.getCarousels.and.returnValue(of(mockCarousels))
    mockCarouselService.getLoading.and.returnValue(of(false))
    mockCarouselService.getError.and.returnValue(of(null))
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize items$ from service', () => {
    expect(mockCarouselService.getItems).toHaveBeenCalled()
    expect(component.items$).toBeDefined()
  })

  it('should call setActiveItem when onSlideChange is triggered', () => {
    const testId = '2'
    component.onSlideChange(testId)

    expect(mockCarouselService.setActiveItem).toHaveBeenCalledWith(testId)
  })

  it('should render carousel items', async () => {
    fixture.detectChanges()
    await fixture.whenStable()

    const compiled = fixture.nativeElement as HTMLElement
    const carouselContainer = compiled.querySelector('.relative.w-full')

    expect(carouselContainer).toBeTruthy()
  })
})
