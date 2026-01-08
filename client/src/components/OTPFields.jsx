import React, { useRef, useEffect } from "react";

const OTPFields = ({ value, onChange }) => {
  const inputsRef = useRef([]);

  // Auto focus to next input
  const handleChange = (e, idx) => {
    const val = e.target.value.replace(/\D/, "");
    if (!val) return;

    const otpArr = value.split("");
    otpArr[idx] = val[0];
    onChange(otpArr.join(""));

    // Focus next
    if (val && inputsRef.current[idx + 1]) {
      inputsRef.current[idx + 1].focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !value[idx] && idx > 0) {
      const otpArr = value.split("");
      otpArr[idx - 1] = "";
      onChange(otpArr.join(""));
      inputsRef.current[idx - 1].focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 4);
    if (pasted.length === 0) return;

    const otpArr = value.split("");
    for (let i = 0; i < pasted.length; i++) {
      if (i < inputsRef.current.length) {
        otpArr[i] = pasted[i];
        inputsRef.current[i].value = pasted[i];
      }
    }
    onChange(otpArr.join(""));
    e.preventDefault();
  };

  // Sync UI if parent updates value
  useEffect(() => {
    value.split("").forEach((char, idx) => {
      if (inputsRef.current[idx]) {
        inputsRef.current[idx].value = char;
      }
    });
  }, [value]);

  return (
    <div
      className="opt-fields w-full flex justify-center gap-3"
      onPaste={handlePaste}
    >
      {[0, 1, 2, 3].map((_, idx) => (
        <input
          key={idx}
          type="text"
          maxLength={1}
          inputMode="numeric"
          ref={(el) => (inputsRef.current[idx] = el)}
          onChange={(e) => handleChange(e, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          className="w-14 h-14 md:w-16 md:h-16 text-center text-xl md:text-2xl font-semibold border-2 border-gray-300 rounded focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
        />
      ))}
    </div>
  );
};

export default OTPFields;
