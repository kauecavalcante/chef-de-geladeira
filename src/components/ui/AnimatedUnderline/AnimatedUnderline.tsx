"use client";

import { motion, Variants } from "framer-motion";
import styles from './AnimatedUnderline.module.css';

interface AnimatedUnderlineProps {
  text: string;
  className?: string;
}

function AnimatedUnderline({ text, className }: AnimatedUnderlineProps) {
  const draw: Variants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 1.5, ease: "easeInOut" },
        opacity: { duration: 0.01 },
      },
    },
  };

  return (
    <div className={`${styles.container} ${className}`}>
      <motion.h2
        className={styles.title}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {text}
      </motion.h2>
      <motion.svg
        className={styles.svgElement}
        viewBox="0 0 300 20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.8 }}
      >
        <motion.path
          d="M 0,10 Q 75,0 150,10 Q 225,20 300,10"
          stroke="var(--primary-color)"
          strokeWidth="4"
          fill="none"
          variants={draw}
        />
      </motion.svg>
    </div>
  );
}

export default AnimatedUnderline;