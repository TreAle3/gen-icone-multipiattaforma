// ic-file-zip.tsx - Funzioni per creare i file zip

import JSZip from 'jszip';
import { dataURLtoBlob } from './ic-funzioni-utili';

/**
 * Crea Contents.json per iOS
 * @param {Array} iOSIcons - Array di icone iOS
 * @returns {string|null} JSON string o null se non ci sono icone
 */
export const createiOSContentsJson = (iOSIcons) => {
  if (!iOSIcons || iOSIcons.length === 0) return null;
  
  const images = iOSIcons.map(icon => ({
    size: `${icon.size}x${icon.size}`,
    idiom: icon.size <= 40 ? 'universal' : icon.size <= 76 ? 'iphone' : 'ipad',
    filename: `icon-${icon.size}x${icon.size}.png`,
    scale: '1x'
  }));
  
  const contents = {
    images: images,
    info: {
      author: 'icon-generator',
      version: 1
    }
  };
  
  return JSON.stringify(contents, null, 2);
};

/**
 * Crea Web App Manifest per browser
 * @param {Array} browserIcons - Array di icone browser
 * @returns {string|null} JSON string o null se non ci sono icone
 */
export const createWebManifest = (browserIcons) => {
  if (!browserIcons || browserIcons.length === 0) return null;
  
  const icons = browserIcons.map(icon => ({
    src: `favicon/favicon-${icon.size}x${icon.size}.png`,
    sizes: `${icon.size}x${icon.size}`,
    type: 'image/png'
  }));
  
  const manifest = {
    name: 'My App',
    short_name: 'App',
    icons: icons,
    theme_color: '#ffffff',
    background_color: '#ffffff',
    display: 'standalone'
  };
  
  return JSON.stringify(manifest, null, 2);
};

/**
 * Crea contenuto README sicuro
 * @param {Array} icons - Array di icone
 * @param {boolean} isOptimized - Se le icone sono ottimizzate
 * @returns {string} Contenuto README
 */
export const createSafeReadmeContent = (icons, isOptimized) => {
  const date = new Date().toLocaleDateString('it-IT');
  const averageSavings = isOptimized ? 
    Math.round(icons.reduce((acc, icon) => 
      acc + (parseInt(icon.savings) || 0), 0) / icons.length) : 0;
  
  // Testo semplice senza caratteri speciali problematici
  const content = `# Icone Generate - Multi-Piattaforma

## Struttura delle Cartelle

### Android
- **mipmap-mdpi/**: 48x48px (density ~160dpi)
- **mipmap-hdpi/**: 72x72px (density ~240dpi)
- **mipmap-xhdpi/**: 96x96px (density ~320dpi)
- **mipmap-xxhdpi/**: 144x144px (density ~480dpi)
- **mipmap-xxxhdpi/**: 192x192px (density ~640dpi)
- **play-store/**: 512x512px (Google Play Store)

### iOS
- **AppIcon.appiconset/**: Contiene tutte le dimensioni per iOS
  - icon-20.png: Notification (20x20)
  - icon-29.png: Settings (29x29)
  - icon-40.png: Spotlight (40x40)
  - icon-60.png: App iPhone (60x60)
  - icon-76.png: App iPad (76x76)
  - icon-1024.png: App Store (1024x1024)

### Windows
- **tiles/**: Icone per Windows tiles
- **taskbar/**: Icone per taskbar

### Browser
- **favicon/**: Icone per browser
  - favicon-16x16.png
  - favicon-32x32.png
  - android-chrome-192x192.png
  - apple-touch-icon-180x180.png

## Istruzioni per l'Uso

### Android
1. Copia le cartelle mipmap-* in \`app/src/main/res/\`
2. Carica l'icona del Play Store nel Google Play Console

### iOS
1. Sostituisci il contenuto di AppIcon.appiconset nel tuo progetto Xcode
2. Assicurati che Contents.json sia configurato correttamente

### Windows
1. Usa le icone della cartella tiles per le Live Tiles
2. Usa l'icona taskbar per la barra delle applicazioni

### Browser
1. Aggiungi le favicon nella root del tuo sito web
2. Includi i meta tag appropriati nell'HTML

## Qualità delle Icone

${isOptimized ? `
✅ **Ottimizzate con Canvas API**
- Resize di alta qualità
- Sharpening adattivo
- Compressione intelligente

**Statistiche:**
- Icone generate: ${icons.length}
- Spazio risparmiato medio: ${Math.round(icons.reduce((acc, icon) => 
  acc + (parseInt(icon.savings) || 0), 0) / icons.length)}%
- Qualità: Premium
` : `
📱 **Qualità Standard**
- Resize con Canvas API
- Qualità buona per uso generale
- Pronte per essere ottimizzate
`}

Generato il ${new Date().toLocaleString('it-IT')}
`;

  return content;
};

