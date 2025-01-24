import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(seconds: number) {
  // Convert seconds to minutes and round to nearest minute
  const minutes = Math.round(seconds / 60);
  
  if (minutes < 1) return "Less than a minute";
  if (minutes === 1) return "1 minute";
  return `${minutes} minutes`;
}
