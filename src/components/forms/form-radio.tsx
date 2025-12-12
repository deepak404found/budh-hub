"use client";

import { type InputHTMLAttributes, forwardRef } from "react";

interface FormRadioProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label: string;
}

export const FormRadio = forwardRef<HTMLInputElement, FormRadioProps>(
  ({ error, label, className, id, ...props }, ref) => {
    const radioId = id || props.name + "-" + props.value;
    return (
      <div className="flex items-center space-x-2">
        <input
          ref={ref}
          type="radio"
          id={radioId}
          className={`h-4 w-4 border-zinc-300 text-zinc-600 focus:ring-zinc-500 dark:border-zinc-700 dark:text-zinc-400 dark:focus:ring-zinc-600 ${
            error
              ? "border-red-500 text-red-600 dark:border-red-500"
              : ""
          } ${className || ""}`}
          {...props}
        />
        <label
          htmlFor={radioId}
          className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
        >
          {label}
        </label>
      </div>
    );
  }
);

FormRadio.displayName = "FormRadio";


