"use client";

import React, { useEffect, useState } from 'react';
import { useFabric } from '@/hooks/useFabric';
import { useSyncCanvas } from '@/hooks/useSyncCanvas';
import { Toolbar } from './Toolbar';
import { Rect, Circle, IText, PencilBrush } from 'fabric';
import { Mode } from '@/types/canvas';

interface CanvasProps {
  roomId: string;
  mode: Mode;
  setMode?: (mode: any) => void;
}

export const Canvas = ({ roomId, mode, setMode }: CanvasProps) => {

  const { canvasRef, canvas } = useFabric();
  const [activeTool, setActiveTool] = useState('select');

  useSyncCanvas(canvas, roomId);

  useEffect(() => {
    if (!canvas) return;

    // Mode-specific canvas styling
    if (mode === 'FOCUS') {
      canvas.backgroundColor = '#f1f5f9';
      // Simple grid pattern could be added here if needed
    } else {
      canvas.backgroundColor = '#ffffff';
    }
    
    canvas.renderAll();

    // Update canvas settings based on tool
    canvas.isDrawingMode = activeTool === 'pencil';

    
    if (activeTool === 'pencil') {
      canvas.freeDrawingBrush = new PencilBrush(canvas);
      canvas.freeDrawingBrush.width = 3;
      canvas.freeDrawingBrush.color = '#4f46e5';
    }

    const handleMouseDown = (options: any) => {
      if (activeTool === 'select' || activeTool === 'pencil') return;

      const pointer = canvas.getScenePoint(options.e);
      let object;

      switch (activeTool) {
        case 'rect':
          object = new Rect({
            left: pointer.x,
            top: pointer.y,
            width: 100,
            height: 100,
            fill: 'transparent',
            stroke: '#4f46e5',
            strokeWidth: 2,
            rx: 8,
            ry: 8,
          });
          break;
        case 'circle':
          object = new Circle({
            left: pointer.x,
            top: pointer.y,
            radius: 50,
            fill: 'transparent',
            stroke: '#4f46e5',
            strokeWidth: 2,
          });
          break;
        case 'text':
          object = new IText('Type here...', {
            left: pointer.x,
            top: pointer.y,
            fontSize: 20,
            fontFamily: 'Inter, sans-serif',
            fill: '#1e293b',
          });
          break;
        case 'block':
          const rect = new Rect({
            left: pointer.x,
            top: pointer.y,
            width: 200,
            height: 120,
            fill: '#eef2ff',
            stroke: '#4f46e5',
            strokeWidth: 2,
            rx: 12,
            ry: 12,
            shadow: 'rgba(0,0,0,0.1) 0px 4px 6px -1px',
          });
          const label = new IText('Concept Name', {
            left: pointer.x + 20,
            top: pointer.y + 20,
            fontSize: 16,
            fontWeight: 'bold',
            fontFamily: 'Inter, sans-serif',
          });
          const description = new IText('Explain the concept here...', {
            left: pointer.x + 20,
            top: pointer.y + 50,
            fontSize: 12,
            width: 160,
            fontFamily: 'Inter, sans-serif',
          });
          
          canvas.add(rect, label, description);
          canvas.setActiveObject(rect);
          setActiveTool('select');
          return;

        case 'eraser':
          if (options.target) {
            canvas.remove(options.target);
          }
          return;
      }

      if (object) {
        canvas.add(object);
        canvas.setActiveObject(object);
        setActiveTool('select');
      }
    };

    canvas.on('mouse:down', handleMouseDown);

    const handleExternalAddBlock = () => {
      // Create block at center of viewport or next available slot
      const center = canvas.getVpCenter();
      
      let left = center.x - 100;
      let top = center.y - 60;

      if (mode === 'FOCUS') {
        // Simple auto-offset for focus mode to avoid overlap
        const objects = canvas.getObjects();
        const blockCount = objects.filter(obj => obj.type === 'rect' && obj.fill === '#eef2ff').length;
        top = 100 + (blockCount * 150);
        left = center.x - 100;
      }

      const rect = new Rect({
        left,
        top,
        width: 200,
        height: 120,
        fill: '#eef2ff',
        stroke: '#4f46e5',
        strokeWidth: 2,
        rx: 12,
        ry: 12,
        shadow: {
          color: 'rgba(0,0,0,0.1)',
          blur: 6,
          offsetX: 0,
          offsetY: 4
        }
      });
      const label = new IText('Concept Name', {
        left: left + 20,
        top: top + 20,
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'Inter, sans-serif',
      });
      const description = new IText('Explain the concept here...', {
        left: left + 20,
        top: top + 50,
        fontSize: 12,
        width: 160,
        fontFamily: 'Inter, sans-serif',
      });
      
      canvas.add(rect, label, description);
      canvas.setActiveObject(rect);
      canvas.renderAll();
    };


    window.addEventListener('add-concept-block', handleExternalAddBlock);

    return () => {
      canvas.off('mouse:down', handleMouseDown);
      window.removeEventListener('add-concept-block', handleExternalAddBlock);
    };

  }, [canvas, activeTool]);

  const handleClear = () => {
    if (canvas && window.confirm('Clear all drawings?')) {
      canvas.clear();
      canvas.backgroundColor = '#ffffff';
      canvas.renderAll();
    }
  };

  const handleDownload = () => {
    if (canvas) {
      const dataURL = canvas.toDataURL({
        format: 'png',
        quality: 1,
      });
      const link = document.createElement('a');
      link.download = `collab-canvas-${roomId}.png`;
      link.href = dataURL;
      link.click();
    }
  };

  return (
    <div className="flex w-full h-full bg-slate-50">
      <Toolbar 
        activeTool={activeTool} 
        setActiveTool={setActiveTool} 
        onClear={handleClear}
        onDownload={handleDownload}
        setMode={setMode}
        activeMode={mode}
      />

      <div className="flex-1 p-4 overflow-hidden flex items-center justify-center relative">
        {/* Top Bar - Anchored to the exact center of the drawing area */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-6 py-2.5 rounded-full shadow-lg border border-slate-200 z-40 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Live Room: <span className="text-indigo-600">{roomId}</span>
            </span>
          </div>
          <div className="h-4 w-px bg-slate-200" />
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert('Link copied! Share it with students.');
            }}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            Invite Students
          </button>
        </div>

        <div className="w-full h-full bg-white shadow-xl rounded-2xl border border-slate-200 overflow-hidden relative">
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>
      </div>
    </div>
  );
};