/**
 * Genera il nome del file per ogni piattaforma
 * @param {Object} icon - Oggetto icona
 * @param {string} platform - Nome della piattaforma
 * @returns {string} Nome del file
 */
export const generateFileName = (icon, platform) => {
  switch (platform) {
    case 'android':
      return `ic_launcher.png`;
    case 'ios':
      return `icon-${icon.size}x${icon.size}.png`;
    case 'windows':
      return `icon-${icon.size}x${icon.size}.png`;
    case 'browser':
      if (icon.name.includes('favicon')) {
        return `favicon-${icon.size}x${icon.size}.png`;
      } else if (icon.name.includes('apple-touch')) {
        return `apple-touch-icon-${icon.size}x${icon.size}.png`;
      } else {
        return `android-chrome-${icon.size}x${icon.size}.png`;
      }
    default:
      return `icon-${icon.size}x${icon.size}.png`;
  }
};

/**
 * Crea e scarica il file ZIP con le icone
 * @param {Array} icons - Array di icone generate
 * @param {boolean} isOptimized - Se le icone sono ottimizzate
 * @returns {Promise<Object>} Risultato dell'operazione
 */
export const createAndDownloadZip = async (icons, isOptimized) => {
  try {
    // Crea una nuova istanza di JSZip
    const zip = new JSZip();
    
    // Organizza le icone per piattaforma
    const platformFolders = {};
    
    icons.forEach(icon => {
      const platformKey = icon.platform.toLowerCase();
      const folderName = icon.folder;
      
      if (!platformFolders[platformKey]) {
        platformFolders[platformKey] = {};
      }
      
      if (!platformFolders[platformKey][folderName]) {
        platformFolders[platformKey][folderName] = [];
      }
      
      platformFolders[platformKey][folderName].push(icon);
    });
    
    // Aggiungi le icone al ZIP
    let totalFiles = 0;
    
    for (const [platform, folders] of Object.entries(platformFolders)) {
      for (const [folderName, iconList] of Object.entries(folders)) {
        iconList.forEach(icon => {
          const fileName = generateFileName(icon, platform);
          const fullPath = `icons/${platform}/${folderName}/${fileName}`;
          
          // Converti dataURL in blob
          const imageData = dataURLtoBlob(icon.dataUrl);
          
          // Aggiungi al ZIP
          zip.file(fullPath, imageData);
          totalFiles++;
        });
      }
    }
    
    // Aggiungi README
    const readmeContent = createSafeReadmeContent(icons, isOptimized);
    zip.file('README.md', readmeContent);
    totalFiles++;
    
    // Aggiungi file di configurazione per ogni piattaforma
    
    // Contents.json per iOS
    const iOSContents = createiOSContentsJson(icons.filter(i => i.platform === 'iOS'));
    if (iOSContents) {
      zip.file('icons/ios/AppIcon.appiconset/Contents.json', iOSContents);
      totalFiles++;
    }
    
    // Web App Manifest per browser
    const webManifest = createWebManifest(icons.filter(i => i.platform === 'Browser'));
    if (webManifest) {
      zip.file('icons/browser/manifest.json', webManifest);
      totalFiles++;
    }
    
    // Genera il ZIP
    console.log(`Generando ZIP con ${totalFiles} file...`);
    
    const zipBlob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 9
      }
    });
    
    console.log('ZIP generato:', zipBlob.size, 'bytes');
    
    // Verifica che il ZIP non sia vuoto
    if (zipBlob.size < 100) {
      throw new Error('ZIP generato troppo piccolo, possibile errore');
    }
    
    // Crea il link di download
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `icone-multi-piattaforma-${new Date().toISOString().split('T')[0]}.zip`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Cleanup
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
    
    return { success: true, fileCount: totalFiles };
    
  } catch (error) {
    console.error('Errore nella creazione del ZIP:', error);
    throw new Error(`Errore ZIP: ${error.message}`);
  }
};
