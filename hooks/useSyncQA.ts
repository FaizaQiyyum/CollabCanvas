import { useEffect, useState, useRef } from 'react';
import { ref, onValue, push, set, serverTimestamp, off } from 'firebase/database';
import { db } from '@/lib/firebase';
import { Question, Answer } from '@/types/canvas';

export const useSyncQA = (roomId: string) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const channelRef = useRef<BroadcastChannel | null>(null);

  // Initial load & setup broadcast
  useEffect(() => {
    if (!roomId) return;

    // Load from localStorage on init
    const localData = localStorage.getItem(`collab_qa_${roomId}`);
    if (localData) {
      try {
        setQuestions(JSON.parse(localData));
      } catch (e) {
        console.error("Failed to parse local QA data");
      }
    }

    if (typeof window !== 'undefined') {
      channelRef.current = new BroadcastChannel(`collab_qa_${roomId}`);
      channelRef.current.onmessage = (event) => {
        if (event.data.type === 'SYNC_ALL') {
          setQuestions(event.data.payload);
        }
      };
    }

    return () => {
      if (channelRef.current) channelRef.current.close();
    };
  }, [roomId]);

  // Persist to localStorage whenever state changes
  useEffect(() => {
    if (!roomId) return;
    // Don't overwrite with empty array on initial render if localStorage already has data
    if (questions.length > 0) {
      localStorage.setItem(`collab_qa_${roomId}`, JSON.stringify(questions));
    }
  }, [questions, roomId]);

  const askQuestion = (text: string, user: string = 'Student') => {
    if (!text.trim()) return;

    const newQuestion: Question = {
      id: Math.random().toString(36).substring(7),
      user,
      text,
      timestamp: Date.now(),
      answers: []
    };

    setQuestions(prev => {
      const updated = [newQuestion, ...prev].sort((a, b) => b.timestamp - a.timestamp);
      channelRef.current?.postMessage({ type: 'SYNC_ALL', payload: updated });
      return updated;
    });
  };

  const answerQuestion = (questionId: string, text: string, user: string = 'Student') => {
    if (!text.trim()) return;

    const newAnswer: Answer = {
      id: Math.random().toString(36).substring(7),
      user,
      text,
      timestamp: Date.now()
    };

    setQuestions(prev => {
      const updated = prev.map(q => 
        q.id === questionId ? { ...q, answers: [...(q.answers || []), newAnswer] } : q
      );
      channelRef.current?.postMessage({ type: 'SYNC_ALL', payload: updated });
      return updated;
    });
  };

  return { questions, askQuestion, answerQuestion };
};
