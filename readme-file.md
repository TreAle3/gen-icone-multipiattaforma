# Icon Generator Multi-Piattaforma

Un generatore di icone professionale che crea automaticamente icone per Android, iOS, Windows, macOS, Linux e Browser da una singola immagine sorgente.

## ✨ Caratteristiche Principali

- **🎯 Multi-Piattaforma**: Genera icone per Android, iOS, Windows, macOS, Linux e Browser
- **🔧 Drag & Drop**: Interfaccia intuitiva con supporto drag and drop
- **⚡ Ottimizzazione Avanzata**: Utilizza Pica.js per resize di qualità professionale
- **📱 Responsive Design**: Funziona perfettamente su desktop, tablet e mobile
- **🎨 Anteprima in Tempo Reale**: Visualizza tutte le icone generate prima del download
- **📦 Download Organizzato**: Scarica un archivio ZIP con cartelle separate per ogni piattaforma
- **🚀 Performance Ottimizzate**: Elaborazione client-side con Web Workers

## 🛠️ Tecnologie Utilizzate

- **React 18** - Framework UI moderno
- **TypeScript** - Type safety e migliore developer experience
- **Tailwind CSS** - Styling utilitario responsive
- **Vite** - Build tool veloce e moderno
- **Pica.js** - Resize di immagini di qualità professionale
- **JSZip** - Generazione archivi ZIP
- **Lucide React** - Icone moderne e scalabili

## 🚀 Quick Start

### Prerequisiti

- Node.js >= 16.0.0
- npm >= 8.0.0

### Installazione

```bash
# Clona il repository
git clone https://github.com/yourusername/icon-generator-multi-platform.git
cd icon-generator-multi-platform

# Installa le dipendenze
npm install

# Avvia il server di sviluppo
npm run dev
```

L'applicazione sarà disponibile su `http://localhost:3000`

### Build per Produzione

```bash
# Crea la build ottimizzata
npm run build

# Anteprima della build
npm run preview
```

## 📱 Piattaforme Supportate

### Android
- mdpi (48x48)
- hdpi (72x72)
- xhdpi (96x96)
- xxhdpi (144x144)
- xxxhdpi (192x192)
- Play Store (512x512)

### iOS
- Notification (20x20)
- Settings (29x29)
- Spotlight (40x40)
- App iPhone (60x60)
- App iPad (76x76)
- App Store (1024x1024)

### Windows
- Small Tile (71x71)
- Medium Tile (150x150)
- Large Tile (310x310)
- Taskbar (24x24)

### Browser
- Favicon 16x16
- Favicon 32x32
- Apple Touch Icon (180x180)
- Android Chrome (192x192)

## 🎨 Utilizzo

1. **Carica un'immagine**: Trascina e rilascia un'immagine (SVG, PNG, JPG, WebP) nell'area di upload
2. **Seleziona le piattaforme**: Scegli per quali piattaforme generare le icone
3. **Genera le icone**: Clicca "