'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import styles from './ConflictModal.module.css';


type Conflict = {
  preference: string;
  ingredients: string[];
};

type Resolution = 'assume_compliant' | 'suggest_alternatives' | 'ignore_preference' | 'save_exception';

interface ConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
  conflicts: Conflict[];
  onResolve: (resolution: Resolution) => void;
}

export function ConflictModal({ isOpen, onClose, conflicts, onResolve }: ConflictModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={styles.modalContainer}
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()} 
          >
            <div className={styles.header}>
              <AlertTriangle className={styles.headerIcon} />
              <h2 className={styles.title}>Conflito de Preferências</h2>
              <button onClick={onClose} className={styles.closeButton}>
                <X size={24} />
              </button>
            </div>

            <div className={styles.content}>
              <p>Detectamos que alguns ingredientes podem não ser compatíveis com suas preferências salvas:</p>
              <ul className={styles.conflictList}>
                {conflicts.map((conflict, index) => (
                  <li key={index}>
                    <strong>{conflict.preference}:</strong> violada por "{conflict.ingredients.join(', ')}"
                  </li>
                ))}
              </ul>
              <p className={styles.question}>O que gostaria de fazer?</p>
            </div>

            <div className={styles.actions}>
              <button onClick={() => onResolve('assume_compliant')} className={styles.actionButton}>
                Usar ingredientes (são compatíveis)
              </button>
              <button onClick={() => onResolve('suggest_alternatives')} className={styles.actionButton}>
                Sugerir alternativas
              </button>
              <button onClick={() => onResolve('ignore_preference')} className={styles.actionButton}>
                Ignorar preferências desta vez
              </button>
              <button onClick={() => onResolve('save_exception')} className={`${styles.actionButton} ${styles.primaryButton}`}>
                Lembrar para sempre (são compatíveis)
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}