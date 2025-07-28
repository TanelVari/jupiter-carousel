import { TestBed } from '@angular/core/testing'
import { CarouselService } from './carousel.service'
import { CarouselItem } from '../interfaces/carousel.interface'

describe('CarouselService', () => {
  let service: CarouselService

  beforeEach(() => {
    TestBed.configureTestingModule({})
    service = TestBed.inject(CarouselService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should initialize with default items', done => {
    service.getItems().subscribe((items: CarouselItem[]) => {
      expect(items).toBeDefined()
      expect(items.length).toBe(3)
      expect(items[0].isActive).toBe(true)
      expect(items[1].isActive).toBe(false)
      expect(items[2].isActive).toBe(false)
      done()
    })
  })

  it('should set active item correctly', done => {
    service.setActiveItem('2')

    service.getItems().subscribe((items: CarouselItem[]) => {
      const activeItem = items.find(item => item.isActive)
      expect(activeItem?.id).toBe('2')

      const inactiveItems = items.filter(item => !item.isActive)
      expect(inactiveItems.length).toBe(2)
      done()
    })
  })

  it('should return observable stream', () => {
    const items$ = service.getItems()
    expect(items$).toBeDefined()
    expect(typeof items$.subscribe).toBe('function')
  })
})
