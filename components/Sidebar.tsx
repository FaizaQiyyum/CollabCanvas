"use client";

import React, { useState } from 'react';
import { 
  Send, 
  MessageSquare,
  Plus,
  Loader2,
  Reply,
  HelpCircle,
  Lightbulb,
  Cpu,
  Sparkles,
  BookOpen,
  Layout
} from 'lucide-react';
import { Mode } from '@/types/canvas';
import { getLearningSupport, TutorResponse } from '@/lib/ai';
import { motion, AnimatePresence } from 'framer-motion';
import { useSyncQA } from '@/hooks/useSyncQA';

interface SidebarProps {
  mode: Mode;
  setMode: (mode: Mode) => void;
  roomId: string;
}

export const Sidebar = ({ mode, setMode, roomId }: SidebarProps) => {
  const [notes, setNotes] = useState('');
  const [aiResponse, setAiResponse] = useState<TutorResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState('');
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<'AI' | 'STUDY' | 'BLOCK' | null>(null);

  const { questions, askQuestion, answerQuestion } = useSyncQA(roomId);

  const handleAiAction = async () => {
    if (!notes.trim() || loading) return;
    setLoading(true);
    setAiResponse(null);
    const res = await getLearningSupport(notes);
    setAiResponse(res);
    setLoading(false);
  };

  const handleAsk = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (inputText.trim()) {
      askQuestion(inputText);
      setInputText('');
    }
  };

  const handleAnswer = (qId: string) => {
    const text = replyText[qId];
    if (text?.trim()) {
      answerQuestion(qId, text);
      setReplyText({ ...replyText, [qId]: '' });
    }
  };

  const handleLearningTab = (tab: 'AI' | 'STUDY' | 'BLOCK') => {
    if (tab === 'BLOCK') {
      window.dispatchEvent(new CustomEvent('add-concept-block'));
      return;
    }
    setActivePanel(prev => prev === tab ? null : tab);
    setMode(tab as Mode);
  };

  const learningTabs = [
    { id: 'BLOCK', icon: Layout, label: 'Concept Block', color: 'indigo' },
    { id: 'AI',    icon: Sparkles, label: 'Tutor AI',    color: 'violet' },
    { id: 'STUDY', icon: BookOpen, label: 'Q&A Board',   color: 'purple' },
  ] as const;

  const colorActive: Record<string, string> = {
    indigo: 'bg-indigo-600 text-white shadow-md shadow-indigo-100',
    violet: 'bg-violet-600 text-white shadow-md shadow-violet-100',
    purple: 'bg-purple-600 text-white shadow-md shadow-purple-100',
  };

  const colorIdle: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100',
    violet: 'bg-violet-50 text-violet-700 border border-violet-100 hover:bg-violet-100',
    purple: 'bg-purple-50 text-purple-700 border border-purple-100 hover:bg-purple-100',
  };

  return (
    <div className="w-[var(--panel-width)] h-full bg-white border-l border-slate-200 flex flex-col z-50">

      {/* ── HEADER ── */}
      <div className="px-5 py-5 border-b border-slate-100 shrink-0">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Learning</p>

        {/* Learning Tab Buttons — always visible */}
        <div className="space-y-2">
          {learningTabs.map((tab) => {
            const isActive = activePanel === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleLearningTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                  isActive ? colorActive[tab.color] : colorIdle[tab.color]
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
                {isActive && (
                  <span className="ml-auto text-[9px] font-black opacity-70 uppercase tracking-widest">Open</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── DYNAMIC CONTENT PANEL ── */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">

          {/* AI TUTOR PANEL */}
          {activePanel === 'AI' && (
            <motion.div
              key="ai-panel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 space-y-4 pb-8"
            >
              <div className="p-3 bg-violet-50 rounded-xl border border-violet-100">
                <p className="text-xs font-bold text-violet-700">Dynamic AI Tutor</p>
                <p className="text-[11px] text-violet-500 mt-0.5">Ask about any topic — physics, coding, history...</p>
              </div>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full h-28 p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-violet-400 text-sm resize-none outline-none shadow-sm"
                placeholder="What should we explore today?"
              />

              <button
                type="button"
                onClick={handleAiAction}
                disabled={loading}
                className="w-full py-3 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-100"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                {loading ? 'Thinking...' : 'Ask AI Tutor'}
              </button>

              {aiResponse && (
                <div className="space-y-3">
                  <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 space-y-2">
                    <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs">
                      <Lightbulb size={14} /> Simple Explanation
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{aiResponse.simple}</p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                    <div className="flex items-center gap-2 text-slate-700 font-bold text-xs">
                      <Cpu size={14} /> Technical Breakdown
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed italic">{aiResponse.technical}</p>
                  </div>

                  <div className="p-4 bg-violet-600 rounded-xl shadow-lg space-y-2">
                    <div className="flex items-center gap-2 text-white/90 font-bold text-xs">
                      <HelpCircle size={14} /> Quiz
                    </div>
                    <p className="text-xs text-white leading-relaxed font-medium">{aiResponse.quiz}</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Q&A BOARD PANEL */}
          {activePanel === 'STUDY' && (
            <motion.div
              key="study-panel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col h-full"
            >
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {questions.length === 0 ? (
                  <div className="text-center py-12 opacity-30">
                    <MessageSquare className="mx-auto mb-2" size={32} />
                    <p className="text-xs">No questions yet. Be the first!</p>
                  </div>
                ) : (
                  questions.map((q) => (
                    <div key={q.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                      <div
                        className="p-3 cursor-pointer hover:bg-slate-50 transition-colors"
                        onClick={() => setExpandedQuestion(expandedQuestion === q.id ? null : q.id)}
                      >
                        <div className="flex justify-between mb-1">
                          <span className="text-[9px] font-black text-purple-500 uppercase">{q.user}</span>
                          <span className="text-[9px] text-slate-400">
                            {new Date(q.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-800">{q.text}</p>
                        <div className="flex items-center gap-1.5 mt-2 text-[10px] text-purple-600 font-bold">
                          <Reply size={11} /> {q.answers?.length || 0} Answers
                        </div>
                      </div>

                      {expandedQuestion === q.id && (
                        <div className="bg-slate-50 border-t border-slate-100 p-3 space-y-2">
                          {q.answers?.map((ans) => (
                            <div key={ans.id} className="bg-white p-2 rounded-lg border border-slate-100 text-[11px] shadow-sm">
                              <p className="font-bold text-emerald-600 mb-0.5">{ans.user}</p>
                              <p className="text-slate-700">{ans.text}</p>
                            </div>
                          ))}
                          <div className="flex gap-2 mt-2">
                            <input
                              type="text"
                              value={replyText[q.id] || ''}
                              onChange={(e) => setReplyText({ ...replyText, [q.id]: e.target.value })}
                              onKeyDown={(e) => e.key === 'Enter' && handleAnswer(q.id)}
                              placeholder="Write a reply..."
                              className="flex-1 p-2 text-[10px] rounded-lg border border-slate-200 focus:ring-1 focus:ring-purple-400 outline-none"
                            />
                            <button
                              onClick={() => handleAnswer(q.id)}
                              className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            >
                              <Send size={12} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Ask Question Footer */}
              <div className="p-4 border-t border-slate-100 bg-white shrink-0">
                <form onSubmit={handleAsk} className="relative">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Ask a new question..."
                    className="w-full p-3 pr-10 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-400 text-xs outline-none shadow-sm"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-purple-600 hover:text-purple-800"
                  >
                    <Plus size={18} />
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* DEFAULT STATE — no panel open */}
          {activePanel === null && (
            <motion.div
              key="default"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full p-8 text-center opacity-30"
            >
              <Sparkles size={36} className="mb-3 text-slate-400" />
              <p className="text-sm font-bold text-slate-400">Select a learning tool above to get started.</p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};
