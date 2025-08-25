'use client';

import React from "react";
import confetti from "canvas-confetti";

interface StarConfettiButtonProps {
  children: React.ReactElement<{ onClick?: (event: React.MouseEvent<HTMLElement>) => void }>;
}

const StarConfettiButton: React.FC<StarConfettiButtonProps> = ({ children }) => {
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const origin = {
      x: (rect.left + rect.width / 2) / window.innerWidth,
      y: (rect.top + rect.height / 2) / window.innerHeight,
    };

    const defaults = {
      spread: 360,
      ticks: 50,
      gravity: 0,
      decay: 0.94,
      startVelocity: 30,
      colors: ["#FF6900", "#ff8c00", "#ffa500", "#ffc107", "#ffd700"],
    };

    const shoot = () => {
      confetti({
        ...defaults,
        particleCount: 40,
        scalar: 1.2,
        shapes: ["star"],
        origin,
      });

      confetti({
        ...defaults,
        particleCount: 10,
        scalar: 0.75,
        shapes: ["circle"],
        origin,
      });
    };

    setTimeout(shoot, 0);
    setTimeout(shoot, 100);
    setTimeout(shoot, 200);

   
    if (children.props && typeof children.props.onClick === 'function') {
      children.props.onClick(event);
    }
  };

  return React.cloneElement(children, {
    onClick: handleClick,
  });
};

export default StarConfettiButton;