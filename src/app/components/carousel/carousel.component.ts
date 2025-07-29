import {
  Component,
  OnInit,
  HostListener,
  OnDestroy,
  ChangeDetectorRef,
  Input
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
  @Input() carouselHeader = ''
  items$: Observable<CarouselItem[]>
  items: CarouselItem[] = []
  anchorItemIndex = 0
  itemsPerPage = 7
  containerPadding = 64 // px-4 md:px-8 -> 32px on each side on desktop
  itemGap = 12

  // Cache calculations to prevent jumpy behavior
  private cachedItemWidth = 0
  private cachedTranslateX = 0

  isResizing = false
  private resizeTimeout: ReturnType<typeof setTimeout> | undefined

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
      this.anchorItemIndex = 0 // Reset to first page when items change
      this.updateCachedValues() // Recalculate cached values
      this.cdr.detectChanges()
    })

    // Set initial items per page based on screen size
    this.updateItemsPerPage()
    this.updateCSSVariables()
    this.updateCachedValues() // Initial calculation
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout)
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.isResizing = true
    clearTimeout(this.resizeTimeout)

    // With anchorItemIndex as the source of truth, we just need to recalculate the layout.
    // The anchor item will stay the same, and the translate will be updated for it.
    this.updateItemsPerPage()
    this.updateCSSVariables()
    this.updateCachedValues()
    this.cdr.detectChanges()

    this.resizeTimeout = setTimeout(() => {
      this.isResizing = false
      this.cdr.detectChanges() // Trigger change detection to re-apply transition
    }, 500) // Adjust timeout as needed
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
      this.itemGap = 4
    } else if (width < 960) {
      this.itemsPerPage = 3
      this.containerPadding = 64 // px-8 -> 32px on each side
      this.itemGap = 8
    } else if (width < 1280) {
      this.itemsPerPage = 4
      this.containerPadding = 64
      this.itemGap = 8
    } else if (width < 1920) {
      this.itemsPerPage = 6
      this.containerPadding = 64
      this.itemGap = 12
    } else {
      this.itemsPerPage = 7
      this.containerPadding = 64
      this.itemGap = 12
    }
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
    if (this.anchorItemIndex === 0) {
      return 0
    }

    const itemAndGapWidth = this.cachedItemWidth + this.itemGap

    // Standard calculation with left preview offset
    const baseTranslation = this.anchorItemIndex * itemAndGapWidth
    const leftPreviewOffset = this.cachedItemWidth * 0.3 + this.itemGap
    const standardTranslation = -(baseTranslation - leftPreviewOffset)

    // Check if we're on the last page (i.e., we can't scroll right)
    if (!this.canScrollRight) {
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
    const isLastPage = !this.canScrollRight
    let visibleItemsStartIndex = this.anchorItemIndex

    if (isLastPage) {
      // On the last page, the visible items are aligned to the end
      visibleItemsStartIndex = Math.max(
        0,
        this.items.length - this.itemsPerPage
      )
    }

    const visibleItemsEndIndex = visibleItemsStartIndex + this.itemsPerPage - 1

    // Main items are never dimmed
    if (index >= visibleItemsStartIndex && index <= visibleItemsEndIndex) {
      return false
    }

    // Preview items
    const leftPreviewIndex = this.canScrollLeft
      ? visibleItemsStartIndex - 1
      : -1
    const rightPreviewIndex = this.canScrollRight
      ? visibleItemsEndIndex + 1
      : -1

    // Dim only the valid preview items
    return index === leftPreviewIndex || index === rightPreviewIndex
  }

  get canScrollLeft(): boolean {
    return this.anchorItemIndex > 0
  }

  get canScrollRight(): boolean {
    // We can scroll right if the anchor of the NEXT page is valid
    return this.anchorItemIndex + this.itemsPerPage < this.items.length
  }

  get totalPages(): number {
    if (this.items.length === 0 || this.itemsPerPage === 0) {
      return 0
    }
    return Math.ceil(this.items.length / this.itemsPerPage)
  }

  scrollLeft(): void {
    if (this.canScrollLeft) {
      this.anchorItemIndex = Math.max(
        0,
        this.anchorItemIndex - this.itemsPerPage
      )
      this.updateCachedValues() // Recalculate for smooth transition
    }
  }

  scrollRight(): void {
    if (this.canScrollRight) {
      // Ensure we don't create an anchor that makes the last item not visible
      const nextAnchor = this.anchorItemIndex + this.itemsPerPage
      const maxAnchor = this.items.length - this.itemsPerPage
      this.anchorItemIndex = Math.min(nextAnchor, maxAnchor)

      this.updateCachedValues() // Recalculate for smooth transition
    }
  }

  // Tab navigation helpers
  getLeftButtonTabIndex(): number {
    // Left button gets tabindex 1 when it exists (first in tab order)
    return this.canScrollLeft ? 1 : -1
  }

  getRightButtonTabIndex(): number {
    // Right button gets tabindex based on how many items are tabbable
    const visibleTabbableItems = this.getVisibleTabbableItems().length
    const baseIndex = this.canScrollLeft ? 2 : 1 // Start after left button if it exists
    return this.canScrollRight ? baseIndex + visibleTabbableItems : -1
  }

  getItemTabIndex(itemIndex: number): number {
    // Only visible (non-dimmed) items should be tabbable
    const visibleTabbableItems = this.getVisibleTabbableItems()
    const itemIndexInTabbable = visibleTabbableItems.indexOf(itemIndex)

    if (itemIndexInTabbable === -1) {
      return -1 // Item is not tabbable (dimmed/preview item)
    }

    const baseIndex = this.canScrollLeft ? 2 : 1 // Start after left button if it exists
    return baseIndex + itemIndexInTabbable
  }

  private getVisibleTabbableItems(): number[] {
    const isLastPage = !this.canScrollRight
    let visibleItemsStartIndex = this.anchorItemIndex

    if (isLastPage) {
      // On the last page, the visible items are aligned to the end
      visibleItemsStartIndex = Math.max(
        0,
        this.items.length - this.itemsPerPage
      )
    }

    const visibleItemsEndIndex = visibleItemsStartIndex + this.itemsPerPage - 1

    // Return indices of main visible items (not dimmed preview items)
    const tabbableItems: number[] = []
    for (
      let i = visibleItemsStartIndex;
      i <= visibleItemsEndIndex && i < this.items.length;
      i++
    ) {
      tabbableItems.push(i)
    }

    return tabbableItems
  }
}
