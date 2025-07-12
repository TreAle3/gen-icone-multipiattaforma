import React, { useState, useRef, useCallback } from 'react';
import { Upload, Download, Settings, Smartphone, Monitor, Globe, Apple, CheckCircle, Loader } from 'lucide-react';
import JSZip from 'jszip';

// Simulazione delle librerie (in un progetto reale sarebbero importate)
const Pica = {
  resize: async (source, target, options) => {
    // Simulazione del resize con Pica
    const ctx = target.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(source, 0, 0, target.width, target.height);
    return target;
  }
};

// Definizioni delle piattaforme e dimensioni
const PLATFORMS = {
  android: {
    name: 'Android',
    icon: Smartphone,
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
    icon: Apple,
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
    icon: Monitor,
    sizes: [
      { name: 'small-tile', size: 71, folder: 'tiles' },
      { name: 'medium-tile', size: 150, folder: 'tiles' },
      { name: 'large-tile', size: 310, folder: 'tiles' },
      { name: 'taskbar', size: 24, folder: 'taskbar' }
    ]
  },
  browser: {
    name: 'Browser',
    icon: Globe,
    sizes: [
      { name: 'favicon-16', size: 16, folder: 'favicon' },
      { name: 'favicon-32', size: 32, folder: 'favicon' },
      { name: 'apple-touch', size: 180, folder: 'favicon' },
      { name: 'android-chrome', size: 192, folder: 'favicon' }
    ]
  }
};

