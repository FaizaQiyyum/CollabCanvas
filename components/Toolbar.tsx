"use client";

import React, { useState } from 'react';
import { 
  Pencil, 
  Square, 
  Circle, 
  Type, 
  Eraser, 
  Trash2, 
  MousePointer2,
  Download,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ToolbarProps {
  activeTool: string;
  setActiveTool: (tool: string) => void;
  onClear: () => void;
  onDownload: () => void;
  setMode?: (mode: any) => void;
  activeMode?: string;
}

export const Toolbar = ({ activeTool, setActiveTool, onClear, onDownload }: ToolbarProps) => {
  const [editingOpen, setEditingOpen] = useState(true);

  const drawingTools = [
    { id: 'select', icon: MousePointer2, label: 'Select' },
    { id: 'pencil', icon: Pencil, label: 'Pencil' },
    { id: 'rect', icon: Square, label: 'Rectangle' },
    { id: 'circle', icon: Circle, label: 'Circle' },
    { id: 'text', icon: Type, label: 'Text' },
  ];

  const editingTools = [
    { id: 'eraser', icon: Eraser, label: 'Eraser' },
    { id: 'clear', icon: Trash2, label: 'Clear All', action: onClear },
  ];

  return (
    <div className="w-[var(--sidebar-width)] h-full bg-white border-r border-slate-200 flex flex-col z-50">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-100 flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
          <Sparkles className="text-white" size={16} />
        </div>
        <h1 className="font-bold text-slate-800 tracking-tight text-sm">CollabCanvas</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">

        {/* ── DRAWING ── */}
        <div className="space-y-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-2">Drawing</p>
          {drawingTools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                activeTool === tool.id
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              )}
            >
              <tool.icon size={16} className={activeTool === tool.id ? "text-white" : "text-slate-400"} />
              {tool.label}
            </button>
          ))}
        </div>

        <div className="border-t border-slate-100" />

        {/* ── EDITING ── */}
        <div className="space-y-1">
          <button
            onClick={() => setEditingOpen(p => !p)}
            className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors mb-1"
          >
            Editing
            {editingOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>
          {editingOpen && editingTools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => {
                if ('action' in tool && tool.action) tool.action();
                else setActiveTool(tool.id);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                activeTool === tool.id
                  ? "bg-slate-900 text-white"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              )}
            >
              <tool.icon size={16} className={activeTool === tool.id ? "text-white" : "text-slate-400"} />
              {tool.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── EXPORT ── */}
      <div className="px-3 py-4 border-t border-slate-100 shrink-0">
        <button
          onClick={onDownload}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-700 transition-all group"
        >
          <Download size={16} className="group-hover:translate-y-0.5 transition-transform" />
          Export Canvas
        </button>
      </div>
    </div>
  );
};
