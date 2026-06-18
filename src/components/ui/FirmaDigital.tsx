// src/components/ui/FirmaDigital.tsx
import React, { useRef, useState, useEffect } from 'react';
import { FaEraser, FaCheck } from 'react-icons/fa';

interface FirmaDigitalProps {
  onSave: (firmaBase64: string) => void;
  onCancel?: () => void;
  width?: number;
  height?: number;
  firmaExistente?: string;
}

export default function FirmaDigital({ onSave, onCancel, width = 400, height = 200, firmaExistente }: FirmaDigitalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    context.lineWidth = 2;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = '#1e293b';
    setCtx(context);

    if (firmaExistente) {
      const img = new Image();
      img.onload = () => {
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        setHasDrawn(true);
      };
      img.src = firmaExistente;
    }
  }, [firmaExistente]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!ctx) return;
    setIsDrawing(true);
    setHasDrawn(true);
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing || !ctx) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (!ctx || !canvasRef.current) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setHasDrawn(false);
  };

  const saveFirma = () => {
    if (!canvasRef.current || !hasDrawn) {
      alert('Por favor, firma en el área');
      return;
    }
    const dataUrl = canvasRef.current.toDataURL('image/png');
    onSave(dataUrl);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <div style={{ 
        border: '2px solid #e2e8f0', 
        borderRadius: '12px', 
        padding: '4px', 
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        width: 'fit-content'
      }}>
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          style={{ 
            touchAction: 'none', 
            cursor: 'crosshair',
            borderRadius: '8px',
            display: 'block',
            backgroundColor: '#fafafa',
            width: '100%',
            height: 'auto',
          }}
        />
      </div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button 
          onClick={clearCanvas} 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            backgroundColor: '#f1f5f9',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: 500,
            color: '#1e293b',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
        >
          <FaEraser /> Limpiar
        </button>
        <button 
          onClick={saveFirma} 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 20px',
            backgroundColor: '#2563eb',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#ffffff',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
        >
          <FaCheck /> Guardar firma
        </button>
        {onCancel && (
          <button 
            onClick={onCancel} 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              backgroundColor: '#94a3b8',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#64748b'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#94a3b8'}
          >
            Cancelar
          </button>
        )}
      </div>
      <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
        Firma con el ratón o el dedo (en pantalla táctil)
      </p>
    </div>
  );
}