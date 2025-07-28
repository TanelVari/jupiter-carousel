import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'
import { CarouselItem } from '../interfaces/carousel.interface'

@Injectable({
  providedIn: 'root'
})
export class CarouselService {
  private itemsSubject = new BehaviorSubject<CarouselItem[]>([])
  public items$: Observable<CarouselItem[]> = this.itemsSubject.asObservable()

  constructor() {
    this.initializeItems()
  }

  private initializeItems(): void {
    const mockItems: CarouselItem[] = [
      {
        id: '1',
        title: 'First Slide',
        description: 'This is the first carousel slide',
        imageUrl: 'https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=Slide+1',
        isActive: true
      },
      {
        id: '2',
        title: 'Second Slide',
        description: 'This is the second carousel slide',
        imageUrl: 'https://via.placeholder.com/800x400/059669/FFFFFF?text=Slide+2',
        isActive: false
      },
      {
        id: '3',
        title: 'Third Slide',
        description: 'This is the third carousel slide',
        imageUrl: 'https://via.placeholder.com/800x400/DC2626/FFFFFF?text=Slide+3',
        isActive: false
      }
    ]

    this.itemsSubject.next(mockItems)
  }

  getItems(): Observable<CarouselItem[]> {
    return this.items$
  }

  setActiveItem(id: string): void {
    const currentItems = this.itemsSubject.value
    const updatedItems = currentItems.map((item: CarouselItem) => ({
      ...item,
      isActive: item.id === id
    }))
    this.itemsSubject.next(updatedItems)
  }
}
