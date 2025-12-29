import { useEffect, useState } from "react";

export default function useIsDesktop(minWidth = 900) {
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia(`(min-width:${minWidth}px)`).matches;
  });

  useEffect(() => {
    const mq = window.matchMedia(`(min-width:${minWidth}px)`);
    const onChange = (e) => setIsDesktop(e.matches);

    // Compatibilidad
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else mq.addListener(onChange);

    setIsDesktop(mq.matches);

    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", onChange);
      else mq.removeListener(onChange);
    };
  }, [minWidth]);

  return isDesktop;
}
