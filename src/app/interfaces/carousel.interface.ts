export interface CarouselItem {
  id: string
  title: string
  description: string
  imageUrl: string
  isActive: boolean
}

export interface CarouselConfig {
  autoPlay: boolean
  interval: number
  showIndicators: boolean
  showNavigation: boolean
}
