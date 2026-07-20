'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import { authClient } from '@/lib/auth-client';
import Link from 'next/link';

const registerSchema = z
  .object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
    email: z.string().email({ message: 'Please enter a valid email address' }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters' })
      .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
      .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
      .regex(/[0-9]/, { message: 'Password must contain at least one number' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
        callbackURL: '/explore',
      }, {
        onRequest: () => {
          setIsLoading(true);
        },
        onSuccess: () => {
          setIsLoading(false);
          toast.success('Account created successfully! Redirecting...');
          router.push('/explore');
        },
        onError: (ctx) => {
          setIsLoading(false);
          toast.error(ctx.error.message || 'Something went wrong during sign up.');
        }
      });
    } catch (err: any) {
      setIsLoading(false);
      toast.error('Failed to create account. Please try again.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 p-8 rounded-2xl shadow-2xl"
    >
      <div className="flex flex-col space-y-2 text-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
          Create an account
        </h1>
        <p className="text-sm text-zinc-400">
          Enter your details to get started with TripMind AI
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name input */}
        <div className="space-y-1 relative">
          <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Name</label>
          <div className="relative">
            <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
            <input
              type="text"
              placeholder="John Doe"
              {...register('name')}
              disabled={isLoading}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/80 border border-zinc-800 text-white placeholder-zinc-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition duration-200"
            />
          </div>
          {errors.name && (
            <p className="text-xs text-red-500 font-semibold">{errors.name.message}</p>
          )}
        </div>

        {/* Email input */}
        <div className="space-y-1 relative">
          <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Email Address</label>
          <div className="relative">
            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
            <input
              type="email"
              placeholder="name@example.com"
              {...register('email')}
              disabled={isLoading}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/80 border border-zinc-800 text-white placeholder-zinc-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition duration-200"
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-500 font-semibold">{errors.email.message}</p>
          )}
        </div>

        {/* Password input */}
        <div className="space-y-1 relative">
          <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Password</label>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('password')}
              disabled={isLoading}
              className="w-full pl-10 pr-10 py-2.5 bg-zinc-950/80 border border-zinc-800 text-white placeholder-zinc-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition duration-200"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition"
            >
              {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-500 font-semibold">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password input */}
        <div className="space-y-1 relative">
          <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Confirm Password</label>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('confirmPassword')}
              disabled={isLoading}
              className="w-full pl-10 pr-10 py-2.5 bg-zinc-950/80 border border-zinc-800 text-white placeholder-zinc-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition duration-200"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition"
            >
              {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-500 font-semibold">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 flex items-center justify-center space-x-2 py-3 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:text-zinc-400 text-white font-semibold rounded-lg shadow-lg hover:shadow-blue-500/20 active:scale-[0.98] transition duration-200 cursor-pointer"
        >
          <span>{isLoading ? 'Creating account...' : 'Create Account'}</span>
          {!isLoading && <FiArrowRight className="w-4 h-4" />}
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-zinc-400">Already have an account? </span>
        <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition">
          Sign In
        </Link>
      </div>
    </motion.div>
  );
}
