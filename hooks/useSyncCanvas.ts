import { useEffect, useRef } from 'react';
import { ref, onValue, set, off } from 'firebase/database';
import { db } from '@/lib/firebase';
import { Canvas } from 'fabric';

export const useSyncCanvas = (canvas: Canvas | null, roomId: string) => {
  const isRemoteChange = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    if (!canvas || !roomId) return;

    // Initialize Local Broadcast Channel for cross-tab sync without internet
    if (typeof window !== 'undefined') {
      channelRef.current = new BroadcastChannel(`collab_canvas_${roomId}`);
      
      channelRef.current.onmessage = (event) => {
        if (event.data && !isRemoteChange.current) {
          isRemoteChange.current = true;
          canvas.loadFromJSON(event.data).then(() => {
            canvas.renderAll();
            isRemoteChange.current = false;
          });
        }
      };
    }

    // Firebase Sync (if available)
    if (db) {
      const canvasRef = ref(db, `rooms/${roomId}/canvas`);
      onValue(canvasRef, (snapshot) => {
        const data = snapshot.val();
        if (data && !isRemoteChange.current) {
          isRemoteChange.current = true;
          canvas.loadFromJSON(data).then(() => {
            canvas.renderAll();
            isRemoteChange.current = false;
          });
        }
      });
    }

    // Initial load from local backup if Firebase fails or is not yet connected
    const backup = localStorage.getItem(`collab_canvas_backup_${roomId}`);
    if (backup) {
      try {
        isRemoteChange.current = true;
        canvas.loadFromJSON(JSON.parse(backup)).then(() => {
          canvas.renderAll();
          isRemoteChange.current = false;
        });
      } catch (e) {
        console.error("Backup load failed", e);
      }
    }

    // Local/Remote Sync Handler
    const syncState = () => {
      if (isRemoteChange.current) return;
      
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      
      timeoutRef.current = setTimeout(() => {
        const json = canvas.toJSON();
        
        // 1. Sync to local tabs
        if (channelRef.current) {
          channelRef.current.postMessage(json);
        }
        
        // 2. Sync to Firebase (if configured)
        if (db) {
          const canvasRef = ref(db, `rooms/${roomId}/canvas`);
          set(canvasRef, json);
        }

        // 3. Save to localStorage for persistence
        localStorage.setItem(`collab_canvas_backup_${roomId}`, JSON.stringify(json));
      }, 300);
    };

    canvas.on('object:modified', syncState);
    canvas.on('object:added', syncState);
    canvas.on('object:removed', syncState);
    canvas.on('path:created', syncState);

    return () => {
      if (db) off(ref(db, `rooms/${roomId}/canvas`));
      if (channelRef.current) channelRef.current.close();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      canvas.off('object:modified', syncState);
      canvas.off('object:added', syncState);
      canvas.off('object:removed', syncState);
      canvas.off('path:created', syncState);
    };
  }, [canvas, roomId]);
};
