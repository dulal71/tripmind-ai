'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMessageCircle,
  FiSend,
  FiUser,
  FiCpu,
  FiLoader,
  FiTrash2,
  FiClock,
  FiPlus,
} from 'react-icons/fi';
import { authClient } from '@/lib/auth-client';
import { useChat } from '@/hooks/useAI';
import { ChatMessageUI, SUGGESTED_PROMPTS } from '@/types/ai';
import api from '@/lib/api';
import Link from 'next/link';

interface ChatHistoryItem {
  _id: string;
  messages: { role: string; content: string; timestamp: string }[];
  updatedAt: string;
}

export default function ChatPage() {
  const { data: session } = authClient.useSession();
  const [messages, setMessages] = useState<ChatMessageUI[]>([]);
  const [input, setInput] = useState('');
  const [historyId, setHistoryId] = useState<string | undefined>(undefined);
  const [chatHistories, setChatHistories] = useState<ChatHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const msgIdRef = useRef(0);
  const chatMutation = useChat();

  const nextId = useCallback(() => {
    msgIdRef.current += 1;
    return `msg-${msgIdRef.current}`;
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history list on mount
  useEffect(() => {
    const loadHistories = async () => {
      try {
        setLoadingHistory(true);
        const { data } = await api.get<{ status: string; data: ChatHistoryItem[] }>('/api/ai/chat/history');
        setChatHistories(data.data);
      } catch {
        // Silent fail
      } finally {
        setLoadingHistory(false);
      }
    };
    if (session?.user) loadHistories();
  }, [session?.user]);

  const loadHistory = async (id: string) => {
    try {
      const { data } = await api.get<{ status: string; data: ChatHistoryItem }>(`/api/ai/chat/history/${id}`);
      const history = data.data;
      setHistoryId(history._id);
      setMessages(
        history.messages.map((m) => ({
          id: nextId(),
          role: m.role as 'user' | 'assistant',
          content: m.content,
          timestamp: new Date(m.timestamp),
        }))
      );
    } catch {
      // Silent fail
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setHistoryId(undefined);
  };

  const deleteHistory = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.delete(`/api/ai/chat/history/${id}`);
      setChatHistories((prev) => prev.filter((h) => h._id !== id));
      if (historyId === id) {
        startNewChat();
      }
    } catch {
      // Silent fail
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMsg: ChatMessageUI = {
      id: nextId(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');

    // Add placeholder for streaming response
    const assistantMsgId = nextId();
    const assistantMsg: ChatMessageUI = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/ai/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${document.cookie.match(/better-auth.session_token=([^;]+)/)?.[1] || ''}`,
        },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          historyId,
        }),
      });

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
                if (data.done && data.historyId) {
                  setHistoryId(data.historyId);
                  // Refresh history list
                  try {
                    const { data: historyData } = await api.get<{ status: string; data: ChatHistoryItem[] }>('/api/ai/chat/history');
                    setChatHistories(historyData.data);
                  } catch {
                    // Silent fail
                  }
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
            ? { ...m, content: 'Sorry, I encountered an error. Please make sure the OPENAI_API_KEY is configured in the server.' }
            : m
        )
      );
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
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 text-center max-w-md">
          <FiMessageCircle className="mx-auto h-12 w-12 text-zinc-600 mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Sign in required</h2>
          <p className="text-sm text-zinc-400 mb-6">You need to be signed in to use the AI Chat Assistant.</p>
          <Link href="/login" className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Header */}
      <div className="border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-xl">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/20">
              <FiMessageCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">AI Travel Assistant</h1>
              <p className="text-xs text-zinc-400">Ask me anything about travel</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={startNewChat}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
            >
              <FiPlus className="h-4 w-4" />
              New Chat
            </button>
            {messages.length > 0 && (
              <button
                onClick={startNewChat}
                className="flex items-center gap-1.5 rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
              >
                <FiTrash2 className="h-4 w-4" />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Chat History */}
        <div className="hidden lg:flex w-64 border-r border-zinc-800/60 bg-zinc-950/80 flex-col">
          <div className="p-4 border-b border-zinc-800/60">
            <h2 className="text-sm font-semibold text-zinc-300">Recent Chats</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {loadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <FiLoader className="h-5 w-5 text-zinc-500 animate-spin" />
              </div>
            ) : chatHistories.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-8">No chat history yet</p>
            ) : (
              chatHistories.map((h) => (
                <button
                  key={h._id}
                  onClick={() => loadHistory(h._id)}
                  className={`w-full text-left rounded-lg p-3 transition-colors group ${
                    historyId === h._id ? 'bg-zinc-800/60 text-white' : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium truncate">
                        {h.messages[0]?.content?.slice(0, 40) || 'New Chat'}...
                      </p>
                      <p className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1">
                        <FiClock className="h-2.5 w-2.5" />
                        {new Date(h.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => deleteHistory(h._id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-red-400 transition-all"
                    >
                      <FiTrash2 className="h-3 w-3" />
                    </button>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 text-center max-w-lg w-full">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20">
                    <FiMessageCircle className="h-8 w-8 text-blue-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white mb-2">How can I help you?</h2>
                  <p className="text-sm text-zinc-400 mb-6">
                    I can help with travel planning, visa questions, packing tips, budget advice, and more.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SUGGESTED_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => handleSuggestedPrompt(prompt)}
                        className="rounded-lg border border-zinc-800 bg-zinc-800/50 p-3 text-left text-sm text-zinc-300 hover:text-white hover:border-zinc-700 hover:bg-zinc-800 transition-all"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <AnimatePresence>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.role === 'assistant' && (
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 shrink-0 mt-1">
                          <FiCpu className="h-4 w-4 text-white" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          msg.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'border border-zinc-800 bg-zinc-900/60 text-zinc-300'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      </div>
                      {msg.role === 'user' && (
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 shrink-0 mt-1">
                          <FiUser className="h-4 w-4 text-zinc-400" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {chatMutation.isPending && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 shrink-0">
                      <FiCpu className="h-4 w-4 text-white" />
                    </div>
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FiLoader className="h-4 w-4 text-blue-400 animate-spin" />
                        <span className="text-sm text-zinc-400">Thinking...</span>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-zinc-800/60 bg-zinc-950/80 backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="mx-auto max-w-4xl px-4 py-4 sm:px-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about travel destinations, packing, visas..."
              disabled={chatMutation.isPending}
              className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || chatMutation.isPending}
              className="flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <FiSend className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
