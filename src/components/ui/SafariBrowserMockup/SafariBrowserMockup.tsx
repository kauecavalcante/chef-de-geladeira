"use client";

import React from "react";
import styles from "./SafariBrowserMockup.module.css";

interface SafariBrowserMockupProps {
  children: React.ReactNode; 
  className?: string;
}

const SafariBrowserMockup: React.FC<SafariBrowserMockupProps> = ({ children, className }) => {
  return (
    <div className={`${styles.mockupContainer} ${className}`}>
      {/* Barra superior do navegador */}
      <div className={styles.topBar}>
        <div className={styles.buttons}>
          <span className={styles.dot} style={{ backgroundColor: '#ff5f56' }} />
          <span className={styles.dot} style={{ backgroundColor: '#ffbd2e' }} />
          <span className={styles.dot} style={{ backgroundColor: '#27c93f' }} />
        </div>
        <div className={styles.addressBar} />
        <div className={styles.placeholder} />
      </div>

      {/* Área de visualização */}
      <div className={styles.previewArea}>
        {children}
      </div>
    </div>
  );
};

export default SafariBrowserMockup;