import { useEffect, useRef, useState } from 'react';
import { Canvas } from 'fabric';

export const useFabric = (onObjectModified?: (e: any) => void) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<Canvas | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const fabricCanvas = new Canvas(canvasRef.current, {
      width: window.innerWidth - 80, // Adjust for sidebar/toolbar
      height: window.innerHeight - 80,
      backgroundColor: '#ffffff',
      isDrawingMode: false,
    });

    setCanvas(fabricCanvas);

    const handleModified = (e: any) => {
      if (onObjectModified) onObjectModified(e);
    };

    fabricCanvas.on('object:modified', handleModified);
    fabricCanvas.on('object:added', handleModified);
    fabricCanvas.on('object:removed', handleModified);

    const handleResize = () => {
      fabricCanvas.setDimensions({
        width: window.innerWidth - 80,
        height: window.innerHeight - 80,
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      fabricCanvas.dispose();
    };
  }, []);

  return { canvasRef, canvas };
};
