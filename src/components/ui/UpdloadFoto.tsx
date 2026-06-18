// UploadFoto.tsx - Componente para subir imágenes
import { useState, useRef } from 'react';
import type { ChangeEvent } from 'react';
import { FaCamera, FaTimes } from 'react-icons/fa';

interface UploadFotoProps {
  onUpload: (file: File, preview: string) => void;
  onRemove?: () => void;
  label?: string;
  accept?: string;
  maxSize?: number; // en MB
  className?: string;
  previewImage?: string; // imagen existente para mostrar
}

export default function UploadFoto({
  onUpload,
  onRemove,
  label = 'Subir foto',
  accept = 'image/*',
  maxSize = 5,
  className = '',
  previewImage,
}: UploadFotoProps) {
  const [preview, setPreview] = useState<string | null>(previewImage || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño
    if (file.size > maxSize * 1024 * 1024) {
      setError(`El archivo no debe superar los ${maxSize}MB`);
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreview(result);
      onUpload(file, result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onRemove) onRemove();
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="relative">
        {preview ? (
          <div className="relative inline-block">
            <img
              src={preview}
              alt="Vista previa"
              className="w-32 h-32 object-cover rounded-lg border border-gray-200"
            />
            <button
              onClick={handleRemove}
              className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              type="button"
            >
              <FaTimes size={12} />
            </button>
          </div>
        ) : (
          <button
            onClick={handleClick}
            className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors bg-gray-50 hover:bg-gray-100"
            type="button"
          >
            <FaCamera className="text-3xl text-gray-400" />
            <span className="text-xs text-gray-500 mt-1">{label}</span>
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}