import React, { useState, useEffect, useRef } from "react";

const RangeFilter = ({ min = 0, max = 100, onChange }) => {
  const [minVal, setMinVal] = useState(min);
  const [maxVal, setMaxVal] = useState(max);
  const minValRef = useRef(min);
  const maxValRef = useRef(max);
  const range = useRef(null);

  // Convert to percentage
  const getPercent = (value) => Math.round(((value - min) / (max - min)) * 100);

  // Set width of the range to decrease from the left side
  useEffect(() => {
    const minPercent = getPercent(minVal);
    const maxPercent = getPercent(maxValRef.current);

    if (range.current) {
      range.current.style.left = `${minPercent}%`;
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [minVal, getPercent]);

  // Set width of the range to decrease from the right side
  useEffect(() => {
    const minPercent = getPercent(minValRef.current);
    const maxPercent = getPercent(maxVal);

    if (range.current) {
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [maxVal, getPercent]);

  // Notify parent when values change (debounced or on mouse up could be better, but simple change is fine for now)
  const handleMinChange = (event) => {
    const value = Math.min(Number(event.target.value), maxVal - 1);
    setMinVal(value);
    minValRef.current = value;
    if (onChange) onChange([value, maxVal]);
  };

  const handleMaxChange = (event) => {
    const value = Math.max(Number(event.target.value), minVal + 1);
    setMaxVal(value);
    maxValRef.current = value;
    if (onChange) onChange([minVal, value]);
  };

  return (
    <div className="w-full px-4 py-4">
      <div className="relative w-full h-12 flex items-center justify-center">
        <input
          type="range"
          min={min}
          max={max}
          value={minVal}
          onChange={handleMinChange}
          className="thumb thumb--left"
          style={{ zIndex: minVal > max - 100 && "5" }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={maxVal}
          onChange={handleMaxChange}
          className="thumb thumb--right"
        />

        <div className="slider">
          <div className="slider__track" />
          <div ref={range} className="slider__range" />
          <div className="slider__left-value">{minVal}</div>
          <div className="slider__right-value">{maxVal}</div>
        </div>
      </div>

      <style>{`
        .slider {
          position: relative;
          width: 100%;
        }
        .slider__track,
        .slider__range {
          position: absolute;
          border-radius: 3px;
          height: 5px;
        }
        .slider__track {
          background-color: #ced4da;
          width: 100%;
          z-index: 1;
        }
        .slider__range {
          background-color: #0A0E2C;
          z-index: 2;
        }
        .slider__left-value,
        .slider__right-value {
          color: #0A0E2C;
          font-size: 12px;
          margin-top: 20px;
          position: absolute;
        }
        .slider__left-value {
          left: 6px;
        }
        .slider__right-value {
          right: -4px;
        }
        .thumb {
          -webkit-appearance: none;
          -webkit-tap-highlight-color: transparent;
          pointer-events: none;
          position: absolute;
          height: 0;
          width: 100%;
          outline: none;
          z-index: 3;
        }
        .thumb--left {
          z-index: 4;
        }
        .thumb--right {
          z-index: 5;
        }
        .thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          -webkit-tap-highlight-color: transparent;
          background-color: #f1f5f7;
          border: none;
          border-radius: 50%;
          box-shadow: 0 0 1px 1px #ced4da;
          cursor: pointer;
          height: 18px;
          width: 18px;
          margin-top: 4px;
          pointer-events: all;
          position: relative;
        }
        .thumb::-moz-range-thumb {
          background-color: #f1f5f7;
          border: none;
          border-radius: 50%;
          box-shadow: 0 0 1px 1px #ced4da;
          cursor: pointer;
          height: 18px;
          width: 18px;
          margin-top: 4px;
          pointer-events: all;
          position: relative;
        }
      `}</style>
    </div>
  );
};

export default RangeFilter;