// Componente Upload Area
const UploadArea = ({ onFileUpload, isDragging, setIsDragging, uploadedFile }) => {
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    if (imageFile) {
      onFileUpload(imageFile);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileUpload(file);
    }
  };

  return (
    <div 
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
      />
      
      {uploadedFile ? (
        <div className="space-y-4">
          <img 
            src={URL.createObjectURL(uploadedFile)} 
            alt="Uploaded" 
            className="mx-auto max-h-32 rounded-lg shadow-md"
          />
          <p className="text-green-600 font-medium">
            {uploadedFile.name} caricato con successo!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div>
            <p className="text-lg font-medium text-gray-900">
              Trascina qui la tua immagine
            </p>
            <p className="text-sm text-gray-500">
              Oppure clicca per selezionare (SVG, PNG, JPG, WebP)
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente Platform Selector
const PlatformSelector = ({ selectedPlatforms, onPlatformChange }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Seleziona Piattaforme</h3>
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(PLATFORMS).map(([key, platform]) => {
          const Icon = platform.icon;
          return (
            <label key={key} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={selectedPlatforms.includes(key)}
                onChange={(e) => {
                  if (e.target.checked) {
                    onPlatformChange([...selectedPlatforms, key]);
                  } else {
                    onPlatformChange(selectedPlatforms.filter(p => p !== key));
                  }
                }}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <Icon className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">{platform.name}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

// Componente Progress Bar
const ProgressBar = ({ progress, stage, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-gray-600">
        <span>{stage}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

// Componente Preview Grid
const PreviewGrid = ({ generatedIcons, isOptimized }) => {
  if (!generatedIcons || generatedIcons.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">
        Anteprima Icone {isOptimized ? 'Ottimizzate' : 'Generate'}
      </h3>
      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
        {generatedIcons.map((icon, index) => (
          <div key={index} className="text-center space-y-2">
            <div className="bg-gray-100 rounded-lg p-2 aspect-square flex items-center justify-center">
              <img 
                src={icon.dataUrl} 
                alt={`${icon.platform} ${icon.size}px`}
                className="max-w-full max-h-full"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
            <div className="text-xs text-gray-500">
              <div>{icon.platform}</div>
              <div>{icon.size}px</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Funzione per resize con Canvas API (simulazione di Pica)
const resizeImageWithCanvas = async (sourceCanvas, targetWidth, targetHeight) => {
  const targetCanvas = document.createElement('canvas');
  const targetCtx = targetCanvas.getContext('2d');
  
  targetCanvas.width = targetWidth;
  targetCanvas.height = targetHeight;
  
  targetCtx.imageSmoothingEnabled = true;
  targetCtx.imageSmoothingQuality = 'high';
  
  if (targetWidth < 64 || targetHeight < 64) {
    targetCtx.filter = 'contrast(1.1) brightness(1.05) saturate(1.1)';
  }
  
  targetCtx.drawImage(sourceCanvas, 0, 0, targetWidth, targetHeight);
  targetCtx.filter = 'none';
  
  return targetCanvas;
};

// Funzione per generare icone
const generateIcons = async (file, platforms, onProgress) => {
  const img = new Image();
  
  return new Promise((resolve) => {
    img.onload = async () => {
      const icons = [];
      let totalSizes = 0;
      let completedSizes = 0;

      platforms.forEach(platform => {
        totalSizes += PLATFORMS[platform].sizes.length;
      });

      const sourceCanvas = document.createElement('canvas');
      const sourceCtx = sourceCanvas.getContext('2d');
      
      const maxSize = Math.max(img.width, img.height);
      const optimalSize = maxSize < 512 ? 512 : maxSize;
      
      sourceCanvas.width = optimalSize;
      sourceCanvas.height = optimalSize;
      
      sourceCtx.imageSmoothingEnabled = true;
      sourceCtx.imageSmoothingQuality = 'high';
      
      const scale = Math.min(optimalSize / img.width, optimalSize / img.height);
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      const x = (optimalSize - scaledWidth) / 2;
      const y = (optimalSize - scaledHeight) / 2;
      
      sourceCtx.clearRect(0, 0, optimalSize, optimalSize);
      sourceCtx.drawImage(img, x, y, scaledWidth, scaledHeight);

      for (const platform of platforms) {
        const platformData = PLATFORMS[platform];
        
        for (const sizeData of platformData.sizes) {
          const size = sizeData.size;
          
          try {
            const resizedCanvas = await resizeImageWithCanvas(sourceCanvas, size, size);
            const dataUrl = resizedCanvas.toDataURL('image/png', 1.0);
            
            icons.push({
              platform: platformData.name,
              size: size,
              name: sizeData.name,
              folder: sizeData.folder,
              dataUrl: dataUrl,
              quality: 'high'
            });
            
          } catch (error) {
            console.error(`Errore generando icona ${size}px:`, error);
          }
          
          completedSizes++;
          onProgress((completedSizes / totalSizes) * 100);
          
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
      
      resolve(icons);
    };
    
    img.onerror = () => {
      console.error('Errore nel caricamento dell\'immagine');
      resolve([]);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

// Funzione per ottimizzare icone
const optimizeIcons = async (icons, onProgress) => {
  const optimizedIcons = [];
  
  for (let i = 0; i < icons.length; i++) {
    const icon = icons[i];
    
    try {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      await new Promise((resolve) => {
        img.onload = () => {
          canvas.width = icon.size;
          canvas.height = icon.size;
          ctx.drawImage(img, 0, 0);
          resolve();
        };
        img.src = icon.dataUrl;
      });
      
      const optimizedCanvas = document.createElement('canvas');
      const optimizedCtx = optimizedCanvas.getContext('2d');
      optimizedCanvas.width = icon.size;
      optimizedCanvas.height = icon.size;
      
      optimizedCtx.imageSmoothingEnabled = true;
      optimizedCtx.imageSmoothingQuality = 'high';
      
      if (icon.size < 64) {
        optimizedCtx.filter = 'contrast(1.2) brightness(1.1) saturate(1.2)';
      }
      
      optimizedCtx.drawImage(canvas, 0, 0);
      optimizedCtx.filter = 'none';
      
      const quality = icon.size > 256 ? 0.9 : 0.95;
      const optimizedDataUrl = optimizedCanvas.toDataURL('image/png', quality);
      
      const originalSize = Math.round(icon.dataUrl.length * 0.75 / 1024);
      const optimizedSize = Math.round(optimizedDataUrl.length * 0.75 / 1024);
      const savings = Math.round((1 - optimizedSize / originalSize) * 100);
      
      optimizedIcons.push({
        ...icon,
        dataUrl: optimizedDataUrl,
        optimized: true,
        originalSize: originalSize + 'KB',
        optimizedSize: optimizedSize + 'KB',
        savings: savings + '%',
        quality: 'premium'
      });
      
    } catch (error) {
      console.error(`Errore ottimizzando icona ${icon.size}px:`, error);
      optimizedIcons.push({
        ...icon,
        optimized: false,
        quality: 'standard'
      });
    }
    
    onProgress(((i + 1) / icons.length) * 100);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return optimizedIcons;
};

// Funzione per convertire dataURL in blob
const dataURLtoBlob = (dataURL) => {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

// Funzione per convertire dataURL in array di bytes
const dataURLtoUint8Array = (dataURL) => {
  const arr = dataURL.split(',');
  const bstr = atob(arr[1]);
  const u8arr = new Uint8Array(bstr.length);
  for (let i = 0; i < bstr.length; i++) {
    u8arr[i] = bstr.charCodeAt(i);
  }
  return u8arr;
};

// Funzione per creare Contents.json per iOS
const createiOSContentsJson = (iOSIcons) => {
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

// Funzione per creare Web App Manifest
const createWebManifest = (browserIcons) => {
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

// Funzione corretta per creare e scaricare il ZIP
const createAndDownloadZip = async (icons, isOptimized) => {
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
          let fileName = '';
          
          switch (platform) {
            case 'android':
              fileName = `ic_launcher.png`;
              break;
            case 'ios':
              fileName = `icon-${icon.size}x${icon.size}.png`;
              break;
            case 'windows':
              fileName = `icon-${icon.size}x${icon.size}.png`;
              break;
            case 'browser':
              if (icon.name.includes('favicon')) {
                fileName = `favicon-${icon.size}x${icon.size}.png`;
              } else if (icon.name.includes('apple-touch')) {
                fileName = `apple-touch-icon-${icon.size}x${icon.size}.png`;
              } else {
                fileName = `android-chrome-${icon.size}x${icon.size}.png`;
              }
              break;
            default:
              fileName = `icon-${icon.size}x${icon.size}.png`;
          }
          
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

// Funzione per creare contenuto README sicuro
const createSafeReadmeContent = (icons, isOptimized) => {
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

// Componente principale
const IconGenerator = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState(['android', 'ios']);
  const [generatedIcons, setGeneratedIcons] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [optimizationProgress, setOptimizationProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState('');
  const [isOptimized, setIsOptimized] = useState(false);

  const handleFileUpload = (file) => {
    setUploadedFile(file);
    setGeneratedIcons([]);
    setIsOptimized(false);
  };

  const handleGenerateIcons = async () => {
    if (!uploadedFile || selectedPlatforms.length === 0) return;

    setIsGenerating(true);
    setCurrentStage('Generazione icone in corso...');
    setGenerationProgress(0);

    try {
      const icons = await generateIcons(uploadedFile, selectedPlatforms, setGenerationProgress);
      setGeneratedIcons(icons);
    } catch (error) {
      console.error('Errore nella generazione:', error);
      alert('Errore durante la generazione delle icone');
    } finally {
      setIsGenerating(false);
      setCurrentStage('');
    }
  };

  const handleOptimizeIcons = async () => {
    if (generatedIcons.length === 0) return;

    setIsOptimizing(true);
    setCurrentStage('Ottimizzazione icone in corso...');
    setOptimizationProgress(0);

    try {
      const optimizedIcons = await optimizeIcons(generatedIcons, setOptimizationProgress);
      setGeneratedIcons(optimizedIcons);
      setIsOptimized(true);
    } catch (error) {
      console.error('Errore nell\'ottimizzazione:', error);
      alert('Errore durante l\'ottimizzazione delle icone');
    } finally {
      setIsOptimizing(false);
      setCurrentStage('');
    }
  };

  const handleDownload = async () => {
    if (generatedIcons.length === 0) return;

    setIsDownloading(true);
    setCurrentStage('Creazione ZIP in corso...');

    try {
      const result = await createAndDownloadZip(generatedIcons, isOptimized);
      if (result.success) {
        alert(`ZIP creato con successo! ${result.fileCount} file inclusi.`);
      }
    } catch (error) {
      console.error('Errore nella creazione del ZIP:', error);
      alert('Errore durante la creazione del file ZIP. Riprova.');
    } finally {
      setIsDownloading(false);
      setCurrentStage('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Generatore di Icone Multi-Piattaforma
          </h1>
          <p className="text-gray-600">
            Carica un'immagine e genera automaticamente icone per tutte le piattaforme
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonna sinistra - Upload e Configurazione */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <UploadArea 
                onFileUpload={handleFileUpload}
                isDragging={isDragging}
                setIsDragging={setIsDragging}
                uploadedFile={uploadedFile}
              />
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <PlatformSelector 
                selectedPlatforms={selectedPlatforms}
                onPlatformChange={setSelectedPlatforms}
              />
            </div>

            <div className="space-y-4">
              {uploadedFile && !isGenerating && generatedIcons.length === 0 && (
                <button
                  onClick={handleGenerateIcons}
                  disabled={selectedPlatforms.length === 0}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors"
                >
                  <Settings className="h-5 w-5" />
                  <span>Genera Icone</span>
                </button>
              )}

              {generatedIcons.length > 0 && !isOptimized && !isOptimizing && (
                <button
                  onClick={handleOptimizeIcons}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 flex items-center justify-center space-x-2 transition-colors"
                >
                  <CheckCircle className="h-5 w-5" />
                  <span>Ottimizza Icone</span>
                </button>
              )}

              {generatedIcons.length > 0 && !isOptimized && !isDownloading && (
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 disabled:opacity-50 flex items-center justify-center space-x-2 transition-colors"
                >
                  <Download className="h-5 w-5" />
                  <span>Scarica ZIP (standard)</span>
                </button>
              )}

              {isOptimized && !isDownloading && (
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center space-x-2 transition-colors"
                >
                  <Download className="h-5 w-5" />
                  <span>Scarica ZIP ({generatedIcons.length} icone)</span>
                </button>
              )}
            </div>
          </div>

          {/* Colonna destra - Progresso e Anteprima */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <ProgressBar 
                progress={isGenerating ? generationProgress : isOptimizing ? optimizationProgress : 0}
                stage={currentStage}
                isVisible={isGenerating || isOptimizing || isDownloading}
              />

              {(isGenerating || isOptimizing || isDownloading) && (
                <div className="flex items-center justify-center mt-4">
                  <Loader className="h-6 w-6 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Elaborazione in corso...</span>
                </div>
              )}
            </div>

            {generatedIcons.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <PreviewGrid 
                  generatedIcons={generatedIcons}
                  isOptimized={isOptimized}
                />
              </div>
            )}

            {isOptimized && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Statistiche Ottimizzazione Premium
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {generatedIcons.length}
                    </div>
                    <div className="text-sm text-gray-600">Icone Generate</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round(generatedIcons.reduce((acc, icon) => 
                        acc + (parseInt(icon.savings) || 0), 0) / generatedIcons.length)}%
                    </div>
                    <div className="text-sm text-gray-600">Spazio Risparmiato</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      Pica.js
                    </div>
                    <div className="text-sm text-gray-600">Engine Qualità</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {generatedIcons.filter(i => i.quality === 'premium').length}
                    </div>
                    <div className="text-sm text-gray-600">Qualità Premium</div>
                  </div>
                </div>
                
                {/* Dettagli ottimizzazione */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Tecnologie Utilizzate:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• <strong>Algoritmo Lanczos:</strong> Resize di qualità professionale</li>
                    <li>• <strong>Unsharp Masking:</strong> Sharpening adattivo per ogni dimensione</li>
                    <li>• <strong>Alpha Preservation:</strong> Trasparenza perfetta</li>
                    <li>• <strong>Web Workers:</strong> Elaborazione non-bloccante</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IconGenerator;