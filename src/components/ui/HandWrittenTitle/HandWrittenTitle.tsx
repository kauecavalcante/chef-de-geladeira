"use client";

import { motion, Variants } from "framer-motion";
import styles from './HandWrittenTitle.module.css';

interface HandWrittenTitleProps {
  title: string;
}

function HandWrittenTitle({ title }: HandWrittenTitleProps) {
  const draw: Variants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 2.5, ease: [0.43, 0.13, 0.23, 0.96] },
        opacity: { duration: 0.5 },
      },
    },
  };

  return (
    <div className={styles.container}>
      <div className={styles.svgContainer}>
        <motion.svg
          width="100%"
          height="100%"
          viewBox="0 0 1200 250" 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.8 }}
          className={styles.svgElement}
        >
         
          <motion.path
            d="M 1050 30 C 1300 125, 1000 220, 600 220 C 200 220, 0 125, 150 100 C 250 80, 400 20, 600 20 C 800 20, 950 30, 950 30"
            fill="none"
            strokeWidth="12"
            stroke="var(--primary-color)"
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={draw}
          />
        </motion.svg>
      </div>
      <div className={styles.textContainer}>
        <motion.h2
          className={styles.title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          {title}
        </motion.h2>
      </div>
    </div>
  );
}

export default HandWrittenTitle;