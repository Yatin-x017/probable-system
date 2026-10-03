import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Normalises a blog slug: lowercase, trimmed, non-alphanumerics -> hyphens.
// Used both when saving posts and when matching URLs, so stored slugs with
// stray spaces/capitals/slashes still resolve to a working /blog/:slug URL.
export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
