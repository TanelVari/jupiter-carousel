import { Component, OnInit, HostListener, OnDestroy } from '@angular/core'
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

  private destroy$ = new Subject<void>()

  constructor(private carouselService: CarouselService) {
    this.items$ = this.carouselService.getItems()
  }

  ngOnInit(): void {
    this.items$.pipe(takeUntil(this.destroy$)).subscribe(items => {
      this.items = items
      this.currentPage = 0 // Reset to first page when items change
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') {
      this.scrollLeft()
    } else if (event.key === 'ArrowRight') {
      this.scrollRight()
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
