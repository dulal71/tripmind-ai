'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiHelpCircle } from 'react-icons/fi';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: 'What is TripMind AI?',
    answer: 'TripMind AI is an AI-powered travel planning platform that creates personalized itineraries, recommends destinations, and answers travel questions using advanced artificial intelligence.',
  },
  {
    question: 'How does the AI travel planner work?',
    answer: 'Simply choose a destination, set your budget, travel style, and interests. Our AI generates a detailed day-by-day itinerary with activities, costs, meal suggestions, and travel tips tailored to your preferences.',
  },
  {
    question: 'Is TripMind AI free to use?',
    answer: 'Yes! TripMind AI offers free access to browse destinations, get AI recommendations, and plan trips. You only need to create a free account to access all features.',
  },
  {
    question: 'What AI models does TripMind use?',
    answer: 'TripMind AI uses OpenAI GPT-4o-mini and Google Gemini for generating travel plans, recommendations, and chat responses. You can choose which provider to use in the settings.',
  },
  {
    question: 'Can I save and manage my trips?',
    answer: 'Absolutely! You can create, edit, save, and delete trips. Each trip stores your AI-generated itinerary, budget breakdown, and preferences for easy access.',
  },
  {
    question: 'How accurate are the AI recommendations?',
    answer: 'Our AI analyzes your budget, interests, travel style, and history to provide highly personalized recommendations with match scores. While AI suggestions are comprehensive, we recommend verifying specific details like visa requirements before traveling.',
  },
  {
    question: 'Can I use the AI chat for visa and packing advice?',
    answer: 'Yes! The AI Chat Assistant can help with visa guidance, packing lists, budget planning, restaurant recommendations, transportation tips, and general travel advice.',
  },
  {
    question: 'Do I need to create an account?',
    answer: 'You can browse destinations as a guest, but creating a free account unlocks all features including AI planning, trip management, favorites, and the AI chat assistant.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative border-t border-zinc-200 dark:border-zinc-800/60">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-blue-500/20">
            <FiHelpCircle className="h-6 w-6 text-blue-500 dark:text-blue-400" />
          </div>
          <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white sm:text-4xl">
            Frequently Asked{' '}
            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">Questions</span>
          </h2>
          <p className="mt-3 text-zinc-500 dark:text-zinc-400 text-lg">Everything you need to know about TripMind AI</p>
        </motion.div>

        <div className="mx-auto max-w-3xl space-y-3">
          {faqData.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 backdrop-blur-sm overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/30 cursor-pointer"
              >
                <span className="text-sm font-semibold text-zinc-900 dark:text-white">{faq.question}</span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FiChevronDown className="h-5 w-5 shrink-0 text-zinc-400" />
                </motion.div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-5 pb-5 border-t border-zinc-200 dark:border-zinc-800/50">
                      <p className="pt-4 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
