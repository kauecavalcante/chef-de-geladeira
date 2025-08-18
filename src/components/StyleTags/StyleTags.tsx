'use client';

import { useState, useEffect } from 'react';
import styles from './StyleTags.module.css';

export type TTag = {
  key: string;
  name: string;
};

type StyleTagsProps = {
  availableTags: TTag[];
  onChange: (selected: TTag[]) => void;
};

export function StyleTags({ availableTags, onChange }: StyleTagsProps) {
  const [selected, setSelected] = useState<TTag[]>([]);


  useEffect(() => {
    onChange(selected);
  }, [selected, onChange]);

  const handleSelect = (tag: TTag) => {
    if (!selected.some(s => s.key === tag.key)) {
      setSelected([...selected, tag]);
    }
  };

  const handleDeselect = (tagToRmove: TTag) => {
    setSelected(selected.filter((tag) => tag.key !== tagToRmove.key));
  };

  const remainingTags = availableTags.filter(
    (tag) => !selected.some((s) => s.key === tag.key)
  );

  return (
    <div className={styles.container}>
      {/* Área de tags selecionadas */}
      <div className={styles.selectedArea}>
        {selected.length === 0 && (
          <span className={styles.placeholder}>Estilos selecionados aparecerão aqui...</span>
        )}
        {selected.map((tag) => (
          <div key={tag.key} className={`${styles.tag} ${styles.selectedTag}`}>
            <span>{tag.name}</span>
            <button
              type="button"
              onClick={() => handleDeselect(tag)}
              className={styles.deselectButton}
              aria-label={`Remover ${tag.name}`}
            >
              &times;
            </button>
          </div>
        ))}
      </div>

      {/* Área de tags disponíveis */}
      {remainingTags.length > 0 && (
        <div className={styles.availableArea}>
          {remainingTags.map((tag) => (
            <button
              type="button"
              key={tag.key}
              onClick={() => handleSelect(tag)}
              className={`${styles.tag} ${styles.availableTag}`}
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}