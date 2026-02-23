import { useEffect, useRef, useState } from "react";

// Animates a number from 0 to `value` over `duration` ms
const AnimatedCounter = ({
  value = 0,
  duration = 1200,
  prefix = "",
  suffix = "",
  formatter,
  className = "",
}) => {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);
  const startTime = useRef(null);

  useEffect(() => {
    if (value === 0) {
      setDisplay(0);
      return;
    }

    const animate = (timestamp) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);

      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    startTime.current = null;
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration]);

  const formatted = formatter ? formatter(display) : display.toLocaleString();

  return (
    <span className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};

export default AnimatedCounter;
