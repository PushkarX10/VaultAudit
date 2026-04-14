/**
 * VaultAudit AI — Chart Utilities (Tremor Raw port)
 *
 * Adapted from Tremor Raw's chartUtils.ts for JSX.
 * Uses the VaultAudit Slate/Zinc "Antigravity" palette.
 */

// VaultAudit Antigravity palette — Slate & Zinc dominant
export const chartColors = {
  slate: {
    bg: 'bg-slate-700',
    stroke: 'stroke-slate-700',
    fill: 'fill-slate-700',
    text: 'text-slate-700',
  },
  zinc: {
    bg: 'bg-zinc-500',
    stroke: 'stroke-zinc-500',
    fill: 'fill-zinc-500',
    text: 'text-zinc-500',
  },
  gray: {
    bg: 'bg-gray-400',
    stroke: 'stroke-gray-400',
    fill: 'fill-gray-400',
    text: 'text-gray-400',
  },
  stone: {
    bg: 'bg-stone-300',
    stroke: 'stroke-stone-300',
    fill: 'fill-stone-300',
    text: 'text-stone-300',
  },
  neutral: {
    bg: 'bg-neutral-200',
    stroke: 'stroke-neutral-200',
    fill: 'fill-neutral-200',
    text: 'text-neutral-200',
  },
  blue: {
    bg: 'bg-blue-500',
    stroke: 'stroke-blue-500',
    fill: 'fill-blue-500',
    text: 'text-blue-500',
  },
  emerald: {
    bg: 'bg-emerald-500',
    stroke: 'stroke-emerald-500',
    fill: 'fill-emerald-500',
    text: 'text-emerald-500',
  },
  violet: {
    bg: 'bg-violet-500',
    stroke: 'stroke-violet-500',
    fill: 'fill-violet-500',
    text: 'text-violet-500',
  },
  amber: {
    bg: 'bg-amber-500',
    stroke: 'stroke-amber-500',
    fill: 'fill-amber-500',
    text: 'text-amber-500',
  },
  cyan: {
    bg: 'bg-cyan-500',
    stroke: 'stroke-cyan-500',
    fill: 'fill-cyan-500',
    text: 'text-cyan-500',
  },
  pink: {
    bg: 'bg-pink-500',
    stroke: 'stroke-pink-500',
    fill: 'fill-pink-500',
    text: 'text-pink-500',
  },
  lime: {
    bg: 'bg-lime-500',
    stroke: 'stroke-lime-500',
    fill: 'fill-lime-500',
    text: 'text-lime-500',
  },
  fuchsia: {
    bg: 'bg-fuchsia-500',
    stroke: 'stroke-fuchsia-500',
    fill: 'fill-fuchsia-500',
    text: 'text-fuchsia-500',
  },
};

export const AvailableChartColors = Object.keys(chartColors);

export const constructCategoryColors = (categories, colors) => {
  const categoryColors = new Map();
  categories.forEach((category, index) => {
    categoryColors.set(category, colors[index % colors.length]);
  });
  return categoryColors;
};

export const getColorClassName = (color, type) => {
  const fallbackColor = {
    bg: 'bg-gray-500',
    stroke: 'stroke-gray-500',
    fill: 'fill-gray-500',
    text: 'text-gray-500',
  };
  return chartColors[color]?.[type] ?? fallbackColor[type];
};

// Tremor Raw getYAxisDomain [v0.0.0]
export const getYAxisDomain = (autoMinValue, minValue, maxValue) => {
  const minDomain = autoMinValue ? 'auto' : minValue ?? 0;
  const maxDomain = maxValue ?? 'auto';
  return [minDomain, maxDomain];
};

// Tremor Raw hasOnlyOneValueForKey [v0.1.0]
export function hasOnlyOneValueForKey(array, keyToCheck) {
  const val = [];
  for (const obj of array) {
    if (Object.prototype.hasOwnProperty.call(obj, keyToCheck)) {
      val.push(obj[keyToCheck]);
      if (val.length > 1) {
        return false;
      }
    }
  }
  return true;
}
