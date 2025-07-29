// Photo type interfaces for responsive images (simplified to only used properties)
export interface PhotoType {
  url: string
}

export interface Photo {
  photoTypes: Record<string, PhotoType>
}

// Carousel item interface for individual items in the carousel (simplified to only used properties)
export interface CarouselItem {
  id: number
  heading: string
  canonicalUrl: string
  verticalPhotos: Photo[]
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
  canonicalUrl: string
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
