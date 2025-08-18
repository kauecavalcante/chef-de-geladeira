'use client';
import React from 'react';
import { motion } from 'framer-motion';
import styles from './TextShimmer.module.css';

interface TextShimmerProps {
  children: string;
  className?: string;
  duration?: number;
}

export function TextShimmer({
  children,
  className,
  duration = 1.5,
}: TextShimmerProps) {

  return (
    <motion.p
      className={`${styles.shimmer} ${className}`}
      initial={{ backgroundPosition: '200% center' }}
      animate={{ backgroundPosition: '-200% center' }}
      transition={{
        repeat: Infinity,
        duration,
        ease: 'linear',
      }}
    >
      {children}
    </motion.p>
  );
}
