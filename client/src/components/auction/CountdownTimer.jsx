import React, { useState, useEffect } from "react";

/**
 * Reusable countdown timer. Updates every second.
 * @param {Date|string} targetDate - End (or start) date
 * @param {'small'|'default'|'large'} size - Visual size
 * @param {boolean} showLabel - Show "Ends in" / "Starts in" style label
 * @param {'boxes'|'hms'} format - 'boxes' = separate boxes, 'hms' = "00 h : 00 m : 00 s" (for dark bar)
 * @param {() => void} onComplete - Called when countdown reaches zero
 */
export default function CountdownTimer({
  targetDate,
  size = "default",
  showLabel = true,
  format = "boxes",
  onComplete,
  variant = "default",
}) {
  const end = targetDate ? new Date(targetDate).getTime() : 0;
  const [diff, setDiff] = useState(() => (end ? Math.max(0, end - Date.now()) : 0));
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!end) return;
    const tick = () => {
      const d = Math.max(0, end - Date.now());
      setDiff(d);
      if (d === 0 && !done) {
        setDone(true);
        onComplete?.();
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [end, onComplete, done]);

  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((diff % (60 * 1000)) / 1000);

  const pad = (n) => String(n).padStart(2, "0");
  const isPast = end && Date.now() > end;

  const sizeClasses = {
    small: "text-sm",
    default: "text-base",
    large: "text-xl md:text-2xl",
  };
  const boxClasses = {
    small: "px-2 py-0.5",
    default: "px-3 py-1",
    large: "px-4 py-2",
  };
  const variantClasses = {
    default: {
      label: "text-slate-500",
      digits: "text-gray-900 dark:text-white",
      box: "bg-slate-200 dark:bg-slate-700",
      separator: "bg-slate-200 dark:bg-slate-700",
    },
    glassDark: {
      label: "text-white/70",
      digits: "text-white",
      box: "bg-white/12 border border-white/15 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]",
      separator: "bg-white/8 border border-white/10 backdrop-blur-md text-white/80",
    },
  };
  const currentVariant = variantClasses[variant] || variantClasses.default;

  if (isPast || (end && diff === 0)) {
    return (
      <span
        className={`font-mono ${sizeClasses[size]} ${currentVariant.digits}`}
      >
        {showLabel && (
          <span className={`${currentVariant.label} mr-1`}>Ended</span>
        )}
        {format === "hms" ? "00 h : 00 m : 00 s" : "00:00:00"}
      </span>
    );
  }

  if (format === "hms") {
    const totalHours = days * 24 + hours;
    return (
      <span
        className={`font-mono font-semibold ${sizeClasses[size]} ${currentVariant.digits}`}
      >
        {pad(totalHours)} h : {pad(minutes)} m : {pad(seconds)} s
      </span>
    );
  }

  return (
    <div className="inline-flex flex-col">
      {showLabel && (
        <span className={`${currentVariant.label} text-xs mb-0.5`}>
          {days > 0 ? `${days}d ` : ""}
          {pad(hours)}:{pad(minutes)}:{pad(seconds)} left
        </span>
      )}
      <div
        className={`flex gap-1 font-mono font-semibold ${sizeClasses[size]} ${currentVariant.digits}`}
      >
        {days > 0 && (
          <span
            className={`${currentVariant.box} rounded ${boxClasses[size]} ${currentVariant.digits}`}
          >
            {pad(days)}d
          </span>
        )}
        <span
          className={`${currentVariant.box} rounded ${boxClasses[size]} ${currentVariant.digits}`}
        >
          {pad(hours)}
        </span>
        <span
          className={`${currentVariant.separator} rounded ${boxClasses[size]} ${currentVariant.digits}`}
        >
          :
        </span>
        <span
          className={`${currentVariant.box} rounded ${boxClasses[size]} ${currentVariant.digits}`}
        >
          {pad(minutes)}
        </span>
        <span
          className={`${currentVariant.separator} rounded ${boxClasses[size]} ${currentVariant.digits}`}
        >
          :
        </span>
        <span
          className={`${currentVariant.box} rounded ${boxClasses[size]} ${currentVariant.digits}`}
        >
          {pad(seconds)}
        </span>
      </div>
    </div>
  );
}
