export interface CarouselItem {
  id: string
  heading: string
  canonicalUrl: string
  images: {
    small: string // Type 60 - 180x270
    large: string // Type 80 - 400x600
  }
}
