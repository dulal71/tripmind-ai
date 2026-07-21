'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMessageCircle,
  FiX,
  FiSend,
  FiUser,
  FiCpu,
  FiLoader,
  FiMaximize2,
  FiMinimize2,
} from 'react-icons/fi';
import { authClient } from '@/lib/auth-client';
import { SUGGESTED_PROMPTS } from '@/types/ai';
import Link from 'next/link';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatWidget() {
  const { data: session } = authClient.useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const msgIdRef = useRef(0);

  const nextId = () => {
    msgIdRef.current += 1;
    return `widget-msg-${msgIdRef.current}`;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMsg: Message = {
      id: nextId(),
      role: 'user',
      content: content.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const assistantMsgId = nextId();
    const assistantMsg: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
    };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/ai/chat/stream`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${
              document.cookie.match(/better-auth.session_token=([^;]+)/)?.[1] || ''
            }`,
          },
          body: JSON.stringify({
            messages: [...messages, userMsg].map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        }
      );

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let accumulated = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          const lines = text.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.content) {
                  accumulated += data.content;
                  const snapshot = accumulated;
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantMsgId ? { ...m, content: snapshot } : m
                    )
                  );
                }
              } catch {
                // Skip invalid JSON
              }
            }
          }
        }
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                content:
                  'Sorry, I encountered an error. Please make sure you are signed in.',
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestedPrompt = (prompt: string) => {
    sendMessage(prompt);
  };

  if (!session?.user) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Link
          href="/login"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-violet-600 shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all"
        >
          <FiMessageCircle className="h-6 w-6 text-white" />
        </Link>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            className={`mb-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 shadow-2xl shadow-black/50 overflow-hidden ${
              isExpanded ? 'w-[450px] h-[600px]' : 'w-[380px] h-[500px]'
            } transition-all duration-300`}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100/80 dark:bg-zinc-900/80 backdrop-blur-xl p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-600">
                  <FiCpu className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">TripMind Assistant</h3>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Ask me anything about travel</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1.5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  {isExpanded ? (
                    <FiMinimize2 className="h-4 w-4" />
                  ) : (
                    <FiMaximize2 className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <FiX className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ height: 'calc(100% - 140px)' }}>
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20">
                    <FiMessageCircle className="h-6 w-6 text-blue-400" />
                  </div>
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-white mb-1">How can I help?</h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                    Ask about destinations, packing, visas, and more.
                  </p>
                  <div className="grid grid-cols-1 gap-2 w-full">
                    {SUGGESTED_PROMPTS.slice(0, 4).map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => handleSuggestedPrompt(prompt)}
                        className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-200/50 dark:bg-zinc-800/50 p-2.5 text-left text-xs text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.role === 'assistant' && (
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 shrink-0 mt-0.5">
                          <FiCpu className="h-3.5 w-3.5 text-white" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-xl px-3 py-2 ${
                          msg.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'border border-zinc-200 dark:border-zinc-800 bg-zinc-200/50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        <p className="text-xs whitespace-pre-wrap leading-relaxed">
                          {msg.content || (
                            <span className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                              <FiLoader className="h-3 w-3 animate-spin" />
                              Thinking...
                            </span>
                          )}
                        </p>
                      </div>
                      {msg.role === 'user' && (
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-200 dark:bg-zinc-800 shrink-0 mt-0.5">
                          <FiUser className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            <div className="absolute bottom-0 left-0 right-0 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-100/80 dark:bg-zinc-900/80 backdrop-blur-xl p-3">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about travel..."
                  disabled={isLoading}
                  className="flex-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-200/50 dark:bg-zinc-800/50 px-3 py-2 text-xs text-zinc-900 dark:text-white placeholder-zinc-500 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-3 py-2 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <FiSend className="h-3.5 w-3.5" />
                </button>
              </form>
              <div className="mt-2 text-center">
                <Link
                  href="/chat"
                  className="text-[10px] text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                >
                  Open full chat →
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition-all ${
          isOpen
            ? 'bg-zinc-200 dark:bg-zinc-800 shadow-black/50 hover:bg-zinc-300 dark:hover:bg-zinc-700'
            : 'bg-gradient-to-r from-blue-600 to-violet-600 shadow-blue-500/30 hover:shadow-blue-500/50'
        }`}
      >
        {isOpen ? (
          <FiX className="h-6 w-6 text-white" />
        ) : (
          <FiMessageCircle className="h-6 w-6 text-white" />
        )}
      </motion.button>
    </div>
  );
}
