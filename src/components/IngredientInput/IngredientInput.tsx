'use client';

import { ArrowUp } from 'lucide-react';
import styles from './IngredientInput.module.css';

type IngredientInputProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  loading: boolean;
  placeholder?: string;
};

export function IngredientInput({
  value,
  onChange,
  onSubmit,
  loading,
  placeholder,
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
      <textarea
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={styles.textarea}
        rows={3}
      />
      <button
        type="button"
        onClick={onSubmit}
        disabled={loading || !value.trim()}
        className={styles.submitButton}
        aria-label="Gerar Receita"
      >
        <ArrowUp size={20} />
      </button>
    </div>
  );
}