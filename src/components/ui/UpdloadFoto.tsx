// src/components/ui/UploadFoto.tsx
import { useState, useRef, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { FaCamera, FaTimes } from 'react-icons/fa';

interface UploadFotoProps {
  onUpload: (file: File, preview: string) => void;
  onRemove?: () => void;
  label?: string;
  accept?: string;
  maxSize?: number; // en MB
  className?: string;
  previewImage?: string;
  buttonClassName?: string;
  autoHideDuration?: number | null; // tiempo en ms para ocultar la imagen (null = no ocultar)
  /** Tamaño de la miniatura de preview en px (default 48, usa 64 para vistas grandes) */
  thumbSize?: number;
}

export default function UploadFoto({
  onUpload,
  onRemove,
  label = 'Subir foto',
  accept = 'image/*',
  maxSize = 5,
  className = '',
  previewImage,
  buttonClassName = '',
  autoHideDuration = 3000, // por defecto 3 segundos
  thumbSize = 48,
}: UploadFotoProps) {
  const [preview, setPreview] = useState<string | null>(previewImage || null);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Efecto para ocultar la imagen después de autoHideDuration
  useEffect(() => {
    if (preview && autoHideDuration !== null && autoHideDuration > 0) {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, autoHideDuration);
    }
    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, [preview, autoHideDuration]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSize * 1024 * 1024) {
      setError(`El archivo no debe superar los ${maxSize}MB`);
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreview(result);
      setIsVisible(true);
      onUpload(file, result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setPreview(null);
    setIsVisible(true);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onRemove) onRemove();
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const hiddenInput = (
    <input
      ref={fileInputRef}
      type="file"
      accept={accept}
      onChange={handleFileChange}
      className="upload-foto-input-oculto"
    />
  );

  // Si no es visible (auto-hide), mostrar solo un link para revelar de nuevo
  if (!isVisible && preview) {
    return (
      <div className={`upload-foto-wrapper ${className}`}>
        <button
          onClick={() => setIsVisible(true)}
          type="button"
          className="upload-foto-mostrar-link"
        >
          Mostrar foto
        </button>
        {hiddenInput}
      </div>
    );
  }

  return (
    <div className={`upload-foto-wrapper ${className}`}>
      {preview ? (
        <div className="upload-foto-preview-box">
          <img
            src={preview}
            alt="Vista previa"
            className="upload-foto-preview-img"
            style={{ width: thumbSize, height: thumbSize }}
          />
          <button
            onClick={handleRemove}
            className="upload-foto-btn-remove"
            type="button"
            title="Eliminar"
          >
            <FaTimes size={10} />
          </button>
        </div>
      ) : (
        <button
          onClick={handleClick}
          className={buttonClassName ? buttonClassName : 'upload-foto-btn-default'}
          type="button"
        >
          <FaCamera className="upload-foto-icon" />
          <span>{label}</span>
        </button>
      )}
      {hiddenInput}
      {error && <p className="upload-foto-error">{error}</p>}
    </div>
  );
}
