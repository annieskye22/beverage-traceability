import React from "react";

export interface SliderProps {
  value?: number[];
  onValueChange?: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export const Slider: React.FC<SliderProps> = ({
  value = [0],
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  className = "",
}) => {
  const currentValue = Array.isArray(value) ? value[0] : value;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (onValueChange) {
      onValueChange([val]);
    }
  };

  return (
    <div className={`relative flex items-center w-full select-none touch-none ${className}`}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={currentValue}
        onChange={handleChange}
        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
      />
    </div>
  );
};

export default Slider;