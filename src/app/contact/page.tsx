'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiMessageSquare, FiSend, FiUser, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      await api.post('/api/contact', { name, email, subject, message });
      setSubmitted(true);
      toast.success('Message sent! We\'ll get back to you soon.');
    } catch {
      toast.error('Failed to send message. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-zinc-800/60">
        <div className="absolute top-[-40%] left-[-20%] w-[60%] h-[80%] rounded-full bg-blue-500/8 blur-[100px]" />
        <div className="absolute bottom-[-30%] right-[-15%] w-[50%] h-[70%] rounded-full bg-violet-500/8 blur-[100px]" />

        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/25">
              <FiMessageSquare className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Get in <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">Touch</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-400">
              Have questions, feedback, or need assistance? We&apos;d love to hear from you.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-6"
          >
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-sm">
              <FiMail className="h-5 w-5 text-blue-400 mb-3" />
              <h3 className="text-sm font-semibold text-white mb-1">Email</h3>
              <p className="text-sm text-zinc-400">hello@tripmind.ai</p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-sm">
              <FiMessageSquare className="h-5 w-5 text-violet-400 mb-3" />
              <h3 className="text-sm font-semibold text-white mb-1">Support</h3>
              <p className="text-sm text-zinc-400">Available 24/7 for AI-powered assistance</p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-sm">
              <FiUser className="h-5 w-5 text-emerald-400 mb-3" />
              <h3 className="text-sm font-semibold text-white mb-1">Community</h3>
              <p className="text-sm text-zinc-400">Join our growing community of travelers</p>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 backdrop-blur-sm">
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-500/20">
                    <FiCheck className="h-8 w-8 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Message Sent!</h3>
                  <p className="text-sm text-zinc-400">Thank you for reaching out. We&apos;ll get back to you soon.</p>
                  <button
                    onClick={() => { setSubmitted(false); setName(''); setEmail(''); setSubject(''); setMessage(''); }}
                    className="mt-6 rounded-lg border border-zinc-800 px-5 py-2 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h2 className="text-xl font-bold text-white mb-2">Send us a Message</h2>
                  <p className="text-sm text-zinc-400 mb-6">Fill out the form below and we&apos;ll respond as soon as possible.</p>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Name *</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-4 py-2.5 text-white placeholder-zinc-500 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Email *</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-4 py-2.5 text-white placeholder-zinc-500 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Subject</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="What's this about?"
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-4 py-2.5 text-white placeholder-zinc-500 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Message *</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us how we can help..."
                      rows={5}
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-4 py-2.5 text-white placeholder-zinc-500 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:from-blue-500 hover:to-violet-500 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <FiSend className="h-4 w-4" />
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
