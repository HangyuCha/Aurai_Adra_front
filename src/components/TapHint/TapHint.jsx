import React, { useEffect, useRef, useState } from 'react';
import styles from './TapHint.module.css';

/**
 * TapHint
 * props: x, y, width, height, borderRadius, onActivate, ariaLabel
 */
export default function TapHint({ x = '50%', y = '80%', width = '30%', height = '8%', borderRadius = '10px', onActivate, ariaLabel = 'tap hint', selector, offsetY = 0, offsetX = 0, suppressInitial = false }){
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
        try{
          // if this ancestor contains the selector target, use it as the overlay
          if(selector && typeof p.querySelector === 'function' && p.querySelector(selector)) return p;
  } catch { /* invalid selector for this node? ignore */ }
        // fallback: class name heuristics in case CSS modules renamed the class (e.g. PhoneFrame_overlay_xxx)
        if(p.classList){
          for(const c of Array.from(p.classList)){
            if(c && c.toLowerCase().includes('overlay')) return p;
          }
        }
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

  // Allow optional horizontal/vertical offsets (in px or CSS value) to nudge the hint relative to computed position.
  // When suppressInitial is requested, we keep the component mounted but hide it
  // visually until computed coordinates are available. This prevents the
  // center-bottom blink while preserving other TapHint instances that rely on
  // the fallback coordinates.
  // Note: `suppressInitial` is a new optional prop (boolean).
  // If false/undefined, behavior is unchanged.
  // Allow optional horizontal/vertical offsets (in px or CSS value) to nudge the hint relative to computed position.
  let topValue;
  let leftValue;
  // compute top
  if (computed) {
    if (offsetY) {
      const offY = typeof offsetY === 'number' ? `${offsetY}px` : offsetY;
      topValue = `calc(${computed.top} - ${offY})`;
    } else {
      topValue = computed.top;
    }
  } else {
    if (offsetY) {
      const offY = typeof offsetY === 'number' ? `${offsetY}px` : offsetY;
      topValue = `calc(${typeof y === 'number' ? `${y}px` : y} - ${offY})`;
    } else {
      topValue = (typeof y === 'number' ? `${y}px` : y);
    }
  }

  // compute left
  if (computed) {
    if (offsetX) {
      const offX = typeof offsetX === 'number' ? `${offsetX}px` : offsetX;
      leftValue = `calc(${computed.left} + ${offX})`;
    } else {
      leftValue = computed.left;
    }
  } else {
    if (offsetX) {
      const offX = typeof offsetX === 'number' ? `${offsetX}px` : offsetX;
      leftValue = `calc(${typeof x === 'number' ? `${x}px` : x} + ${offX})`;
    } else {
      leftValue = (typeof x === 'number' ? `${x}px` : x);
    }
  }

  const style = {
    left: leftValue,
    top: topValue,
    width: computed ? computed.width : (typeof width === 'number' ? `${width}px` : width),
    height: computed ? computed.height : (typeof height === 'number' ? `${height}px` : height),
    borderRadius,
    transform: 'translate(-50%, -50%)',
  };

  // If caller asked to suppress initial fallback blink, hide until computed.
  if (suppressInitial && selector && computed === null) {
    style.visibility = 'hidden';
  }

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
