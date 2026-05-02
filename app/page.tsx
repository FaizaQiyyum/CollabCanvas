"use client";

import React, { useState, useEffect } from 'react';
import { Canvas } from '@/components/Canvas';
import { Sidebar } from '@/components/Sidebar';
import { Mode } from '@/types/canvas';

export default function Home() {
  const [mode, setMode] = useState<Mode>('COLLAB');
  const [roomId, setRoomId] = useState<string>('');

  useEffect(() => {
    // Generate or get room ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    let id = urlParams.get('room');
    if (!id) {
      id = Math.random().toString(36).substring(7);
      window.history.pushState({}, '', `?room=${id}`);
    }
    setRoomId(id);
  }, []);

  if (!roomId) return null;

  return (
    <main className="flex h-full w-full bg-slate-50 overflow-hidden">
      <div className="flex-1 h-full min-w-0">
        <Canvas roomId={roomId} mode={mode} setMode={setMode} />
      </div>

      <Sidebar mode={mode} setMode={setMode} roomId={roomId} />

    </main>
  );
}
