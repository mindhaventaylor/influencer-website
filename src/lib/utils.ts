import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs))
}

// Utility to filter out CSS class names from props to prevent them from being passed as DOM attributes
export function filterDOMProps(props: Record<string, any>): Record<string, any> {
  const cssClassNames = new Set([
    'text-muted-foreground',
    'text-foreground',
    'bg-background',
    'bg-secondary',
    'border-border',
    // Add more CSS class names as needed
  ]);

  const filtered: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(props)) {
    // Skip CSS class names that might be passed as boolean props
    if (!cssClassNames.has(key)) {
      filtered[key] = value;
    }
  }
  
  return filtered;
}
