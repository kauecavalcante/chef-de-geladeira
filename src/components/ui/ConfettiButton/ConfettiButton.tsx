"use client";

import React from "react";
import confetti from "canvas-confetti";
import type { Options as ConfettiOptions } from "canvas-confetti";

interface ConfettiButtonProps {
  children: React.ReactElement<{ onClick?: (event: React.MouseEvent<HTMLElement>) => void }>;
  options?: ConfettiOptions;
}

const ConfettiButton: React.FC<ConfettiButtonProps> = ({ children, options }) => {
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    confetti({
      ...options,
      origin: {
        x: x / window.innerWidth,
        y: y / window.innerHeight,
      },
    });

    
    if (children.props && typeof children.props.onClick === 'function') {
      children.props.onClick(event);
    }
  };

  
  return React.cloneElement(children, {
    onClick: handleClick,
  });
};

export default ConfettiButton;