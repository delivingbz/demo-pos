import { useEffect, useRef } from "react";

// onIdle: callback to run when timeout elapses
// timeout: ms (default 15 minutes)
export default function useIdleTimeout(onIdle, timeout = 15 * 60 * 1000) {
  const timerRef = useRef(null);
  const savedCallback = useRef(onIdle);

  useEffect(() => {
    savedCallback.current = onIdle;
  }, [onIdle]);

  useEffect(() => {
    const events = [
      "mousemove",
      "mousedown",
      "keypress",
      "touchstart",
      "scroll",
      "click",
    ];

    const reset = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (typeof savedCallback.current === "function")
          savedCallback.current();
      }, timeout);
    };

    // start timer
    reset();

    // attach listeners
    for (const e of events) window.addEventListener(e, reset);

    return () => {
      // cleanup
      if (timerRef.current) clearTimeout(timerRef.current);
      for (const e of events) window.removeEventListener(e, reset);
    };
  }, [timeout]);
}
