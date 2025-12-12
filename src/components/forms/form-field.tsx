"use client";

import { type ReactNode } from "react";
import {
  Controller,
  type FieldPath,
  type FieldValues,
  type UseFormReturn,
} from "react-hook-form";

interface FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  form: UseFormReturn<TFieldValues>;
  name: TName;
  label?: string;
  children: (field: {
    value: unknown;
    onChange: (value: unknown) => void;
    onBlur: () => void;
    error?: string;
    ref: React.Ref<any>;
  }) => ReactNode;
}

export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({ form, name, label, children }: FormFieldProps<TFieldValues, TName>) {
  const {
    control,
    formState: { errors },
  } = form;

  const error = errors[name]?.message as string | undefined;

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-zinc-900 dark:text-zinc-100"
        >
          {label}
        </label>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field: { value, onChange, onBlur, ref } }) => {
          const child = children({
            value: value ?? "",
            onChange: (newValue) => onChange(newValue),
            onBlur,
            error,
            ref,
          });
          return <>{child}</>;
        }}
      />
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
