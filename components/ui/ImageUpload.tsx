
import React, { useRef, useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import Button from './Button';

interface ImageUploadProps {
  currentImage?: string;
  onImageSelected: (base64Data: string) => void;
  label?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ currentImage, onImageSelected, label = "Immagine" }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | undefined>(currentImage);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const processFile = (file: File) => {
    setError(null);

    // Validazione Tipo
    if (!file.type.startsWith('image/')) {
        setError("Il file selezionato non è un'immagine.");
        return;
    }

    // Validazione Dimensione (Max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        setError("L'immagine è troppo grande (Max 5MB).");
        return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreview(result);
      onImageSelected(result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  }, []);

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita di riaprire il dialog di selezione
    setPreview('');
    setFileName(null);
    setError(null);
    onImageSelected('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
      
      <div 
        onClick={triggerClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
            relative group w-full min-h-[200px] rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden flex flex-col items-center justify-center
            ${isDragging 
                ? 'border-brand-gold bg-brand-gold/10 scale-[1.02]' 
                : 'border-gray-600 bg-gray-800/50 hover:border-gray-400 hover:bg-gray-800'
            }
            ${preview ? 'border-solid border-gray-600' : ''}
        `}
      >
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/jpg, image/webp"
            className="hidden"
        />

        {preview ? (
            <>
                <img 
                    src={preview} 
                    alt="Preview" 
                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" 
                />
                
                <div className="z-10 flex flex-col items-center space-y-3 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="bg-black/70 text-white text-xs py-1 px-3 rounded-full mb-2 truncate max-w-[200px]">
                        {fileName || 'Immagine caricata'}
                    </div>
                    <div className="flex space-x-2">
                        <Button type="button" variant="secondary" className="text-sm py-1 px-3 pointer-events-none">
                            Cambia
                        </Button>
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="bg-red-600 hover:bg-red-500 text-white py-1 px-3 rounded-md text-sm font-semibold transition-colors shadow-lg"
                        >
                            Rimuovi
                        </button>
                    </div>
                </div>
                
                {/* Always visible label on mobile/touch when image exists */}
                <div className="absolute bottom-2 right-2 md:hidden">
                     <button
                        type="button"
                        onClick={handleRemove}
                        className="bg-red-600 text-white p-2 rounded-full shadow-lg"
                    >
                        <X size={16} />
                    </button>
                </div>
            </>
        ) : (
            <div className="text-center p-6 pointer-events-none">
                <div className={`mx-auto h-12 w-12 rounded-full flex items-center justify-center mb-4 transition-colors ${isDragging ? 'bg-brand-gold text-brand-dark' : 'bg-gray-700 text-gray-400'}`}>
                    <Upload size={24} />
                </div>
                <h3 className="text-brand-light font-medium mb-1">
                    {isDragging ? 'Rilascia il file qui' : 'Clicca o trascina un file'}
                </h3>
                <p className="text-gray-500 text-xs">
                    JPG, PNG, WebP fino a 5MB
                </p>
            </div>
        )}
      </div>

      {error && (
        <div className="flex items-center mt-2 text-red-400 text-sm animate-pulse">
            <AlertCircle size={14} className="mr-1.5" />
            {error}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
