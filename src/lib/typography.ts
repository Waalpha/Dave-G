import { PublicWebsiteTypographyConfig } from '../types';

export const FONT_FAMILY_OPTIONS = [
  { id: 'sans', name: 'Inter / Modern Sans', class: 'font-sans-clean', preview: 'Clean modern sans-serif' },
  { id: 'poppins', name: 'Poppins Geometric', class: 'font-poppins', preview: 'Friendly geometric headings' },
  { id: 'outfit', name: 'Outfit Contemporary', class: 'font-outfit', preview: 'Sleek contemporary display' },
  { id: 'serif', name: 'Merriweather Editorial', class: 'font-serif-clean', preview: 'Authoritative editorial serif' },
  { id: 'display', name: 'Playfair Display', class: 'font-display', preview: 'Refined luxury serif' },
  { id: 'mono', name: 'JetBrains Code Mono', class: 'font-mono-clean', preview: 'Technical monospace character' }
] as const;

export const FONT_SIZE_OPTIONS = [
  { id: 'sm', label: 'Compact', headingClass: 'text-2xl sm:text-3xl lg:text-4xl', subtitleClass: 'text-xs sm:text-sm' },
  { id: 'md', label: 'Standard', headingClass: 'text-3xl sm:text-4xl lg:text-5xl', subtitleClass: 'text-sm sm:text-base' },
  { id: 'lg', label: 'Large (Default)', headingClass: 'text-3xl sm:text-5xl lg:text-6xl', subtitleClass: 'text-sm sm:text-base lg:text-lg' },
  { id: 'xl', label: 'Heroic Bold', headingClass: 'text-4xl sm:text-6xl lg:text-7xl', subtitleClass: 'text-base sm:text-lg lg:text-xl' },
  { id: '2xl', label: 'Ultra Display', headingClass: 'text-5xl sm:text-7xl lg:text-8xl', subtitleClass: 'text-lg sm:text-xl lg:text-2xl' }
] as const;

export const FONT_WEIGHT_OPTIONS = [
  { id: 'normal', label: 'Normal (400)', class: 'font-normal' },
  { id: 'medium', label: 'Medium (500)', class: 'font-medium' },
  { id: 'semibold', label: 'Semi-Bold (600)', class: 'font-semibold' },
  { id: 'bold', label: 'Bold (700)', class: 'font-bold' },
  { id: 'black', label: 'Extra Black (900)', class: 'font-black' }
] as const;

export const TEXT_ALIGN_OPTIONS = [
  { id: 'left', label: 'Left Align', textClass: 'text-left', alignContainer: 'items-start text-left', statsAlign: 'justify-start' },
  { id: 'center', label: 'Center Align', textClass: 'text-center', alignContainer: 'items-center text-center mx-auto', statsAlign: 'justify-center' },
  { id: 'right', label: 'Right Align', textClass: 'text-right', alignContainer: 'items-end text-right ml-auto', statsAlign: 'justify-end' }
] as const;

export function getFontFamilyClass(font?: string): string {
  switch (font) {
    case 'poppins': return 'font-poppins';
    case 'outfit': return 'font-outfit';
    case 'serif': return 'font-serif-clean';
    case 'display': return 'font-display';
    case 'mono': return 'font-mono-clean';
    case 'sans':
    default:
      return 'font-sans-clean';
  }
}

export function getHeadingSizeClass(size?: string): string {
  switch (size) {
    case 'sm': return 'text-2xl sm:text-3xl lg:text-4xl';
    case 'md': return 'text-3xl sm:text-4xl lg:text-5xl';
    case 'lg': return 'text-3xl sm:text-5xl lg:text-6xl';
    case 'xl': return 'text-4xl sm:text-6xl lg:text-7xl';
    case '2xl': return 'text-5xl sm:text-7xl lg:text-8xl';
    default: return 'text-3xl sm:text-5xl lg:text-6xl';
  }
}

export function getSubtitleSizeClass(size?: string): string {
  switch (size) {
    case 'sm': return 'text-xs sm:text-sm';
    case 'base':
    case 'md': return 'text-sm sm:text-base';
    case 'lg': return 'text-sm sm:text-base lg:text-lg';
    case 'xl': return 'text-base sm:text-lg lg:text-xl';
    default: return 'text-sm sm:text-base lg:text-lg';
  }
}

export function getFontWeightClass(weight?: string, fallback = 'font-bold'): string {
  switch (weight) {
    case 'normal': return 'font-normal';
    case 'medium': return 'font-medium';
    case 'semibold': return 'font-semibold';
    case 'bold': return 'font-bold';
    case 'black': return 'font-black';
    default: return fallback;
  }
}

export function getTextAlignClass(align?: string): { text: string; container: string; stats: string } {
  switch (align) {
    case 'center':
      return { text: 'text-center', container: 'items-center text-center mx-auto', stats: 'justify-center' };
    case 'right':
      return { text: 'text-right', container: 'items-end text-right ml-auto', stats: 'justify-end' };
    case 'left':
    default:
      return { text: 'text-left', container: 'items-start text-left', stats: 'justify-start' };
  }
}
