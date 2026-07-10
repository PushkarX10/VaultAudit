/**
 * VaultAudit AI — Utility: cn()
 * Combines clsx + tailwind-merge for conflict-free class composition.
 */

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
