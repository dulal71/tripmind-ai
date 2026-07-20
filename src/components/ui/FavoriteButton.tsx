'use client';

import { motion } from 'framer-motion';
import { FiHeart } from 'react-icons/fi';
import { useIsFavorited, useAddFavorite, useRemoveFavorite } from '@/hooks/useFavorites';
import { authClient } from '@/lib/auth-client';
import toast from 'react-hot-toast';

interface FavoriteButtonProps {
  destinationId: string;
  size?: 'sm' | 'md';
}

export default function FavoriteButton({ destinationId, size = 'md' }: FavoriteButtonProps) {
  const { data: session } = authClient.useSession();
  const { data: isFavorited } = useIsFavorited(destinationId);
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session?.user) {
      toast.error('Sign in to save favorites');
      return;
    }

    try {
      if (isFavorited) {
        await removeFavorite.mutateAsync(destinationId);
        toast.success('Removed from favorites');
      } else {
        await addFavorite.mutateAsync(destinationId);
        toast.success('Added to favorites');
      }
    } catch {
      toast.error('Failed to update favorite');
    }
  };

  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  const btnSize = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10';

  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={handleClick}
      disabled={addFavorite.isPending || removeFavorite.isPending}
      className={`flex items-center justify-center rounded-full backdrop-blur-md transition-colors disabled:opacity-50 cursor-pointer ${
        btnSize
      } ${
        isFavorited
          ? 'bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30'
          : 'bg-zinc-950/60 border border-zinc-700/50 text-zinc-400 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10'
      }`}
    >
      <FiHeart className={`${iconSize} ${isFavorited ? 'fill-red-400' : ''}`} />
    </motion.button>
  );
}
