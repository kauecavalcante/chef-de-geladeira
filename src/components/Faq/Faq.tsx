'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import styles from './Faq.module.css';

type FaqItemProps = {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
};

const faqData = [
  {
    q: "Como a Inteligência Artificial cria as receitas?",
    a: "Usamos modelos de linguagem avançados, treinados com milhares de receitas, para entender as combinações de sabores e criar um passo a passo coerente e delicioso.",
  },
  {
    q: "As receitas são testadas e seguras?",
    a: "As receitas são geradas por IA e servem como uma excelente inspiração. Recomendamos sempre usar o bom senso na cozinha, especialmente em relação a alergias e segurança alimentar.",
  },
  {
    q: "Posso cancelar minha assinatura Premium a qualquer momento?",
    a: "Sim! Você pode gerenciar e cancelar sua assinatura a qualquer momento através da sua página de 'Minha Conta', sem burocracia.",
  },
  {
    q: "E se eu colocar um ingrediente que não combina?",
    a: "O Chef IA é treinado para ser criativo! Ele tentará encontrar a melhor forma de utilizar seus ingredientes. E se você colocar algo que não é comida, nosso sistema inteligente irá simplesmente ignorá-lo.",
  },
];

const FaqItem: React.FC<FaqItemProps> = ({ question, answer, isOpen, onClick }) => {
  return (
    <div className={styles.faqItem}>
      <button className={styles.faqQuestion} onClick={onClick}>
        <span>{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown size={20} />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={styles.faqAnswer}
          >
            <p>{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleClick = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className={styles.faqContainer}>
      {faqData.map((item, index) => (
        <FaqItem
          key={index}
          question={item.q}
          answer={item.a}
          isOpen={openIndex === index}
          onClick={() => handleClick(index)}
        />
      ))}
    </div>
  );
}