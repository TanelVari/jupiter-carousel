import { ComponentFixture, TestBed } from '@angular/core/testing'
import { CarouselComponent } from './carousel.component'
import { CarouselService } from '../../services/carousel.service'
import { of } from 'rxjs'
import { CarouselItem } from '../../interfaces/carousel.interface'

describe('CarouselComponent', () => {
  let component: CarouselComponent
  let fixture: ComponentFixture<CarouselComponent>
  let mockCarouselService: jasmine.SpyObj<CarouselService>

  const mockItems: CarouselItem[] = [
    {
      id: '1',
      title: 'Test Slide 1',
      description: 'Test description 1',
      imageUrl: 'test-image-1.jpg',
      isActive: true
    },
    {
      id: '2',
      title: 'Test Slide 2',
      description: 'Test description 2',
      imageUrl: 'test-image-2.jpg',
      isActive: false
    }
  ]

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('CarouselService', [
      'getItems',
      'setActiveItem'
    ])

    await TestBed.configureTestingModule({
      declarations: [CarouselComponent],
      providers: [{ provide: CarouselService, useValue: spy }]
    }).compileComponents()

    fixture = TestBed.createComponent(CarouselComponent)
    component = fixture.componentInstance
    mockCarouselService = TestBed.inject(
      CarouselService
    ) as jasmine.SpyObj<CarouselService>

    mockCarouselService.getItems.and.returnValue(of(mockItems))
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
