// imageProcessor.js - Modulo per l'elaborazione grafica delle icone

// Funzioni da ic-piattaforme.tsx
import { 
  PLATFORMS,
  PLATFORM_ICONS
} from './ic-piattaforme';

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

/**
 * Ridimensiona un'immagine usando Canvas API con ottimizzazioni di qualità
 * @param {HTMLCanvasElement} sourceCanvas - Canvas sorgente
 * @param {number} targetWidth - Larghezza target
 * @param {number} targetHeight - Altezza target
 * @returns {Promise<HTMLCanvasElement>} Canvas ridimensionato
 */
export const resizeImageWithCanvas = async (sourceCanvas, targetWidth, targetHeight) => {
  const targetCanvas = document.createElement('canvas');
  const targetCtx = targetCanvas.getContext('2d');
  
  targetCanvas.width = targetWidth;
  targetCanvas.height = targetHeight;
  
  targetCtx.imageSmoothingEnabled = true;
  targetCtx.imageSmoothingQuality = 'high';
  
  // Applica filtri per icone piccole per migliorare la leggibilità
  if (targetWidth < 64 || targetHeight < 64) {
    targetCtx.filter = 'contrast(1.1) brightness(1.05) saturate(1.1)';
  }
  
  targetCtx.drawImage(sourceCanvas, 0, 0, targetWidth, targetHeight);
  targetCtx.filter = 'none';
  
  return targetCanvas;
};

/**
 * Prepara il canvas sorgente ottimizzato dall'immagine caricata
 * @param {HTMLImageElement} img - Immagine sorgente
 * @returns {HTMLCanvasElement} Canvas ottimizzato
 */
export const prepareSourceCanvas = (img) => {
  const sourceCanvas = document.createElement('canvas');
  const sourceCtx = sourceCanvas.getContext('2d');
  
  const maxSize = Math.max(img.width, img.height);
  const optimalSize = maxSize < 512 ? 512 : maxSize;
  
  sourceCanvas.width = optimalSize;
  sourceCanvas.height = optimalSize;
  
  sourceCtx.imageSmoothingEnabled = true;
  sourceCtx.imageSmoothingQuality = 'high';
  
  // Centra l'immagine nel canvas quadrato
  const scale = Math.min(optimalSize / img.width, optimalSize / img.height);
  const scaledWidth = img.width * scale;
  const scaledHeight = img.height * scale;
  const x = (optimalSize - scaledWidth) / 2;
  const y = (optimalSize - scaledHeight) / 2;
  
  sourceCtx.clearRect(0, 0, optimalSize, optimalSize);
  sourceCtx.drawImage(img, x, y, scaledWidth, scaledHeight);
  
  return sourceCanvas;
};

/**
 * Genera tutte le icone per le piattaforme selezionate
 * @param {File} file - File immagine caricato
 * @param {string[]} platforms - Array delle piattaforme selezionate
 * @param {Function} onProgress - Callback per il progresso
 * @returns {Promise<Array>} Array delle icone generate
 */
export const generateIcons = async (file, platforms, onProgress) => {
  const img = new Image();
  
  return new Promise((resolve) => {
    img.onload = async () => {
      const icons = [];
      let totalSizes = 0;
      let completedSizes = 0;

      // Calcola il totale delle dimensioni da generare
      platforms.forEach(platform => {
        totalSizes += PLATFORMS[platform].sizes.length;
      });

      // Prepara il canvas sorgente ottimizzato
      const sourceCanvas = prepareSourceCanvas(img);

      // Genera le icone per ogni piattaforma
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
          
          // Piccola pausa per non bloccare l'interfaccia
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

/**
 * Ottimizza le icone generate con algoritmi avanzati
 * @param {Array} icons - Array delle icone da ottimizzare
 * @param {Function} onProgress - Callback per il progresso
 * @returns {Promise<Array>} Array delle icone ottimizzate
 */
export const optimizeIcons = async (icons, onProgress) => {
  const optimizedIcons = [];
  
  for (let i = 0; i < icons.length; i++) {
    const icon = icons[i];
    
    try {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Carica l'icona esistente
      await new Promise((resolve) => {
        img.onload = () => {
          canvas.width = icon.size;
          canvas.height = icon.size;
          ctx.drawImage(img, 0, 0);
          resolve();
        };
        img.src = icon.dataUrl;
      });
      
      // Crea canvas ottimizzato
      const optimizedCanvas = document.createElement('canvas');
      const optimizedCtx = optimizedCanvas.getContext('2d');
      optimizedCanvas.width = icon.size;
      optimizedCanvas.height = icon.size;
      
      optimizedCtx.imageSmoothingEnabled = true;
      optimizedCtx.imageSmoothingQuality = 'high';
      
      // Applica filtri di ottimizzazione per icone piccole
      if (icon.size < 64) {
        optimizedCtx.filter = 'contrast(1.2) brightness(1.1) saturate(1.2)';
      }
      
      optimizedCtx.drawImage(canvas, 0, 0);
      optimizedCtx.filter = 'none';
      
      // Determina la qualità di compressione basata sulla dimensione
      const quality = icon.size > 256 ? 0.9 : 0.95;
      const optimizedDataUrl = optimizedCanvas.toDataURL('image/png', quality);
      
      // Calcola le statistiche di ottimizzazione
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
