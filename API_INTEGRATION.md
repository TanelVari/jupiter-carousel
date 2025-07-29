# API Integration Documentation

## Overview

This document describes the integration with the ERR Jupiter API to fetch carousel data from the endpoint:
`https://services.err.ee/api/v2/category/getByUrl?url=video&domain=jupiter.err.ee`

## Data Structure

### API Response

The API returns a complex JSON structure with the following key components:

```typescript
interface ApiResponse {
  apiVersion: string
  data: {
    category: {
      id: number
      name: string
      description: string
      domain: string
      frontPage: CarouselSection[]
    }
  }
}
```

### Carousel Sections

Each carousel section in the `frontPage` array represents a different content category:

```typescript
interface CarouselSection {
  header: string // Section title
  headerUrl: string // Optional URL for the header
  highTimeline: boolean // Filtering flag - we ignore sections with false
  liveBlock: boolean // Live content indicator
  manual: {
    highTimeline: boolean
    banner: boolean
  }
  data: ApiCarouselItem[] // Array of carousel items
}
```

### Carousel Items

Individual items within each carousel section:

```typescript
interface ApiCarouselItem {
  id: number
  heading: string // Item title
  lead?: string // HTML description (optional)
  subHeading: string // Subtitle
  type: string // Content type (movie, series, episode)
  canonicalUrl: string // Link to content
  verticalPhotos: Photo[] // Responsive images array
  // ... other properties
}
```

### Photo/Image Structure

Each carousel item contains multiple image formats for responsive design:

```typescript
interface Photo {
  id: number
  photoTypes: Record<string, PhotoType>
  photoUrlOriginal: string
  photoUrlBase: string
}

interface PhotoType {
  type: number
  w: number // Width in pixels
  h: number // Height in pixels
  url: string // Image URL
}
```

## Image Size Mapping

The API provides different image sizes identified by type numbers:

- **Type 2**: 1920x1080 (large/desktop)
- **Type 17**: 600x338 (medium/tablet)
- **Type 34**: 324x182 (small/mobile)
- **Type 60**: 180x270 (portrait small)
- **Type 80**: 400x600 (portrait large)

## Data Processing

### Filtering

- Only carousel sections with `highTimeline !== false` are processed
- Empty sections are handled gracefully

### Transformation

Raw API data is transformed into simplified interfaces for the application:

```typescript
interface ProcessedCarouselItem {
  id: string
  heading: string
  images: {
    small: string // Type 60 - 180x270
    large: string // Type 80 - 400x600
  }
  }
  isActive: boolean
}

interface ProcessedCarousel {
  id: string
  header: string
  items: ProcessedCarouselItem[]
}
```

## Error Handling

### Network Errors

- HTTP errors (4xx, 5xx) are caught and logged
- User-friendly error messages are provided
- Fallback content is displayed when API fails

### Data Validation

- Missing or malformed data is handled gracefully
- Default values are provided for missing fields
- Image URLs are validated before use

### Retry Mechanism

- Failed requests can be retried via `retryLoading()` method
- Loading states are properly managed during retries

## Services Architecture

### ApiService

- Handles raw API communication
- Processes and transforms API responses
- Manages loading and error states
- Provides fallback data when needed

### CarouselService

- Bridges ApiService with UI components
- Manages carousel selection state
- Provides simplified data streams for components
- Handles user interactions (slide changes, etc.)

## Usage Examples

### Fetching Carousels

```typescript
// Get all available carousels
this.carouselService.getCarousels().subscribe(carousels => {
  console.log('Available carousels:', carousels)
})

// Get items for currently selected carousel
this.carouselService.getItems().subscribe(items => {
  console.log('Current carousel items:', items)
})
```

### Handling Loading States

```typescript
// Monitor loading state
this.carouselService.getLoading().subscribe(isLoading => {
  if (isLoading) {
    // Show loading spinner
  }
})

// Monitor error state
this.carouselService.getError().subscribe(error => {
  if (error) {
    console.error('API Error:', error)
    // Show error message to user
  }
})
```

### Selecting Different Carousels

```typescript
// Switch to a specific carousel
this.carouselService.selectCarousel('carousel-id')

// Set active item within current carousel
this.carouselService.setActiveItem('item-id')
```

## Performance Considerations

### Caching

- API responses are cached in BehaviorSubjects
- Subsequent requests use cached data until refresh
- Images should be lazy-loaded for better performance

### Responsive Images

- Use appropriate image size based on screen size
- Implement srcset for optimal image delivery
- Consider WebP format support

### Error Recovery

- Implement proper retry logic with exponential backoff
- Cache successful responses for offline scenarios
- Provide meaningful error messages to users

## Testing

### Unit Tests

- ApiService tests cover error handling and data transformation
- CarouselService tests verify state management
- Component tests ensure proper integration

### Integration Tests

- Test actual API connectivity
- Verify data transformation accuracy
- Test error scenarios and recovery

## Future Enhancements

### Possible Improvements

- Implement caching with TTL (time-to-live)
- Add offline support with local storage
- Implement infinite scrolling for large datasets
- Add image optimization and lazy loading
- Consider WebSocket for real-time updates
