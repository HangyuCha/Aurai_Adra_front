import React, { useEffect, useRef, useState } from 'react';
import styles from './TapHint.module.css';

/**
 * TapHint
 * props: x, y, width, height, borderRadius, onActivate, ariaLabel
 */
export default function TapHint({ x = '50%', y = '80%', width = '30%', height = '8%', borderRadius = '10px', onActivate, ariaLabel = 'tap hint', selector }){
  const ref = useRef(null);
  const [computed, setComputed] = useState(null);

  useEffect(() => {
    if (!selector) return undefined;
    let mounted = true;

    const el = ref.current;
    if (!el) return undefined;

    // find overlay ancestor (PhoneFrame overlay) to use as coordinate space
    function findOverlay(node){
      let p = node.parentElement;
      while(p){
        if(p.classList && p.classList.contains('overlay')) return p;
        p = p.parentElement;
      }
      return null;
    }

    const overlay = findOverlay(el);
    if(!overlay) return undefined;

    const getAndSet = () => {
      const target = overlay.querySelector(selector) || document.querySelector(selector);
      if(!target) return setComputed(null);
      const oRect = overlay.getBoundingClientRect();
      const tRect = target.getBoundingClientRect();
      const leftPct = ((tRect.left + tRect.width/2) - oRect.left) / oRect.width * 100;
      const topPct = ((tRect.top + tRect.height/2) - oRect.top) / oRect.height * 100;
      const wPct = (tRect.width / oRect.width) * 100;
      const hPct = (tRect.height / oRect.height) * 100;
      if(mounted) setComputed({ left: `${leftPct}%`, top: `${topPct}%`, width: `${wPct}%`, height: `${hPct}%` });
    };

    // initial
    getAndSet();

    // resize/scroll observers
    const ro = new ResizeObserver(getAndSet);
    ro.observe(overlay);
    ro.observe(document.body);
    const to = setInterval(getAndSet, 500); // fallback for dynamic changes
    window.addEventListener('resize', getAndSet);
    window.addEventListener('scroll', getAndSet, true);

    return () => {
      mounted = false;
      ro.disconnect();
      clearInterval(to);
      window.removeEventListener('resize', getAndSet);
      window.removeEventListener('scroll', getAndSet, true);
    };
  }, [selector]);

  const style = {
    left: computed ? computed.left : (typeof x === 'number' ? `${x}px` : x),
    top: computed ? computed.top : (typeof y === 'number' ? `${y}px` : y),
    width: computed ? computed.width : (typeof width === 'number' ? `${width}px` : width),
    height: computed ? computed.height : (typeof height === 'number' ? `${height}px` : height),
    borderRadius,
    transform: 'translate(-50%, -50%)',
  };

  return (
    <button
      ref={ref}
      type="button"
      aria-label={ariaLabel}
      className={styles.hint}
      style={style}
      onClick={onActivate}
    />
  );
}
