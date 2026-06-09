import React from "react";

const FilterDropDown = ({ value, onChange, options = [], className = "" }) => {
  return (
    <div className="mb-4">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`border rounded-md px-3 py-2 ${className}`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FilterDropDown;
