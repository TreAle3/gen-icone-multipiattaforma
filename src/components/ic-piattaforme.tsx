// ic-piattaforme.tsx - Definizioni complete delle piattaforme supportate

/**
 * Definizioni delle piattaforme supportate con le relative dimensioni
 */
export const PLATFORMS = {
  android: {
    name: 'Android',
    sizes: [
      { name: 'mdpi', size: 48, folder: 'mipmap-mdpi' },
      { name: 'hdpi', size: 72, folder: 'mipmap-hdpi' },
      { name: 'xhdpi', size: 96, folder: 'mipmap-xhdpi' },
      { name: 'xxhdpi', size: 144, folder: 'mipmap-xxhdpi' },
      { name: 'xxxhdpi', size: 192, folder: 'mipmap-xxxhdpi' },
      { name: 'play-store', size: 512, folder: 'play-store' }
    ]
  },
  ios: {
    name: 'iOS',
    sizes: [
      { name: 'notification', size: 20, folder: 'AppIcon.appiconset' },
      { name: 'settings', size: 29, folder: 'AppIcon.appiconset' },
      { name: 'spotlight', size: 40, folder: 'AppIcon.appiconset' },
      { name: 'app-iphone', size: 60, folder: 'AppIcon.appiconset' },
      { name: 'app-ipad', size: 76, folder: 'AppIcon.appiconset' },
      { name: 'app-store', size: 1024, folder: 'AppIcon.appiconset' }
    ]
  },
  windows: {
    name: 'Windows',
    sizes: [
      { name: 'small-tile', size: 71, folder: 'tiles' },
      { name: 'medium-tile', size: 150, folder: 'tiles' },
      { name: 'large-tile', size: 310, folder: 'tiles' },
      { name: 'taskbar', size: 24, folder: 'taskbar' }
    ]
  },
  browser: {
    name: 'Browser',
    sizes: [
      { name: 'favicon-16', size: 16, folder: 'favicon' },
      { name: 'favicon-32', size: 32, folder: 'favicon' },
      { name: 'apple-touch', size: 180, folder: 'favicon' },
      { name: 'android-chrome', size: 192, folder: 'favicon' }
    ]
  },
  macos: {
    name: 'macOS',
    sizes: [
      { name: 'menubar', size: 16, folder: 'AppIcon.iconset' },
      { name: 'menubar@2x', size: 32, folder: 'AppIcon.iconset' },
      { name: 'dock', size: 32, folder: 'AppIcon.iconset' },
      { name: 'dock@2x', size: 64, folder: 'AppIcon.iconset' },
      { name: 'finder', size: 128, folder: 'AppIcon.iconset' },
      { name: 'finder@2x', size: 256, folder: 'AppIcon.iconset' },
      { name: 'app', size: 512, folder: 'AppIcon.iconset' },
      { name: 'app@2x', size: 1024, folder: 'AppIcon.iconset' }
    ]
  },
  linux: {
    name: 'Linux',
    sizes: [
      { name: 'small', size: 16, folder: 'hicolor/16x16/apps' },
      { name: 'small-med', size: 22, folder: 'hicolor/22x22/apps' },
      { name: 'medium', size: 24, folder: 'hicolor/24x24/apps' },
      { name: 'medium-large', size: 32, folder: 'hicolor/32x32/apps' },
      { name: 'large', size: 48, folder: 'hicolor/48x48/apps' },
      { name: 'extra-large', size: 64, folder: 'hicolor/64x64/apps' },
      { name: 'huge', size: 96, folder: 'hicolor/96x96/apps' },
      { name: 'enormous', size: 128, folder: 'hicolor/128x128/apps' },
      { name: 'gigantic', size: 192, folder: 'hicolor/192x192/apps' },
      { name: 'colossal', size: 256, folder: 'hicolor/256x256/apps' }
    ]
  }
};