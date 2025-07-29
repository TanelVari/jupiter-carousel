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
  }

  private updateCSSVariables(): void {
    const root = document.documentElement
    root.style.setProperty('--nr-of-items', this.itemsPerPage.toString())
    root.style.setProperty('--container-padding', `${this.containerPadding}px`)
    root.style.setProperty('--item-gap', `${this.itemGap}px`)
  }

  getItemWidth(): string {
    // Calculate item width dynamically
    const viewportWidth = window.innerWidth
    const totalPadding = this.containerPadding
    const totalGaps = this.itemGap * (this.itemsPerPage - 1)
    const availableWidth = viewportWidth - totalPadding - totalGaps
    const itemWidth = availableWidth / this.itemsPerPage

    return `${itemWidth}px`
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
    const startIndex = this.currentPage * this.itemsPerPage
    const endIndex = startIndex + this.itemsPerPage
    const visible = this.items.slice(startIndex, endIndex)

    // Add preview item if there are more items to the right
    if (endIndex < this.items.length) {
      visible.push(this.items[endIndex])
    }

    return visible
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
    }
  }

  scrollRight(): void {
    if (this.canScrollRight) {
      this.currentPage++
    }
  }

  goToPage(pageIndex: number): void {
    if (pageIndex >= 0 && pageIndex < this.totalPages) {
      this.currentPage = pageIndex
    }
  }
}
