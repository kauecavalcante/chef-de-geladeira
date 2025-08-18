'use client';

import { useState } from 'react';
import { CheckCircle2, Circle, CircleDot } from 'lucide-react';
import styles from './InstructionChecklist.module.css';

interface InstructionChecklistProps {
  instructions: string[];
}

export function InstructionChecklist({ instructions }: InstructionChecklistProps) {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [currentStep, setCurrentStep] = useState(0);

  const handleStepClick = (index: number) => {
    
    if (index !== currentStep) return;

    const newCompleted = new Set(completedSteps);
    newCompleted.add(index);
    setCompletedSteps(newCompleted);

    
    if (currentStep < instructions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const getStepStatus = (index: number) => {
    if (completedSteps.has(index)) {
      return 'completed';
    }
    if (index === currentStep) {
      return 'current';
    }
    return 'pending';
  };

  return (
    <ol className={styles.checklist}>
      {instructions.map((instruction, index) => {
        const status = getStepStatus(index);
        const isClickable = status === 'current';

        return (
          <li
            key={index}
            className={`${styles.step} ${styles[status]}`}
            onClick={isClickable ? () => handleStepClick(index) : undefined}
          >
            <div className={styles.iconContainer}>
              {status === 'completed' && <CheckCircle2 size={24} />}
              {status === 'current' && <CircleDot size={24} />}
              {status === 'pending' && <Circle size={24} />}
            </div>
            <span className={styles.text}>{instruction}</span>
          </li>
        );
      })}
    </ol>
  );
}
