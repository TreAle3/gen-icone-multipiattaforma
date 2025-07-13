import React, { useState, useRef, useCallback } from 'react';
import { Upload, Download, Settings, Smartphone, Monitor, Globe, Apple, CheckCircle, Loader } from 'lucide-react';
import JSZip from 'jszip'; // Non usato direttamente
import Pica from 'pica'; // Non usato direttamente

// Funzioni da ic-immagini.tsx
import { 
  generaIcone, 
  optimizeIcons 
} from './ic-immagini';


// Funzioni da ic-piattaforme.tsx
import { 
  PLATFORMS 
} from './ic-piattaforme';


// Funzioni da ic-file-zip.tsx
import { 
  createAndDownloadZip
} from './ic-file-zip';

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
const HtmlSceltaPiattaforme = ({ selectedPlatforms, onPlatformChange }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Seleziona Piattaforme</h3>
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(PLATFORMS).map(([key, platform]) => {
          // Aggiungi le icone Lucide per ogni piattaforma
          const iconMap = {
            android: Smartphone,
            ios: Apple,
            windows: Monitor,
            browser: Globe
          };
          const Icon = iconMap[key] || Smartphone;
          
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
      const icons = await generaIcone(uploadedFile, selectedPlatforms, setGenerationProgress);
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
              <HtmlSceltaPiattaforme 
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
						acc + (parseInt(icon.savings?.replace('%', '')) || 0), 0) / generatedIcons.length)}%
					</div>
					<div className="text-sm text-gray-600">Spazio Risparmiato</div>
				  </div>
				  <div className="text-center p-4 bg-purple-50 rounded-lg">
					<div className="text-2xl font-bold text-purple-600">
					  Image-Q
					</div>
					<div className="text-sm text-gray-600">Quantizzazione</div>
				  </div>
				  <div className="text-center p-4 bg-orange-50 rounded-lg">
					<div className="text-2xl font-bold text-orange-600">
					  {generatedIcons.filter(i => i.quality === 'premium').length}
					</div>
					<div className="text-sm text-gray-600">Qualità Premium</div>
				  </div>
				</div>
				
				{/* Dettagli ottimizzazione aggiornati */}
				<div className="mt-4 p-3 bg-gray-50 rounded-lg">
				  <h4 className="font-medium text-gray-900 mb-2">Pipeline di Ottimizzazione:</h4>
				  <ul className="text-sm text-gray-600 space-y-1">
					<li>• <strong>Fase 1 - Pica.js:</strong> Resize professionale con filtro Lanczos</li>
					<li>• <strong>Fase 2 - Image-Q:</strong> Quantizzazione colori algoritmo Wu</li>
					<li>• <strong>Unsharp Masking:</strong> Sharpening adattivo per icone piccole</li>
					<li>• <strong>Palette Optimization:</strong> Riduzione a 256 colori ottimali</li>
					<li>• <strong>Alpha Preservation:</strong> Trasparenza perfetta mantenuta</li>
					<li>• <strong>Quality Mode:</strong> {generatedIcons.filter(i => i.quality === 'premium').length > 0 ? 'Premium (Pica + Image-Q)' : 'High (Pica only)'}</li>
				  </ul>
				</div>

				{/* Dettagli tecnici algoritmi */}
				<div className="mt-4 p-3 bg-blue-50 rounded-lg">
				  <h4 className="font-medium text-gray-900 mb-2">Algoritmi Utilizzati:</h4>
				  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
					<div>
					  <strong className="text-blue-700">Resize Engine:</strong>
					  <ul className="text-gray-600 mt-1 space-y-1">
						<li>• Lanczos interpolation (quality: 3)</li>
						<li>• Adaptive unsharp masking</li>
						<li>• High-quality image smoothing</li>
					  </ul>
					</div>
					<div>
					  <strong className="text-green-700">Color Quantization:</strong>
					  <ul className="text-gray-600 mt-1 space-y-1">
						<li>• Wu quantization algorithm</li>
						<li>• Euclidean distance formula</li>
						<li>• 256-color palette optimization</li>
					  </ul>
					</div>
				  </div>
				</div>

				{/* Statistiche file size se disponibili */}
				{generatedIcons.some(icon => icon.originalSize && icon.optimizedSize) && (
				  <div className="mt-4 p-3 bg-green-50 rounded-lg">
					<h4 className="font-medium text-gray-900 mb-2">Riduzione Dimensioni:</h4>
					<div className="text-sm text-gray-600">
					  <div className="flex justify-between mb-1">
						<span>Dimensione originale media:</span>
						<span className="font-medium">
						  {Math.round(generatedIcons.reduce((acc, icon) => 
							acc + (parseInt(icon.originalSize?.replace('KB', '')) || 0), 0) / generatedIcons.length)}KB
						</span>
					  </div>
					  <div className="flex justify-between mb-1">
						<span>Dimensione ottimizzata media:</span>
						<span className="font-medium text-green-600">
						  {Math.round(generatedIcons.reduce((acc, icon) => 
							acc + (parseInt(icon.optimizedSize?.replace('KB', '')) || 0), 0) / generatedIcons.length)}KB
						</span>
					  </div>
					  <div className="flex justify-between">
						<span>Totale file ottimizzati:</span>
						<span className="font-medium text-blue-600">
						  {generatedIcons.filter(i => i.optimized).length}/{generatedIcons.length}
						</span>
					  </div>
					</div>
				  </div>
				)}
			  </div>
			)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IconGenerator;