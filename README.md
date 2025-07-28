# Jupiter Carousel

A modern Angular 20 TypeScript application with Tailwind CSS and Prettier configuration.

## Features

- ✅ **Angular 20** with TypeScript 5.8
- ✅ **ESBuild** for faster builds and development
- ✅ **Tailwind CSS 3.4** for styling
- ✅ **Prettier 3.3** configuration (no semicolons, single quotes)
- ✅ **Modular project structure**
- ✅ **Interface-based approach**
- ✅ **Strict TypeScript configuration**
- ✅ **Testing setup** with Jasmine 5.4 and Karma
- ✅ **Zone.js optimizations** for better performance
- ✅ **Modern bundler optimizations**

## Project Structure

```
src/
├── app/
│   ├── components/          # Reusable components
│   ├── interfaces/          # TypeScript interfaces
│   ├── services/           # Angular services
│   ├── app.component.*     # Root component
│   ├── app.module.ts       # Main app module
│   └── app-routing.module.ts # Routing configuration
├── assets/                 # Static assets
├── styles.css             # Global styles with Tailwind
└── index.html             # Main HTML file
```

## Getting Started

### Prerequisites

- Node.js (version 18.19 or higher)
- npm (version 10 or higher)

### Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server (with ESBuild):

   ```bash
   npm start
   ```

3. Open your browser to `http://localhost:4200`

## What's New in Angular 20

### Performance Improvements

- **ESBuild integration** - Faster builds and hot reload
- **Zone.js optimizations** - Event and run coalescing for better performance
- **Modern bundler** - Improved tree-shaking and code splitting
- **TypeScript 5.8** - Latest language features and optimizations

### Development Experience

- **Enhanced type safety** - Stricter TypeScript configuration
- **Better error messages** - Improved debugging experience
- **Faster testing** - Optimized test runner configuration

## Development

### Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run unit tests
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run lint` - Run linting

### Code Style

This project uses Prettier with the following configuration:

- No semicolons
- Single quotes
- No trailing commas
- 80 character line width
- 2 space indentation

### TypeScript Configuration

The project uses strict TypeScript settings:

- Strict mode enabled
- No implicit any
- No unused variables
- Force consistent casing in file names

## Architecture

### Interfaces over Types

This project follows an interface-based approach:

```typescript
// ✅ Preferred
export interface CarouselItem {
  id: string
  heading: string
  description: string
  imageUrl: string
  isActive: boolean
}

// ❌ Avoid
export type CarouselItem = {
  id: string
  // ...
}
```

### Service Pattern

Services use RxJS observables for state management:

```typescript
@Injectable({
  providedIn: 'root'
})
export class CarouselService {
  private itemsSubject = new BehaviorSubject<CarouselItem[]>([])
  public items$: Observable<CarouselItem[]> = this.itemsSubject.asObservable()
}
```

## Styling with Tailwind CSS

The project includes Tailwind CSS for utility-first styling:

```html
<div class="min-h-screen bg-gray-50 flex items-center justify-center">
  <h1 class="text-4xl font-bold text-gray-900 mb-4">
    Welcome to Jupiter Carousel
  </h1>
</div>
```

## Contributing

1. Format your code: `npm run format`
2. Run tests: `npm test`
3. Build: `npm run build`

## License

This project is licensed under the MIT License.
