'use client';

import { motion, AnimatePresence, MotionProps } from 'framer-motion';
import { ReactNode } from 'react';

const variants = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  slideLeft: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
  slideRight: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  },
};

interface AnimatedComponentProps {
  children: ReactNode;
  variant?: keyof typeof variants;
  className?: string;
}

export function AnimatedDiv({ 
  children, 
  variant = 'fadeIn',
  className,
  ...props 
}: MotionProps & AnimatedComponentProps) {
  return (
    <motion.div
      className={className}
      variants={variants[variant]}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      initial="initial"
      animate="animate"
      exit="exit"
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedPresence({ children }: { children: ReactNode }) {
  return (
    <AnimatePresence mode="wait">
      {children}
    </AnimatePresence>
  );
}

export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: 'easeInOut' },
};

export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};
