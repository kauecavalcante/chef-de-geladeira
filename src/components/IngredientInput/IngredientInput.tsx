'use client';

import { ArrowUp, ChefHat, Sparkles, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { TTag } from '@/types'; 
import styles from './IngredientInput.module.css';

type IngredientInputProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  loading: boolean;
  placeholder?: string;
  selectedTags: TTag[];
};

export function IngredientInput({
  value,
  onChange,
  onSubmit,
  loading,
  placeholder,
  selectedTags,
}: IngredientInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!loading && value.trim()) {
        onSubmit();
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.inputWrapper}>
        <div className={styles.content}>
          <div className={styles.iconWrapper}>
            <ChefHat className={styles.icon} />
          </div>
          <textarea
            value={value}
            onChange={onChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={styles.textarea}
            rows={1}
          />
          <button
            type="button"
            onClick={onSubmit}
            disabled={loading || !value.trim()}
            className={styles.submitButton}
            aria-label="Gerar Receita"
          >
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className={styles.spinner} />
              </motion.div>
            ) : (
              <ArrowUp size={16} />
            )}
          </button>
        </div>
        {selectedTags.length > 0 && (
          <div className={styles.tagsContainer}>
            {selectedTags.map(tag => (
              <span key={tag.key} className={styles.selectedTag}>
                <Zap size={12} />
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}