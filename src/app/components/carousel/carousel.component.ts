import {
  Component,
  OnInit,
  HostListener,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core'
import { Observable, Subject } from 'rxjs'
import { takeUntil } from 'rxjs/operators'
import { CarouselItem } from '../../interfaces/carousel.interface'
import { CarouselService } from '../../services/carousel.service'

@Component({
  selector: 'app-carousel',
  standalone: false,
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css']
})
export class CarouselComponent implements OnInit, OnDestroy {
  items$: Observable<CarouselItem[]>
  items: CarouselItem[] = []
  currentPage = 0
  itemsPerPage = 7
  containerPadding = 64 // px-4 md:px-8 -> 32px on each side on desktop
  itemGap = 24

  // Cache calculations to prevent jumpy behavior
  private cachedItemWidth = 0
  private cachedTranslateX = 0

  private destroy$ = new Subject<void>()

  constructor(
    private carouselService: CarouselService,
    private cdr: ChangeDetectorRef
  ) {
    this.items$ = this.carouselService.getItems()
  }

  ngOnInit(): void {
    this.items$.pipe(takeUntil(this.destroy$)).subscribe(items => {
      this.items = items
      this.currentPage = 0 // Reset to first page when items change
      this.updateCachedValues() // Recalculate cached values
      this.cdr.detectChanges()
    })

    // Set initial items per page based on screen size
    this.updateItemsPerPage()
    this.updateCSSVariables()
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.updateItemsPerPage()
    this.updateCSSVariables()
    this.updateCachedValues() // Recalculate cached values on resize
    this.cdr.detectChanges()
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') {
      this.scrollLeft()
    } else if (event.key === 'ArrowRight') {
      this.scrollRight()
    }
  }

  private updateItemsPerPage(): void {
    const width = window.innerWidth
    if (width < 768) {
      this.itemsPerPage = 2
      this.containerPadding = 32 // px-4 -> 16px on each side
      this.itemGap = 12
    } else if (width < 960) {
      this.itemsPerPage = 3
      this.containerPadding = 64 // px-8 -> 32px on each side
      this.itemGap = 16
    } else if (width < 1280) {
      this.itemsPerPage = 4
      this.containerPadding = 64
      this.itemGap = 20
    } else if (width < 1920) {
      this.itemsPerPage = 6
      this.containerPadding = 64
      this.itemGap = 24
    } else {
      this.itemsPerPage = 7
      this.containerPadding = 64
      this.itemGap = 24
    }

    // Recalculate cached values when screen size changes
    this.updateCachedValues()
  }

  private updateCachedValues(): void {
    this.cachedItemWidth = this.calculateItemWidth()
    this.cachedTranslateX = this.calculateTranslateX()
  }

  private calculateItemWidth(): number {
    const viewportWidth = window.innerWidth
    const totalPadding = this.containerPadding

    // Simple approach: calculate width based on itemsPerPage + space for partial previews
    // We need to fit: [30% left] + [itemsPerPage full items] + [30% right]
    // Each partial preview takes 30% of an item width

    const mainItemGaps = this.itemGap * (this.itemsPerPage - 1)
    let extraSpace = 0

    // Add space for gaps and partial preview items
    if (this.items.length > this.itemsPerPage) {
      // Reserve space for potential left and right previews
      // Each preview: 30% of item width + gap
      extraSpace = this.itemGap * 2 // gaps for preview items
      // The partial preview space will be calculated as a fraction of available space
    }

    const availableWidth =
      viewportWidth - totalPadding - mainItemGaps - extraSpace

    // Calculate item width accounting for partial previews
    // Total items to fit: itemsPerPage + 0.3 (left) + 0.3 (right) = itemsPerPage + 0.6
    const effectiveItemCount = this.itemsPerPage + 0.6
    return availableWidth / effectiveItemCount
  }

  private calculateTranslateX(): number {
    if (this.currentPage === 0) {
      return 0
    }

    const itemAndGapWidth = this.cachedItemWidth + this.itemGap

    // Standard calculation with left preview offset
    const baseTranslation =
      this.currentPage * this.itemsPerPage * itemAndGapWidth
    const leftPreviewOffset = this.cachedItemWidth * 0.3 + this.itemGap
    const standardTranslation = -(baseTranslation - leftPreviewOffset)

    // Check if we're on the last page and have fewer items than itemsPerPage
    const isLastPage = this.currentPage === this.totalPages - 1
    const itemsOnLastPage =
      this.items.length - this.currentPage * this.itemsPerPage

    if (isLastPage && itemsOnLastPage < this.itemsPerPage) {
      // Calculate the position where the last item would align to the right edge
      const viewportWidth = window.innerWidth
      const rightEdgePosition = viewportWidth - this.containerPadding

      // Calculate where the last item ends in the ribbon
      const lastItemIndex = this.items.length - 1
      const lastItemEndPosition =
        (lastItemIndex + 1) * itemAndGapWidth - this.itemGap

      // Calculate translation needed to align last item to right edge
      const rightAlignTranslation = rightEdgePosition - lastItemEndPosition

      // Use the more restrictive translation (don't scroll too far)
      return Math.max(standardTranslation, rightAlignTranslation)
    }

    return standardTranslation
  }

  private updateCSSVariables(): void {
    const root = document.documentElement
    root.style.setProperty('--nr-of-items', this.itemsPerPage.toString())
    root.style.setProperty('--container-padding', `${this.containerPadding}px`)
    root.style.setProperty('--item-gap', `${this.itemGap}px`)
  }

  getItemWidth(): string {
    return `${this.cachedItemWidth}px`
  }

  getCarouselTransform(): string {
    // Use cached transform value instead of recalculating each time
    return `translateX(${this.cachedTranslateX}px)`
  }

  getImageUrl(item: CarouselItem): string {
    // Use small image for mobile/tablet, large for desktop
    const width = window.innerWidth
    return width < 960 ? item.images.small : item.images.large
  }

  getImageSizes(): string {
    // Simplified responsive sizes based on actual item width
    const width = window.innerWidth
    if (width >= 1920) {
      return `calc((100vw - 64px - 144px) / 7)` // 144px = 6 gaps * 24px
    } else if (width >= 1280) {
      return `calc((100vw - 64px - 120px) / 6)` // 120px = 5 gaps * 24px
    } else if (width >= 960) {
      return `calc((100vw - 64px - 60px) / 4)` // 60px = 3 gaps * 20px
    } else if (width >= 768) {
      return `calc((100vw - 64px - 32px) / 3)` // 32px = 2 gaps * 16px
    } else {
      return `calc((100vw - 32px - 12px) / 2)` // 12px = 1 gap * 12px
    }
  }

  get visibleItems(): CarouselItem[] {
    // Return ALL items - the ribbon will show all items and translate to show different sections
    return this.items
  }

  getItemOpacity(index: number): boolean {
    // Special handling for the last page with fewer items
    const isLastPage = this.currentPage === this.totalPages - 1
    const currentPageStart = this.currentPage * this.itemsPerPage
    const actualItemsOnPage = Math.min(
      this.itemsPerPage,
      this.items.length - currentPageStart
    )

    if (isLastPage && actualItemsOnPage < this.itemsPerPage) {
      // On the last page, we're showing:
      // - Items from currentPageStart to (items.length - 1) as main items
      // - One left preview item (if canScrollLeft) which should be dimmed

      const mainItemsStart = currentPageStart
      const mainItemsEnd = this.items.length - 1

      // Main items (all remaining items) are never dimmed
      if (index >= mainItemsStart && index <= mainItemsEnd) {
        return false
      }

      // Left preview item should be dimmed
      // Note: Using currentPageStart - 2 due to visual positioning offset
      const leftPreviewIndex = this.canScrollLeft ? currentPageStart - 2 : -1
      return index === leftPreviewIndex
    } else {
      // Normal page logic
      const currentPageEnd = currentPageStart + this.itemsPerPage - 1

      // Main items (itemsPerPage count) are never dimmed
      if (index >= currentPageStart && index <= currentPageEnd) {
        return false
      }

      // Left preview item (if exists and we can scroll left)
      const leftPreviewIndex = this.canScrollLeft ? currentPageStart - 1 : -1

      // Right preview item (if exists and we can scroll right)
      const rightPreviewIndex = this.canScrollRight ? currentPageEnd + 1 : -1

      // Dim only the valid preview items
      return index === leftPreviewIndex || index === rightPreviewIndex
    }
  }

  get leftPreviewItem(): CarouselItem | null {
    if (!this.canScrollLeft) {
      return null
    }

    const startIndex = this.currentPage * this.itemsPerPage
    return startIndex > 0 ? this.items[startIndex - 1] : null
  }

  get rightPreviewItem(): CarouselItem | null {
    const startIndex = this.currentPage * this.itemsPerPage
    const endIndex = startIndex + this.itemsPerPage

    return endIndex < this.items.length ? this.items[endIndex] : null
  }

  get canScrollLeft(): boolean {
    return this.currentPage > 0
  }

  get canScrollRight(): boolean {
    return (this.currentPage + 1) * this.itemsPerPage < this.items.length
  }

  get totalPages(): number {
    return Math.ceil(this.items.length / this.itemsPerPage)
  }

  scrollLeft(): void {
    if (this.canScrollLeft) {
      this.currentPage--
      this.updateCachedValues() // Recalculate for smooth transition
    }
  }

  scrollRight(): void {
    if (this.canScrollRight) {
      this.currentPage++
      this.updateCachedValues() // Recalculate for smooth transition
    }
  }

  goToPage(pageIndex: number): void {
    if (pageIndex >= 0 && pageIndex < this.totalPages) {
      this.currentPage = pageIndex
      this.updateCachedValues() // Recalculate for smooth transition
    }
  }
}
