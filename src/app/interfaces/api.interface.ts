// Photo type interfaces for responsive images
export interface PhotoType {
  type: number
  w: number
  h: number
  url: string
}

export interface Photo {
  id: number
  ord: number
  type: number
  created: number
  version: number
  format: string
  captionEt: string
  captionEn: string
  captionRu: string
  authorEt: string
  authorEn: string
  authorRu: string
  photoTypes: Record<string, PhotoType>
  photoUrlOriginal: string
  photoUrlBase: string
}

// Carousel item interface for individual items in the carousel
export interface CarouselItem {
  id: number
  heading: string
  lead?: string
  primaryCategoryId: number
  type: string
  parentContentPath: string
  scheduleStart: number
  subHeading: string
  hasActiveMedia: boolean
  rootContentId: number
  rootCategoryId: number
  canonicalUrl: string
  fancyUrl: string
  anotherDomainContent: boolean
  photos?: Photo[]
  verticalPhotos: Photo[]
  squarePhotos?: Photo[]
}

// Carousel section interface
export interface CarouselSection {
  header: string
  headerUrl: string
  highTimeline: boolean
  liveBlock: boolean
  manual: {
    highTimeline: boolean
    banner: boolean
  }
  data: CarouselItem[]
}

// Main API response structure
export interface ApiResponse {
  apiVersion: string
  data: {
    category: {
      id: number
      name: string
      description: string
      domain: string
      analyticsId: string
      gemiusId: string
      siteContent: string
      frontPage: CarouselSection[]
    }
  }
}

// Processed carousel item for our component (simplified)
export interface ProcessedCarouselItem {
  id: string
  heading: string
  images: {
    small: string // Type 60 - 180x270
    large: string // Type 80 - 400x600
  }
}

// Processed carousel section
export interface ProcessedCarousel {
  id: string
  header: string
  items: ProcessedCarouselItem[]
}
