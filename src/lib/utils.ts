import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Gilroy font utility classes
export const gilroy = {
  light: "font-gilroy font-light",
  normal: "font-gilroy font-normal", 
  medium: "font-gilroy font-medium",
  semibold: "font-gilroy font-semibold",
  bold: "font-gilroy font-bold",
  extrabold: "font-gilroy font-extrabold",
}
