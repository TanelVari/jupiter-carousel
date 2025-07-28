import { Component, OnInit } from '@angular/core'
import { Observable } from 'rxjs'
import { CarouselItem } from '../../interfaces/carousel.interface'
import { CarouselService } from '../../services/carousel.service'

@Component({
  selector: 'app-carousel',
  standalone: false,
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css']
})
export class CarouselComponent implements OnInit {
  items$: Observable<CarouselItem[]>

  constructor(private carouselService: CarouselService) {
    this.items$ = this.carouselService.getItems()
  }

  ngOnInit(): void {}

  onSlideChange(itemId: string): void {
    this.carouselService.setActiveItem(itemId)
  }
}
