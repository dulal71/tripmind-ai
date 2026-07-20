'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiCompass, FiZap, FiGlobe, FiUsers, FiHeart, FiArrowRight } from 'react-icons/fi';

const values = [
  { icon: FiZap, title: 'Innovation', description: 'Leveraging cutting-edge AI technology to transform how people plan and experience travel.' },
  { icon: FiHeart, title: 'Personalization', description: 'Every recommendation and itinerary is tailored to individual preferences and needs.' },
  { icon: FiGlobe, title: 'Global Reach', description: 'Covering destinations worldwide with comprehensive cultural and practical insights.' },
  { icon: FiUsers, title: 'Community', description: 'Building a platform where travelers share experiences and inspire each other.' },
];

const tech = [
  { name: 'Next.js', category: 'Frontend' },
  { name: 'React', category: 'Frontend' },
  { name: 'TypeScript', category: 'Language' },
  { name: 'Tailwind CSS', category: 'Styling' },
  { name: 'Express.js', category: 'Backend' },
  { name: 'MongoDB', category: 'Database' },
  { name: 'OpenAI', category: 'AI Engine' },
  { name: 'Better Auth', category: 'Authentication' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-zinc-800/60">
        <div className="absolute top-[-40%] left-[-20%] w-[60%] h-[80%] rounded-full bg-blue-500/8 blur-[100px]" />
        <div className="absolute bottom-[-30%] right-[-15%] w-[50%] h-[70%] rounded-full bg-violet-500/8 blur-[100px]" />

        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/25">
              <FiCompass className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              About <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">TripMind AI</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-400 leading-relaxed">
              We&apos;re on a mission to make travel planning effortless, personalized, and intelligent through the power of artificial intelligence.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 sm:p-10 backdrop-blur-sm"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
          <p className="text-zinc-400 leading-relaxed text-lg">
            TripMind AI was created to solve a fundamental problem: travel planning is time-consuming, overwhelming, and often lacks personalization.
            By harnessing the power of Large Language Models, we create intelligent, context-aware travel experiences that understand your unique preferences,
            budget, and interests. Our goal is to transform the way people discover, plan, and experience travel around the world.
          </p>
        </motion.div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Our Values</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 text-center backdrop-blur-sm"
              >
                <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-blue-500/20">
                  <value.icon className="h-5 w-5 text-blue-400" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{value.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Built With</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {tech.map((item) => (
              <div key={item.name} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 text-center backdrop-blur-sm">
                <p className="text-sm font-semibold text-white">{item.name}</p>
                <p className="text-xs text-zinc-500 mt-1">{item.category}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <p className="text-zinc-400 mb-6">Ready to experience smarter travel planning?</p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-8 py-3.5 text-sm font-semibold text-white shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 active:scale-[0.98] transition-all"
          >
            Get Started Free
            <FiArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
