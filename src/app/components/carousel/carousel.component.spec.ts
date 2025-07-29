import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ChangeDetectorRef } from '@angular/core'
import { of } from 'rxjs'

import { CarouselComponent } from './carousel.component'
import { CarouselService } from '../../services/carousel.service'
import { CarouselItem } from '../../interfaces/carousel.interface'

describe('CarouselComponent', () => {
  let component: CarouselComponent
  let fixture: ComponentFixture<CarouselComponent>
  let mockCarouselService: jasmine.SpyObj<CarouselService>
  let mockChangeDetector: jasmine.SpyObj<ChangeDetectorRef>

  const mockCarouselItems: CarouselItem[] = [
    {
      id: '1',
      heading: 'Item 1',
      canonicalUrl: 'https://example.com/item1',
      images: { small: 'image1_small.jpg', large: 'image1_large.jpg' }
    },
    {
      id: '2',
      heading: 'Item 2',
      canonicalUrl: 'https://example.com/item2',
      images: { small: 'image2_small.jpg', large: 'image2_large.jpg' }
    },
    {
      id: '3',
      heading: 'Item 3',
      canonicalUrl: 'https://example.com/item3',
      images: { small: 'image3_small.jpg', large: 'image3_large.jpg' }
    },
    {
      id: '4',
      heading: 'Item 4',
      canonicalUrl: 'https://example.com/item4',
      images: { small: 'image4_small.jpg', large: 'image4_large.jpg' }
    },
    {
      id: '5',
      heading: 'Item 5',
      canonicalUrl: 'https://example.com/item5',
      images: { small: 'image5_small.jpg', large: 'image5_large.jpg' }
    }
  ]

  beforeEach(async () => {
    mockCarouselService = jasmine.createSpyObj('CarouselService', ['getItems'])
    mockCarouselService.getItems.and.returnValue(of(mockCarouselItems))

    mockChangeDetector = jasmine.createSpyObj('ChangeDetectorRef', [
      'detectChanges'
    ])

    await TestBed.configureTestingModule({
      declarations: [CarouselComponent],
      providers: [
        { provide: CarouselService, useValue: mockCarouselService },
        { provide: ChangeDetectorRef, useValue: mockChangeDetector }
      ]
    }).compileComponents()

    fixture = TestBed.createComponent(CarouselComponent)
    component = fixture.componentInstance

    // Mock window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1200
    })

    fixture.detectChanges()
  })

  afterEach(() => {
    TestBed.resetTestingModule()
  })

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy()
    })

    it('should initialize with default values', () => {
      expect(component.anchorItemIndex).toBe(0)
      // Values will be set by updateItemsPerPage() based on window.innerWidth (1200)
      expect(component.itemsPerPage).toBe(4) // 1200px width = 4 items per page
      expect(component.containerPadding).toBe(64)
      expect(component.itemGap).toBe(8) // 1200px width = 8px gap
    })

    it('should subscribe to carousel items on init', () => {
      expect(component.items).toEqual(mockCarouselItems)
      expect(mockCarouselService.getItems).toHaveBeenCalled()
    })

    it('should set carousel header input', () => {
      component.carouselHeader = 'Test Header'
      expect(component.carouselHeader).toBe('Test Header')
    })
  })

  describe('Responsive Behavior', () => {
    it('should calculate 2 items per page for mobile screens', () => {
      Object.defineProperty(window, 'innerWidth', { value: 500 })
      component['updateItemsPerPage']()
      expect(component.itemsPerPage).toBe(2)
      expect(component.containerPadding).toBe(32)
      expect(component.itemGap).toBe(4)
    })

    it('should calculate 3 items per page for tablet screens', () => {
      Object.defineProperty(window, 'innerWidth', { value: 800 })
      component['updateItemsPerPage']()
      expect(component.itemsPerPage).toBe(3)
      expect(component.containerPadding).toBe(64)
      expect(component.itemGap).toBe(8)
    })

    it('should calculate 4 items per page for small desktop screens', () => {
      Object.defineProperty(window, 'innerWidth', { value: 1000 })
      component['updateItemsPerPage']()
      expect(component.itemsPerPage).toBe(4)
    })

    it('should calculate 6 items per page for large desktop screens', () => {
      Object.defineProperty(window, 'innerWidth', { value: 1600 })
      component['updateItemsPerPage']()
      expect(component.itemsPerPage).toBe(6)
    })

    it('should calculate 7 items per page for very large screens', () => {
      Object.defineProperty(window, 'innerWidth', { value: 2000 })
      component['updateItemsPerPage']()
      expect(component.itemsPerPage).toBe(7)
    })

    it('should recalculate layout on window resize', () => {
      spyOn(component as any, 'updateItemsPerPage')
      spyOn(component as any, 'updateCSSVariables')
      spyOn(component as any, 'updateCachedValues')

      // Create a fresh spy for detectChanges to avoid interference from initialization
      const detectChangesSpy = spyOn(component['cdr'], 'detectChanges')

      component.onResize()

      expect(component['updateItemsPerPage']).toHaveBeenCalled()
      expect(component['updateCSSVariables']).toHaveBeenCalled()
      expect(component['updateCachedValues']).toHaveBeenCalled()
      expect(detectChangesSpy).toHaveBeenCalled()
    })

    it('should handle resize timeout properly', done => {
      component.onResize()
      expect(component.isResizing).toBe(true)

      setTimeout(() => {
        expect(component.isResizing).toBe(false)
        done()
      }, 600)
    })
  })

  describe('Scroll Navigation', () => {
    beforeEach(() => {
      component.itemsPerPage = 3
      component['updateCachedValues']()
    })

    it('should scroll left when scrollLeft is called', () => {
      component.anchorItemIndex = 3
      component.scrollLeft()
      expect(component.anchorItemIndex).toBe(0)
    })

    it('should not scroll left when at the beginning', () => {
      component.anchorItemIndex = 0
      component.scrollLeft()
      expect(component.anchorItemIndex).toBe(0)
    })

    it('should scroll right when scrollRight is called', () => {
      component.anchorItemIndex = 0
      component.scrollRight()
      expect(component.anchorItemIndex).toBe(2) // items.length - itemsPerPage = 5 - 3 = 2
    })

    it('should not scroll right when at the end', () => {
      const maxAnchor = component.items.length - component.itemsPerPage
      component.anchorItemIndex = maxAnchor
      component.scrollRight()
      expect(component.anchorItemIndex).toBe(maxAnchor)
    })

    it('should determine canScrollLeft correctly', () => {
      component.anchorItemIndex = 0
      expect(component.canScrollLeft).toBe(false)

      component.anchorItemIndex = 1
      expect(component.canScrollLeft).toBe(true)
    })

    it('should determine canScrollRight correctly', () => {
      component.anchorItemIndex = 0
      expect(component.canScrollRight).toBe(true)

      const maxAnchor = component.items.length - component.itemsPerPage
      component.anchorItemIndex = maxAnchor
      expect(component.canScrollRight).toBe(false)
    })
  })

  describe('Keyboard Navigation', () => {
    it('should scroll left on ArrowLeft key', () => {
      spyOn(component, 'scrollLeft')
      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' })
      component.handleKeyDown(event)
      expect(component.scrollLeft).toHaveBeenCalled()
    })

    it('should scroll right on ArrowRight key', () => {
      spyOn(component, 'scrollRight')
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' })
      component.handleKeyDown(event)
      expect(component.scrollRight).toHaveBeenCalled()
    })

    it('should not scroll on other keys', () => {
      spyOn(component, 'scrollLeft')
      spyOn(component, 'scrollRight')
      const event = new KeyboardEvent('keydown', { key: 'Enter' })
      component.handleKeyDown(event)
      expect(component.scrollLeft).not.toHaveBeenCalled()
      expect(component.scrollRight).not.toHaveBeenCalled()
    })
  })

  describe('Item Display and Opacity', () => {
    beforeEach(() => {
      component.itemsPerPage = 3
    })

    it('should return all items in visibleItems', () => {
      expect(component.visibleItems).toEqual(mockCarouselItems)
    })

    it('should calculate item opacity correctly for main items', () => {
      component.anchorItemIndex = 1
      expect(component.getItemOpacity(1)).toBe(false) // Main item
      expect(component.getItemOpacity(2)).toBe(false) // Main item
      expect(component.getItemOpacity(3)).toBe(false) // Main item
    })

    it('should calculate item opacity correctly for preview items', () => {
      component.anchorItemIndex = 1
      expect(component.getItemOpacity(0)).toBe(true) // Left preview
      expect(component.getItemOpacity(4)).toBe(true) // Right preview
    })

    it('should handle opacity calculation at boundaries', () => {
      component.anchorItemIndex = 0
      expect(component.getItemOpacity(0)).toBe(false) // Main item at start
      expect(component.getItemOpacity(3)).toBe(true) // Right preview

      const maxAnchor = component.items.length - component.itemsPerPage
      component.anchorItemIndex = maxAnchor
      expect(component.getItemOpacity(1)).toBe(true) // Left preview
      expect(component.getItemOpacity(4)).toBe(false) // Main item at end
    })
  })

  describe('CSS and Transform Calculations', () => {
    beforeEach(() => {
      component.itemsPerPage = 3
      spyOn(component as any, 'calculateItemWidth').and.returnValue(200)
      component['updateCachedValues']()
    })

    it('should calculate correct transform value for first page', () => {
      component.anchorItemIndex = 0
      component['updateCachedValues']()
      const transform = component.getCarouselTransform()
      expect(transform).toBe('translateX(0px)')
    })

    it('should calculate transform for other pages', () => {
      component.anchorItemIndex = 1
      component['updateCachedValues']()
      const transform = component.getCarouselTransform()
      expect(transform).toMatch(/translateX\(-?\d+\.?\d*px\)/)
    })

    it('should return item width as string', () => {
      const width = component.getItemWidth()
      expect(width).toMatch(/\d+px/)
    })

    it('should update CSS variables', () => {
      spyOn(document.documentElement.style, 'setProperty')
      component['updateCSSVariables']()

      expect(document.documentElement.style.setProperty).toHaveBeenCalledWith(
        '--nr-of-items',
        '3'
      )
      expect(document.documentElement.style.setProperty).toHaveBeenCalledWith(
        '--container-padding',
        '64px'
      )
      expect(document.documentElement.style.setProperty).toHaveBeenCalledWith(
        '--item-gap',
        '8px' // Expected 8px based on component's current itemGap
      )
    })
  })

  describe('Image Handling', () => {
    const testItem = mockCarouselItems[0]

    it('should return small image for mobile screens', () => {
      Object.defineProperty(window, 'innerWidth', { value: 500 })
      const imageUrl = component.getImageUrl(testItem)
      expect(imageUrl).toBe(testItem.images.small)
    })

    it('should return large image for desktop screens', () => {
      Object.defineProperty(window, 'innerWidth', { value: 1200 })
      const imageUrl = component.getImageUrl(testItem)
      expect(imageUrl).toBe(testItem.images.large)
    })

    it('should return appropriate image sizes for different screen widths', () => {
      Object.defineProperty(window, 'innerWidth', { value: 2000 })
      let sizes = component.getImageSizes()
      expect(sizes).toContain('calc((100vw - 64px - 144px) / 7)')

      Object.defineProperty(window, 'innerWidth', { value: 1500 })
      sizes = component.getImageSizes()
      expect(sizes).toContain('calc((100vw - 64px - 120px) / 6)')

      Object.defineProperty(window, 'innerWidth', { value: 1000 })
      sizes = component.getImageSizes()
      expect(sizes).toContain('calc((100vw - 64px - 60px) / 4)')

      Object.defineProperty(window, 'innerWidth', { value: 800 })
      sizes = component.getImageSizes()
      expect(sizes).toContain('calc((100vw - 64px - 32px) / 3)')

      Object.defineProperty(window, 'innerWidth', { value: 500 })
      sizes = component.getImageSizes()
      expect(sizes).toContain('calc((100vw - 32px - 12px) / 2)')
    })
  })

  describe('Pagination', () => {
    it('should calculate total pages correctly', () => {
      component.itemsPerPage = 3
      expect(component.totalPages).toBe(2) // 5 items / 3 items per page = 2 pages

      component.itemsPerPage = 2
      expect(component.totalPages).toBe(3) // 5 items / 2 items per page = 3 pages
    })

    it('should handle empty items array', () => {
      component.items = []
      expect(component.totalPages).toBe(0)
    })

    it('should handle zero items per page', () => {
      component.itemsPerPage = 0
      expect(component.totalPages).toBe(0)
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle empty items array gracefully', () => {
      component.items = []
      expect(() => component.scrollLeft()).not.toThrow()
      expect(() => component.scrollRight()).not.toThrow()
      expect(component.canScrollLeft).toBe(false)
      expect(component.canScrollRight).toBe(false)
    })

    it('should handle invalid anchor index values', () => {
      component.anchorItemIndex = -1
      expect(component.canScrollLeft).toBe(false)

      component.anchorItemIndex = 999
      expect(component.canScrollRight).toBe(false)
    })

    it('should clear timeout on destroy', () => {
      spyOn(window, 'clearTimeout')
      component.onResize() // Create a timeout
      component.ngOnDestroy()
      expect(clearTimeout).toHaveBeenCalled()
    })
  })

  describe('Performance and Caching', () => {
    it('should cache item width calculations', () => {
      spyOn(component as any, 'calculateItemWidth').and.returnValue(200)
      component['updateCachedValues']()

      expect(component['cachedItemWidth']).toBe(200)
      expect(component['calculateItemWidth']).toHaveBeenCalledTimes(1)
    })

    it('should cache transform calculations', () => {
      spyOn(component as any, 'calculateTranslateX').and.returnValue(-100)
      component['updateCachedValues']()

      expect(component['cachedTranslateX']).toBe(-100)
      expect(component['calculateTranslateX']).toHaveBeenCalledTimes(1)
    })

    it('should update cached values when anchor changes', () => {
      spyOn(component as any, 'updateCachedValues')
      component.scrollRight()
      expect(component['updateCachedValues']).toHaveBeenCalled()
    })
  })

  describe('Template Integration', () => {
    it('should render component correctly', () => {
      fixture.detectChanges()
      const compiled = fixture.nativeElement
      expect(compiled).toBeTruthy()
    })

    it('should apply carousel header when provided', () => {
      component.carouselHeader = 'Test Carousel'
      expect(component.carouselHeader).toBe('Test Carousel')
    })
  })
})
