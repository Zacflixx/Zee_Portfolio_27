/** Insert Cloudinary transformations after /upload/. Never ship the raw PNG. */
export function cld(url: string, transform: string): string {
  return url.replace('/upload/', `/upload/${transform}/`);
}

export const GRID_WIDTHS = [480, 720, 960] as const;

export function srcset(url: string, widths: readonly number[] = GRID_WIDTHS): string {
  return widths.map((w) => `${cld(url, `f_auto,q_auto,w_${w}`)} ${w}w`).join(', ');
}

export const src = (url: string, w = 720) => cld(url, `f_auto,q_auto,w_${w}`);
export const lightbox = (url: string) => cld(url, 'f_auto,q_auto,w_1600');
export const ogImage = (url: string) => cld(url, 'c_fill,w_1200,h_630,f_jpg,q_auto');
