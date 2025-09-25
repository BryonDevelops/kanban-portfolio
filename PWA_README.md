# Progressive Web App (PWA) Implementation

This portfolio now includes Progressive Web App (PWA) functionality with offline caching capabilities.

## Features Implemented

### 🔄 Service Worker

- **Auto-generated** by `next-pwa` package
- **Automatic registration** and updates
- **Skip waiting** for immediate updates
- **Disabled in development** to avoid conflicts

### 📱 PWA Manifest

- **Web App Manifest** (`/public/manifest.json`)
- **App metadata** (name, description, icons, theme colors)
- **Display mode** set to "standalone" for native app experience
- **Theme color** matching the portfolio design

### 💾 Offline Caching

- **Static assets** cached for offline access
- **Images and fonts** cached with appropriate strategies
- **Automatic cache management** with expiration policies

### 📲 Install Prompt

- **Smart install prompt** component (`PWAInstallPrompt`)
- **Browser compatibility** detection
- **User-friendly interface** with dismiss option
- **Persistent dismissal** using localStorage

### 🚫 Offline Fallback

- **Offline page** (`/app/offline/page.tsx`)
- **Graceful degradation** when network is unavailable
- **User guidance** for reconnection

## How It Works

1. **Installation**: Users can install the portfolio as a native app on their devices
2. **Caching**: Static assets are cached for offline access
3. **Offline Mode**: Previously visited pages remain accessible offline
4. **Updates**: Service worker automatically updates when new content is available

## Browser Support

- ✅ Chrome/Edge (full PWA support)
- ✅ Firefox (partial support)
- ✅ Safari (iOS 11.3+, macOS 10.14.4+)
- ✅ Samsung Internet
- ✅ Other Chromium-based browsers

## Development Notes

- PWA features are **disabled in development** (`NODE_ENV === 'development'`)
- Service worker is **auto-generated** during build process
- Manifest is **statically served** from `/public/manifest.json`
- Install prompt **respects user preferences** (dismissed prompts are remembered)

## Testing PWA Features

1. **Build for production**: `npm run build && npm start`
2. **Open in browser** and check for install prompt
3. **Install the app** on your device
4. **Go offline** and test cached content
5. **Check offline page** at `/offline`

## Configuration Files

- `next.config.ts` - PWA configuration with next-pwa
- `public/manifest.json` - Web App Manifest
- `app/layout.tsx` - PWA metadata and install prompt
- `presentation/components/shared/pwa-install-prompt.tsx` - Install prompt component
- `app/offline/page.tsx` - Offline fallback page
