// ic-immagini.tsx - Modulo per l'elaborazione grafica delle icone

import Pica from 'pica';
import * as iq from 'image-q';

// Crea un'istanza singola di Pica.js all'inizio del modulo.
const picaInstance = Pica();

// Funzioni da ic-piattaforme.tsx
import { 
  PLATFORMS,
  PLATFORM_ICONS
} from './ic-piattaforme';

/**
 * Ridimensiona un'immagine usando Pica.js per qualità professionale
 * @param {HTMLCanvasElement} sourceCanvas - Canvas sorgente
 * @param {number} targetWidth - Larghezza target
 * @param {number} targetHeight - Altezza target
 * @returns {Promise<HTMLCanvasElement>} Canvas ridimensionato
 */
export const ResizeImmagineConPica = async (sourceCanvas, targetWidth, targetHeight) => {
  const targetCanvas = document.createElement('canvas');
  targetCanvas.width = targetWidth;
  targetCanvas.height = targetHeight;
  // Configurazione Pica per qualità ottimale
  const picaOptions = {
    quality: 3, // Lanczos filter (massima qualità)
    alpha: true, // Preserva trasparenza
    unsharpAmount: targetWidth < 64 ? 160 : 80, // Sharpening adattivo
    unsharpRadius: 0.6,
    unsharpThreshold: 1
  };
  // Usa Pica per il resize di qualità professionale
  await picaInstance.resize(sourceCanvas, targetCanvas, picaOptions);
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
export const generaIcone = async (file, platforms, onProgress) => {
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
            const resizedCanvas = await ResizeImmagineConPica(sourceCanvas, size, size);
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
 * Ottimizza le icone già generate con quantizzazione del colore
 * @param {Array} icons - Array delle icone già processate con Pica.js
 * @param {Function} onProgress - Callback per il progresso
 * @returns {Promise<Array>} Array delle icone ottimizzate
 */
export const optimizeIcons = async (icons, onProgress) => {
  const optimizedIcons = [];
  
  for (let i = 0; i < icons.length; i++) {
    const icon = icons[i];
    
    try {
      const img = new Image();
      const sourceCanvas = document.createElement('canvas');
      const ctx = sourceCanvas.getContext('2d');
      
      // Carica l'icona esistente (già processata con Pica.js)
      await new Promise((resolve) => {
        img.onload = () => {
          sourceCanvas.width = icon.size;
          sourceCanvas.height = icon.size;
          ctx.drawImage(img, 0, 0);
          resolve();
        };
        img.src = icon.dataUrl;
      });
      
      // --- OTTIMIZZAZIONE PNG con quantizzazione del colore tramite image-q ---
      try {
        // 1. Ottenere i dati dei pixel dal canvas esistente (già ottimizzato da Pica)
        const imageData = sourceCanvas.getContext('2d').getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
        
        // 2. Creare un PointContainer da image-q
        const pointContainer = iq.utils.PointContainer.fromUint8Array(
          imageData.data, 
          imageData.width, 
          imageData.height
        );
        
        // 3. Applicare la quantizzazione del colore
        const palette = await iq.buildPalette([pointContainer], {
          colors: 256, // Numero massimo di colori
          method: iq.constants.palette.WU, // Algoritmo Wu
          colorDistanceFormula: iq.constants.distance.EUCLIDEAN
        });
        
        // 4. Applicare la palette quantizzata
        const quantizedPointContainer = iq.applyPalette(pointContainer, palette);
        
        // 5. Convertire in Uint8Array
        const quantizedData = quantizedPointContainer.toUint8Array();
        
        // 6. Creare un nuovo ImageData con i dati quantizzati
        const quantizedImageData = new ImageData(
          new Uint8ClampedArray(quantizedData), 
          imageData.width, 
          imageData.height
        );
        
        // 7. Creare un nuovo canvas per l'immagine quantizzata
        const quantizedCanvas = document.createElement('canvas');
        quantizedCanvas.width = sourceCanvas.width;
        quantizedCanvas.height = sourceCanvas.height;
        quantizedCanvas.getContext('2d').putImageData(quantizedImageData, 0, 0);
        
        // 8. Convertire il canvas quantizzato in Data URL
        const finalDataUrl = quantizedCanvas.toDataURL('image/png');
        
        // Calcola le statistiche di ottimizzazione
        const originalSize = Math.round(icon.dataUrl.length * 0.75 / 1024);
        const optimizedSize = Math.round(finalDataUrl.length * 0.75 / 1024);
        const savings = originalSize > 0 ? Math.round((1 - optimizedSize / originalSize) * 100) : 0;
        
        optimizedIcons.push({
          ...icon,
          dataUrl: finalDataUrl,
          optimized: true,
          originalSize: originalSize + 'KB',
          optimizedSize: optimizedSize + 'KB',
          savings: savings + '%',
          quality: 'premium',
          algorithm: 'Pica Lanczos + Image-Q Wu Quantization'
        });
        
      } catch (quantizeError) {
        console.warn(`Quantizzazione fallita per icona ${icon.size}px, mantengo versione Pica:`, quantizeError);
        
        // Fallback: mantieni l'icona già ottimizzata con Pica
        const originalSize = Math.round(icon.dataUrl.length * 0.75 / 1024);
        
        optimizedIcons.push({
          ...icon,
          optimized: true,
          originalSize: originalSize + 'KB',
          optimizedSize: originalSize + 'KB',
          savings: '0%',
          quality: 'high',
          algorithm: 'Pica Lanczos (Image-Q unavailable)'
        });
      }
      
    } catch (error) {
      console.error(`Errore ottimizzando icona ${icon.size}px:`, error);
      optimizedIcons.push({
        ...icon,
        optimized: false,
        quality: 'standard',
        error: error.message
      });
    }
    
    onProgress(((i + 1) / icons.length) * 100);
    await new Promise(resolve => setTimeout(resolve, 50)); // Ridotto il delay
  }
  
  return optimizedIcons;
};
