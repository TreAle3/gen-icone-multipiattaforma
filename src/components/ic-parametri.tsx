// ic-parametri.js - Definizioni delle costanti per il generatore di icone

/**
 * Soglie di dimensione per applicare filtri di ottimizzazione
 */
export const SIZE_THRESHOLDS = {
  SMALL_ICON: 64,
  LARGE_ICON: 256,
  OPTIMAL_SOURCE: 512
};

/**
 * Configurazioni di qualità per l'ottimizzazione
 */
export const QUALITY_SETTINGS = {
  HIGH: 0.95,
  MEDIUM: 0.9,
  LOW: 0.8
};

/**
 * Filtri CSS per l'ottimizzazione delle icone piccole
 */
export const IMAGE_FILTERS = {
  SMALL_ICON_STANDARD: 'contrast(1.1) brightness(1.05) saturate(1.1)',
  SMALL_ICON_PREMIUM: 'contrast(1.2) brightness(1.1) saturate(1.2)',
  NONE: 'none'
};

/**
 * Formati di output supportati
 */
export const OUTPUT_FORMATS = {
  PNG: 'image/png',
  JPEG: 'image/jpeg',
  WEBP: 'image/webp'
};

/**
 * Configurazioni per il canvas
 */
export const CANVAS_CONFIG = {
  SMOOTHING_ENABLED: true,
  SMOOTHING_QUALITY: 'high',
  ALPHA_ENABLED: true
};

/**
 * Ritardi per evitare il blocco dell'interfaccia
 */
export const PROCESSING_DELAYS = {
  GENERATION_STEP: 50,
  OPTIMIZATION_STEP: 100,
  UI_UPDATE: 16
};

/**
 * Mappa delle icone Lucide per ogni piattaforma
 */
export const PLATFORM_ICONS = {
  android: 'Smartphone',
  ios: 'Apple',
  windows: 'Monitor',
  browser: 'Globe'
};
