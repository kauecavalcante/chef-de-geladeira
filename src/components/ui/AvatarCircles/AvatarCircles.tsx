"use client";

import React from "react";
import styles from "./AvatarCircles.module.css";

interface AvatarCirclesProps {
  className?: string;
  numPeople?: number;
  avatarUrls: string[];
}

const AvatarCircles: React.FC<AvatarCirclesProps> = ({
  numPeople,
  className,
  avatarUrls,
}) => {
  return (
    <div className={`${styles.avatarContainer} ${className}`}>
      {avatarUrls.map((url, index) => (
        <img
          key={index}
          className={styles.avatarImage}
          src={url}
          width={40}
          height={40}
          alt={`Avatar ${index + 1}`}
        />
      ))}
      <a
        className={styles.avatarMore}
        href="#"
        onClick={(e) => e.preventDefault()}
      >
        +{numPeople}
      </a>
    </div>
  );
};

export default AvatarCircles;