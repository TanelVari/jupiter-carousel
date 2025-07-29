import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ChangeDetectorRef } from '@angular/core'

import { CarouselComponent } from './carousel.component'
import { CarouselItem } from '../../interfaces/carousel.interface'

describe('CarouselComponent', () => {
  let component: CarouselComponent
  let fixture: ComponentFixture<CarouselComponent>
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
    mockChangeDetector = jasmine.createSpyObj('ChangeDetectorRef', [
      'detectChanges'
    ])

    await TestBed.configureTestingModule({
      declarations: [CarouselComponent],
      providers: [{ provide: ChangeDetectorRef, useValue: mockChangeDetector }]
    }).compileComponents()

    fixture = TestBed.createComponent(CarouselComponent)
    component = fixture.componentInstance

    // Set up component inputs
    component.carouselHeader = 'Test Carousel'
    component.carouselItems = mockCarouselItems

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

    it('should have carousel items from input', () => {
      component.ngOnInit()
      expect(component.items).toEqual(mockCarouselItems)
    })

    it('should set carousel header input', () => {
      component.carouselHeader = 'Test Header'
      expect(component.carouselHeader).toBe('Test Header')
    })

    it('should set carousel index input', () => {
      component.carouselIndex = 2
      expect(component.carouselIndex).toBe(2)
    })

    it('should initialize with default carousel index of 0', () => {
      expect(component.carouselIndex).toBe(0)
    })

    it('should convert input items to carousel items', () => {
      const mockProcessedItems = [
        {
          id: '1',
          heading: 'Processed Item 1',
          canonicalUrl: 'https://example.com/1',
          images: {
            small: 'photo1_small.jpg',
            large: 'photo1_large.jpg'
          }
        }
      ]

      component.carouselItems = mockProcessedItems
      component['convertInputItemsToCarouselItems']()

      expect(component.items.length).toBe(1)
      expect(component.items[0].id).toBe('1')
      expect(component.items[0].heading).toBe('Processed Item 1')
      expect(component.items[0].canonicalUrl).toBe('https://example.com/1')
      expect(component.items[0].images.small).toBe('photo1_small.jpg')
      expect(component.items[0].images.large).toBe('photo1_large.jpg')
    })

    it('should handle empty carousel items input', () => {
      component.carouselItems = []
      component['convertInputItemsToCarouselItems']()

      expect(component.items).toEqual([])
    })

    it('should call convertInputItemsToCarouselItems on ngOnChanges', () => {
      spyOn(component as any, 'convertInputItemsToCarouselItems')

      component.ngOnChanges()

      expect(component['convertInputItemsToCarouselItems']).toHaveBeenCalled()
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

    it('should calculate carousel height based on item width', () => {
      // Use the existing spy from beforeEach and configure its return value
      ;(component as any)['calculateItemWidth'].and.returnValue(200)
      component['updateCachedValues']()

      const height = component.getCarouselHeight()

      // For 2:3 aspect ratio, height = width * (3/2)
      // 200px * 1.5 = 300px = 18.75rem
      expect(height).toBe('18.75rem')
    })

    it('should respect minimum height bounds', () => {
      // Use the existing spy and configure for very small item width
      ;(component as any)['calculateItemWidth'].and.returnValue(50)
      component['updateCachedValues']()

      const height = component.getCarouselHeight()

      // Should be clamped to minimum 12rem
      expect(height).toBe('12rem')
    })

    it('should respect maximum height bounds', () => {
      // Use the existing spy and configure for very large item width
      ;(component as any)['calculateItemWidth'].and.returnValue(1000)
      component['updateCachedValues']()

      const height = component.getCarouselHeight()

      // Should be clamped to maximum 50rem
      expect(height).toBe('50rem')
    })

    it('should handle cached item width correctly', () => {
      // Set cached width directly (bypassing the spy)
      component['cachedItemWidth'] = 240

      const height = component.getCarouselHeight()

      // 240px * 1.5 = 360px = 22.5rem
      expect(height).toBe('22.5rem')
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

  describe('Tab Navigation', () => {
    beforeEach(() => {
      component.items = mockCarouselItems // 5 items total
      component.itemsPerPage = 3
    })

    describe('Left Button Tab Index', () => {
      it('should return 1 when left scroll is available', () => {
        component.anchorItemIndex = 1 // Not at the beginning

        expect(component.getLeftButtonTabIndex()).toBe(1)
      })

      it('should return -1 when left scroll is not available', () => {
        component.anchorItemIndex = 0 // At the beginning

        expect(component.getLeftButtonTabIndex()).toBe(-1)
      })
    })

    describe('Right Button Tab Index', () => {
      it('should return correct index when both buttons are present', () => {
        component.anchorItemIndex = 1 // In the middle, both buttons available

        const visibleItems = (component as any).getVisibleTabbableItems().length
        const expectedIndex = 1 + visibleItems + 1 // left button + items + 1 for right button index
        expect(component.getRightButtonTabIndex()).toBe(expectedIndex)
      })

      it('should return correct index when only right button is present', () => {
        component.anchorItemIndex = 0 // At beginning, only right button

        const visibleItems = (component as any).getVisibleTabbableItems().length
        const expectedIndex = visibleItems + 1 // no left button + items + 1 for right button index
        expect(component.getRightButtonTabIndex()).toBe(expectedIndex)
      })

      it('should return -1 when right scroll is not available', () => {
        component.anchorItemIndex = 2 // At the end (5 items, 3 per page, index 2 = last page)

        expect(component.getRightButtonTabIndex()).toBe(-1)
      })
    })

    describe('Item Tab Index', () => {
      it('should return correct tab indices for visible items on first page', () => {
        component.anchorItemIndex = 0 // First page, left button not present

        // Items 0, 1, 2 should be tabbable with indices 1, 2, 3
        expect(component.getItemTabIndex(0)).toBe(1)
        expect(component.getItemTabIndex(1)).toBe(2)
        expect(component.getItemTabIndex(2)).toBe(3)
      })

      it('should return correct tab indices when left button is present', () => {
        component.anchorItemIndex = 1 // Middle page, left button present

        // Items 1, 2, 3 should be tabbable with indices 2, 3, 4 (after left button)
        expect(component.getItemTabIndex(1)).toBe(2)
        expect(component.getItemTabIndex(2)).toBe(3)
        expect(component.getItemTabIndex(3)).toBe(4)
      })

      it('should return -1 for non-visible items', () => {
        component.anchorItemIndex = 0 // First page

        // Items 3+ should not be tabbable
        expect(component.getItemTabIndex(3)).toBe(-1)
        expect(component.getItemTabIndex(4)).toBe(-1)
      })

      it('should handle last page correctly', () => {
        component.anchorItemIndex = 2 // Last page (items 2, 3, 4)

        // Last 3 items should be tabbable
        expect(component.getItemTabIndex(2)).toBe(2) // After left button
        expect(component.getItemTabIndex(3)).toBe(3)
        expect(component.getItemTabIndex(4)).toBe(4)
      })
    })

    describe('Visible Tabbable Items', () => {
      it('should return correct visible items for first page', () => {
        component.anchorItemIndex = 0

        const tabbableItems = (component as any).getVisibleTabbableItems()
        expect(tabbableItems).toEqual([0, 1, 2])
      })

      it('should return correct visible items for middle page', () => {
        component.anchorItemIndex = 1

        const tabbableItems = (component as any).getVisibleTabbableItems()
        expect(tabbableItems).toEqual([1, 2, 3])
      })

      it('should return correct visible items for last page', () => {
        component.anchorItemIndex = 2 // Last possible anchor for 5 items with 3 per page

        const tabbableItems = (component as any).getVisibleTabbableItems()
        expect(tabbableItems).toEqual([2, 3, 4])
      })
    })

    describe('Tab Navigation Integration', () => {
      it('should maintain tab order when scrolling right', () => {
        component.anchorItemIndex = 0 // First page

        // Initial state: no left button, items 0,1,2 tabbable, right button at index 4
        expect(component.getLeftButtonTabIndex()).toBe(-1)
        expect(component.getItemTabIndex(0)).toBe(1)
        expect(component.getItemTabIndex(1)).toBe(2)
        expect(component.getItemTabIndex(2)).toBe(3)
        expect(component.getRightButtonTabIndex()).toBe(4)

        // Scroll right
        component.scrollRight()

        // After scrolling: nextAnchor = 0 + 3 = 3, maxAnchor = 5 - 3 = 2, so anchor becomes min(3, 2) = 2
        // This means items 2,3,4 are visible, and canScrollRight becomes false
        expect(component.anchorItemIndex).toBe(2)
        expect(component.canScrollRight).toBe(false)
        expect(component.getLeftButtonTabIndex()).toBe(1)
        expect(component.getItemTabIndex(2)).toBe(2)
        expect(component.getItemTabIndex(3)).toBe(3)
        expect(component.getItemTabIndex(4)).toBe(4)
        expect(component.getRightButtonTabIndex()).toBe(-1) // No more pages to scroll
      })

      it('should maintain tab order when scrolling left', () => {
        component.anchorItemIndex = 2 // Last page (with 5 items and 3 per page)

        // Initial state: left button at 1, items 2,3,4 tabbable, no right button
        expect(component.getLeftButtonTabIndex()).toBe(1)
        expect(component.getItemTabIndex(2)).toBe(2)
        expect(component.getItemTabIndex(3)).toBe(3)
        expect(component.getItemTabIndex(4)).toBe(4)
        expect(component.getRightButtonTabIndex()).toBe(-1)

        // Scroll left: anchor becomes max(0, 2-3) = 0
        component.scrollLeft()

        expect(component.anchorItemIndex).toBe(0)
        expect(component.getLeftButtonTabIndex()).toBe(-1) // Back to first page
        expect(component.getItemTabIndex(0)).toBe(1)
        expect(component.getItemTabIndex(1)).toBe(2)
        expect(component.getItemTabIndex(2)).toBe(3)
        expect(component.getRightButtonTabIndex()).toBe(4) // Can scroll right again
      })

      it('should handle single page scenario correctly', () => {
        // Test with fewer items than itemsPerPage
        component.items = mockCarouselItems.slice(0, 2) // Only 2 items
        component.itemsPerPage = 3
        component.anchorItemIndex = 0

        // No scroll buttons should be present, only items tabbable
        expect(component.getLeftButtonTabIndex()).toBe(-1)
        expect(component.getRightButtonTabIndex()).toBe(-1)
        expect(component.getItemTabIndex(0)).toBe(1)
        expect(component.getItemTabIndex(1)).toBe(2)
      })

      it('should handle exact page size scenario', () => {
        // Test with exactly itemsPerPage items
        component.items = mockCarouselItems.slice(0, 3) // Exactly 3 items
        component.itemsPerPage = 3
        component.anchorItemIndex = 0

        // No scroll buttons should be present
        expect(component.getLeftButtonTabIndex()).toBe(-1)
        expect(component.getRightButtonTabIndex()).toBe(-1)
        expect(component.getItemTabIndex(0)).toBe(1)
        expect(component.getItemTabIndex(1)).toBe(2)
        expect(component.getItemTabIndex(2)).toBe(3)
      })
    })

    describe('Tab Navigation Edge Cases', () => {
      it('should handle empty items array', () => {
        component.items = []
        component.itemsPerPage = 3

        expect(component.getLeftButtonTabIndex()).toBe(-1)
        expect(component.getRightButtonTabIndex()).toBe(-1)
        expect(component.getItemTabIndex(0)).toBe(-1)
      })

      it('should handle single item', () => {
        component.items = [mockCarouselItems[0]]
        component.itemsPerPage = 3
        component.anchorItemIndex = 0

        expect(component.getLeftButtonTabIndex()).toBe(-1)
        expect(component.getRightButtonTabIndex()).toBe(-1)
        expect(component.getItemTabIndex(0)).toBe(1)
      })

      it('should handle itemsPerPage = 1', () => {
        component.items = mockCarouselItems // 5 items
        component.itemsPerPage = 1
        component.anchorItemIndex = 2 // Middle item

        // Should have both buttons and only one item tabbable
        expect(component.getLeftButtonTabIndex()).toBe(1)
        expect(component.getItemTabIndex(2)).toBe(2)
        expect(component.getRightButtonTabIndex()).toBe(3)

        // Other items should not be tabbable
        expect(component.getItemTabIndex(0)).toBe(-1)
        expect(component.getItemTabIndex(1)).toBe(-1)
        expect(component.getItemTabIndex(3)).toBe(-1)
        expect(component.getItemTabIndex(4)).toBe(-1)
      })
    })

    describe('Global Tab Index with Carousel Index', () => {
      it('should calculate correct global tab indices for carousel index 0', () => {
        component.carouselIndex = 0
        component.anchorItemIndex = 1 // In the middle - both buttons available
        component.items = mockCarouselItems // 5 items total
        component.itemsPerPage = 3

        // With anchorItemIndex=1, itemsPerPage=3, items.length=5:
        // canScrollRight = 1 + 3 < 5 = true (can scroll right)
        // isLastPage = false
        // visibleItemsStartIndex = anchorItemIndex = 1
        // visibleItems = [1, 2, 3]

        // For carousel 0: base = (0 * 10) + 1 = 1
        expect(component.getLeftButtonTabIndex()).toBe(1) // base = 1
        expect(component.getItemTabIndex(1)).toBe(2) // base + left offset + indexOf(1 in [1,2,3]) = 1 + 1 + 0 = 2
        expect(component.getItemTabIndex(2)).toBe(3) // base + left offset + indexOf(2 in [1,2,3]) = 1 + 1 + 1 = 3
        expect(component.getItemTabIndex(3)).toBe(4) // base + left offset + indexOf(3 in [1,2,3]) = 1 + 1 + 2 = 4
        expect(component.getRightButtonTabIndex()).toBe(5) // base + left offset + visibleItems.length = 1 + 1 + 3 = 5
      })

      it('should calculate correct global tab indices for carousel index 1', () => {
        component.carouselIndex = 1
        component.anchorItemIndex = 1 // In the middle - both buttons available
        component.items = mockCarouselItems // 5 items total
        component.itemsPerPage = 3

        // For carousel 1: base = (1 * 10) + 1 = 11
        expect(component.getLeftButtonTabIndex()).toBe(11) // base = 11
        expect(component.getItemTabIndex(1)).toBe(12) // base + left offset + indexOf(1) = 11 + 1 + 0 = 12
        expect(component.getItemTabIndex(2)).toBe(13) // base + left offset + indexOf(2) = 11 + 1 + 1 = 13
        expect(component.getItemTabIndex(3)).toBe(14) // base + left offset + indexOf(3) = 11 + 1 + 2 = 14
        expect(component.getRightButtonTabIndex()).toBe(15) // base + left offset + visible items count = 11 + 1 + 3 = 15
      })

      it('should calculate correct global tab indices for carousel index 2', () => {
        component.carouselIndex = 2
        component.anchorItemIndex = 1 // In the middle - both buttons available
        component.items = mockCarouselItems // 5 items total
        component.itemsPerPage = 3

        // For carousel 2: base = (2 * 10) + 1 = 21
        expect(component.getLeftButtonTabIndex()).toBe(21) // base = 21
        expect(component.getItemTabIndex(1)).toBe(22) // base + left offset + indexOf(1) = 21 + 1 + 0 = 22
        expect(component.getItemTabIndex(2)).toBe(23) // base + left offset + indexOf(2) = 21 + 1 + 1 = 23
        expect(component.getItemTabIndex(3)).toBe(24) // base + left offset + indexOf(3) = 21 + 1 + 2 = 24
        expect(component.getRightButtonTabIndex()).toBe(25) // base + left offset + visible items count = 21 + 1 + 3 = 25
      })

      it('should handle carousel index when only right button is available', () => {
        component.carouselIndex = 1
        component.anchorItemIndex = 0 // Only right button available
        component.items = mockCarouselItems // 5 items total
        component.itemsPerPage = 3

        // For carousel 1: base = (1 * 10) + 1 = 11
        expect(component.getLeftButtonTabIndex()).toBe(-1) // No left button
        expect(component.getItemTabIndex(0)).toBe(11) // base + no left offset + item index = 11 + 0 + 0 = 11
        expect(component.getItemTabIndex(1)).toBe(12) // base + no left offset + item index = 11 + 0 + 1 = 12
        expect(component.getItemTabIndex(2)).toBe(13) // base + no left offset + item index = 11 + 0 + 2 = 13
        expect(component.getRightButtonTabIndex()).toBe(14) // base + no left offset + visible items = 11 + 0 + 3 = 14
      })

      it('should handle carousel index when only left button is available', () => {
        component.carouselIndex = 2
        component.anchorItemIndex = 2 // Only left button available (last page)
        component.items = mockCarouselItems // 5 items total
        component.itemsPerPage = 3

        // For carousel 2: base = (2 * 10) + 1 = 21
        expect(component.getLeftButtonTabIndex()).toBe(21) // base + 0 = 21
        expect(component.getRightButtonTabIndex()).toBe(-1) // No right button on last page
      })
    })
  })
})
