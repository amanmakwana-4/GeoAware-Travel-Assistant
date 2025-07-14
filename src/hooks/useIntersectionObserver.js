import { useEffect, useRef, useState } from 'react';

export const useIntersectionObserver = (threshold = 0.1) => {
  const elementRef = useRef(null);
  const [hasIntersected, setHasIntersected] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasIntersected(true);
          observer.disconnect(); // Unobserve after first trigger
        }
      },
      { threshold }
    );

    const el = elementRef.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [threshold]);

  return { elementRef, hasIntersected };
};
