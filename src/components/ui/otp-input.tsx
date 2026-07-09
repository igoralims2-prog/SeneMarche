"use client";

import { useRef, type KeyboardEvent, type ClipboardEvent, type ChangeEvent } from "react";
import { cn } from "@/lib/utils";

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
};

export function OtpInput({ value, onChange, length = 6, disabled }: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(length, " ").split("").slice(0, length);

  function focusAt(index: number) {
    refs.current[Math.max(0, Math.min(length - 1, index))]?.focus();
  }

  function update(index: number, char: string) {
    const next = [...digits];
    next[index] = char || " ";
    onChange(next.join("").trimEnd());
  }

  function handleChange(index: number, e: ChangeEvent<HTMLInputElement>) {
    const char = e.target.value.replace(/\D/g, "").slice(-1);
    update(index, char);
    if (char) focusAt(index + 1);
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (digits[index]?.trim()) {
        update(index, "");
      } else {
        focusAt(index - 1);
      }
    } else if (e.key === "ArrowLeft") {
      focusAt(index - 1);
    } else if (e.key === "ArrowRight") {
      focusAt(index + 1);
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    onChange(pasted);
    focusAt(Math.min(pasted.length, length - 1));
  }

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length }, (_, i) => {
        const filled = !!digits[i]?.trim();
        return (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digits[i]?.trim() ?? ""}
            onChange={(e) => handleChange(i, e)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            disabled={disabled}
            aria-label={`Chiffre ${i + 1}`}
            className={cn(
              "w-11 h-14 text-center text-2xl font-black rounded-xl border-2 transition-all duration-150",
              "focus:outline-none focus:ring-0",
              filled
                ? "border-green-500 bg-green-50 text-green-700 shadow-sm shadow-green-100"
                : "border-gray-200 bg-white text-gray-900 focus:border-green-400",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          />
        );
      })}
    </div>
  );
}
