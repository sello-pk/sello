import React from "react";

const Input = ({ inputType, name, value, onChange, placeholder, min }) => {
  return (
    <input
      type={inputType}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      min={min}
      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
    />
  );
};

export default Input;
