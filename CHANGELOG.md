# Changelog

## [2.0.0] - Angular 20 Upgrade

### 🚀 Major Updates

- **Angular 20.0.0** - Upgraded from Angular 17
- **TypeScript 5.8** - Latest TypeScript version with improved performance
- **ESBuild Integration** - Faster builds and hot module replacement
- **Zone.js 0.15** - Performance optimizations

### ⚡ Performance Improvements

- **Bundler optimizations** - ESBuild for faster development builds
- **Zone.js coalescing** - Event and run coalescing enabled
- **Modern module resolution** - Using bundler resolution strategy
- **Enhanced tree-shaking** - Better dead code elimination

### 🛠️ Development Experience

- **Stricter TypeScript** - Enhanced type safety with additional compiler options
- **Modern dependencies** - Updated all packages to latest versions
- **Environment configurations** - Proper dev/prod environment setup
- **Bundle analyzer** - Added script for analyzing bundle size

### 📦 Updated Dependencies

- `@angular/*` packages: `20.0.0`
- `typescript`: `5.8.0`
- `tailwindcss`: `3.4.0`
- `prettier`: `3.3.0`
- `jasmine-core`: `5.4.0`
- `@types/node`: `22.0.0`

### 🔧 Configuration Changes

- Switched to `browser-esbuild` builder
- Added module resolution bundler strategy
- Enhanced TypeScript compiler options
- Improved production build optimizations
- Added environment file replacements

### 🧪 Testing Updates

- Updated Jasmine to 5.4
- Added headless test script
- Improved test configuration

### 📝 New Scripts

- `build:prod` - Production build with optimizations
- `test:headless` - Run tests without browser UI
- `analyze` - Bundle size analysis

### 🔄 Migration Notes

- No breaking changes in existing component code
- TypeScript strict mode may require minor type adjustments
- Build process now uses ESBuild for faster compilation
