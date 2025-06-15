import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { useQuery } from "@tanstack/react-query"
import { User } from "@shared/schema"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Map to cache tradesperson names
const tradespersonNameCache: Record<number, string> = {};

// Function to get a tradesperson's display name
export function getTradespersonDisplayName(tradespersonId: number): string {
  // Check if we have the name in cache
  if (tradespersonNameCache[tradespersonId]) {
    return tradespersonNameCache[tradespersonId];
  }
  
  // If not in cache, return a temporary name while we fetch
  return `Tradesperson #${tradespersonId}`;
}

// Format currency for display
export function formatCurrency(amount: number | undefined | null): string {
  if (amount === undefined || amount === null) return '$0.00';
  
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2
  }).format(amount);
}

// Custom hook to fetch and cache tradesperson data
export function useTradesperson(tradespersonId: number | undefined) {
  const { data: tradesperson } = useQuery<User>({
    queryKey: tradespersonId ? [`/api/users/${tradespersonId}`] : [],
    enabled: !!tradespersonId,
    onSuccess: (data) => {
      if (data && tradespersonId) {
        // Cache the name for future use
        tradespersonNameCache[tradespersonId] = data.name || data.username || `Tradesperson #${tradespersonId}`;
      }
    }
  });
  
  return tradesperson;
}
